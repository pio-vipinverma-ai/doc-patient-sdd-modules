#!/usr/bin/env node
// mutate.js - ensureExists, appendPrinciple, versionIncrement for .github/constitution.md
import fs from 'fs';
import path from 'path';

function getPath(repoRoot) {
  return path.join(repoRoot, '.github', 'constitution.md');
}

function nowIso() { return new Date().toISOString(); }

function read(repoRoot) {
  const p = getPath(repoRoot);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function write(repoRoot, text) {
  const p = getPath(repoRoot);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, 'utf8');
}

function makeTemplate(options = {}) {
  const version = options.version || '1.0.0';
  const fm = ['---', `version: ${version}`, `amendments: []`, `lastEditedAt: ${nowIso()}`, '---', ''];
  const body = ['# Project Constitution', '', '## Principles', '', ''].join('\n');
  return fm.join('\n') + '\n' + body;
}

function hasPrinciple(text, id) {
  if (!text) return false;
  const re = new RegExp('^###\\s+' + id + '\\b', 'm');
  return re.test(text);
}

function ensureExists(repoRoot) {
  const existing = read(repoRoot);
  if (existing) return { created: false, path: getPath(repoRoot) };
  const tpl = makeTemplate();
  write(repoRoot, tpl);
  return { created: true, path: getPath(repoRoot) };
}

function appendPrinciple(repoRoot, { id, title, description }) {
  if (!id || !title) throw new Error('id and title required');
  let text = read(repoRoot);
  if (!text) {
    text = makeTemplate();
  }
  if (hasPrinciple(text, id)) {
    return { appended: false, reason: 'exists' };
  }
  const section = `\n### ${id} - ${title}\n\n${description || ''}\n`;
  // append at end of file
  const newText = text.trimEnd() + '\n' + section;
  // update frontmatter lastEditedAt and bump patch version
  const updated = updateFrontmatter(newText);
  write(repoRoot, updated);
  return { appended: true, id };
}

function updateFrontmatter(text) {
  if (!text.startsWith('---')) {
    const tpl = makeTemplate();
    return tpl + '\n' + text;
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) return text;
  const fmRaw = text.slice(3, end + 1).trim();
  const body = text.slice(end + 4).trimStart();
  const lines = fmRaw.split(/\r?\n/);
  const fm = {};
  lines.forEach(line => {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2];
  });
  // bump patch of version x.y.z
  if (!fm.version) fm.version = '1.0.0';
  const parts = fm.version.split('.').map(n => parseInt(n, 10) || 0);
  parts[2] = (parts[2] || 0) + 1;
  fm.version = parts.join('.');
  fm.lastEditedAt = nowIso();
  const newFmLines = ['---', `version: ${fm.version}`, `amendments: []`, `lastEditedAt: ${fm.lastEditedAt}`, '---', ''];
  return newFmLines.join('\n') + '\n' + body;
}

if (process.argv[1] && process.argv[1].endsWith('mutate.js')) {
  const cmd = process.argv[2];
  const repoRoot = process.cwd();
  if (cmd === 'ensureExists') {
    const res = ensureExists(repoRoot);
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }
  if (cmd === 'append') {
    const argv = process.argv.slice(3);
    const args = {};
    for (let i = 0; i < argv.length; i++) {
      if (argv[i].startsWith('--')) {
        const key = argv[i].slice(2);
        args[key] = argv[i+1];
        i++;
      }
    }
    try {
      const res = appendPrinciple(repoRoot, { id: args.id, title: args.title, description: args.desc });
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    } catch (err) {
      console.error(err.message);
      process.exit(2);
    }
  }
  console.error('unknown command. use ensureExists or append --id --title --desc');
  process.exit(2);
}

export { ensureExists, appendPrinciple, updateFrontmatter };
