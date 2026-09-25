import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { witnesses, createCipherVotePrivateState, type CipherVotePrivateState } from './witnesses.js';

export {
  Contract,
  ledger,
  pureCircuits,
  expectedVk,
  type Witnesses,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/ciphervote/contract/index.js';

import { Contract } from './managed/ciphervote/contract/index.js';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
export const zkConfigPath = path.resolve(currentDir, 'managed', 'ciphervote');

export { witnesses, createCipherVotePrivateState, type CipherVotePrivateState };
