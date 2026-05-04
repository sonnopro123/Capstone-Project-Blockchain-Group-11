/**
 * Unit tests for ECC Engine and Merkle Engine (plain Node.js — no Hardhat)
 * Run: node test/eccMerkle.test.js
 */

const assert = require('assert');
const { generateIssuerKeyPair, signCredential, verifySignature } = require('../backend/services/eccService');
const { buildMerkleTree, generateRoot, generateProof, verifyProof } = require('../backend/merkle/merkleService');

// ---------------------------------------------------------------------------
// ECC Tests
// ---------------------------------------------------------------------------
console.log('=== ECC Engine Tests ===');

{
  const { privateKey, publicKey } = generateIssuerKeyPair();
  assert.ok(privateKey, 'privateKey should exist');
  assert.ok(publicKey, 'publicKey should exist');
  console.log('[PASS] generateIssuerKeyPair');

  const payload = { studentId: 'SV001', issuerAddress: '0xabc', issuedAt: '2025-01-01' };
  const { signature } = signCredential(payload, privateKey);
  assert.ok(signature.r && signature.s, 'signature should have r and s');
  console.log('[PASS] signCredential');

  const valid = verifySignature(payload, signature, publicKey);
  assert.strictEqual(valid, true, 'signature should be valid');
  console.log('[PASS] verifySignature — valid');

  const tampered = { ...payload, studentId: 'HACKER' };
  const invalid = verifySignature(tampered, signature, publicKey);
  assert.strictEqual(invalid, false, 'tampered payload should fail');
  console.log('[PASS] verifySignature — tampered payload rejected');
}

// ---------------------------------------------------------------------------
// Merkle Tests
// ---------------------------------------------------------------------------
console.log('\n=== Merkle Engine Tests ===');

const courses = [
  { courseCode: 'CS101', grade: 'A' },
  { courseCode: 'MATH201', grade: 'B+' },
  { courseCode: 'PHY301', grade: 'A-' },
  { courseCode: 'ENG401', grade: 'B' },
];

{
  const root = generateRoot(courses);
  assert.ok(root.startsWith('0x'), 'root should be 0x-prefixed hex');
  console.log('[PASS] generateRoot:', root);
}

{
  const proofData = generateProof(courses, courses[1]);
  assert.strictEqual(proofData.courseCode, 'MATH201', 'proof course should match');
  assert.ok(Array.isArray(proofData.proof), 'proof should be array');
  console.log('[PASS] generateProof for MATH201');

  const ok = verifyProof(proofData.proof, proofData.leaf, proofData.root);
  assert.strictEqual(ok, true, 'proof should verify');
  console.log('[PASS] verifyProof — valid proof');
}

{
  // Tampered leaf should fail
  const proofData = generateProof(courses, courses[0]);
  const tamperedLeaf = '0x' + 'deadbeef'.repeat(8);
  const fail = verifyProof(proofData.proof, tamperedLeaf, proofData.root);
  assert.strictEqual(fail, false, 'tampered leaf should fail');
  console.log('[PASS] verifyProof — tampered leaf rejected');
}

{
  // Course not in list should throw
  try {
    generateProof(courses, { courseCode: 'NOTEXIST', grade: 'A' });
    assert.fail('Should have thrown');
  } catch (e) {
    assert.ok(e.message.includes('not found'), 'should throw not found');
    console.log('[PASS] generateProof — unknown course throws');
  }
}

console.log('\nAll tests passed!');
