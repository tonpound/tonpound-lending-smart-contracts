// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "../../SimplePriceOracle.sol";
import "../../ExponentialNoError.sol";


contract SimplePriceOracleV2 is SimplePriceOracle, ExponentialNoError {

    /// @notice A common scaling factor to maintain precision
    uint256 public constant EXP_SCALE = 1e18;

    /// @notice         Evaluates input amount according to stored price, accrues interest
    /// @param cToken   Market to evaluate
    /// @param amount   Amount of tokens to evaluate according to 'reverse' order
    /// @param reverse  Order of evaluation
    /// @return         Depending on 'reverse' order:
    ///                     false - return USD amount equal to 'amount' of 'cToken' in wei
    ///                     true - return cTokens equal to 'amount' of USD 
    function getEvaluation(CToken cToken, uint256 amount, bool reverse) external returns (uint256) {
        Exp memory exchangeRate = Exp({mantissa: cToken.exchangeRateCurrent()});
        uint256 oraclePriceMantissa = getUnderlyingPrice(cToken);
        require(oraclePriceMantissa != 0, "invalid price");
        Exp memory oraclePrice = Exp({mantissa: oraclePriceMantissa});

        if (reverse) {
            // input: 'amount' in USD scaled in 1e18, i.e. 19.54$ = 19540000000000000000
            // tokenAmount = amountUSD / oraclePrice 
            // cTokenAmount = tokenAmount / exchangeRate
            uint256 tokenAmount = div_(amount, oraclePrice);
            uint256 cTokenAmount =  div_(tokenAmount, exchangeRate);
            return cTokenAmount; 
        }
        // underlyingAmount = exchangeRate * amount
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
    ///                     true - return cTokens equal to 'amount' of USD 
    function getEvaluationStored(CToken cToken, uint256 amount, bool reverse) external view returns (uint256) {
        Exp memory exchangeRate = Exp({mantissa: cToken.exchangeRateStored()});
        uint256 oraclePriceMantissa = getUnderlyingPrice(cToken);
        require(oraclePriceMantissa != 0, "invalid price");
        Exp memory oraclePrice = Exp({mantissa: oraclePriceMantissa});

        if (reverse) {
            // input: 'amount' in USD scaled in 1e18, i.e. 19.54$ = 19540000000000000000
            // tokenAmount = amountUSD / oraclePrice 
            // cTokenAmount = tokenAmount / exchangeRate
            uint256 tokenAmount = div_(amount, oraclePrice);
            uint256 cTokenAmount =  div_(tokenAmount, exchangeRate);
            return cTokenAmount; 
        }
        // underlyingAmount = exchangeRate * amount
        // underlyingAmountUSD = underlyingAmount * oraclePrice
        uint256 underlyingAmount = mul_ScalarTruncate(exchangeRate, amount);
        uint256 underlyingAmountUSD = mul_ScalarTruncate(oraclePrice, underlyingAmount);
        return underlyingAmountUSD;
    }
}
