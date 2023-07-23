import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  typechain: {
    outDir: "typechain",
  },
  networks: {
    sepolia: {
      url: "https://empty-black-brook.ethereum-sepolia.discover.quiknode.pro/aaa3a928279d171584fb68c564fb2b63f4096c5f/",
      chainId: 11155111,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    // testnet
    // gnosis: {
    //   url: "https://rpc.chain49.com/gnosis-chiado/db4f02be85mshf86ac49af245e5ep1c323ejsn871f8e96f2bb",
    //   chainId: 10200,
    //   accounts: [`0x${process.env.PRIVATE_KEY}`],
    // },
    // testnet
    linea: {
      url: "https://linea-goerli.infura.io/v3/d44378c8782446c2abd641d4d87ce0b9",
      chainId: 59140,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    mantle: {
      url: "https://rpc.ankr.com/mantle_testnet/8fe8c3eeaf26053c78e8e37539781a5227c1c6056b025418befcf26bf30a407b",
      chainId: 5001,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      gas: 5000000, // Adding gas limit
    },
    //
    // zetachain: {
    //   ???
    // },
    celo: {
      url: "https://celo-alfajores.infura.io/v3/d44378c8782446c2abd641d4d87ce0b9",
      chainId: 44787,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};

export default config;
