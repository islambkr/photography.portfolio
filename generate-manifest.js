const fs   = require('fs');
const path = require('path');

const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const ROOT = __dirname;

function scan(folder) {
  const abs = path.join(ROOT, folder);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter(f => EXTS.has(path.extname(f).toLowerCase()))
    .sort()
    .map(f => `${folder}/${f}`);
}

const files = scan('pictures');

// 1. Write images.json
fs.writeFileSync(path.join(ROOT, 'images.json'), JSON.stringify(files, null, 2));

// 2. Inject the list directly into index.html so it works without a server
const htmlPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const startTag = '/* IMAGES-START */';
const endTag   = '/* IMAGES-END */';
const newBlock = `${startTag}\nconst GALLERY_IMAGES = ${JSON.stringify(files)};\n${endTag}`;

if (html.includes(startTag) && html.includes(endTag)) {
  html = html.slice(0, html.indexOf(startTag)) + newBlock + html.slice(html.indexOf(endTag) + endTag.length);
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ ${files.length} image(s) injected into index.html`);
} else {
  console.warn('⚠ Markers not found in index.html — only images.json was updated.');
}
