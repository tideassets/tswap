import { verifyContract } from '@tideswap/common/verify'
import { sleep } from '@tideswap/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@tideswap/v3-core/deployments/${networkName}.json`)

  // Verify PancakeV3PoolDeployer
  console.log('Verify PancakeV3PoolDeployer')
  await verifyContract(deployedContracts.PancakeV3PoolDeployer)
  await sleep(10000)

  // Verify pancakeV3Factory
  console.log('Verify pancakeV3Factory')
  await verifyContract(deployedContracts.PancakeV3Factory, [deployedContracts.PancakeV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
