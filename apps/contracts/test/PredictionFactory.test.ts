import { ethers } from "hardhat";
import { expect } from "chai";

describe("PredictionFactory", function () {
  let factory: any;
  let mockPyth: any;
  let owner: any, user1: any, user2: any;
  const ASSET = 0; // BTC
  const STAKE = ethers.parseEther("1");
  const PREDICTION1 = 100000;
  const PREDICTION2 = 110000;
  const BTC_FEED_ID =
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const MockPyth = await ethers.getContractFactory("MockPyth");
    mockPyth = await MockPyth.deploy();

    const PredictionFactory = await ethers.getContractFactory(
      "PredictionFactory"
    );
    factory = await PredictionFactory.deploy(await mockPyth.getAddress());

    // Set initial price in mock
    await mockPyth.setPrice(100000, 0); // $100,000
  });

  it("should create, join, and settle a pool with correct winner", async () => {
    // 1. Create pool by user1
    await expect(
      factory
        .connect(user1)
        .createPool(ASSET, STAKE, PREDICTION1, [], { value: STAKE })
    ).to.emit(factory, "PoolCreated");

    // 2. Join pool by user2 (no extra array argument)
    await expect(
      factory
        .connect(user2)
        .joinPool(ASSET, STAKE, PREDICTION2, { value: STAKE })
    ).to.emit(factory, "PoolJoined");

    // 3. Fast-forward 5 minutes
    await ethers.provider.send("evm_increaseTime", [5 * 60]);
    await ethers.provider.send("evm_mine", []);

    // 4. Set new price in mock for settlement
    await mockPyth.setPrice(109000, 0); // $109,000

    // 5. Settle pool (user2 is closer)
    const balanceBefore = await ethers.provider.getBalance(user2.address);
    const tx = await factory
      .connect(owner)
      .settlePool(ASSET, STAKE, [], { value: 0 });
    await tx.wait();
    const balanceAfter = await ethers.provider.getBalance(user2.address);

    expect(balanceAfter - balanceBefore).to.be.closeTo(
      STAKE * 2n,
      ethers.parseEther("0.01")
    );
  });

  it("should not allow creating a new pool if one is active", async () => {
    await factory
      .connect(user1)
      .createPool(ASSET, STAKE, PREDICTION1, [], { value: STAKE });
    await expect(
      factory
        .connect(user2)
        .createPool(ASSET, STAKE, PREDICTION2, { value: STAKE })
    ).to.be.revertedWith("Active pool exists");
  });

  it("should allow refund if no one joins in 5 minutes", async () => {
    await factory
      .connect(user1)
      .createPool(ASSET, STAKE, PREDICTION1, [], { value: STAKE });
    await ethers.provider.send("evm_increaseTime", [5 * 60]);
    await ethers.provider.send("evm_mine", []);
    const balanceBefore = await ethers.provider.getBalance(user1.address);
    const tx = await factory.connect(user1).refundPool(ASSET, STAKE);
    await tx.wait();
    const balanceAfter = await ethers.provider.getBalance(user1.address);
    expect(balanceAfter - balanceBefore).to.be.closeTo(
      STAKE,
      ethers.parseEther("0.01")
    );
  });

  it("should enforce pool status transitions", async () => {
    await factory
      .connect(user1)
      .createPool(ASSET, STAKE, PREDICTION1, [], { value: STAKE });
    await factory
      .connect(user2)
      .joinPool(ASSET, STAKE, PREDICTION2, { value: STAKE });
    // Try to refund after join (should fail)
    await ethers.provider.send("evm_increaseTime", [5 * 60]);
    await ethers.provider.send("evm_mine", []);
    await expect(
      factory.connect(user1).refundPool(ASSET, STAKE)
    ).to.be.revertedWith("Pool already joined");
  });
});
