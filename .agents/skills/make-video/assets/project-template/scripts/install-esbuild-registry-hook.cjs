// Keep esbuild's real lib/main.js named main.js (the API locates its binary from that filename).
// Route require("esbuild") through registry-entry.js so the registry unittest can load.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkgDir = path.join(root, 'node_modules/esbuild');
const main = path.join(pkgDir, 'lib/main.js');
const original = path.join(pkgDir, 'lib/main.original.js');
const entry = path.join(pkgDir, 'registry-entry.js');
const pkgPath = path.join(pkgDir, 'package.json');
const marker = 'registry-loader-hook';

if (!fs.existsSync(main) && fs.existsSync(original)) fs.copyFileSync(original, main);
if (!fs.existsSync(main)) {
  console.error('esbuild is not installed; run npm ci before installing the registry loader hook');
  process.exit(1);
}
if (fs.readFileSync(main, 'utf8').includes(marker)) {
  if (!fs.existsSync(original)) {
    console.error('esbuild lib/main.js was replaced and lib/main.original.js is missing');
    process.exit(1);
  }
  fs.copyFileSync(original, main);
}
if (fs.existsSync(original)) fs.rmSync(original);

fs.writeFileSync(entry, `"use strict";
// ${marker}: see scripts/registry-loader-hook.cjs
const real = require("./lib/main.js");
module.exports = require("../../scripts/registry-loader-hook.cjs").install(real);
`);

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (pkg.main !== 'registry-entry.js') {
  pkg.main = 'registry-entry.js';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}
