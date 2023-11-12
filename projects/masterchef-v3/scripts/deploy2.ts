/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { configs } from "@tideswap/common/config";
import { tryVerify } from "@tideswap/common/verify";
import { writeFileSync } from "fs";

async function main() {
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  // Check if the network is supported.
  console.log(`Deploying to ${networkName} network...`);

  // Compile contracts.
  await run("compile");
  console.log("Compiled contracts...");

  const config = configs[networkName as keyof typeof configs];
  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }

  const v3PeripheryDeployedContracts = await import(`@tideswap/v3-periphery/deployments/${networkName}.json`);
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager;

  const MasterChefV3 = await ethers.getContractFactory("MasterChefV3");
  const masterChefV3 = await MasterChefV3.deploy(config.cake, positionManager_address, config.WNATIVE);
  console.log("masterChefV3 deployed to:", masterChefV3.address);

  const StableLPFactory = await ethers.getContractFactory("PancakeStableSwapLPFactory");
  const stableLPFactory = await StableLPFactory.deploy();
  console.log("stableLPFactory deployed to:", stableLPFactory.address);

  const StableSwapTwoPoolDeployer = await ethers.getContractFactory("PancakeStableSwapTwoPoolDeployer");
  const stableSwapTwoPoolDeployer = await StableSwapTwoPoolDeployer.deploy();
  console.log("stableSwapTwoPoolDeployer deployed to:", stableSwapTwoPoolDeployer.address);

  const StableSwapThreePoolDeployer = await ethers.getContractFactory("PancakeStableSwapThreePoolDeployer");
  const stableSwapThreePoolDeployer = await StableSwapThreePoolDeployer.deploy();
  console.log("stableSwapThreePoolDeployer deployed to:", stableSwapThreePoolDeployer.address);

  const StableSwapFactory = await ethers.getContractFactory("PancakeStableSwapFactory");
  const stableSwapFactory = await StableSwapFactory.deploy(stableLPFactory.address, stableSwapTwoPoolDeployer.address, stableSwapThreePoolDeployer.address);
  console.log("stableSwapFactory deployed to:", stableSwapFactory.address);

  const StableSwapInfo = await ethers.getContractFactory("PancakeStableSwapTwoPoolInfo");
  const stableSwapInfo = await StableSwapInfo.deploy();
  console.log("stableSwapInfo deployed to:", stableSwapInfo.address);
  // await tryVerify(masterChefV3, [config.cake, positionManager_address]);

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        MasterChefV3: masterChefV3.address,
        StableSwapFactory: stableSwapFactory.address,
        StableSwapInfo: stableSwapInfo.address,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
