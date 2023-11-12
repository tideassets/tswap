import { ethers, network } from 'hardhat'
import { configs } from '@tideswap/common/config'
import { tryVerify } from '@tideswap/common/verify'
import { writeFileSync } from 'fs'

async function main() {
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@tideswap/v3-core/deployments/${networkName}.json`)
  const v3PeripheryDeployedContracts = await import(`@tideswap/v3-periphery/deployments/${networkName}.json`)
  const v3MasterChefDeployedContracts = await import(`@tideswap/masterchef-v3/deployments/${networkName}.json`)

  const pancakeV3PoolDeployer_address = v3DeployedContracts.PancakeV3PoolDeployer
  const pancakeV3Factory_address = v3DeployedContracts.PancakeV3Factory
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager
  const stableFactory_address = v3MasterChefDeployedContracts.StableSwapFactory
  const stableInfo_address = v3MasterChefDeployedContracts.StableSwapInfo

  /** Factoryv2 */
  console.log('Deploying Factoryv2...')
  const FactoryV2 = await ethers.getContractFactory('PancakeFactory')
  const factoryV2 = await FactoryV2.deploy("0x0000000000000000000000000000000000000000") // no fee handler
  console.log('Factoryv2 deployed to:', factoryV2.address)

  /** SmartRouterHelper */
  console.log('Deploying SmartRouterHelper...')
  const SmartRouterHelper = await ethers.getContractFactory('SmartRouterHelper')
  const smartRouterHelper = await SmartRouterHelper.deploy()
  console.log('SmartRouterHelper deployed to:', smartRouterHelper.address)
  // await tryVerify(smartRouterHelper)

  /** SmartRouter */
  console.log('Deploying SmartRouter...')
  const SmartRouter = await ethers.getContractFactory('SmartRouter', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const smartRouter = await SmartRouter.deploy(
    factoryV2.address,
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    positionManager_address,
    stableFactory_address,
    stableInfo_address,
    config.WNATIVE
  )
  console.log('SmartRouter deployed to:', smartRouter.address)

  // await tryVerify(smartRouter, [
  //   config.v2Factory,
  //   pancakeV3PoolDeployer_address,
  //   pancakeV3Factory_address,
  //   positionManager_address,
  //   config.stableFactory,
  //   config.stableInfo,
  //   config.WNATIVE,
  // ])

  /** MixedRouteQuoterV1 */
  const MixedRouteQuoterV1 = await ethers.getContractFactory('MixedRouteQuoterV1', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const mixedRouteQuoterV1 = await MixedRouteQuoterV1.deploy(
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    factoryV2.address,
    stableFactory_address,
    config.WNATIVE
  )
  console.log('MixedRouteQuoterV1 deployed to:', mixedRouteQuoterV1.address)

  // await tryVerify(mixedRouteQuoterV1, [
  //   pancakeV3PoolDeployer_address,
  //   pancakeV3Factory_address,
  //   config.v2Factory,
  //   config.stableFactory,
  //   config.WNATIVE,
  // ])

  /** QuoterV2 */
  const QuoterV2 = await ethers.getContractFactory('QuoterV2', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const quoterV2 = await QuoterV2.deploy(pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE)
  console.log('QuoterV2 deployed to:', quoterV2.address)

  // await tryVerify(quoterV2, [pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE])

  /** TokenValidator */
  const TokenValidator = await ethers.getContractFactory('TokenValidator', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const tokenValidator = await TokenValidator.deploy(factoryV2.address, positionManager_address)
  console.log('TokenValidator deployed to:', tokenValidator.address)

  // await tryVerify(tokenValidator, [config.v2Factory, positionManager_address])

  const contracts = {
    FactoryV2: factoryV2.address,
    SmartRouter: smartRouter.address,
    SmartRouterHelper: smartRouterHelper.address,
    MixedRouteQuoterV1: mixedRouteQuoterV1.address,
    QuoterV2: quoterV2.address,
    TokenValidator: tokenValidator.address,
  }

  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
