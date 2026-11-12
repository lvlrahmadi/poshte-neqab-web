'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const out = path.join(root, 'dist');
const files = [
  'index.html', 'app.js', 'engine.js', 'fonts-loader.js', 'sw.js',
  'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'
];
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(out, file));
for (const dir of ['assets', 'fonts']) fs.cpSync(path.join(root, dir), path.join(out, dir), { recursive: true });
console.log('Offline web bundle created in dist/');
