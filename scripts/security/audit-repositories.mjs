#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repos = [
  path.resolve(process.env.ARCHITECT_REPO ?? path.join(import.meta.dirname, '..', '..')),
  path.resolve(process.env.COSMIC_HAMMER_REPO ?? '/home/ubuntu/cosmic-hammer'),
];
const ignored = new Set(['.git', 'node_modules', 'dist', 'coverage', '.venv', '__pycache__', '.pytest_cache']);
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.html', '.css', '.py', '.yml', '.yaml', '.toml', '.env', '.example']);
const findings = [];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /(?:ghp_|github_pat_|sk-[A-Za-z0-9]{20,})/,
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'`][A-Za-z0-9_\-./+=]{20,}["'`]/i,
];
const browserRiskPatterns = [
  { name: 'unsafe-html', regex: /dangerouslySetInnerHTML|innerHTML\s*=/ },
  { name: 'dynamic-code', regex: /\beval\s*\(|new Function\s*\(/ },
  { name: 'credential-storage', regex: /localStorage\.(?:setItem|getItem).*?(?:token|secret|password)|indexedDB.*?(?:token|secret|password)/is },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (textExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name.startsWith('.env')) out.push(full);
  }
  return out;
}

for (const repo of repos) {
  if (!fs.existsSync(repo)) {
    findings.push({ repo, severity: 'high', category: 'repository', message: 'Repository path is missing' });
    continue;
  }
  for (const file of walk(repo)) {
    const rel = path.relative(repo, file);
    let content;
    try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (!rel.includes('scripts/security/audit-repositories.mjs') && !rel.endsWith('.env.example')) {
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          findings.push({ repo, severity: 'high', category: 'secret', file: rel, message: 'Potential literal credential detected; review manually' });
        }
      }
    }
    const documentationOnly = rel.startsWith('docs/') || rel.startsWith('audit/') || rel.includes('scripts/security/audit-repositories.mjs');
    if (repo.endsWith('cosmic-hammer') && !documentationOnly) {
      for (const risk of browserRiskPatterns) {
        if (risk.regex.test(content)) findings.push({ repo, severity: 'medium', category: 'browser', file: rel, message: risk.name });
      }
    }
  }
  const pkg = path.join(repo, 'package.json');
  if (fs.existsSync(pkg)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(pkg, 'utf8'));
      if (!parsed.packageManager && repo.endsWith('architect-orchestrator')) {
        findings.push({ repo, severity: 'low', category: 'supply-chain', message: 'packageManager field is not pinned' });
      }
    } catch {
      findings.push({ repo, severity: 'high', category: 'configuration', file: 'package.json', message: 'Invalid JSON' });
    }
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  scope: repos,
  posture: 'DEFENSIVE_STATIC_AUDIT',
  externalWrites: false,
  findings,
  summary: {
    high: findings.filter((item) => item.severity === 'high').length,
    medium: findings.filter((item) => item.severity === 'medium').length,
    low: findings.filter((item) => item.severity === 'low').length,
  },
};

const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR ?? path.join(repos[0], 'audit', 'evidence', 'security'));
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'cross-repository-static-audit.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (output.summary.high > 0) process.exitCode = 2;
