import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { witnesses, createCipherVotePrivateState } from '../contract/witnesses.js';

describe('CipherVote Circuit Logic & Witness Execution', () => {
  test('voter_secret witness extracts 32-byte secret without leaking to caller', () => {
    const mockSecret = crypto.randomBytes(32);
    const mockSalt = crypto.randomBytes(32);
    const privateState = createCipherVotePrivateState(mockSecret, mockSalt);

    const [nextState, extractedSecret] = witnesses.voter_secret({
      privateState,
      ledger: {},
    });

    assert.equal(nextState, privateState, 'Private state must be preserved across witness calls');
    assert.deepEqual(extractedSecret, mockSecret, 'Extracted secret must match witness state');
    assert.equal(extractedSecret.length, 32, 'Secret must be exactly 32 bytes');
  });

  test('voter_salt witness extracts 32-byte blinding salt correctly', () => {
    const mockSecret = crypto.randomBytes(32);
    const mockSalt = crypto.randomBytes(32);
    const privateState = createCipherVotePrivateState(mockSecret, mockSalt);

    const [nextState, extractedSalt] = witnesses.voter_salt({
      privateState,
      ledger: {},
    });

    assert.equal(nextState, privateState);
    assert.deepEqual(extractedSalt, mockSalt);
    assert.equal(extractedSalt.length, 32);
  });

  test('voter_path witness returns Merkle path for enrolled commitment', () => {
    const mockSecret = crypto.randomBytes(32);
    const mockSalt = crypto.randomBytes(32);
    const privateState = createCipherVotePrivateState(mockSecret, mockSalt);
    const mockCommitment = crypto.randomBytes(32);

    const mockLedger = {
      registeredVoters: {
        findPathForLeaf: (leaf) => ({
          leaf,
          siblings: [crypto.randomBytes(32), crypto.randomBytes(32)],
          indices: [0, 1],
        }),
      },
    };

    const [nextState, path] = witnesses.voter_path(
      { privateState, ledger: mockLedger },
      mockCommitment,
    );

    assert.equal(nextState, privateState);
    assert.ok(path, 'Merkle path must be returned');
    assert.deepEqual(path.leaf, mockCommitment, 'Path leaf must match queried commitment');
    assert.equal(path.siblings.length, 2, 'Path must provide siblings array');
  });

  test('voter_path throws descriptive error when commitment not enrolled in ledger', () => {
    const privateState = createCipherVotePrivateState();
    const unenrolledCommitment = crypto.randomBytes(32);

    const mockLedger = {
      registeredVoters: {
        findPathForLeaf: () => null,
      },
    };

    assert.throws(
      () => {
        witnesses.voter_path(
          { privateState, ledger: mockLedger },
          unenrolledCommitment,
        );
      },
      /Commitment leaf not found in registeredVoters Merkle tree/,
    );
  });
});
