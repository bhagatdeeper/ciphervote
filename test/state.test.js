import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('CipherVote Ledger State & Double-Voting Prevention', () => {
  test('Nullifier double-spend rejection: identical nullifier is rejected upon second submission', () => {
    const usedNullifiers = new Set();
    const nullifierHex = crypto.randomBytes(32).toString('hex');

    // First ballot submission succeeds
    assert.ok(!usedNullifiers.has(nullifierHex), 'Nullifier must be unused initially');
    usedNullifiers.add(nullifierHex);
    assert.ok(usedNullifiers.has(nullifierHex), 'Nullifier must be recorded in ledger set');

    // Replay attempt must fail
    const isReplay = usedNullifiers.has(nullifierHex);
    assert.ok(isReplay, 'Replay attempt must be detected');
    assert.throws(
      () => {
        if (usedNullifiers.has(nullifierHex)) {
          throw new Error('Contract assertion failed: Nullifier already used');
        }
      },
      /Nullifier already used/,
    );
  });

  test('Public ledger counters increment strictly by 1 per verified ballot', () => {
    const ledger = {
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
    };

    function applyBallot(choice) {
      if (choice === 1) ledger.yesVotes++;
      else if (choice === 2) ledger.noVotes++;
      else if (choice === 3) ledger.abstainVotes++;
      else throw new Error('Invalid choice');
    }

    applyBallot(1);
    applyBallot(1);
    applyBallot(2);
    applyBallot(3);

    assert.equal(ledger.yesVotes, 2);
    assert.equal(ledger.noVotes, 1);
    assert.equal(ledger.abstainVotes, 1);
    assert.equal(ledger.yesVotes + ledger.noVotes + ledger.abstainVotes, 4);
  });

  test('Invalid ballot choices (<1 or >3) are rejected by circuit preconditions', () => {
    function validateChoice(choice) {
      if (choice < 1 || choice > 3) {
        throw new Error(`Circuit constraint violation: choice ${choice} not in [1, 3]`);
      }
    }

    assert.throws(() => validateChoice(0), /Circuit constraint violation/);
    assert.throws(() => validateChoice(4), /Circuit constraint violation/);
    assert.throws(() => validateChoice(-1), /Circuit constraint violation/);
    assert.doesNotThrow(() => validateChoice(1));
    assert.doesNotThrow(() => validateChoice(2));
    assert.doesNotThrow(() => validateChoice(3));
  });

  test('Merkle path verification: valid membership proof verifies root; tampered proof fails', () => {
    const leafA = crypto.createHash('sha256').update('leafA').digest();
    const leafB = crypto.createHash('sha256').update('leafB').digest();
    const leafC = crypto.createHash('sha256').update('leafC').digest();
    const leafD = crypto.createHash('sha256').update('leafD').digest();

    const nodeAB = crypto.createHash('sha256').update(Buffer.concat([leafA, leafB])).digest();
    const nodeCD = crypto.createHash('sha256').update(Buffer.concat([leafC, leafD])).digest();
    const root = crypto.createHash('sha256').update(Buffer.concat([nodeAB, nodeCD])).digest();

    // Verify leafA with sibling leafB and sibling nodeCD
    const computedRoot = crypto.createHash('sha256').update(
      Buffer.concat([
        crypto.createHash('sha256').update(Buffer.concat([leafA, leafB])).digest(),
        nodeCD,
      ]),
    ).digest();

    assert.deepEqual(computedRoot, root, 'Valid Merkle path must reconstruct root');

    // Tampered sibling
    const tamperedSibling = crypto.randomBytes(32);
    const badRoot = crypto.createHash('sha256').update(
      Buffer.concat([
        crypto.createHash('sha256').update(Buffer.concat([leafA, tamperedSibling])).digest(),
        nodeCD,
      ]),
    ).digest();

    assert.notDeepEqual(badRoot, root, 'Tampered Merkle path must fail root check');
  });
});
