import { verifyContract } from '@tideswap/common/verify'
import { sleep } from '@tideswap/common/sleep'
import { configs } from '@tideswap/common/config'

async function main() {
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_v3_core = await import(`@tideswap/v3-core/deployments/${networkName}.json`)
  const deployedContracts_v3_periphery = await import(`@tideswap/v3-periphery/deployments/${networkName}.json`)
  const deployedContracts_smart_router = await import(`@tideswap/smart-router/deployments/${networkName}.json`)
  const deployedContracts_masterchef = await import(`@tideswap/masterchef-v3/deployments/${networkName}.json`)

  // Verify SmartRouterHelper
  console.log('Verify SmartRouterHelper')
  await verifyContract(deployedContracts_smart_router.SmartRouterHelper)
  await sleep(10000)

  // Verify swapRouter
  console.log('Verify swapRouter')
  await verifyContract(deployedContracts_smart_router.SmartRouter, [
    deployedContracts_smart_router.FactoryV2,
    deployedContracts_v3_core.PancakeV3PoolDeployer,
    deployedContracts_v3_core.PancakeV3Factory,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
    deployedContracts_masterchef.StableSwapFactory,
    deployedContracts_masterchef.StableSwapInfo,
    config.WNATIVE,
  ])
  await sleep(10000)

  // Verify mixedRouteQuoterV1
  console.log('Verify mixedRouteQuoterV1')
  await verifyContract(deployedContracts_smart_router.MixedRouteQuoterV1, [
    deployedContracts_v3_core.PancakeV3PoolDeployer,
    deployedContracts_v3_core.PancakeV3Factory,
    deployedContracts_smart_router.FactoryV2,
    deployedContracts_masterchef.StableSwapFactory,
    config.WNATIVE,
  ])
  await sleep(10000)

  // Verify quoterV2
  console.log('Verify quoterV2')
  await verifyContract(deployedContracts_smart_router.QuoterV2, [
    deployedContracts_v3_core.PancakeV3PoolDeployer,
    deployedContracts_v3_core.PancakeV3Factory,
    config.WNATIVE,
  ])
  await sleep(10000)

  // Verify tokenValidator
  console.log('Verify tokenValidator')
  await verifyContract(deployedContracts_smart_router.TokenValidator, [
    deployedContracts_smart_router.FactoryV2,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
