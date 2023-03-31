// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;


contract MockPriceFeed {

    string public name;
    int256 public currentPrice;
    uint256 public lastUpdated;
    uint8 public decimals;

    constructor(string memory name_, uint8 decimals_) {
        name = name_;
        decimals = decimals_;
    }

    function setPriceFeedData(int256 price_, uint256 updatedAt_) external {
        currentPrice = price_;
        lastUpdated = updatedAt_;
    }

    function setPrice(int256 price_) external {
        currentPrice = price_;
    }

    function setTime(uint256 updatedAt_) external {
        lastUpdated = updatedAt_;
    }

    function setDecimals(uint8 decimals_) external {
        decimals = decimals_;
    }

    function latestRoundData() external view
		returns (
			uint80 roundId,
			int256 answer,
			uint256 startedAt,
			uint256 updatedAt,
			uint80 answeredInRound
		) {
            return (0, currentPrice, 0, lastUpdated, 0);
        }
}
