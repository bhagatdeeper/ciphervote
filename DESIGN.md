# Design System: Zero-Knowledge Cryptographic Governance (CipherVote)

## Brand & Style
The design system establishes a hyper-secure, mission-critical operational cockpit for sovereign cryptographic governance, zero-knowledge verification, and confidential consensus on the Midnight Network. The UI evokes absolute mathematical integrity, institutional secrecy, and high-velocity clarity. Built for institutional validators, protocol stewards, and privacy-first DAOs, the aesthetic marries high-density cryptographic telemetry with luxury glassmorphic finishes.

The visual direction merges **Technical Glassmorphism** with **Cybernetic Terminal Precision**:
- Atmospheric obsidian depths layered under specular crystalline panels.
- Micro-hairline borders illuminated with directional luminous energy.
- Tactical monospaced telemetry juxtaposed with wide, geometric structural typography.
- Active feedback loops utilizing controlled photonic blooms and rhythmic pulsing signals to convey live zero-knowledge state changes and cryptographic attestation.

## Color Palette
The palette is rooted in cold, deep cosmic obsidian foundations, contrasted with three distinct functional luminescences:
- **Surface Canvas Base:** `#080c12` (Pure, cold obsidian base void).
- **Layer 01 Deep Surface:** `#0b111b` (Telemetry docks, sidebars, underlying grid matrices).
- **Layer 02 Elevated Glass:** `rgba(15, 23, 42, 0.65)` with `backdrop-filter: blur(24px)` (Crystalline structural cards, modal sheets).
- **Layer 03 Interactive Glass:** `rgba(30, 41, 59, 0.45)` (Hover states, nested data cells).
- **Electric Violet (`#8b5cf6`, `#d0bcff`):** Primary executive actions, cryptographic key generation, active proposals, and verified identity status. Glow: `rgba(139, 92, 246, 0.35)`.
- **Radiant Cyan (`#06b6d4`, `#4cd7f6`):** Telemetry, live network metrics, zk-SNARK generation status, and real-time state synchronizations. Glow: `rgba(6, 182, 212, 0.35)`.
- **Cryptographic Emerald (`#10b981`, `#4edea3`):** Consensus quorum reached, zero-knowledge proof verified, ballot sealed, validator integrity optimal. Glow: `rgba(16, 185, 129, 0.35)`.
- **Negative / Rejected Coral (`#f43f5e`, `#ffb4ab`):** Reject ballots and critical warnings.
- **Icy Monochromes & Slates:** Primary text `#f8fafc`, secondary labels `#94a3b8`, `#64748b`.
- **Border Standards:** `1px solid rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.16)`.

## Typography
- **Headings & Display:** `Space Grotesk` (Google Fonts) with tight negative tracking (`-0.03em`) for mechanical cohesion and architectural presence.
- **Data, Hashes & Telemetry:** `JetBrains Mono` (Google Fonts) for transaction hashes, zero-knowledge proofs, nullifier outputs, block times, and cybernetic badges.
- **Body & Continuous Text:** `Space Grotesk` / `Inter` for crisp readability.

## Key Frontend Modules (Level 2: Waxing Crescent)
1. **Global Header & Navigation:**
   - CipherVote logo with glowing ZK shield
   - Network status badge: `Midnight Preprod Testnet` with pulsing emerald beacon
   - Live Contract address: `027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b` (with copy & explorer link)
   - ZK Proof Server status: `http://127.0.0.1:6300 (Connected)`
   - **Lace Wallet Integration button**: "Connect Lace Wallet" with simulated / live Midnight Preprod wallet bridge, address preview, and balance.

2. **Active Governance Motion Hero:**
   - Motion: `CIPHERVOTE-PROPOSAL-001: Midnight Ecosystem Grant Allocation ($250,000 DUST)`
   - Status badge: `ACTIVE VOTING WINDOW OPEN`
   - Quorum progress bar with dynamic glowing gradient (Violet -> Cyan -> Emerald)
   - Countdown timer widget (`02d : 14h : 38m : 12s`) with live ticking seconds.

3. **Public Ledger Real-Time Tally Board:**
   - 3 Telemetry Cards with glassmorphic sheen:
     - **YES Ballots**: Live counter, percentage bar, and verified proof tally.
     - **NO Ballots**: Live counter, percentage bar, and verified proof tally.
     - **ABSTAIN Ballots**: Live counter, percentage bar, and verified proof tally.
   - Aggregate stats: Total Shielded Ballots Cast, Historic Merkle Tree Size, Nullifier Collision Risk (0.00000%).

4. **Confidential Zero-Knowledge Voting Station:**
   - Step 1: Select Ballot Choice (Interactive cards for [YES - Support Proposal], [NO - Reject Proposal], [ABSTAIN])
   - Step 2: Cryptographic Secrets Input:
     - Private Voter Secret input (with show/hide eye toggle & "Auto-Derive from Lace" button)
     - Blinding Salt Generator with "Regenerate Salt" button
     - Merkle Membership Leaf index display
   - Step 3: Interactive ZK Circuit Pipeline Visualization:
     - 4-Stage visual pipeline with glowing conduits:
       `Witness Synthesis -> Groth16 Prover -> Merkle Path Check -> Nullifier Ledger Registration`
   - Primary Execution Trigger: **"Generate ZK Proof & Cast Shielded Ballot"** with glowing violet bloom, live progress bar, and instant tally update upon submission!

5. **Voter Registration & Merkle Snapshot Panel:**
   - Merkle Tree State readout: Historic Merkle Root, Leaf count
   - Registration flow for new voters to insert commitment into `registeredVoters` tree.

6. **Recent Cryptographic Nullifiers & Block Stream:**
   - Live ledger stream showing spent nullifiers, tx hashes, block height, timestamps, and Explorer links.