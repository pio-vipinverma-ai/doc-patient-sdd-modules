#!/usr/bin/env node
// validate.js - simple validator for .github/constitution.md
import fs from 'fs';
import path from 'path';

function readFile(repoRoot) {
  const p = path.join(repoRoot, '.github', 'constitution.md');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function parseFrontMatter(text) {
  if (!text.startsWith('---')) return { fm: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: {}, body: text };
  const fmRaw = text.slice(3, end + 1).trim();
  const body = text.slice(end + 4).trimStart();
  const fm = {};
  // very small frontmatter parser: lines like key: value
  fmRaw.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      // try parse JSON arrays/objects
      if (val.startsWith('[') || val.startsWith('{')) {
        // eslint-disable-next-line no-empty
        try { val = JSON.parse(val); } catch {}
      }
      fm[m[1]] = val;
    }
  });
  return { fm, body };
}

function extractPrinciples(body) {
  // Principles are expected under a heading '## Principles' and each principle is a '### ID - Title' section
  const principles = [];
  const principleHeaderRegex = /^###\s+([A-Za-z0-9_-]+)\s*-\s*(.+)$/gm;
  let m;
  while ((m = principleHeaderRegex.exec(body)) !== null) {
    const id = m[1].trim();
    const title = m[2].trim();
    principles.push({ id, title });
  }
  return principles;
}

function validate(repoRoot = process.cwd()) {
  const diagnostics = [];
  const text = readFile(repoRoot);
  if (!text) {
    diagnostics.push({ level: 'error', message: 'Missing .github/constitution.md' });
    return diagnostics;
  }

  const { fm, body } = parseFrontMatter(text);
  if (!fm.version) diagnostics.push({ level: 'warning', message: 'Missing frontmatter `version`' });
  if (!body.includes('## Principles')) diagnostics.push({ level: 'warning', message: 'Missing `## Principles` section' });

  const principles = extractPrinciples(body);
  const ids = new Set();
  principles.forEach(p => {
    if (!p.id) diagnostics.push({ level: 'error', message: `Principle with empty id: ${p.title}` });
    if (ids.has(p.id)) diagnostics.push({ level: 'error', message: `Duplicate principle id: ${p.id}` });
    ids.add(p.id);
  });

  return diagnostics;
}

if (process.argv[1] && process.argv[1].endsWith('validate.js')) {
  const repoRoot = process.argv[2] || process.cwd();
  const diags = validate(repoRoot);
  if (!diags || diags.length === 0) {
    console.log(JSON.stringify({ ok: true, diagnostics: [] }, null, 2));
    process.exit(0);
  }
  console.log(JSON.stringify({ ok: false, diagnostics: diags }, null, 2));
  const hasError = diags.some(d => d.level === 'error');
  process.exit(hasError ? 2 : 1);
}

export { validate, parseFrontMatter, extractPrinciples };
