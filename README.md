Tonpound Protocol
=================

Tonpound is a decentralized lending protocol that connects The Open Network (TON) and Ethereum blockchain.
The main advantage of Tonpound is the ability to use wrapped versions of Toncoin (TON) as collateral to borrow funds. This feature allows traders to keep their TON position while earning passive income both from node fees and Supply lending interest. In addition, lenders receive an opportunity to borrow other assets available on Tonpound Markets.
The Tonpound Protocol is an Ethereum smart contract for supplying or borrowing assets. Through the cToken contracts, accounts on the blockchain *supply* capital (Ether or ERC-20 tokens) to receive cTokens or *borrow* assets from the protocol (holding other assets as collateral). The Compound cToken contracts track these balances and algorithmically set interest rates for borrowers.

Before getting started with this repo, please read:

* The [Tonpound Litepaper](https://app.gitbook.com/o/k1EyBt30VBr5MJanNvVd/s/Pc0VBkkXbYch7DGAVxUb/), describing how Tonpound works.

Governance
=========
Tonpound is governed by its Decentralized Autonomous Organization (DAO), whose membership is based on holding a governance NFT (gNFT). The members of Tonpound DAO can vote on protocol development and receive benefits such as share in protocol income. For an overview of Tonpound DAO, please see Section 5. 
Tonpound Participation Index (TPI) is an ERC-20 token that must be burned to obtain a fully functional gNFT. No pre-sale of TPI or gNFTs will take place, however, a large part of TPI’s supply will be distributed as airdrop to the most active users and first liquidity providers to Tonpound Markets. 



## Deploying Tonpound contracts
---------------------------------------

To deploy contracts use hardhat-deploy script:
```
npx hardhat deploy --network <networkName> --tags <"DeployTag">
```

For contract verification:
```
npx hardhat --network <networkName> etherscan-verify
```


## Mainnet Deploy order

```
npx hardhat deploy --network main --tags "TPI"

npx hardhat deploy --network main --tags "Comptroller"
npx hardhat deploy --network main --tags "TrollSet1"
npx hardhat deploy --network main --tags "TrollSet2"

npx hardhat deploy --network main --tags "RateModels"
npx hardhat deploy --network main --tags "CERC"
npx hardhat deploy --network main --tags "ReserveFactor"
npx hardhat deploy --network main --tags "CPTON"

npx hardhat deploy --network main --tags "TonPriceOracle"
npx hardhat deploy --network main --tags "TwapOracle"

npx hardhat deploy --network main --tags "TrollSet3"
npx hardhat deploy --network main --tags "TrollSet4"
npx hardhat deploy --network main --tags "TrollSet5"
npx hardhat deploy --network main --tags "TrollSet6"
npx hardhat deploy --network main --tags "TrollSet7"


npx hardhat deploy --network hardhat --tags "Comptroller,TrollSet1,TrollSet2,RateModels,CERC,ReserveFactor,CPTON,TonPriceOracle,TrollSet3,TrollSet4,TrollSet5,TrollSet6,TrollSet7"

```