// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.10;

import "./interfaces/IPriceOracle.sol";
import "./UniswapLib.sol";


contract UniswapConfig {

    /// @dev Describe how the USD price should be determined for an asset.
    struct TokenConfig {
        // The address of the underlying market token. For this `LINK` market configuration, this would be the address of the `LINK` token.
        address underlying;
        // The bytes32 hash of the underlying symbol.
        bytes32 symbolHash;
        // The number of smallest units of measurement in a single whole unit.
        uint256 baseUnit;
        // The address of the pool being used as the anchor for this market.
        address uniswapMarket;
        // True if the pair on Uniswap is defined as ETH / X
        bool isUniswapReversed;
    }

    /// @notice cToken configs
    mapping(address => TokenConfig) public cTokenConfig;
    
    /// @notice cToken address by underlying's symbol hash
    mapping(bytes32 => address) internal cTokenBySymbolHash;

    /// @notice cToken address by underlying address
    mapping(address => address) internal cTokenByUnderlying;

    event ConfigUpdate(address indexed cToken, address uniswapMarket);

    error ZeroAddress();
    error InvalidCToken(address);
    error InvalidMarket(address uniswapPool, address underlying);

    /**
     * @notice Sets config to fetch underlying price
     * @param cToken The address of the Compound Token
     * @param uniswapMarket The address of the V3 pool being used as the anchor for this market
     */
    function _setTokenConfig(
        address cToken,
        address uniswapMarket
        ) internal {

        if(!ICToken(cToken).isCToken()) revert InvalidCToken(cToken);
        address underlying = ICToken(cToken).underlying();

        if(uniswapMarket == address(0)) revert ZeroAddress();
        if(
            IUniswapV3Pool(uniswapMarket).token0() != underlying && 
            IUniswapV3Pool(uniswapMarket).token1() != underlying
        ) revert InvalidMarket(uniswapMarket, underlying);

        bytes32 symbolHash = keccak256(bytes(IERC20(underlying).symbol()));
        uint256 baseUnit = 10 ** IERC20(underlying).decimals();
        bool isUniswapReversed = 
            IUniswapV3Pool(uniswapMarket).token0() == underlying ? false : true;

        cTokenConfig[cToken] = TokenConfig({
            underlying: underlying,
            symbolHash: symbolHash,
            baseUnit: baseUnit,
            uniswapMarket: uniswapMarket,
            isUniswapReversed: isUniswapReversed
        });

        cTokenBySymbolHash[symbolHash] = cToken;
        cTokenByUnderlying[underlying] = cToken;
        
        emit ConfigUpdate(cToken, uniswapMarket);
    }

    /**
     * @notice Get the config for symbol
     * @param symbol The symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbol(string calldata symbol)
        public
        view
        returns (TokenConfig memory)
    {
        TokenConfig memory config = cTokenConfig[cTokenBySymbolHash[keccak256(bytes(symbol))]];
        return config;
    }

    /**
     * @notice Get the config for the symbolHash
     * @param symbolHash The keccack256 of the symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbolHash(bytes32 symbolHash)
        public
        view
        returns (TokenConfig memory)
    {
        TokenConfig memory config = cTokenConfig[cTokenBySymbolHash[symbolHash]];
        return config;
    }

    /**
     * @notice Get the config for the cToken
     * @param cToken The address of the cToken of the config to get
     * @return The config object
     */
    function getTokenConfigByCToken(address cToken)
        public
        view
        returns (TokenConfig memory)
    {
        TokenConfig memory config = cTokenConfig[cToken];
        return config;
    }

    /**
     * @notice Get the config for an underlying asset
     * @dev The underlying address of ETH is the zero address
     * @param underlying The address of the underlying asset of the config to get
     * @return The config object
     */
    function getTokenConfigByUnderlying(address underlying)
        public
        view
        returns (TokenConfig memory)
    {
        TokenConfig memory config = cTokenConfig[cTokenByUnderlying[underlying]];
        return config;
    }
}
