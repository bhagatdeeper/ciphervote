# CipherVote: Official Idea Submission — "The Turn"
**Midnight Privacy dApp Program • Lunar Phase 3 (First Quarter)**

---

## 🏛️ Project Overview

- **Project Name**: CipherVote
- **Tagline**: Confidential Zero-Knowledge DAO Governance & Anonymous Voting Protocol
- **Target Network**: Midnight Network (Preprod Testnet & Mainnet)
- **Programming Language**: Compact `0.26` / `0.34`
- **Smart Contract Address (Preprod)**: `027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b`
- **Live Demo Video (Google Drive)**: [https://drive.google.com/file/d/1FgUn5BlqVxozrA-vSZoiNx2r7KzVocDv/view?usp=sharing](https://drive.google.com/file/d/1FgUn5BlqVxozrA-vSZoiNx2r7KzVocDv/view?usp=sharing)
- **Live Web Application**: [https://bhagatdeeper.github.io/ciphervote/](https://bhagatdeeper.github.io/ciphervote/)
- **GitHub Repository**: [https://github.com/bhagatdeeper/ciphervote](https://github.com/bhagatdeeper/ciphervote)
- **Author**: Deep Bhagat ([@bhagatdeeper](https://github.com/bhagatdeeper))

---

## 1. Selected Problem Statement

**Challenge Category**: *Privacy-Preserving DAO Governance, Anonymous Polling & Sybil-Resistant Voting (Proof of Entitlement Without Identity Exposure)*

### The Problem: Why Transparent On-Chain Voting Fails DAOs
On traditional transparent blockchains (e.g., Ethereum, Cardano L1, Solana), every governance vote is permanently etched into the public ledger. Anyone can observe:
1. **The voter's public wallet address**,
2. **Their exact token balance / voting power**,
3. **Their specific ballot selection**, and
4. **The exact timestamp and block of their vote**.

This total lack of privacy produces catastrophic real-world failure modes in decentralized governance:
- **Voter Intimidation & Coercion**: Core contributors and delegate voters face targeted harassment or retribution from founders, whales, or hostile factions if they vote against contentious proposals.
- **Vote Buying & Bribery**: Because transparent ledgers make votes publicly auditable per address, malicious actors can easily construct bribe contracts that reward voters only after verifying their public on-chain ballot.
- **Herding Behavior & Inaction**: Smaller token holders wait to see how dominant whales vote before casting their ballots, eliminating genuine decentralized consensus.
- **Identity & Financial Exposure**: High-net-worth delegates risk revealing their net worth, portfolio allocations, and voting strategies to competitive adversaries.

---

## 2. CipherVote Solution & Architecture

**CipherVote** completely eliminates voter exposure while maintaining cryptographic verifiability through Midnight's **Compact** language and dual-state architecture:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                  OFF-CHAIN CLIENT DEVICE                    │
 │                                                             │
 │  1. Private Credentials:                                    │
 │     • voter_secret() : Private entitlement seed             │
 │     • voter_salt()   : Cryptographic blinding factor        │
 │     • voter_path()   : Historic Merkle membership proof     │
 │                                                             │
 │  2. Groth16 Zero-Knowledge Prover:                          │
 │     • Proves commitment ∈ registeredVoters Merkle tree      │
 │     • Computes nullifier = Commit(secret, proposalId)       │
 │     • Proves nullifier ∉ usedNullifiers                     │
 │     • Proves ballot choice ∈ {1: Yes, 2: No, 3: Abstain}    │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                 ZK Proof + Deliberate disclose()
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 ON-CHAIN MIDNIGHT LEDGER                    │
 │                                                             │
 │  • registeredVoters : HistoricMerkleTree<10, Bytes<32>>     │
 │  • usedNullifiers   : Set<Bytes<32>> (Anti-Double-Vote)     │
 │  • yesVotes         : Public counter (incremented)          │
 │  • noVotes          : Public counter (incremented)          │
 │  • abstainVotes     : Public counter (incremented)          │
 │  • totalVoted       : Total ballots cast                    │
 │  • proposalId       : Unique governance motion hash         │
 └─────────────────────────────────────────────────────────────┘
```

### Technical Innovation Highlights:
1. **Historic Merkle Tree Commitments**: Voters generate blinded commitments off-chain:
   $$\text{commitment} = \text{persistentCommit}([\text{"ciphervote:commit:"}, \text{secret}], \text{salt})$$
   The public ledger only records the commitment root, completely decoupling the voter's identity from their membership slot.
2. **Proposal-Scoped Unlinkable Nullifiers**:
   $$\text{nullifier} = \text{persistentCommit}([\text{"ciphervote:nullify:"}, \text{secret}], \text{proposalId})$$
   - Deterministic: A voter cannot vote twice on the same proposal without generating an identical nullifier (which is blocked by `usedNullifiers`).
   - Unlinkable: The nullifier reveals zero information about the voter's secret or Merkle leaf position, and cannot be linked across different proposals.
3. **Deliberate use of `disclose()`**:
   - `disclose(publicChoice)`: Only the aggregate choice category is published so public counters increment.
   - `disclose(nullifier)`: Publishes the nullifier to prevent double-voting.
   - All secret keys, blinding salts, and user identities remain 100% private to the client.

---

## 3. Market Opportunity & Target Users

1. **Decentralized Autonomous Organizations (DAOs)**:
   - High-stakes treasury grants, executive compensation, leadership elections, and protocol forks requiring confidential balloting.
2. **Enterprise & Foundation Governance**:
   - Midnight and Cardano ecosystem councils requiring confidential stakeholder voting.
3. **Confidential Community Polling**:
   - Sybil-resistant sentiment polling and community feedback where participants must be verified token holders without doxxing themselves.

---

## 4. Delivery Roadmap Across Lunar Phases

| Lunar Phase | Milestone | Key Deliverables | Status |
|---|---|---|:---:|
| **🌑 Level 1: New Moon** | Toolchain & First Contract | Compact contract, compiler scripts, ZK circuits, Preprod deployment, test suite | ✅ **COMPLETE** |
| **🌒 Level 2: Waxing Crescent** | Frontend Integration | Stitch UI dashboard, Lace wallet connection, 4-stage ZK pipeline, Preprod stream | ✅ **COMPLETE** |
| **🌓 Level 3: First Quarter** | Production dApp & The Turn | CI/CD pipeline (`.github/workflows/ci.yml`), 17 automated tests, JSON receipts export, formal submission | ✅ **COMPLETE** |
| **🌔 Level 4: Waxing Gibbous** | Live MVP & Documentation | Production domain deployment, API docs, public product (X) profile launch | 🔜 **NEXT** |
| **🌕 Level 5: Full Moon** | Users & Feedback Loop | Onboard 50 Preprod testers, feedback widget, telemetry monitoring | 🔜 **PENDING** |
| **🌝 Level 6: Supermoon** | Mainnet Deployment | Deploy to Midnight Mainnet, production audits, onboard 20 real governance users | 🔜 **PENDING** |

---

## 5. Verification & Proof of Work

- **Live Preprod Contract**: `027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b`
- **Explorer Link**: [https://explorer.preprod.midnight.network/contract/027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b](https://explorer.preprod.midnight.network/contract/027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b)
- **Automated Tests**: 17 passing tests across 7 test suites (`npm test`)
- **Automated CI/CD**: [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml)
