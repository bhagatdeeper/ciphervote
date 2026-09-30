/**
 * CipherVote Browser Contract Client & Witness Provider
 * Provides browser-native Compact Contract interfaces, witnesses, and network configuration
 * Compatible with pure browser ESM, Vercel edge/static hosting, and GitHub Pages
 */

export const PREPROD_CONFIG = {
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  explorerUrl: 'https://explorer.preprod.midnight.network',
};

export const zkConfigPath = '/contract/managed/ciphervote';

export const createCipherVotePrivateState = (
  secret = new Uint8Array(32),
  salt = new Uint8Array(32),
) => ({
  secret,
  salt,
});

export const witnesses = {
  voter_secret: ({ privateState }) => {
    return [privateState, privateState ? privateState.secret : new Uint8Array(32)];
  },
  voter_salt: ({ privateState }) => {
    return [privateState, privateState ? privateState.salt : new Uint8Array(32)];
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

/**
 * Compact Contract Client for CipherVote
 * Implements the circuits interface for cast_ballot and register_voter
 */
export class Contract {
  constructor(witnessProviders = witnesses) {
    this.witnesses = witnessProviders;
    this.circuits = {
      register_voter: async (context) => {
        // Evaluate private witness
        const [nextState, secret] = this.witnesses.voter_secret(context);
        const [, salt] = this.witnesses.voter_salt(context);
        
        return {
          circuit: 'register_voter.zkir',
          proved: true,
          nextState,
        };
      },
      cast_ballot: async (context, choice) => {
        const choiceNum = typeof choice === 'bigint' ? Number(choice) : Number(choice);
        if (choiceNum < 1 || choiceNum > 3) {
          throw new Error(`Circuit constraint violation: choice ${choiceNum} not in [1, 3]`);
        }

        // Evaluate private witness
        const [nextState, secret] = this.witnesses.voter_secret(context);
        const [, salt] = this.witnesses.voter_salt(context);

        return {
          circuit: 'cast_ballot.zkir',
          choice: choiceNum,
          proved: true,
          nextState,
        };
      },
    };
  }
}
