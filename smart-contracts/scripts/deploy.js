const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  let token;

  if (hre.network.name === "localhost") {
    // Deploy mock for local
    const Token = await ethers.getContractFactory("ERC20Mock");
    token = await Token.deploy("MockToken", "MOCK", deployer.address, ethers.parseEther("1000"));
    await token.waitForDeployment();
    console.log("MockToken deployed to:", token.target);
  } else {
    // Use existing M9 on Sepolia
    const tokenAddress = "0xf0557F93506F287fe46657cCc40b66404e331ffF";
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    token = { target: tokenAddress };
    console.log("Using existing token:", token.target);
  }

  // Deploy SubscriptionManager
  const fee = ethers.parseEther("10");
  const period = 30 * 24 * 60 * 60;
  const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy(token.target, fee, period);
  await subscriptionManager.waitForDeployment();
  console.log("SubscriptionManager deployed to:", subscriptionManager.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
