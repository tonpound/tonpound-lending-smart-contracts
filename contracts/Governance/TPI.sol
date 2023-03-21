// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";

interface IgNFT {
    /// @notice View method to read SegmentManagement contract address
    /// @return Address of SegmentManagement contract
    function SEGMENT_MANAGEMENT() external view returns (address);
}

contract TPI is ERC20Permit, Multicall {

    error NotManagement();

    address public immutable segmentManagement;

    constructor(
        string memory name_,
        string memory symbol_,
        address initMintReceiver,
        uint256 initMintAmount,
        IgNFT gNft
    ) ERC20(name_, symbol_) ERC20Permit(name_) {
        segmentManagement = gNft.SEGMENT_MANAGEMENT();
        _mint(initMintReceiver, initMintAmount);
    }

    /// @notice         Function to be used for gNFT segment activation
    /// @param account  Address, whose token to be burned
    /// @param amount   Amount to be burned
    function burnFrom(address account, uint256 amount) external {
        if (msg.sender != segmentManagement) revert NotManagement();
        _burn(account, amount);
    }

    /// @notice View function to get current active circulating supply,
    ///         used to calculate price of gNFT segment activation
    /// @return Total supply without specific TPI storing address, e.g. vesting
    function getCirculatingSupply() external view returns (uint256) {
        return totalSupply();
    }
}
