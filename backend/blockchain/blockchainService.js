/**
 * MODULE E — BLOCKCHAIN SERVICE
 * Connects to an Ethereum node, interacts with CredentialRegistry smart contract.
 */

const { ethers } = require('ethers');
const artifact = require('../../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json');
const contractABI = artifact.abi;

let provider;
let ownerWallet;
let contract;

/**
 * Initialize provider, owner wallet, and contract instance.
 * Must be called before any other function.
 * @param {string} rpcUrl          e.g. http://127.0.0.1:8545
 * @param {string} ownerPrivateKey Owner wallet private key (used for registerIssuer only)
 * @param {string} contractAddress Deployed CredentialRegistry address
 */
function init(rpcUrl, ownerPrivateKey, contractAddress) {
  provider = new ethers.JsonRpcProvider(rpcUrl);
  ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
  contract = new ethers.Contract(contractAddress, contractABI, ownerWallet);
}

function _ensureInit() {
  if (!contract) throw new Error('blockchainService not initialized. Call init() first.');
}

/**
 * Get a contract instance connected to a specific signer wallet.
 * @param {string} privateKey  Issuer's Ethereum private key
 * @returns {ethers.Contract}
 */
function _contractAs(privateKey) {
  const signerWallet = new ethers.Wallet(privateKey, provider);
  return contract.connect(signerWallet);
}

// ---------------------------------------------------------------------------
// Issuer management (owner-only on-chain)
// ---------------------------------------------------------------------------

async function registerIssuerOnChain(issuerAddress) {
  _ensureInit();
  const tx = await contract.registerIssuer(issuerAddress);
  return tx.wait();
}

async function removeIssuerOnChain(issuerAddress) {
  _ensureInit();
  const tx = await contract.removeIssuer(issuerAddress);
  return tx.wait();
}

async function isIssuerAuthorized(issuerAddress) {
  _ensureInit();
  return contract.isIssuerAuthorized(issuerAddress);
}

// ---------------------------------------------------------------------------
// Credential management
// ---------------------------------------------------------------------------

/**
 * Issue credential on-chain, signed by the issuer's own Ethereum wallet.
 * @param {string} credentialId       bytes32 hex (0x-prefixed)
 * @param {string} merkleRoot         bytes32 hex (0x-prefixed)
 * @param {string} issuerEthPrivateKey Issuer's Ethereum private key
 */
async function issueCredentialOnChain(credentialId, merkleRoot, issuerEthPrivateKey) {
  _ensureInit();
  const issuerContract = _contractAs(issuerEthPrivateKey);
  const tx = await issuerContract.issueCredential(credentialId, merkleRoot);
  return tx.wait();
}

/**
 * Revoke credential on-chain, signed by the issuer's own Ethereum wallet.
 * @param {string} credentialId       bytes32 hex (0x-prefixed)
 * @param {string} issuerEthPrivateKey Issuer's Ethereum private key
 */
async function revokeCredentialOnChain(credentialId, issuerEthPrivateKey) {
  _ensureInit();
  const issuerContract = _contractAs(issuerEthPrivateKey);
  const tx = await issuerContract.revokeCredential(credentialId);
  return tx.wait();
}

/**
 * @returns {{ valid: boolean, merkleRoot: string }}
 */
async function verifyCredentialOnChain(credentialId) {
  _ensureInit();
  const [valid, merkleRoot] = await contract.verifyCredential(credentialId);
  return { valid, merkleRoot };
}

async function getMerkleRootOnChain(credentialId) {
  _ensureInit();
  return contract.getMerkleRoot(credentialId);
}

module.exports = {
  init,
  registerIssuerOnChain,
  removeIssuerOnChain,
  isIssuerAuthorized,
  issueCredentialOnChain,
  revokeCredentialOnChain,
  verifyCredentialOnChain,
  getMerkleRootOnChain,
};
