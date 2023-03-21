// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ICToken {
    function underlying() external view returns (address);
    function exchangeRateCurrent() external returns (uint);
    function exchangeRateStored() external view returns (uint);
    function isCToken() external view returns (bool);
}

interface IPriceOracle {
    function isPriceOracle() external view returns (bool);
    function getAssetPrice(address asset) external view returns (uint);
    function getAssetPriceUpdateTimestamp(address asset) external view returns (uint);
    function getUnderlyingPrice(ICToken cToken) external view returns (uint);
    function getUnderlyingPriceUpdateTimestamp(address cToken) external view returns (uint);
}
