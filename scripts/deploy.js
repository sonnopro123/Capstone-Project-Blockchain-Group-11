/**
 * Deploy CredentialRegistry to selected network.
 * Usage: npx hardhat run scripts/deploy.js --network sepolia
 */

const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const Factory = await ethers.getContractFactory('CredentialRegistry');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('CredentialRegistry deployed to:', address);
  console.log('Add this to your .env file:');
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
