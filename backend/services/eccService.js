/**
 * MODULE B — ECC ENGINE
 * Uses the `elliptic` library (secp256k1 curve) to sign and verify credentials.
 */

const { ec: EC } = require('elliptic');
const { keccak256 } = require('js-sha3');

const ec = new EC('secp256k1');

/**
 * Generate a new ECC key pair for an issuer.
 * @returns {{ privateKey: string, publicKey: string }}
 */
function generateIssuerKeyPair() {
  const keyPair = ec.genKeyPair();
  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex'),
  };
}

/**
 * Sign a credential payload with an issuer's private key.
 * @param {object} credentialPayload  Plain JS object representing the credential.
 * @param {string} privateKeyHex      Issuer's private key in hex.
 * @returns {{ signature: { r: string, s: string }, hash: string }}
 */
function signCredential(credentialPayload, privateKeyHex) {
  const msgHash = _hashPayload(credentialPayload);
  const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
  const sig = keyPair.sign(msgHash);
  return {
    signature: {
      r: sig.r.toString('hex'),
      s: sig.s.toString('hex'),
    },
    hash: msgHash,
  };
}

/**
 * Verify an ECC signature against a credential payload and issuer's public key.
 * @param {object} credentialPayload  The original credential payload.
 * @param {{ r: string, s: string }} signature
 * @param {string} publicKeyHex       Issuer's public key in hex.
 * @returns {boolean}
 */
function verifySignature(credentialPayload, signature, publicKeyHex) {
  try {
    const msgHash = _hashPayload(credentialPayload);
    const keyPair = ec.keyFromPublic(publicKeyHex, 'hex');
    return keyPair.verify(msgHash, signature);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _hashPayload(payload) {
  const json = JSON.stringify(payload, Object.keys(payload).sort());
  return keccak256(json);
}

module.exports = { generateIssuerKeyPair, signCredential, verifySignature };
