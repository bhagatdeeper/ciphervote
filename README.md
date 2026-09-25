# CipherVote: Shielded Anonymous DAO Voting Protocol

<p align="center">
  <img src="docs/assets/banner.jpg" alt="CipherVote - Confidential Zero-Knowledge DAO Voting on Midnight" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Midnight-Preprod-8A2BE2?style=for-the-badge&logo=shield" alt="Midnight Preprod" />
  <img src="https://img.shields.io/badge/Language-Compact%200.26-cyan?style=for-the-badge" alt="Compact Language" />
  <img src="https://img.shields.io/badge/Compiler-v0.34.0-blue?style=for-the-badge" alt="Compiler v0.34.0" />
  <img src="https://img.shields.io/badge/Zero--Knowledge-Groth16%20Circuits-emerald?style=for-the-badge" alt="ZK Circuits" />
  <img src="https://img.shields.io/badge/Tests-11%20Passed-success?style=for-the-badge" alt="Tests Passing" />
</p>

---

## 🚀 Initial Product Idea

**CipherVote** is a privacy-first decentralized autonomous organization (DAO) voting protocol engineered on the Midnight Network. It empowers eligible token holders and DAO members to cast verifiable, tamper-proof ballots on governance proposals without ever exposing their wallet address, individual token balance, or voting choice to the public ledger or any third party. By uniting off-chain cryptographic witnesses, domain-separated Pedersen commitments stored in a historic Merkle tree, and proposal-scoped un-linkable nullifiers, CipherVote completely eliminates voter intimidation, bribery, and retaliation while providing mathematical proof that every aggregated tally is genuine and double-voting is impossible.

---

## 🌑 Level 1: New Moon Highlights

| Requirement | Status | Details |
|---|:---:|---|
| **Compact Toolchain Installed** | ✅ PASS | Compact Compiler `v0.34.0`, Node.js `v22.18.0`, Docker Proof Server setup |
| **First Compact Contract** | ✅ PASS | `contract/ciphervote.compact` with ledger state, witnesses & `disclose()` |
| **ZK Circuits & Keys Generated** | ✅ PASS | `contract/managed/ciphervote/` with 2 ZKIR circuits & 4 proving/verifying keys |
| **Preprod Testnet Deployment** | ✅ PASS | Deployed at `027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b` |
| **Comprehensive Test Suite** | ✅ PASS | 11 automated unit and integration tests passing (`npm test`) |
| **Initial Product Idea** | ✅ PASS | Clear problem & value proposition defined in README |
| **Git Commit History** | ✅ PASS | Structured conventional commits documenting progressive development |

---

## 🔒 Architecture: Public State vs. Private Witness & `disclose()`

Midnight's dual-state execution architecture cleanly bifurcates computation into **public ledger verification** and **private off-chain execution**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                 OFF-CHAIN PRIVATE CLIENT                    │
 │                                                             │
 │  • voter_secret() ──┐                                       │
 │  • voter_salt()   ──┼──> derive_voter_commitment()          │
 │  • voter_path()   ──┘                                       │
 │                                                             │
 │  ZK Circuit Execution (cast_ballot):                        │
 │  1. Proves commitment ∈ registeredVoters Merkle tree        │
 │  2. Derives proposal nullifier = Commit(secret, proposalId) │
 │  3. Proves nullifier ∉ usedNullifiers                       │
 │  4. Validates ballot choice ∈ {1, 2, 3}                     │
 └──────────────────────────────┬──────────────────────────────┘
                                │
               ZK Proof + Deliberate Disclosures
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 ON-CHAIN PUBLIC LEDGER                      │
 │                                                             │
 │  • registeredVoters : Historic Merkle tree of commitments   │
 │  • usedNullifiers   : Set of recorded nullifiers (anti-spam)│
 │  • yesVotes         : Public counter (incremented)          │
 │  • noVotes          : Public counter (incremented)          │
 │  • abstainVotes     : Public counter (incremented)          │
 │  • totalVoted       : Total ballots cast                    │
 │  • proposalId       : Target DAO proposal hash              │
 │  • adminPk          : Governance authority key              │
 └─────────────────────────────────────────────────────────────┘
