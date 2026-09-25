import { type Ledger, type Witnesses } from './managed/ciphervote/contract/index.js';
import { type WitnessContext } from '@midnight-ntwrk/compact-runtime';

/**
 * Off-chain private state for CipherVote.
 * Securely stores the voter's private credential secret and blinding salt
 * on the client machine. Never published to the network or ledger.
 */
export type CipherVotePrivateState = {
  secret: Uint8Array;
  salt: Uint8Array;
};

export const createCipherVotePrivateState = (
  secret: Uint8Array = new Uint8Array(32),
  salt: Uint8Array = new Uint8Array(32),
): CipherVotePrivateState => ({
  secret,
  salt,
});

export const witnesses: Witnesses<CipherVotePrivateState> = {
  voter_secret: ({ privateState }: WitnessContext<Ledger, CipherVotePrivateState>): [CipherVotePrivateState, Uint8Array] => {
    return [privateState, privateState.secret];
  },
  voter_salt: ({ privateState }: WitnessContext<Ledger, CipherVotePrivateState>): [CipherVotePrivateState, Uint8Array] => {
    return [privateState, privateState.salt];
  },
  voter_path: (
    { ledger, privateState }: WitnessContext<Ledger, CipherVotePrivateState>,
    commitment: Uint8Array,
  ): [CipherVotePrivateState, any] => {
    // Find the Merkle membership path from the public ledger's HistoricMerkleTree
    const path = ledger.registeredVoters.findPathForLeaf(commitment);
    if (!path) {
      throw new Error(`Commitment leaf not found in registeredVoters Merkle tree`);
    }
    return [privateState, path];
  },
};

export type { Ledger, WitnessContext };
