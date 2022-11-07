import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, BigNumber, Signer, utils, constants, BigNumberish } from "ethers";
import { parseEther, poll } from "ethers/lib/utils";
import hre, { ethers, network } from "hardhat";
import { Impersonate } from "../utils/utilities";
import web3 from "web3";

const UNISWAPV2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const USDC_TOKEN = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WETH_TOKEN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const ADAI_V2 = "0x028171bCA77440897B824Ca71D1c56caC55b68A3";

const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const HDRN = "0xF2E3A6Ba8955B345a88E5013D9a299c0E83a787e";

const BUSD = "0x4Fabb145d64652a948d72533023f6E7A623C7C53";
const RAI = "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919";
const BAT = "0x7abE0cE388281d2aCF297Cb089caef3819b13448";
const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";
const MKR = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2";

describe.only("Balancer", function () {
  let signer: SignerWithAddress;
  let user: SignerWithAddress;

  let token: Contract;
  let token2: Contract;
  let tokenWETH: Contract;
  let recipient: Contract;
  let vault: Contract;

  before(async () => {
    signer = await Impersonate("0x1157A2076b9bB22a85CC2C162f20fAB3898F4101");
    user = await Impersonate("0x7713974908Be4BEd47172370115e8b1219F4A5f0");

    hre.tracer.nameTags[signer.address] = "ADMIN";

    vault = await ethers.getContractAt("IVault", "0xBA12222222228d8Ba445958a75a0704d566BF2C8", signer);

    tokenWETH = await ethers.getContractAt("IERC20", WETH_TOKEN, signer);

    token = await ethers.getContractAt("IERC20", MKR, signer);
    token2 = await ethers.getContractAt("IERC20", BAL, signer);

    const MockFlashLoanRecipient = await ethers.getContractFactory("MockFlashLoanRecipient");
    recipient = await MockFlashLoanRecipient.deploy(vault.address);
  });

  it("Balancer Flashloan", async function () {
    await vault
      .connect(signer)
      .flashLoan(recipient.address, [token.address, token2.address], [parseEther("100").toHexString(), parseEther("200").toHexString()], "0x10");
  });

  it("Single Swap (WETH USDT)", async function () {
    const poolId = "0x14bf727f67aa294ec36347bd95aba1a2c136fe7a00020000000000000000002c";

    const swap = {
      poolId: poolId,
      assetIn: WETH_TOKEN,
      assetOut: USDT,
      amount: 1000000000000,
    };

    // 0 = GIVEN_IN, 1 = GIVEN_OUT
    const swap_kind = 0;

    const swap_struct = {
      poolId: swap["poolId"],
      kind: swap_kind,
      assetIn: web3.utils.toChecksumAddress(swap["assetIn"]),
      assetOut: web3.utils.toChecksumAddress(swap["assetOut"]),
      amount: swap["amount"],
      userData: "0x",
    };

    const fund_struct = {
      sender: signer.address,
      fromInternalBalance: false,
      recipient: signer.address,
      toInternalBalance: false,
    };

    await tokenWETH.connect(signer).approve(vault.address, parseEther("20000"));

    await vault.connect(signer).swap(swap_struct, fund_struct, 0, 1669602495);
  });

  it("Single Swap (BAL WETH)", async function () {
    const pool_BAL_WETH = "0x3ebf48cd7586d7a4521ce59e53d9a907ebf1480f000200000000000000000028";

    const swap = {
      poolId: pool_BAL_WETH,
      assetIn: BAL,
      assetOut: WETH_TOKEN,
      amount: 1000000000,
    };

    // 0 = GIVEN_IN, 1 = GIVEN_OUT
    const swap_kind = 0;

    const swap_struct = {
      poolId: swap["poolId"],
      kind: swap_kind,
      assetIn: web3.utils.toChecksumAddress(swap["assetIn"]),
      assetOut: web3.utils.toChecksumAddress(swap["assetOut"]),
      amount: swap["amount"],
      userData: "0x",
    };

    const fund_struct = {
      sender: signer.address,
      fromInternalBalance: false,
      recipient: signer.address,
      toInternalBalance: false,
    };

    await token2.connect(signer).approve(vault.address, parseEther("10000"));

    await vault.connect(signer).swap(swap_struct, fund_struct, swap_kind, 1669602495, { value: parseEther("0") });
  });

  it("Batch Swap", async function () {
    const pool_BAL_WETH = "0x3ebf48cd7586d7a4521ce59e53d9a907ebf1480f000200000000000000000028";
    const pool_MKR_BAL = "0x03cd191f589d12b0582a99808cf19851e468e6b500020000000000000000002b";

    const swap = [
      {
        poolId: pool_MKR_BAL,
        assetIn: MKR,
        assetOut: BAL,
        amount: 100000000000000,
      },
      {
        poolId: pool_BAL_WETH,
        assetIn: BAL,
        assetOut: WETH_TOKEN,
        amount: 1000000000000000,
      },
    ];

    // 0 = GIVEN_IN, 1 = GIVEN_OUT
    const swap_kind = 0;

    // Token data
    const token_data: any = [];
    token_data[MKR] = {
      symbol: "MKR",
      decimals: "18",
      limit: constants.MaxInt256,
    };

    token_data[BAL] = {
      symbol: "BAL",
      decimals: "18",
      limit: constants.MaxInt256,
    };

    token_data[WETH_TOKEN] = {
      symbol: "WETH",
      decimals: "18",
      limit: constants.MaxInt256,
    };

    var token_addresses = Object.keys(token_data);
    token_addresses.sort();
    const token_indices: any = [];
    for (var i = 0; i < token_addresses.length; i++) {
      token_indices[token_addresses[i]] = i;
    }

    const swap_steps_struct = [];
    for (const step of swap) {
      const swap_step_struct = {
        poolId: step["poolId"],
        assetInIndex: token_indices[step["assetIn"]],
        assetOutIndex: token_indices[step["assetOut"]],
        amount: step["amount"],
        userData: "0x",
      };
      swap_steps_struct.push(swap_step_struct);
    }

    const token_limits = [];
    const checksum_tokens = [];
    for (const token of token_addresses) {
      token_limits.push(token_data[token]["limit"]).toString();
      checksum_tokens.push(web3.utils.toChecksumAddress(token));
    }

    const fund_struct = {
      sender: signer.address,
      fromInternalBalance: false,
      recipient: signer.address,
      toInternalBalance: false,
    };

    await token.connect(signer).approve(vault.address, parseEther("20000"));

    await vault.connect(signer).batchSwap(swap_kind, swap_steps_struct, checksum_tokens, fund_struct, token_limits, 1669602495, { value: parseEther("0") });
  });
});
