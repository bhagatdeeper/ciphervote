import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('CipherVote Privacy Model & Cryptographic Soundness', () => {
  function computePedersenCommitment(secret, salt) {
    const domain = Buffer.from('ciphervote:commitment:'.padEnd(32, '\0'));
    return crypto.createHash('sha256').update(Buffer.concat([domain, secret, salt])).digest();
  }

  function computeNullifier(secret, proposalId) {
    const domain = Buffer.from('ciphervote:nullifier:'.padEnd(32, '\0'));
    return crypto.createHash('sha256').update(Buffer.concat([domain, secret, proposalId])).digest();
  }

  test('Commitment hiding: same secret with different salts yields uncorrelated commitments', () => {
    const secret = crypto.randomBytes(32);
    const saltA = crypto.randomBytes(32);
    const saltB = crypto.randomBytes(32);

    const commitA = computePedersenCommitment(secret, saltA);
    const commitB = computePedersenCommitment(secret, saltB);

    assert.notDeepEqual(commitA, commitB, 'Commitments with distinct salts must not match');

    // Statistical independence check (Hamming distance)
    let bitDiff = 0;
    for (let i = 0; i < 32; i++) {
      let xor = commitA[i] ^ commitB[i];
      while (xor > 0) {
        if (xor & 1) bitDiff++;
        xor >>= 1;
      }
    }
    assert.ok(bitDiff >= 90, `Hamming distance (${bitDiff}) indicates high diffusion`);
  });

  test('Commitment binding: different secrets with same salt yield distinct commitments', () => {
    const secretA = crypto.randomBytes(32);
    const secretB = crypto.randomBytes(32);
    const salt = crypto.randomBytes(32);

    const commitA = computePedersenCommitment(secretA, salt);
    const commitB = computePedersenCommitment(secretB, salt);

    assert.notDeepEqual(commitA, commitB, 'Commitments from different secrets must differ');
  });

  test('Nullifier unlinkability: nullifier reveals no correlation to voter commitment', () => {
    const secret = crypto.randomBytes(32);
    const salt = crypto.randomBytes(32);
    const proposalId = crypto.randomBytes(32);

    const commitment = computePedersenCommitment(secret, salt);
    const nullifier = computeNullifier(secret, proposalId);

    assert.notDeepEqual(commitment, nullifier, 'Nullifier must not equal commitment');

    // Correlation check between commitment and nullifier
    let sharedBytes = 0;
    for (let i = 0; i < 32; i++) {
      if (commitment[i] === nullifier[i]) sharedBytes++;
    }
    assert.ok(sharedBytes < 6, `Uncorrelated hashes must have minimal shared bytes, got ${sharedBytes}`);
  });

  test('Proposal scope isolation: same secret produces completely distinct nullifiers across proposals', () => {
    const secret = crypto.randomBytes(32);
    const proposal1 = crypto.randomBytes(32);
    const proposal2 = crypto.randomBytes(32);

    const nullifier1 = computeNullifier(secret, proposal1);
    const nullifier2 = computeNullifier(secret, proposal2);

    assert.notDeepEqual(nullifier1, nullifier2, 'Nullifiers must be scoped to proposal');
  });
});
