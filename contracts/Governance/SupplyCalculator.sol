// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


interface IgNFT {
    /// @notice View method to read SegmentManagement contract address
    /// @return Address of SegmentManagement contract
    function SEGMENT_MANAGEMENT() external view returns (address);
}

interface IVestingWallet {
    /// @notice Getter for the amount of releasable `token` tokens
    /// @param token Address of IERC20 token to be checked
    /// @return Amount of `token` tokens ready to be released
    function releasable(address token) external view returns (uint256);
}

interface ITPI {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract SupplyCalculator is Ownable {
    error ZeroAddress();
    error OnlyOnce();
    error MaxLimit();
    error MaxExcluded();
    error IndexError();
    error NotReady();

    ITPI public immutable TPI;
    address[] public vestingWallets;
    address[] public excluded;
    uint8 public constant maxExcluded = 50;

    constructor(ITPI TPI_) {
        if(address(TPI_) == address(0)) revert ZeroAddress();
        TPI = TPI_;
    }

    /// @notice View function to get current active circulating supply,
    ///         used to calculate price of gNFT segment activation
    /// @return Total supply without specific TPI storing address, e.g. vesting
    function getCirculatingSupply() external view returns (uint256) {
        uint256 curSupply = TPI.totalSupply();
        uint256 len = vestingWallets.length;
        uint256 vested;
        uint256 releasable;
        address vesting;

        for (uint256 i = 0; i < len; ) {
            vesting = vestingWallets[i];
            vested += TPI.balanceOf(vesting);
            releasable += IVestingWallet(vesting).releasable(address(TPI));
            unchecked {i++;}
        }

        uint256 excludedAmount;
        uint256 excludedLen = excluded.length;
        for (uint256 j = 0; j < excludedLen;) {
            excludedAmount += TPI.balanceOf(excluded[j]);
            unchecked {j++;}
        }

        return curSupply + vested - releasable - excludedAmount;
    }

    function removeVesting(uint256 i) external onlyOwner {
        uint256 len = vestingWallets.length;
        if (i >= len) revert IndexError();

        address vesting = vestingWallets[i];
        if (TPI.balanceOf(vesting) - IVestingWallet(vesting).releasable(address(TPI)) > 0) 
            revert NotReady();
        
        vestingWallets[i] = vestingWallets[len-1];
        vestingWallets.pop();
    }

    function setVesting(address[] calldata _vestingWallets) external onlyOwner{
        if (vestingWallets.length > 0) revert OnlyOnce();
        if (_vestingWallets.length > 10) revert MaxLimit();
        vestingWallets = _vestingWallets;
    }

    function addExcluded(address[] calldata excluded_) external onlyOwner {
        uint256 len = excluded_.length;
        if (len + excluded.length > maxExcluded) revert MaxExcluded();

        for (uint256 i = 0; i < len; ) {
            if (excluded_[i] == address(0)) revert ZeroAddress();
            excluded.push(excluded_[i]);
            unchecked {i++;}
        }
    }

    function removeExcluded(address excluded_) external onlyOwner {
        uint256 len = excluded.length;
        for (uint256 i = 0; i < len; ) {
            if (excluded[i] == excluded_) {
                excluded[i] = excluded[len - 1];
                excluded.pop();
                return;
            }
            unchecked {i++;}
        }
    }
}
