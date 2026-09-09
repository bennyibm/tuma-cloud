import { execSync } from 'child_process';
import fs from 'fs';

console.log('🛡️  TUMA Secret Shield — Scan des fichiers indexés avant commit...');

let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
  stagedFiles = output.split('\n').filter((f) => f.trim().length > 0);
} catch {
  process.exit(0);
}

if (stagedFiles.length === 0) {
  process.exit(0);
}

// Patterns that would trigger GitHub Push Protection or leak real credentials
const forbiddenPatterns = [
  { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/ },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Token', regex: /gh[pousr]_[0-9a-zA-Z]{36}/ },
  { name: 'Unencrypted RSA Private Key', regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
];

let violations = [];

for (const file of stagedFiles) {
  // Skip binary files, images, lockfiles, or files in scripts/ itself
  if (
    file.endsWith('.png') ||
    file.endsWith('.jpg') ||
    file.endsWith('.jpeg') ||
    file.endsWith('.lock') ||
    file.endsWith('package-lock.json') ||
    file === 'scripts/check-secrets.mjs'
  ) {
    continue;
  }

  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, 'utf8');

  for (const pattern of forbiddenPatterns) {
    if (pattern.regex.test(content)) {
      violations.push({ file, pattern: pattern.name });
    }
  }
}

if (violations.length > 0) {
  console.error('\n❌ ERREUR : Des secrets ou clés non masquées ont été détectés dans votre commit !');
  violations.forEach((v) => {
    console.error(`   • Fichier: ${v.file} -> Type: ${v.pattern}`);
  });
  console.error('\n👉 Veuillez masquer ces valeurs (ex: sk_live_EXAMPLE_KEY) pour protéger votre repo.');
  process.exit(1);
}

console.log('✅ Aucun secret détecté dans les fichiers indexés. Le commit peut continuer.');
