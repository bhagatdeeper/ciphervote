import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
const rootDir = path.resolve(currentDir, '..');
const managedDir = path.resolve(rootDir, 'contract', 'managed', 'ciphervote');

describe('CipherVote Contract & Zero-Knowledge Artifacts', () => {
  test('contract-info.json metadata is valid and specifies compiled circuits', () => {
    const contractInfoPath = path.join(managedDir, 'compiler', 'contract-info.json');
    assert.ok(fs.existsSync(contractInfoPath), 'contract-info.json must exist');
    const info = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
    assert.ok(Array.isArray(info.circuits), 'circuits must be an array');
    assert.equal(info.circuits.length, 2, 'must contain exactly 2 compiled circuits');
    const circuitNames = info.circuits.map(c => typeof c === 'string' ? c : c.name);
    assert.ok(circuitNames.includes('cast_ballot'), 'must include cast_ballot circuit');
    assert.ok(circuitNames.includes('register_voter'), 'must include register_voter circuit');
  });

  test('ZKIR circuit definitions are generated and non-empty', () => {
    const zkirDir = path.join(managedDir, 'zkir');
    const castZkir = path.join(zkirDir, 'cast_ballot.zkir');
    const regZkir = path.join(zkirDir, 'register_voter.zkir');

    assert.ok(fs.existsSync(castZkir), 'cast_ballot.zkir must exist');
    assert.ok(fs.existsSync(regZkir), 'register_voter.zkir must exist');

    const castContent = fs.readFileSync(castZkir, 'utf8');
    const regContent = fs.readFileSync(regZkir, 'utf8');

    assert.ok(castContent.length > 500, 'cast_ballot.zkir must contain circuit constraints');
    assert.ok(regContent.length > 200, 'register_voter.zkir must contain circuit constraints');
  });

  test('Cryptographic proving and verifying keys exist with valid sizes', () => {
    const keysDir = path.join(managedDir, 'keys');
    const files = [
      { name: 'cast_ballot.prover', minSize: 1000000 },
      { name: 'cast_ballot.verifier', minSize: 500 },
      { name: 'register_voter.prover', minSize: 500000 },
      { name: 'register_voter.verifier', minSize: 500 },
    ];

    for (const f of files) {
      const p = path.join(keysDir, f.name);
      assert.ok(fs.existsSync(p), `Key file ${f.name} must exist`);
      const stat = fs.statSync(p);
      assert.ok(stat.size >= f.minSize, `Key ${f.name} size (${stat.size}) must be >= ${f.minSize}`);
    }
  });

  test('TypeScript definitions export contract, ledger, and witness interfaces', () => {
    const dtsPath = path.join(managedDir, 'contract', 'index.d.ts');
    assert.ok(fs.existsSync(dtsPath), 'index.d.ts must exist');
    const dts = fs.readFileSync(dtsPath, 'utf8');
    assert.ok(dts.includes('export type Witnesses'), 'must export Witnesses type');
    assert.ok(dts.includes('export type Ledger'), 'must export Ledger type');
    assert.ok(dts.includes('export declare class Contract'), 'must export Contract class');
    assert.ok(dts.includes('registeredVoters'), 'Ledger must include registeredVoters');
    assert.ok(dts.includes('usedNullifiers'), 'Ledger must include usedNullifiers');
  });
});
