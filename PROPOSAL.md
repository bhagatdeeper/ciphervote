# CipherVote: Hackathon Proposal ("The Turn")

### 1. What problem are you solving, and why is Midnight uniquely suited for it?
**Problem**: Transparent blockchains expose voter wallet addresses, token holdings, and vote selections in plaintext. This enables bribery, voter intimidation, whale coercion, and retaliation in DAO governance.
**Why Midnight**: Midnight’s **Compact** language and dual-state architecture allow off-chain zero-knowledge circuit execution (Groth16) with deliberate `disclose()` controls. Voters prove eligibility and membership in an authorized voter Merkle tree without exposing their wallet key or balance. The public ledger only stores unlinkable nullifiers and aggregate tally increments.

### 2. What is the technical architecture of your dApp?
- **Smart Contract (`contract/ciphervote.compact`)**:
  - Public ledger state: `registeredVoters: HistoricMerkleTree<10, Bytes<32>>`, `usedNullifiers: Set<Bytes<32>>`, `yesVotes`, `noVotes`, `abstainVotes`, `totalVoted`, `proposalId`.
  - Private witnesses: `voter_secret()`, `voter_salt()`, `voter_path()`.
  - Deliberate `disclose()`: Only public ballot choice and the nullifier are revealed; private credentials remain completely off-chain.
- **Frontend (`frontend/`)**:
  - Ultra-premium dark-mode dashboard built using the Stitch design system.
  - Native Midnight Lace extension connectivity + instant Preprod Testnet Bridge.
  - 4-stage interactive ZK circuit pipeline visualization (Witness Synthesis -> Groth16 Prover -> Merkle Verification -> Nullifier Record).
  - JSON receipt export and cryptographic proof backup.
- **Deployment**:
  - Live on Midnight Preprod at contract address `027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b`.

### 3. Who is your target user and what is your go-to-market strategy?
- **Target Users**:
  - Decentralized Autonomous Organizations (DAOs) allocating grants or executing contentious governance decisions.
  - High-net-worth token holders seeking protection against whale tracking and retaliation.
  - Enterprise councils requiring confidential board votes.
- **Go-To-Market**:
  - Partner with Midnight and Cardano Catalyst DAOs to pilot confidential grant allocation rounds.
  - Provide a plug-and-play SDK for any DAO to deploy private governance motions in minutes.

### 4. What is your roadmap for delivery across Lunar Phases?
- **Level 1 (New Moon)**: Toolchain, Compact contract, Preprod deployment, tests. (✅ Completed)
- **Level 2 (Waxing Crescent)**: Frontend UI, Lace wallet integration, live nullifier stream. (✅ Completed)
- **Level 3 (First Quarter)**: Production hardening, CI/CD pipeline, 17 automated tests, formal proposal submission. (✅ Completed)
- **Level 4 (Waxing Gibbous)**: Production hosting on GitHub Pages / Vercel, public documentation, product X profile.
- **Level 5 (Full Moon)**: Onboard 50 Preprod community testers and maintain active feedback loops.
- **Level 6 (Supermoon)**: Midnight Mainnet deployment and live DAO pilot onboarding.
