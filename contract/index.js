import { witnesses, createCipherVotePrivateState } from './witnesses.js';
import { Contract, ledger, pureCircuits } from './managed/ciphervote/contract/index.js';

export {
  Contract,
  ledger,
  pureCircuits,
  witnesses,
  createCipherVotePrivateState,
};

export const zkConfigPath = typeof process !== 'undefined' && process.cwd ? './contract/managed/ciphervote' : '/contract/managed/ciphervote';
