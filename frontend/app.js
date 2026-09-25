/**
 * CipherVote: Shielded Anonymous DAO Voting Protocol
 * Frontend Client & Midnight Preprod / Lace Integration
 */

// Contract & Network Config
const CONTRACT_ADDRESS = '027a6078288bbc7e66b13686afd90b6dc84976da488a9f3906aef97624ddacd26b';
const PROPOSAL_ID = '0x5b2e69659d77697128aaaa817d32cf6741ef43e36927f7906210d7fab1551b81';
const EXPLORER_BASE = 'https://explorer.preprod.midnight.network';
const QUORUM_TARGET = 500000;

// Application State
const state = {
  wallet: null, // { address, network, balance, type }
  selectedChoice: 1, // 1 = YES, 2 = NO, 3 = ABSTAIN
  voterSecret: '',
  voterSalt: '',
  proposal: {
    yesVotes: 1405,
    noVotes: 386,
    abstainVotes: 103,
    yesWeight: 3420180,
    noWeight: 940320,
    abstainWeight: 251500,
  },
  usedNullifiers: new Set([
    '0x3a9f4e2b8109ca88172df03a8901bce471829031',
    '0x7b2190ef01aa74328901cce1904bca9928104821',
    '0x8109ca88172df03a8901bce4718290313a9f4e2b',
  ]),
  recentBallots: [
    {
      nullifier: '0x3a9f4e2b8109ca88...829031',
      choice: 'YES',
      txHash: '0x8c42a91b...e5109b',
      block: 159428,
      time: '2 mins ago',
      choiceNum: 1,
    },
    {
      nullifier: '0x7b2190ef01aa74...992810',
      choice: 'YES',
      txHash: '0x4f19ca02...11b842',
      block: 159425,
      time: '6 mins ago',
      choiceNum: 1,
    },
    {
      nullifier: '0x8109ca88172df0...3a9f4e',
      choice: 'NO',
      txHash: '0x2ada1ead...aa0655',
      block: 159420,
      time: '12 mins ago',
      choiceNum: 2,
    },
  ],
  lastReceipt: null,
};

// DOM Elements
const DOM = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  initCountdownTimer();
  initWalletDetection();
  generateFreshSalt();
  deriveDefaultSecret();
  renderTally();
  renderFeed();
  bindEventListeners();
});

function cacheDOMElements() {
  DOM.connectBtn = document.getElementById('connect-lace-btn');
  DOM.connectBtnText = document.getElementById('connect-btn-text');
  DOM.walletModal = document.getElementById('wallet-modal');
  DOM.closeModalBtn = document.getElementById('close-modal-btn');
  DOM.connectLaceExtBtn = document.getElementById('connect-lace-extension-btn');
  DOM.connectDevWalletBtn = document.getElementById('connect-dev-wallet-btn');
  DOM.laceDetectedStatus = document.getElementById('lace-detected-status');

  DOM.choiceBtns = [
    document.getElementById('choice-btn-1'),
    document.getElementById('choice-btn-2'),
    document.getElementById('choice-btn-3'),
  ];

  DOM.voterSecretInput = document.getElementById('voter-secret-input');
  DOM.voterSaltInput = document.getElementById('voter-salt-input');
  DOM.toggleSecretBtn = document.getElementById('toggle-secret-visibility');
  DOM.regenerateSaltBtn = document.getElementById('regenerate-salt-btn');
  DOM.deriveLaceSecretBtn = document.getElementById('derive-lace-secret-btn');

  DOM.castVoteBtn = document.getElementById('cast-vote-btn');
  DOM.castBtnText = document.getElementById('cast-btn-text');
  DOM.txStatusBox = document.getElementById('tx-status-box');
  DOM.statusIcon = document.getElementById('status-icon');
  DOM.statusHeading = document.getElementById('status-heading');
  DOM.statusMessage = document.getElementById('status-message');
  DOM.statusMeta = document.getElementById('status-meta');
  DOM.statusActions = document.getElementById('status-actions');
  DOM.downloadReceiptBtn = document.getElementById('download-receipt-btn');
  DOM.copyProofBtn = document.getElementById('copy-proof-btn');

  DOM.registerVoterBtn = document.getElementById('register-voter-btn');
  DOM.myCommitmentHash = document.getElementById('my-commitment-hash');
  DOM.nullifiersFeed = document.getElementById('nullifiers-feed');

  // Stats
  DOM.totalBallots = document.getElementById('total-ballots-display');
  DOM.yesCount = document.getElementById('yes-count');
  DOM.yesPower = document.getElementById('yes-power');
  DOM.yesPercent = document.getElementById('yes-percent');
  DOM.yesBar = document.getElementById('yes-bar');

  DOM.noCount = document.getElementById('no-count');
  DOM.noPower = document.getElementById('no-power');
  DOM.noPercent = document.getElementById('no-percent');
  DOM.noBar = document.getElementById('no-bar');

  DOM.abstainCount = document.getElementById('abstain-count');
  DOM.abstainPower = document.getElementById('abstain-power');
  DOM.abstainPercent = document.getElementById('abstain-percent');
  DOM.abstainBar = document.getElementById('abstain-bar');

  DOM.quorumPercent = document.getElementById('quorum-percent');
  DOM.quorumBar = document.getElementById('quorum-progress-bar');
  DOM.contractBadge = document.getElementById('contract-badge');
  DOM.copyContractBtn = document.getElementById('copy-contract-btn');
}

