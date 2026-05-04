/**
 * Hardhat unit tests for CredentialRegistry.sol
 * Run: npx hardhat test
 */

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CredentialRegistry', function () {
  let registry;
  let owner, issuer1, issuer2, other;

  const CREDENTIAL_ID = ethers.keccak256(ethers.toUtf8Bytes('student001:issuer1'));
  const MERKLE_ROOT = ethers.keccak256(ethers.toUtf8Bytes('merkle_root_hash'));

  beforeEach(async function () {
    [owner, issuer1, issuer2, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('CredentialRegistry');
    registry = await Factory.deploy();
  });

  // -------------------------------------------------------------------------
  // Issuer management
  // -------------------------------------------------------------------------
  describe('registerIssuer', function () {
    it('owner can register issuer', async function () {
      await registry.registerIssuer(issuer1.address);
      expect(await registry.isIssuerAuthorized(issuer1.address)).to.be.true;
    });

    it('non-owner cannot register issuer', async function () {
      await expect(registry.connect(other).registerIssuer(issuer1.address)).to.be.revertedWith('Not owner');
    });

    it('cannot register same issuer twice', async function () {
      await registry.registerIssuer(issuer1.address);
      await expect(registry.registerIssuer(issuer1.address)).to.be.revertedWith('Already registered');
    });
  });

  describe('removeIssuer', function () {
    beforeEach(async () => registry.registerIssuer(issuer1.address));

    it('owner can remove issuer', async function () {
      await registry.removeIssuer(issuer1.address);
      expect(await registry.isIssuerAuthorized(issuer1.address)).to.be.false;
    });

    it('non-owner cannot remove issuer', async function () {
      await expect(registry.connect(other).removeIssuer(issuer1.address)).to.be.revertedWith('Not owner');
    });
  });

  // -------------------------------------------------------------------------
  // Credential management
  // -------------------------------------------------------------------------
  describe('issueCredential', function () {
    beforeEach(async () => registry.registerIssuer(issuer1.address));

    it('authorized issuer can issue credential', async function () {
      await registry.connect(issuer1).issueCredential(CREDENTIAL_ID, MERKLE_ROOT);
      expect(await registry.getMerkleRoot(CREDENTIAL_ID)).to.equal(MERKLE_ROOT);
    });

    it('unauthorized address cannot issue credential', async function () {
      await expect(
        registry.connect(other).issueCredential(CREDENTIAL_ID, MERKLE_ROOT)
      ).to.be.revertedWith('Not authorized issuer');
    });

    it('cannot issue same credential twice', async function () {
      await registry.connect(issuer1).issueCredential(CREDENTIAL_ID, MERKLE_ROOT);
      await expect(
        registry.connect(issuer1).issueCredential(CREDENTIAL_ID, MERKLE_ROOT)
      ).to.be.revertedWith('Already issued');
    });
  });

  describe('revokeCredential', function () {
    beforeEach(async function () {
      await registry.registerIssuer(issuer1.address);
      await registry.connect(issuer1).issueCredential(CREDENTIAL_ID, MERKLE_ROOT);
    });

    it('issuer can revoke their credential', async function () {
      await registry.connect(issuer1).revokeCredential(CREDENTIAL_ID);
      expect(await registry.isRevoked(CREDENTIAL_ID)).to.be.true;
    });

    it('other issuer cannot revoke', async function () {
      await registry.registerIssuer(issuer2.address);
      await expect(
        registry.connect(issuer2).revokeCredential(CREDENTIAL_ID)
      ).to.be.revertedWith('Not credential issuer');
    });

    it('cannot revoke twice', async function () {
      await registry.connect(issuer1).revokeCredential(CREDENTIAL_ID);
      await expect(
        registry.connect(issuer1).revokeCredential(CREDENTIAL_ID)
      ).to.be.revertedWith('Already revoked');
    });
  });

  // -------------------------------------------------------------------------
  // verifyCredential
  // -------------------------------------------------------------------------
  describe('verifyCredential', function () {
    beforeEach(async function () {
      await registry.registerIssuer(issuer1.address);
      await registry.connect(issuer1).issueCredential(CREDENTIAL_ID, MERKLE_ROOT);
    });

    it('valid credential returns true', async function () {
      const [valid, root] = await registry.verifyCredential(CREDENTIAL_ID);
      expect(valid).to.be.true;
      expect(root).to.equal(MERKLE_ROOT);
    });

    it('revoked credential returns false', async function () {
      await registry.connect(issuer1).revokeCredential(CREDENTIAL_ID);
      const [valid] = await registry.verifyCredential(CREDENTIAL_ID);
      expect(valid).to.be.false;
    });

    it('unknown credential returns false', async function () {
      const [valid, root] = await registry.verifyCredential(ethers.keccak256(ethers.toUtf8Bytes('unknown')));
      expect(valid).to.be.false;
      expect(root).to.equal(ethers.ZeroHash);
    });

    it('credential becomes invalid when issuer removed', async function () {
      await registry.removeIssuer(issuer1.address);
      const [valid] = await registry.verifyCredential(CREDENTIAL_ID);
      expect(valid).to.be.false;
    });
  });
});
