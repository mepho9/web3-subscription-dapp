const { ethers } = require("hardhat");
const { parseEther, formatEther, formatUnits } = require("ethers");

// 0x7e993Bb37E63d0b0B47A8558afD407200d4446E5
async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying contracts with:", deployer.address);

	const balance = await ethers.provider.getBalance(deployer.address);
	console.log("Balance SepoliaETH:", formatEther(balance));

	const feeData = await ethers.provider.getFeeData();
	console.log("Gas Price (gwei):", formatUnits(feeData.gasPrice, "gwei"));

	const tokenAddress = "0xf0557F93506F287fe46657cCc40b66404e331ffF";
	console.log("Using existing token:", tokenAddress);

	const fee = parseEther("10");
	const period = 30 * 24 * 60 * 60;

	const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
	const subscriptionManager = await SubscriptionManager.deploy(tokenAddress, fee, period);
	await subscriptionManager.waitForDeployment();

	console.log("SubscriptionManager deployed to:", subscriptionManager.target);
}

main().catch((error) => {
	console.error("Deployment failed:", error);
	process.exitCode = 1;
});
