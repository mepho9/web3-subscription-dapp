const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy mock ERC20 token
  const Token = await ethers.getContractFactory("ERC20Mock");
  const token = await Token.deploy("MockToken", "MOCK", deployer.address, ethers.parseEther("1000"));
  await token.waitForDeployment();
  console.log("MockToken deployed to:", token.target);

  // Deploy SubscriptionManager with mock token
  const fee = ethers.parseEther("10"); // 10 tokens fee
  const period = 30 * 24 * 60 * 60; // 30 days

  const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy(token.target, fee, period);
  await subscriptionManager.waitForDeployment();
  console.log("SubscriptionManager deployed to:", subscriptionManager.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
