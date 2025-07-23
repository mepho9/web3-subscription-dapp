const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SubscriptionManager", function () {
  let token;
  let subscriptionManager;
  let owner;
  let user;
  const fee = ethers.parseEther("10"); // 10 tokens
  const period = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy mock token
    const Token = await ethers.getContractFactory("ERC20Mock");
    token = await Token.deploy("MockToken", "MOCK", owner.address, ethers.parseEther("1000"));
    await token.waitForDeployment();

    // Send tokens to user
    await token.transfer(user.address, ethers.parseEther("100"));

    // Deploy subscription manager
    const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
    subscriptionManager = await SubscriptionManager.deploy(token.target, fee, period);
    await subscriptionManager.waitForDeployment();

    // Approve subscription payment
    await token.connect(user).approve(subscriptionManager.target, ethers.parseEther("100"));
  });

  describe("Deployment", function () {
    it("should set the correct fee, period, and token", async function () {
      expect(await subscriptionManager.subscriptionFee()).to.equal(fee);
      expect(await subscriptionManager.subscriptionPeriod()).to.equal(period);
      expect(await subscriptionManager.acceptedToken()).to.equal(token.target);
    });
  });

  describe("Subscription", function () {
    it("should allow a user to subscribe and set expiration", async function () {
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      await subscriptionManager.connect(user).subscribe();

      const expiresAt = await subscriptionManager.subscriptionExpiresAt(user.address);
      expect(expiresAt).to.be.greaterThan(now);
    });

    it("should extend an existing subscription", async function () {
      await subscriptionManager.connect(user).subscribe();
      const firstExpiry = await subscriptionManager.subscriptionExpiresAt(user.address);

      await ethers.provider.send("evm_increaseTime", [1]);
      await subscriptionManager.connect(user).subscribe();
      const secondExpiry = await subscriptionManager.subscriptionExpiresAt(user.address);

      expect(secondExpiry).to.equal(firstExpiry + BigInt(period));
    });

    it("should emit Subscribed event", async function () {
      const tx = await subscriptionManager.connect(user).subscribe();
      const expiresAt = await subscriptionManager.subscriptionExpiresAt(user.address);

      await expect(tx)
        .to.emit(subscriptionManager, "Subscribed")
        .withArgs(user.address, expiresAt);
    });

    it("should revert if token transfer fails", async function () {
      const [_, __, otherUser] = await ethers.getSigners();
      await expect(subscriptionManager.connect(otherUser).subscribe()).to.be.reverted;
    });
  });

  describe("Getters", function () {
    it("should return true for subscribed users", async function () {
      await subscriptionManager.connect(user).subscribe();
      expect(await subscriptionManager.isSubscribed(user.address)).to.equal(true);
    });

    it("should return false for non-subscribed users", async function () {
      expect(await subscriptionManager.isSubscribed(user.address)).to.equal(false);
    });

    it("should return remaining time correctly", async function () {
      await subscriptionManager.connect(user).subscribe();
      const remaining = await subscriptionManager.getRemainingTime(user.address);
      expect(remaining).to.be.above(0);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async () => {
      await subscriptionManager.connect(user).subscribe();
    });

    it("should allow the owner to withdraw a specific amount", async function () {
      const ownerBalanceBefore = await token.balanceOf(owner.address);
      await subscriptionManager.connect(owner).withdraw(owner.address, fee);
      const ownerBalanceAfter = await token.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(fee);
    });

    it("should allow the owner to withdraw all tokens", async function () {
      const total = await token.balanceOf(subscriptionManager.target);
      await subscriptionManager.connect(owner).withdrawAll(owner.address);
      const balanceAfter = await token.balanceOf(subscriptionManager.target);
      expect(balanceAfter).to.equal(0);
    });

    it("should emit TokensWithdrawn event", async function () {
      await expect(subscriptionManager.connect(owner).withdrawAll(owner.address))
        .to.emit(subscriptionManager, "TokensWithdrawn")
        .withArgs(owner.address, fee);
    });

    it("should revert if non-owner tries to withdraw", async function () {
      await expect(subscriptionManager.connect(user).withdraw(user.address, fee)).to.be.reverted;
    });
  });

    describe("Chainlink Automation (auto-renewal)", function () {
    beforeEach(async () => {
      // Subscribe user
      await subscriptionManager.connect(user).subscribe();

      // Enable auto-renew
      await subscriptionManager.connect(user).setAutoRenew(true);

      // Advance time beyond subscription expiration
      await ethers.provider.send("evm_increaseTime", [period + 10]);
      await ethers.provider.send("evm_mine");

      // Re-approve in case tokens need approval again
      await token.connect(user).approve(subscriptionManager.target, ethers.parseEther("100"));
    });

    it("should return true in checkUpkeep when subscription expired and autoRenew is enabled", async () => {
      const { upkeepNeeded, performData } = await subscriptionManager.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;

      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["address"], performData);
      expect(decoded[0]).to.equal(user.address);
    });

    it("should perform auto-renewal via performUpkeep", async () => {
      const { performData } = await subscriptionManager.checkUpkeep("0x");

      const oldExpiry = await subscriptionManager.subscriptionExpiresAt(user.address);

      await subscriptionManager.performUpkeep(performData);

      const newExpiry = await subscriptionManager.subscriptionExpiresAt(user.address);

      expect(newExpiry).to.be.greaterThan(oldExpiry);
    });

    it("should not renew if autoRenew is off", async () => {
      await subscriptionManager.connect(user).setAutoRenew(false);
      const { upkeepNeeded } = await subscriptionManager.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });
  });

});