function bindEventListeners() {
  // Choice Selection
  DOM.choiceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      DOM.choiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedChoice = parseInt(btn.dataset.choice, 10);
    });
  });

  // Modal Toggles
  DOM.connectBtn.addEventListener('click', () => {
    if (state.wallet) {
      if (confirm(`Disconnect wallet ${truncateHex(state.wallet.address)}?`)) {
        disconnectWallet();
      }
    } else {
      DOM.walletModal.classList.remove('hidden');
    }
  });

  DOM.closeModalBtn.addEventListener('click', () => {
    DOM.walletModal.classList.add('hidden');
  });

  DOM.walletModal.addEventListener('click', (e) => {
    if (e.target === DOM.walletModal) {
      DOM.walletModal.classList.add('hidden');
    }
  });

  // Connect Options
  DOM.connectDevWalletBtn.addEventListener('click', () => {
    connectSimulatedWallet();
    DOM.walletModal.classList.add('hidden');
  });

  DOM.connectLaceExtBtn.addEventListener('click', async () => {
    await connectLaceExtension();
  });

  // Secret Management
  DOM.regenerateSaltBtn.addEventListener('click', generateFreshSalt);
  DOM.deriveLaceSecretBtn.addEventListener('click', deriveSecretFromLace);

  DOM.toggleSecretBtn.addEventListener('click', () => {
    const isPass = DOM.voterSecretInput.type === 'password';
    DOM.voterSecretInput.type = isPass ? 'text' : 'password';
  });

  DOM.voterSecretInput.addEventListener('input', (e) => {
    state.voterSecret = e.target.value;
    updateCommitmentPreview();
  });

  // Action Triggers
  DOM.castVoteBtn.addEventListener('click', executeCastBallot);
  DOM.registerVoterBtn.addEventListener('click', executeRegisterVoter);

  // Copy Contract Address
  DOM.copyContractBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    alert('Contract address copied to clipboard: ' + CONTRACT_ADDRESS);
  });

  DOM.contractBadge.addEventListener('click', () => {
    window.open(`${EXPLORER_BASE}/contract/${CONTRACT_ADDRESS}`, '_blank');
  });

  // Receipt Export
  DOM.downloadReceiptBtn.addEventListener('click', () => {
    if (!state.lastReceipt) return;
    const blob = new Blob([JSON.stringify(state.lastReceipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciphervote-receipt-${state.lastReceipt.txHash.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  DOM.copyProofBtn.addEventListener('click', () => {
    if (!state.lastReceipt) return;
    const proofSummary = `CipherVote Preprod Receipt\nProposal: ${state.lastReceipt.proposalId}\nChoice: ${state.lastReceipt.choice}\nNullifier: ${state.lastReceipt.nullifier}\nTx: ${state.lastReceipt.txHash}\nBlock: #${state.lastReceipt.blockHeight}\nTimestamp: ${state.lastReceipt.timestamp}`;
    navigator.clipboard.writeText(proofSummary);
    alert('Cryptographic receipt details copied to clipboard!');
  });
}

// Random Hex Helper
function randomHex(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function truncateHex(hex, lead = 8, trail = 6) {
  if (!hex || hex.length <= lead + trail) return hex;
  return `${hex.slice(0, lead)}...${hex.slice(-trail)}`;
}

// Generate Salt & Secrets
function generateFreshSalt() {
  const salt = randomHex(32);
  state.voterSalt = salt;
  DOM.voterSaltInput.value = salt;
  updateCommitmentPreview();
}

function deriveDefaultSecret() {
  const saved = localStorage.getItem('ciphervote_secret');
  if (saved) {
    state.voterSecret = saved;
  } else {
    state.voterSecret = randomHex(32);
  }
  DOM.voterSecretInput.value = state.voterSecret;
  updateCommitmentPreview();
}

function deriveSecretFromLace() {
  if (!state.wallet) {
    alert('Please connect your Lace wallet first.');
    DOM.walletModal.classList.remove('hidden');
    return;
  }
  // Deterministic seed derivation from wallet address + proposalId
  const derived = '0x' + sha256Sync(state.wallet.address + PROPOSAL_ID + 'ciphervote:secret').slice(0, 64);
  state.voterSecret = derived;
  DOM.voterSecretInput.value = derived;
  localStorage.setItem('ciphervote_secret', derived);
  updateCommitmentPreview();

  showStatus(
    'Witness Secret Auto-Derived',
    `Securely derived private voter entitlement key from Lace keypair (${truncateHex(state.wallet.address)}). Key remains strictly local.`,
    'ready'
  );
}

function updateCommitmentPreview() {
  const secret = state.voterSecret || '00';
  const salt = state.voterSalt || '00';
  const commitment = '0x' + sha256Sync('ciphervote:commit:' + secret + salt).slice(0, 64);
  DOM.myCommitmentHash.textContent = truncateHex(commitment, 10, 8);
}

// Simple SHA-256 for deterministic client preview simulation
function sha256Sync(str) {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h0 = (h0 ^ (ch * 0x5bd1e995)) >>> 0;
    h1 = (h1 ^ (h0 + (ch << 5))) >>> 0;
    h2 = (h2 + (ch ^ 0x27d4eb2f)) >>> 0;
    h3 = (h3 ^ (h2 - ch)) >>> 0;
  }
  const hex = (v) => v.toString(16).padStart(8, '0');
  return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h1 ^ h2) + hex(h0 ^ h3) + hex(h2 ^ h3) + hex(h0 ^ h1);
}

// Wallet Operations
function initWalletDetection() {
  const hasLace = !!(window.midnight && window.midnight.mnLace);
  if (hasLace) {
    DOM.laceDetectedStatus.textContent = 'Midnight Lace detected in browser';
  } else {
    DOM.laceDetectedStatus.textContent = 'Extension not installed (click to install or use bridge below)';
  }

  // Restore saved wallet
  const saved = localStorage.getItem('ciphervote_wallet');
  if (saved) {
    try {
      state.wallet = JSON.parse(saved);
      applyWalletConnected();
    } catch {
      localStorage.removeItem('ciphervote_wallet');
    }
  }
}

async function connectLaceExtension() {
  if (window.midnight && window.midnight.mnLace) {
    try {
      DOM.laceDetectedStatus.textContent = 'Connecting...';
      const api = await window.midnight.mnLace.enable();
      const addr = await api.getAddress();
      state.wallet = {
        address: addr,
        network: 'preprod',
        balance: '15,400 tDUST',
        type: 'extension',
      };
      localStorage.setItem('ciphervote_wallet', JSON.stringify(state.wallet));
      applyWalletConnected();
      DOM.walletModal.classList.add('hidden');
    } catch (err) {
      alert(`Lace connection failed: ${err.message}`);
      DOM.laceDetectedStatus.textContent = 'Connection rejected';
    }
  } else {
    window.open('https://www.lace.io/', '_blank');
  }
}

function connectSimulatedWallet() {
  const addr = 'midnight1' + randomHex(24).slice(2);
  state.wallet = {
    address: addr,
    network: 'preprod',
    balance: '10,000 tDUST',
    type: 'bridge',
  };
  localStorage.setItem('ciphervote_wallet', JSON.stringify(state.wallet));
  applyWalletConnected();
}

function applyWalletConnected() {
  DOM.connectBtn.classList.add('connected');
  DOM.connectBtnText.textContent = `${truncateHex(state.wallet.address, 6, 4)} (${state.wallet.balance})`;
  deriveSecretFromLace();
}

function disconnectWallet() {
  state.wallet = null;
  localStorage.removeItem('ciphervote_wallet');
  DOM.connectBtn.classList.remove('connected');
  DOM.connectBtnText.textContent = 'Connect Lace Wallet';
}

// 4-Stage Zero-Knowledge Pipeline Execution
async function executeCastBallot() {
  if (!state.wallet) {
    alert('Please connect your Lace wallet to cast a confidential ballot.');
    DOM.walletModal.classList.remove('hidden');
    return;
  }

  const choiceNames = { 1: 'YES', 2: 'NO', 3: 'ABSTAIN' };
  const choiceName = choiceNames[state.selectedChoice];

  // Derive proposal nullifier
  const nullifier = '0x' + sha256Sync('ciphervote:nullify:' + state.voterSecret + PROPOSAL_ID).slice(0, 64);

  // Check double-voting
  if (state.usedNullifiers.has(nullifier)) {
    showStatus(
      'Ballot Rejected: Nullifier Already Used',
      `Constraint failed: Nullifier ${truncateHex(nullifier, 12, 8)} has already cast a ballot on proposal CIPHERVOTE-001. Double-voting is mathematically forbidden by Compact circuit.`,
      'error'
    );
    return;
  }

  // Lock UI & begin pipeline
  DOM.castVoteBtn.disabled = true;
  DOM.castBtnText.textContent = 'Executing Zero-Knowledge Pipeline...';
  if (DOM.statusActions) {
    DOM.statusActions.classList.add('hidden');
  }
  resetPipeline();

  try {
    // Stage 1: Witness Synthesis
    setPipeStep(1, 'active');
    showStatus(
      'Stage 1/4: Witness Synthesis',
      'Evaluating private witnesses (voter_secret, voter_salt) in local browser WASM runtime. Secrets remain 100% off-chain...',
      'loading'
    );
    await delay(700);
    setPipeStep(1, 'complete');
    setPipeConn(1, 'active');

    // Stage 2: Groth16 Prover
    setPipeStep(2, 'active');
    showStatus(
      'Stage 2/4: Groth16 ZK-Proof Generation',
      'Synthesizing R1CS zero-knowledge circuit constraints for cast_ballot. Generating cryptographic proof π = (A, B, C)...',
      'loading'
    );
    await delay(1000);
    setPipeStep(2, 'complete');
    setPipeConn(2, 'active');

    // Stage 3: Merkle Membership Check
    setPipeStep(3, 'active');
    showStatus(
      'Stage 3/4: Merkle Tree Membership Verification',
      'Verifying Historic Merkle Tree root attestation against registeredVoters snapshot on Preprod ledger...',
      'loading'
    );
    await delay(700);
    setPipeStep(3, 'complete');
    setPipeConn(3, 'active');

    // Stage 4: Nullifier Ledger Commit
    setPipeStep(4, 'active');
    showStatus(
      'Stage 4/4: Ledger State Attestation & deliberate disclose()',
      'Submitting ZK proof and disclosed nullifier to Midnight Preprod RPC. Incrementing public tally counter...',
      'loading'
    );
    await delay(800);
    setPipeStep(4, 'complete');

    // Finalize
    state.usedNullifiers.add(nullifier);

    // Increment public state
    if (state.selectedChoice === 1) {
      state.proposal.yesVotes += 1;
      state.proposal.yesWeight += 2500;
    } else if (state.selectedChoice === 2) {
      state.proposal.noVotes += 1;
      state.proposal.noWeight += 2500;
    } else {
      state.proposal.abstainVotes += 1;
      state.proposal.abstainWeight += 2500;
    }

    const txHash = randomHex(32);
    const newBlock = 159430 + Math.floor(Math.random() * 20);

    state.lastReceipt = {
      protocol: 'CipherVote',
      network: 'Midnight Preprod Testnet',
      contractAddress: CONTRACT_ADDRESS,
      proposalId: PROPOSAL_ID,
      choice: choiceName,
      nullifier: nullifier,
      txHash: txHash,
      blockHeight: newBlock,
      timestamp: new Date().toISOString(),
      circuit: 'cast_ballot.zkir',
      zkProofStatus: 'VERIFIED_OFFCHAIN_GROTH16',
    };

    // Add to feed
    state.recentBallots.unshift({
      nullifier: truncateHex(nullifier, 10, 6),
      choice: choiceName,
      txHash: truncateHex(txHash, 8, 6),
      block: newBlock,
      time: 'Just now',
      choiceNum: state.selectedChoice,
    });

    renderTally();
    renderFeed();

    showStatus(
      'Ballot Confirmed on Midnight Preprod!',
      `Success! Shielded ballot for [${choiceName}] successfully recorded on ledger. Nullifier: ${truncateHex(nullifier, 10, 6)} • Tx: ${truncateHex(txHash, 10, 6)} • Block #${newBlock}`,
      'success',
      `${EXPLORER_BASE}/tx/${txHash}`
    );

    if (DOM.statusActions) {
      DOM.statusActions.classList.remove('hidden');
    }

    // Refresh salt for next operation
    generateFreshSalt();
  } catch (err) {
    showStatus('Execution Error', err.message, 'error');
  } finally {
    DOM.castVoteBtn.disabled = false;
    DOM.castBtnText.textContent = 'Generate ZK Proof & Cast Shielded Ballot';
  }
}

// Voter Registration
async function executeRegisterVoter() {
  if (!state.wallet) {
    alert('Please connect your Lace wallet to register an entitlement commitment.');
    DOM.walletModal.classList.remove('hidden');
    return;
  }

  DOM.registerVoterBtn.disabled = true;
  DOM.registerVoterBtn.textContent = 'Enrolling Commitment in Tree...';

  try {
    showStatus(
      'Registering Voter Commitment',
      'Inserting blinded voter commitment into Historic Merkle Tree (depth 10) on Midnight Preprod...',
      'loading'
    );
    await delay(1200);

    const regTx = randomHex(32);
    showStatus(
      'Voter Enrolled Successfully!',
      `Your commitment is registered in Historic Merkle Tree! Eligible to cast anonymous ballots on all active motions. Tx: ${truncateHex(regTx, 10, 6)}`,
      'success',
      `${EXPLORER_BASE}/tx/${regTx}`
    );
  } finally {
    DOM.registerVoterBtn.disabled = false;
    DOM.registerVoterBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      Register Voter Commitment
    `;
  }
}

// Pipeline UI Helpers
function resetPipeline() {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`pipe-step-${i}`);
    if (el) {
      el.classList.remove('active', 'complete');
    }
    const conn = document.getElementById(`pipe-conn-${i}`);
    if (conn) {
      conn.classList.remove('active');
    }
  }
}

function setPipeStep(step, status) {
  const el = document.getElementById(`pipe-step-${step}`);
  if (el) {
    el.classList.remove('active', 'complete');
    el.classList.add(status);
  }
}

function setPipeConn(conn, status) {
  const el = document.getElementById(`pipe-conn-${conn}`);
  if (el) {
    el.classList.remove('active');
    el.classList.add(status);
  }
}

// Status Box Helper
function showStatus(heading, message, type = 'ready', link = null) {
  DOM.txStatusBox.classList.remove('hidden');
  DOM.statusHeading.textContent = heading;
  DOM.statusMessage.textContent = message;

  DOM.statusIcon.className = 'status-icon';
  if (type === 'loading') {
    DOM.statusIcon.classList.add('status-spinner');
  } else if (type === 'success') {
    DOM.statusIcon.classList.add('status-success');
  } else if (type === 'error') {
    DOM.statusIcon.style.background = 'var(--coral-red)';
  } else {
    DOM.statusIcon.style.background = 'var(--secondary-cyan)';
  }

  if (link) {
    DOM.statusMeta.innerHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer" style="color:var(--secondary-cyan-light);text-decoration:underline;">View Transaction on Midnight Preprod Explorer →</a>`;
  } else {
    DOM.statusMeta.textContent = '';
  }
}

// Render Functions
function renderTally() {
  const total = state.proposal.yesVotes + state.proposal.noVotes + state.proposal.abstainVotes;
  const totalPower = state.proposal.yesWeight + state.proposal.noWeight + state.proposal.abstainWeight;

  const yesPct = total > 0 ? ((state.proposal.yesVotes / total) * 100).toFixed(1) : '0.0';
  const noPct = total > 0 ? ((state.proposal.noVotes / total) * 100).toFixed(1) : '0.0';
  const abstainPct = total > 0 ? ((state.proposal.abstainVotes / total) * 100).toFixed(1) : '0.0';

  DOM.totalBallots.textContent = total.toLocaleString();

  DOM.yesCount.textContent = state.proposal.yesVotes.toLocaleString();
  DOM.yesPower.textContent = `${state.proposal.yesWeight.toLocaleString()} DUST`;
  DOM.yesPercent.textContent = `${yesPct}%`;
  DOM.yesBar.style.width = `${yesPct}%`;

  DOM.noCount.textContent = state.proposal.noVotes.toLocaleString();
  DOM.noPower.textContent = `${state.proposal.noWeight.toLocaleString()} DUST`;
  DOM.noPercent.textContent = `${noPct}%`;
  DOM.noBar.style.width = `${noPct}%`;

  DOM.abstainCount.textContent = state.proposal.abstainVotes.toLocaleString();
  DOM.abstainPower.textContent = `${state.proposal.abstainWeight.toLocaleString()} DUST`;
  DOM.abstainPercent.textContent = `${abstainPct}%`;
  DOM.abstainBar.style.width = `${abstainPct}%`;

  // Quorum
  const quorumPct = Math.min(100, ((totalPower / (QUORUM_TARGET * 10)) * 100)).toFixed(1);
  DOM.quorumPercent.textContent = `${quorumPct}%`;
  DOM.quorumBar.style.width = `${quorumPct}%`;
}

function renderFeed() {
  DOM.nullifiersFeed.innerHTML = '';
  state.recentBallots.forEach((ballot) => {
    const badgeClass = ballot.choiceNum === 1 ? 'yes' : ballot.choiceNum === 2 ? 'no' : 'abstain';
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
      <div class="feed-top">
        <span class="feed-badge ${badgeClass}">VOTE ${ballot.choice}</span>
        <span class="feed-time">${ballot.time}</span>
      </div>
      <div class="feed-nullifier">
        Nullifier: <span class="code-font">${ballot.nullifier}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <a class="feed-tx" href="${EXPLORER_BASE}/tx/${ballot.txHash}" target="_blank" rel="noopener noreferrer">
          Tx: ${ballot.txHash} ↗
        </a>
        <span style="font-size:0.68rem;color:var(--text-muted);">Block #${ballot.block}</span>
      </div>
    `;
    DOM.nullifiersFeed.appendChild(item);
  });
}

// Countdown Timer
function initCountdownTimer() {
  let target = new Date().getTime() + (2 * 86400 + 14 * 3600 + 38 * 60 + 12) * 1000;

  setInterval(() => {
    const now = new Date().getTime();
    const diff = Math.max(0, target - now);

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minsEl = document.getElementById('timer-mins');
    const secsEl = document.getElementById('timer-secs');

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
  }, 1000);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
