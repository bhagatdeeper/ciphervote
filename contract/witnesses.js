/**
 * Off-chain private state and witness providers for CipherVote.
 * Evaluates private voter_secret, voter_salt, and Merkle membership path.
 */
export const createCipherVotePrivateState = (
  secret = new Uint8Array(32),
  salt = new Uint8Array(32),
) => ({
  secret,
  salt,
});

export const witnesses = {
  voter_secret: ({ privateState }) => {
    return [privateState, privateState.secret];
  },
  voter_salt: ({ privateState }) => {
    return [privateState, privateState.salt];
  },
  voter_path: ({ ledger, privateState }, commitment) => {
    if (ledger && ledger.registeredVoters && typeof ledger.registeredVoters.findPathForLeaf === 'function') {
      const path = ledger.registeredVoters.findPathForLeaf(commitment);
      if (!path) {
        throw new Error('Commitment leaf not found in registeredVoters Merkle tree');
      }
      return [privateState, path];
    }
    return [privateState, { leaf: commitment, path: [] }];
  },
};