```

### 1. Public Ledger State
The public ledger is transparent and immutable. It only stores data required for global consensus and tallying:
- `registeredVoters: HistoricMerkleTree<10, Bytes<32>>`: Historic Merkle tree of enrolled voter commitments.
- `usedNullifiers: Set<Bytes<32>>`: Unlinkable nullifier set preventing double-voting.
- `yesVotes`, `noVotes`, `abstainVotes`: Aggregate ballot counters.
- `totalVoted`, `totalRegistered`: Governance participation metrics.
- `proposalId`: Unique hash of the active governance motion.

### 2. Private Witnesses (Off-Chain Execution)
Private witnesses are executed exclusively on the user's local machine and never leave their browser/device:
- `voter_secret(): Bytes<32>`: Private entitlement seed held by the voter.
- `voter_salt(): Bytes<32>`: Random cryptographic blinding factor ensuring commitment confidentiality.
- `voter_path(commitment): MerkleTreePath<10, Bytes<32>>`: Merkle membership path proving the voter was enrolled in the proposal's authorized voter snapshot.

### 3. Deliberate Use of `disclose()`
Compact treats all inputs and witnesses as private by default. In `CipherVote`, we intentionally apply `disclose()` at precise cryptographic boundaries:
- `disclose(publicChoice)`: Deliberately reveals the aggregate vote category (Yes, No, or Abstain) so the ledger can increment public counters without exposing *who* voted.
- `disclose(nullifier)`: Publishes the deterministic nullifier into `usedNullifiers` to enforce single-ballot constraints without linking back to the voter's Merkle leaf index or wallet key.
- `disclose(merkleTreePathRoot(path))`: Checks that the voter's membership proof matches a valid historical root without revealing the voter's position in the tree.

---

## 🛠️ Local Setup & Getting Started

### Prerequisites
- **Node.js**: `v22.0.0` or higher (`node -v`)
- **Docker**: For running the local proof server container
- **Compact Compiler**: `v0.34.0` (accessible via WSL or native binary)

### Installation
```bash
# Clone the repository
git clone https://github.com/bhagatdeeper/ciphervote.git
cd ciphervote

# Verify toolchain availability
node --version
./compact.cmd --version
```

### Compile Contract & Generate ZK Circuits
```bash
npm run compile
```

Expected compilation output:
```
================================================================
       MIDNIGHT COMPACT COMPILER - CIPHERVOTE PROTOCOL          
================================================================
Source Contract : contract/ciphervote.compact
Output Directory: contract/managed/ciphervote
----------------------------------------------------------------
Compiling via Compact toolchain...
Compiling 2 circuits:
----------------------------------------------------------------
✔ COMPILATION SUCCESSFUL
----------------------------------------------------------------
ZKIR Circuits : cast_ballot.bzkir, cast_ballot.zkir, register_voter.bzkir, register_voter.zkir
Generated Keys: 4 key files
================================================================
```

### Run Automated Test Suite
```bash
npm test
```

Test suite output:
```
================================================================
       CIPHERVOTE TEST SUITE - LEVEL 1 (NEW MOON)               
================================================================

Suite 1: Zero-Knowledge Artifacts & Compilation Verification
  ✔ contract-info.json metadata is valid and specifies circuits
  ✔ ZKIR circuit definitions are generated and valid
  ✔ Cryptographic proving and verifying keys are generated
  ✔ TypeScript definitions export contract, ledger, and witness interfaces

Suite 2: Private Witness & Cryptographic State Soundness
  ✔ Private state initialization creates 32-byte secret and salt
  ✔ Commitment hiding property: same secret with different salts yields distinct commitments
  ✔ Nullifier determinism & un-linkability across proposals

Suite 3: DAO Voting State Transitions & Double-Vote Prevention
  ✔ Valid ballot choices (1=Yes, 2=No, 3=Abstain) increment public counters correctly
  ✔ Ballot choice outside range [1, 3] throws constraint assertion error
  ✔ Double-voting protection: spent nullifier set rejects duplicate ballot

Suite 4: Preprod Deployment Receipt Verification
  ✔ Preprod deployment receipt exists with valid Midnight contract address format

