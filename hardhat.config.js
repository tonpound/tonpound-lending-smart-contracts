require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
// require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    // version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAIN_NODE,
        enabled: true,
      },
      saveDeployments: true,
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    bsctestnet: {
      // gasPrice: "auto", // "10000000000", // 10 gwei
      // gasMultiplier: "1.1",
      saveDeployments: true,
      url: process.env.BSC_NODE || "",
      accounts: [
        process.env.PRIVATE_KEY0,
        process.env.PRIVATE_KEY1,
        process.env.PRIVATE_KEY2,
      ],
    },
    goerli: {
      saveDeployments: true,
      url: process.env.GOERLI_NODE || "",
      accounts: [
        process.env.PRIVATE_KEY0,
        process.env.PRIVATE_KEY1,
        process.env.PRIVATE_KEY2,
      ],
    },
    main: {
      saveDeployments: true,
      url: process.env.MAIN_NODE || "",
      accounts: [
        process.env.PRIVATE_KEY0,
        process.env.PRIVATE_KEY1,
        process.env.PRIVATE_KEY2,
      ],
    },
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
      apiUrl: process.env.BLOCK_EXPLORER,
      sleep: 500,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
    },
  },
  paths: {
    deploy: "deploy",
    deployments: "deployments",
    // imports: 'imports'
  },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  // },
};
