import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
const rootDir = path.resolve(currentDir, '..');

const sourceFile = path.resolve(rootDir, 'contract', 'ciphervote.compact');
const outputDir = path.resolve(rootDir, 'contract', 'managed', 'ciphervote');

console.log('================================================================');
console.log('       MIDNIGHT COMPACT COMPILER - CIPHERVOTE PROTOCOL          ');
console.log('================================================================');
console.log(`Source Contract : ${sourceFile}`);
console.log(`Output Directory: ${outputDir}`);
console.log('----------------------------------------------------------------');

if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source file does not exist: ${sourceFile}`);
  process.exit(1);
}

// Convert Windows path to WSL mount path
function toWslPath(winPath) {
  const normalized = winPath.replace(/\\/g, '/');
  const match = normalized.match(/^([a-zA-Z]):\/(.*)$/);
  if (match) {
    const drive = match[1].toLowerCase();
    const rest = match[2];
    return `/mnt/${drive}/${rest}`;
  }
  return normalized;
}

const wslSource = toWslPath(sourceFile);
const wslOutput = toWslPath(outputDir);

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

console.log(`Compiling via Compact toolchain...`);
const compileCmd = `wsl bash -c "~/.local/bin/compact compile '${wslSource}' '${wslOutput}'"`;

try {
  const result = execSync(compileCmd, { stdio: 'inherit' });
  console.log('----------------------------------------------------------------');
  console.log('✔ COMPILATION SUCCESSFUL');
  console.log('----------------------------------------------------------------');

  const contractInfoPath = path.join(outputDir, 'compiler', 'contract-info.json');
  if (fs.existsSync(contractInfoPath)) {
    const info = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
    console.log(`Contract Name : ${info.name}`);
    console.log(`Circuits      : ${info.circuits ? info.circuits.join(', ') : 'None'}`);
    console.log(`Ledger State  : ${info.ledger ? Object.keys(info.ledger).join(', ') : 'None'}`);
  }

  const zkirDir = path.join(outputDir, 'zkir');
  if (fs.existsSync(zkirDir)) {
    const zkirFiles = fs.readdirSync(zkirDir);
    console.log(`ZKIR Circuits : ${zkirFiles.join(', ')}`);
  }

  const keysDir = path.join(outputDir, 'keys');
  if (fs.existsSync(keysDir)) {
    const keyFiles = fs.readdirSync(keysDir);
    console.log(`Generated Keys: ${keyFiles.length} key files`);
  }
  console.log('================================================================');
} catch (error) {
  console.error('\n✖ COMPILATION FAILED:');
  console.error(error.message);
  process.exit(1);
}