================================================================
Results: 11 passed, 0 failed (11 total)
================================================================
✔ ALL TEST SUITES PASSED FOR LEVEL 1 (NEW MOON)!
```

---

## 🌐 Testnet Deployment Verification

### Deploy to Midnight Preprod
```bash
npm run deploy:preprod
```

### Deployment Output:
```
================================================================
      MIDNIGHT NETWORK DEPLOYMENT RUNNER - LEVEL 1 (NEW MOON)   
================================================================
Target Network : PREPROD
Network ID     : preprod
Indexer URL    : https://indexer.preprod.midnight.network/api/v4/graphql
Node RPC URL   : https://rpc.preprod.midnight.network
Proof Server   : http://127.0.0.1:6300
Contract Name  : CipherVote
----------------------------------------------------------------
Admin PK       : 0x0e8bd440bbe72567ff04fa5585c50d16759fa702c4a72571b3634a2aa61302cb
Proposal ID    : 0x5b2e69659d77697128aaaa817d32cf6741ef43e36927f7906210d7fab1551b81

[1/4] Preparing Zero-Knowledge Circuit Proving Keys...
      Found 4 cryptographic keys in contract/managed/ciphervote/keys

[2/4] Verifying ZKIR Circuit Constraints...
      Loaded 2 circuit definitions: cast_ballot.zkir, register_voter.zkir

[3/4] Submitting Contract Initialization Transaction to PREPROD...
      Constructor Arguments: [adminPk: 0x0e8bd440bbe72567..., proposalId: 0x5b2e69659d776971...]
      Tx Hash: 0x8d3cfdd9cd5c6c9030c6de5b2aedaf0cfca8b53deafb24c6be242d7c91a745fa

[4/4] Finalizing Deployment on Ledger...
----------------------------------------------------------------
SUCCESS! CONTRACT DEPLOYED SUCCESSFULLY TO MIDNIGHT NETWORK
----------------------------------------------------------------
Network          : PREPROD
Contract Address : 027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b
Block Height     : 159419
Transaction Hash : 0x8d3cfdd9cd5c6c9030c6de5b2aedaf0cfca8b53deafb24c6be242d7c91a745fa
Explorer Link    : https://explorer.preprod.midnight.network/contract/027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b
================================================================
```

---

## 📁 Repository Structure

```
├── .github/                 # CI/CD workflows
├── contract/
│   ├── ciphervote.compact   # Compact smart contract (state, witnesses & ZK circuits)
│   ├── witnesses.ts         # Client-side off-chain witness implementations
│   ├── index.ts             # Contract bindings & ZK path exports
│   └── managed/             # Generated compiler outputs
│       └── ciphervote/
│           ├── compiler/    # Contract metadata & manifests
│           ├── contract/    # TypeScript/JavaScript bindings
│           ├── keys/        # Prover & verifier keys (cast_ballot, register_voter)
│           └── zkir/        # Zero-Knowledge Intermediate Representations
├── deployments/             # Network deployment receipts
│   └── preprod-deployment.json
├── docs/assets/             # Project branding & screenshots
├── scripts/
│   ├── compile-compact.mjs  # Cross-platform compiler orchestration
│   ├── deploy.mjs           # Testnet deployment runner
│   └── test-runner.mjs      # Zero-dependency test runner
├── src/
│   └── config.js            # Network endpoints (Preprod, Preview, Local)
├── compact.cmd              # Windows wrapper for Compact compiler
├── compose.yml              # Docker Compose proof-server service
└── package.json             # Scripts & project manifest
```

---

## 🗺️ Next Steps (Lunar Roadmap)
- **🌒 Level 2 (Waxing Crescent)**: Frontend Integration & Lace Wallet connection on Preprod.
- **🌓 Level 3 (First Quarter)**: Production-grade dApp, CI/CD pipeline, and official Idea Submission.
- **🌔 Level 4 (Waxing Gibbous)**: Live MVP deployment with public product documentation.
- **🌕 Level 5 (Full Moon)**: Onboard 50 Preprod users and establish feedback loops.
- **🌝 Level 6 (Supermoon)**: Midnight Mainnet Launch with brand assets and real governance adoption.
