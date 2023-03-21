// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./CErc20Delegate.sol";

interface IpTON {
    function deposit(uint amount, address receiver) external returns (uint);
    function maxRedeem(address owner) external view returns (uint);
    function redeem(uint shares, address receiver, address owner) external returns (uint);
}

/**
 * @title Compound's CDai Contract
 * @notice CToken which wraps Multi-Collateral DAI
 * @author Compound
 */
contract CpTonDelegate is CErc20Delegate {
    /**
     * @notice StakedTON contract address
     */
    address public stakedTON;


    /**
     * @notice Delegate interface to become the implementation
     * @param data The encoded arguments for becoming
     */
    function _becomeImplementation(bytes memory data) override public {
        require(msg.sender == admin, "only the admin may initialize the implementation");

        address stTonAddress_ = abi.decode(data, (address));
        return _becomeImplementation(stTonAddress_);
    }

    /**
     * @notice Explicit interface to become the implementation
     * @param stTonAddress_ StakedTON address
     */
    function _becomeImplementation(address stTonAddress_) internal {
        // Get dai and vat and sanity check the underlying
        stakedTON = stTonAddress_;
        EIP20Interface(stTonAddress_).approve(underlying, type(uint256).max);
    }

    /**
     * @notice Sender supplies stakedTON assets into the market and receives cTokens in exchange
     * stakedTON wraps into PooledTON (underlying) inside
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the stakedTON asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mintSt(uint mintAmount) external returns (uint) {
        accrueInterest();
        address minter = msg.sender;

        /* Verify market's block number equals current block number */
        if (accrualBlockNumber != getBlockNumber()) {
            revert MintFreshnessCheck();
        }

        Exp memory exchangeRate = Exp({mantissa: exchangeRateStoredInternal()});

        /* Wraps stTon to pTon, then deposits on behalf of msg.sender */
        EIP20Interface(stakedTON).transferFrom(minter, address(this), mintAmount);
        _checkUpdateAllowance(mintAmount);
        uint actualMintAmount = IpTON(underlying).deposit(mintAmount, address(this));

        /* Fail if mint not allowed */
        uint allowed = comptroller.mintAllowed(address(this), minter, actualMintAmount);
        if (allowed != 0) {
            revert MintComptrollerRejection(allowed);
        }

        uint mintTokens = div_(actualMintAmount, exchangeRate);

        totalSupply = totalSupply + mintTokens;
        accountTokens[minter] = accountTokens[minter] + mintTokens;

        /* We emit a Mint event, and a Transfer event */
        emit Mint(minter, actualMintAmount, mintTokens);
        emit Transfer(address(this), minter, mintTokens);

        return NO_ERROR;
    }


    /**
     * @notice Sender redeems cTokens in exchange for the stakedTON tokens
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of cTokens to redeem into stakedTON tokens
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemSt(uint redeemTokens) external returns (uint) {
        accrueInterest();
        address redeemer = msg.sender;
        require(redeemTokens > 0, "Redeem zero amount");

        /* exchangeRate = invoke Exchange Rate Stored() */
        Exp memory exchangeRate = Exp({mantissa: exchangeRateStoredInternal() });

        /*
        * We calculate the exchange rate and the amount of underlying to be redeemed:
        *  redeemAmount = redeemTokens x exchangeRateCurrent
        */
        uint redeemAmount = mul_ScalarTruncate(exchangeRate, redeemTokens);

        /* Fail if redeem not allowed */
        uint allowed = comptroller.redeemAllowed(address(this), redeemer, redeemTokens);
        if (allowed != 0) {
            revert RedeemComptrollerRejection(allowed);
        }

        /* Verify market's block number equals current block number */
        if (accrualBlockNumber != getBlockNumber()) {
            revert RedeemFreshnessCheck();
        }

        /* Fail gracefully if protocol has insufficient cash */
        if (getCashPrior() < redeemAmount) {
            revert RedeemTransferOutNotPossible();
        }

        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)

        /*
         * We write the previously calculated values into storage.
         *  Note: Avoid token reentrancy attacks by writing reduced supply before external transfer.
         */
        totalSupply = totalSupply - redeemTokens;
        accountTokens[redeemer] = accountTokens[redeemer] - redeemTokens;

        // Unwrap and transfer stakedTON tokens to redeemer
        IpTON(underlying).redeem(redeemAmount, redeemer, address(this));

        /* We emit a Transfer event, and a Redeem event */
        emit Transfer(redeemer, address(this), redeemTokens);
        emit Redeem(redeemer, redeemAmount, redeemTokens);

        /* We call the defense hook */
        comptroller.redeemVerify(address(this), redeemer, redeemAmount, redeemTokens);

        return NO_ERROR;
    }

    function _checkUpdateAllowance(uint amount) internal {
        if(EIP20Interface(stakedTON).allowance(address(this), underlying) < amount) {
            EIP20Interface(stakedTON).approve(underlying, type(uint256).max);
        }
    }
}
