// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./UniswapConfig.sol";
import "../ExponentialNoError.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TonpoundPriceOracle is ExponentialNoError, UniswapConfig, Ownable {
    
    struct FeedData {
        /// @notice priceFeed address
        address priceFeed;
        /// @notice max time between price updates
        uint128 heartbeat;
        /// @notice Decimals of a pricefeed
        uint8 feedDecimals;
        /// @notice Decimals of asset
        uint8 assetDecimals;
    }

    /// @notice ChainLink Feed address by underlying address
    mapping(address => FeedData) public chainLinkFeeds;

    /// @notice weth address
    address public immutable baseAsset;

    /// @notice chainlink price feed ETH / USD
    AggregatorV3Interface public immutable baseAssetFeed;

    /// @notice The number of wei in 1 ETH
    uint256 public constant ETH_BASE_UNIT = 1e18;

    /// @notice A common scaling factor to maintain precision
    uint256 public constant EXP_SCALE = 1e18;

    /// @notice denominator to scale price from chainlink price feed
    uint256 public immutable baseAssetFeedDenominator;

    /// @notice The time interval to for TWAP price calculation
    uint256 public twapPeriod;

    /// @notice The event emitted when the stored price is updated
    event PriceUpdated(bytes32 indexed symbolHash, uint256 price);

    /// @notice The event emitted when new PriceFeed added (updated)
    event NewFeedForAsset(address indexed asset, address oldFeed, address newFeed);

    /// @notice The event emitted when twapPeriod updated
    event NewTwapPeriod(uint256 newTwap);

    error InvalidTwap();
    error InvalidPrice();
    error AnchorTooBig();
    error WrongLengths();
    error PriceConversionError();
    error TwapNotInRange();
    error TwatGtMax();
    error InvalidHeartbeat();
    error InvalidFeedDecimals();


    /**
     * @notice Construct a Uniswap anchored view for a set of token configurations
     * @dev Note that to avoid immature TWAPs, the system must run for at least a single twapPeriod before using.
     *      NOTE: Reported prices are set to 1 during construction. We assume that this contract will not be voted in by
     *      governance until prices have been updated through `validate` for each TokenConfig.
     * @param twapPeriod_ The time difference to calculate twap price
     */
    constructor(
        uint32 twapPeriod_,
        address baseUnderlying,
        AggregatorV3Interface baseAssetFeed_,
        uint128 baseAssetHeartBeat
    ) {
        if(twapPeriod_ < 600 || twapPeriod_ > 604800) revert InvalidTwap();
        twapPeriod = twapPeriod_;

        if(baseUnderlying == address(0)) revert ZeroAddress();
        baseAsset = baseUnderlying;
        baseAssetFeed = baseAssetFeed_;
        uint8 priceFeedDecimals = baseAssetFeed_.decimals();
        baseAssetFeedDenominator = 10 ** (priceFeedDecimals - 6);

        _setPriceFeedForUnderlying(baseUnderlying, address(baseAssetFeed_), baseAssetHeartBeat);
    }

    /// @notice Get the underlying price of a cToken asset
    /// @param cToken The cToken to get the underlying price of
    /// @return The underlying asset price mantissa (scaled by 1e(36 - assetDecimals)).
    ///         Zero means the price is unavailable.
    function getUnderlyingPrice(address cToken) public view returns (uint) {
        address asset = ICToken(cToken).underlying();
        uint oraclePrice = _getOraclePriceForAsset(asset);
        if(oraclePrice != 0) {
            return oraclePrice;
        }

        if(asset == baseAsset) {
            // price from twap comes scaled to 1e6, thus it must be scaled to 1e18
            return _getEthTwapPrice() * 10**12;
        } else {
            return _fetchTwapPriceForAsset(cToken);
        }
    }

    /// @notice Sets config to fetch underlying price
    /// @param newTwap The time interval to for TWAP price calculation
    function setTwapPeriod(uint256 newTwap) external onlyOwner {
        if(newTwap < 600 || newTwap > 604800) revert InvalidTwap();
        twapPeriod = newTwap;
        emit NewTwapPeriod(newTwap);
    }

    /// @notice Sets config to fetch underlying price
    /// @param cToken The address of the Compound Token
    /// @param uniswapMarket The address of the V3 pool being used as the anchor for this market
    function setTokenConfig(address cToken, address uniswapMarket) external onlyOwner {
        _setTokenConfig(cToken, uniswapMarket);
    }

    /// @notice Fetch the underlying price of a cToken from TWAP, in the format expected by the Comptroller.
    /// @dev Implements the PriceOracle interface for Compound v2.
    /// @param cToken The cToken address for price retrieval
    /// @return Price denominated in USD for the given cToken address, in the format expected by the Comptroller.
    ///         (scaled by 1e(36 - assetDecimals))
    function _fetchTwapPriceForAsset(address cToken)
        internal
        view
        returns (uint256)
    {
        TokenConfig memory config = getTokenConfigByCToken(cToken);
        if(config.underlying == address(0)) return 0;

        uint256 anchorPrice = calculateAnchorPriceFromEthPrice(config);
        if(anchorPrice >= 2**248) revert AnchorTooBig();
        // Comptroller needs prices in the format: ${raw price} * 1e36 / baseUnit
        // The baseUnit of an asset is the amount of the smallest denomination of that asset per whole.
        // For example, the baseUnit of ETH is 1e18.
        // Since the prices in this view have 6 decimals, we must scale them by 1e(36 - 6)/baseUnit
        return FullMath.mulDiv(1e30, anchorPrice, config.baseUnit);
    }

    /// @notice Calculate the anchor price by fetching price data from the TWAP
    /// @param config TokenConfig
    /// @return anchorPrice uint
    function calculateAnchorPriceFromEthPrice(TokenConfig memory config)
        internal
        view
        returns (uint256 anchorPrice)
    {
        uint256 ethPrice = fetchEthPrice();
        anchorPrice = fetchAnchorPrice(config, ethPrice);
    }

    /// @dev Fetches the latest TWATP from the UniV3 pool oracle, over the last anchor period.
    ///      Note that the TWATP (time-weighted average tick-price) is not equivalent to the TWAP,
    ///      as ticks are logarithmic. The TWATP returned by this function will usually
    ///      be lower than the TWAP.
    function getUniswapTwap(TokenConfig memory config)
        internal
        view
        returns (uint256)
    {
        uint32 twapPeriod_ = uint32(twapPeriod);
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = twapPeriod_;
        (int56[] memory tickCumulatives, ) = IUniswapV3Pool(
            config.uniswapMarket
        ).observe(secondsAgos);

        int56 twapPeriod__ = int56(uint56(twapPeriod_));
        int56 timeWeightedAverageTickS56 = (tickCumulatives[1] -
            tickCumulatives[0]) / twapPeriod__;
        if(
            timeWeightedAverageTickS56 < TickMath.MIN_TICK ||
            timeWeightedAverageTickS56 > TickMath.MAX_TICK
        ) revert TwapNotInRange();

        if(timeWeightedAverageTickS56 >= type(int24).max) revert TwatGtMax();

        int24 timeWeightedAverageTick = int24(timeWeightedAverageTickS56);
        if (config.isUniswapReversed) {
            // If the reverse price is desired, inverse the tick
            // price = 1.0001^{tick}
            // (price)^{-1} = (1.0001^{tick})^{-1}
            // \frac{1}{price} = 1.0001^{-tick}
            timeWeightedAverageTick = -timeWeightedAverageTick;
        }
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
            timeWeightedAverageTick
        );
        // Squaring the result also squares the Q96 scalar (2**96),
        // so after this mulDiv, the resulting TWAP is still in Q96 fixed precision.
        uint256 twapX96 = FullMath.mulDiv(
            sqrtPriceX96,
            sqrtPriceX96,
            FixedPoint96.Q96
        );

        // Scale up to a common precision (EXP_SCALE), then down-scale from Q96.
        return FullMath.mulDiv(EXP_SCALE, twapX96, FixedPoint96.Q96);
    }

    /// @dev Fetches the current eth/usd price from price feed or twap, with 6 decimals of precision
    function fetchEthPrice() internal view returns (uint) {
        (int chainLinkEthPrice, uint updatedAt) = getChainLinkPrice(baseAssetFeed);
        if (updatedAt + chainLinkFeeds[baseAsset].heartbeat >= block.timestamp) {
            // eth pricefeed returns value with 8 decimals, thus we scaling it to 6 
            return uint(chainLinkEthPrice) / baseAssetFeedDenominator;
        }

        // try to get ETH price from twap if oracle is dead
        return _getEthTwapPrice();
    }

    /// @dev Returns current eth price from uniswapV3 pool twap, with 6 decimals of precision
    function _getEthTwapPrice() internal view returns (uint) {
        TokenConfig memory config = getTokenConfigByUnderlying(baseAsset);
        if(config.underlying == address(0)) return 0;
        return getUniswapTwap(config);
    }

    /// @dev Fetches the current token/usd price from Uniswap, with 6 decimals of precision.
    /// @param conversionFactor 1e18 if seeking the ETH price, and a 6 decimal ETH-USDC price in the case of other assets
    function fetchAnchorPrice(
        TokenConfig memory config,
        uint256 conversionFactor
    ) internal view virtual returns (uint256) {
        // `getUniswapTwap(config)`
        //      -> TWAP between the baseUnits of Uniswap pair (scaled to 1e18)
        // `twap * config.baseUnit`
        //      -> price of 1 token relative to `baseUnit` of the other token (scaled to 1e18)
        uint256 twap = getUniswapTwap(config);

        // `unscaledPriceMantissa * config.baseUnit / EXP_SCALE`
        //      -> price of 1 token relative to baseUnit of the other token (scaled to 1)
        uint256 unscaledPriceMantissa = twap * conversionFactor;

        // Adjust twap according to the units of the non-ETH asset
        // 1. In the case of ETH, we would have to scale by 1e6 / USDC_UNITS, but since baseUnit2 is 1e6 (USDC), it cancels
        // 2. In the case of non-ETH tokens
        //  a. `getUniswapTwap(config)` handles "reversed" token pairs, so `twap` will always be Token/ETH TWAP.
        //  b. conversionFactor = ETH price * 1e6
        //      unscaledPriceMantissa = twap{token/ETH} * EXP_SCALE * conversionFactor
        //      so ->
        //      anchorPrice = (twap * tokenBaseUnit / ETH_BASE_UNIT) * ETH_price * 1e6
        //                  = twap * conversionFactor * tokenBaseUnit / ETH_BASE_UNIT
        //                  = unscaledPriceMantissa / EXP_SCALE * tokenBaseUnit / ETH_BASE_UNIT
        uint256 anchorPrice = (unscaledPriceMantissa * config.baseUnit) /
            ETH_BASE_UNIT /
            EXP_SCALE;

        return anchorPrice;
    }


    /* ChainLink Oracles */

    function setPriceFeedForUnderlying(address _underlying, address _priceFeed, uint128 _heartbeat) external onlyOwner {
        _setPriceFeedForUnderlying(_underlying, _priceFeed, _heartbeat);
    }

    function setPriceFeedsForUnderlyings(
        address[] calldata _underlyings,
        address[] calldata _priceFeeds,
        uint128[] calldata _heartbeats
        ) external onlyOwner {
        if(
            _underlyings.length != _priceFeeds.length ||
            _underlyings.length != _heartbeats.length
        ) revert WrongLengths();

        for (uint i = 0; i < _underlyings.length; ) {
            _setPriceFeedForUnderlying(_underlyings[i], _priceFeeds[i], _heartbeats[i]);
            unchecked {
                ++i;
            }
        }
    }

    function _setPriceFeedForUnderlying(address underlying, address priceFeed, uint128 heartbeat) internal {
        if(heartbeat == 0 || heartbeat > 172800) revert InvalidHeartbeat();        

        uint8 feedDecimals = AggregatorV3Interface(priceFeed).decimals();
        if(feedDecimals > 18) revert InvalidFeedDecimals();

        uint8 assetDecimals = IERC20(underlying).decimals();

        address oldFeed = chainLinkFeeds[underlying].priceFeed;
        chainLinkFeeds[underlying] = FeedData(priceFeed, heartbeat, feedDecimals, assetDecimals);
        emit NewFeedForAsset(underlying, oldFeed, priceFeed);
    }

    /**
      * @notice Get the underlying price of a cToken asset
      * @param asset The asset (Erc20 or native)
      * @return The asset price mantissa (scaled by 1e(36 - assetDecimals)).
      *  Zero means the price is unavailable.
      */
    function _getOraclePriceForAsset(address asset) internal view returns (uint) {
        FeedData memory feedData = chainLinkFeeds[asset];
        if (feedData.priceFeed == address(0)) {
            return 0;
        }
        
        (int feedPriceRaw, uint256 updatedAt) = getChainLinkPrice(AggregatorV3Interface(feedData.priceFeed));
        if (updatedAt + feedData.heartbeat < block.timestamp) {
            // feed data too old
            return 0;
        }
        uint feedPrice = uint(feedPriceRaw);
        // Safety
        if(feedPriceRaw != int(feedPrice)) revert PriceConversionError();

        // Needs to be scaled to e36 and then divided by the asset's decimals
        return (feedPrice * 10**(36 - feedData.feedDecimals)) / (10 ** feedData.assetDecimals);
    }

    /// @notice Returns latest price from chainlink and lastTime price was updated
    function getChainLinkPrice(AggregatorV3Interface priceFeed) internal view returns (int, uint) {
        (, int price, , uint updatedAt, ) = priceFeed.latestRoundData();
        return (price, updatedAt);
    }

    /// @notice         Evaluates input amount according to stored price, accrues interest
    /// @param cToken   Market to evaluate
    /// @param amount   Amount of tokens to evaluate according to 'reverse' order
    /// @param reverse  Order of evaluation
    /// @return         Depending on 'reverse' order:
    ///                     false - return USD amount equal to 'amount' of 'cToken' in wei
    ///                     true - return cTokens equal to 'amount' of USD represented in wei
    ///                            e.g. 123e18 = 123.00$
    function getEvaluation(address cToken, uint256 amount, bool reverse) external returns (uint256) {
        Exp memory exchangeRate = Exp({mantissa: ICToken(cToken).exchangeRateCurrent()});
        uint256 oraclePriceMantissa = getUnderlyingPrice(cToken);        
        if(oraclePriceMantissa == 0) revert InvalidPrice();
        Exp memory oraclePrice = Exp({mantissa: oraclePriceMantissa});

        if (reverse) {
            // input: 'amount' in USD scaled in 1e18, i.e. 19.54$ = 19540000000000000000
            // tokenAmount = amountUSD / oraclePrice 
            // cTokenAmount = tokenAmount / exchangeRate
            uint256 tokenAmount = div_(amount, oraclePrice);
            uint256 cTokenAmount =  div_(tokenAmount, exchangeRate);
            return cTokenAmount; 
        }
        // underlyingAmount = exchangeRate * cTokenAmount
        // underlyingAmountUSD = underlyingAmount * oraclePrice
        uint256 underlyingAmount = mul_ScalarTruncate(exchangeRate, amount);
        uint256 underlyingAmountUSD = mul_ScalarTruncate(oraclePrice, underlyingAmount);
        return underlyingAmountUSD;
    }

    /// @notice         Evaluates input amount according to stored price, doesn't accrue interest
    /// @param cToken   Market to evaluate
    /// @param amount   Amount of tokens to evaluate according to 'reverse' order
    /// @param reverse  Order of evaluation
    /// @return         Depending on 'reverse' order:
    ///                     false - return USD amount equal to 'amount' of 'cToken' in wei
    ///                     true - return cTokens equal to 'amount' of USD represented in wei
    ///                            e.g. 123e18 = 123.00$
    function getEvaluationStored(address cToken, uint256 amount, bool reverse) external view returns (uint256) {
        Exp memory exchangeRate = Exp({mantissa: ICToken(cToken).exchangeRateStored()});
        uint256 oraclePriceMantissa = getUnderlyingPrice(cToken);
        if(oraclePriceMantissa == 0) revert InvalidPrice();
        Exp memory oraclePrice = Exp({mantissa: oraclePriceMantissa});

        if (reverse) {
            // input: 'amount' in USD scaled in 1e18, i.e. 19.54$ = 19540000000000000000
            // tokenAmount = amountUSD / oraclePrice 
            // cTokenAmount = tokenAmount / exchangeRate
            uint256 tokenAmount = div_(amount, oraclePrice);
            uint256 cTokenAmount =  div_(tokenAmount, exchangeRate);
            return cTokenAmount; 
        }
        // underlyingAmount = exchangeRate * cTokenAmount
        // underlyingAmountUSD = underlyingAmount * oraclePrice
        uint256 underlyingAmount = mul_ScalarTruncate(exchangeRate, amount);
        uint256 underlyingAmountUSD = mul_ScalarTruncate(oraclePrice, underlyingAmount);
        return underlyingAmountUSD;
    }
}
