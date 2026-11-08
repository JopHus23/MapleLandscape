import fs from 'fs';
import path from 'path';

const essaysDir = 'essays';
const listFile = 'essays.html';
const galleryFile = 'gallery.html';
const imagesDir = 'images';
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function mdToHtml(md) {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
  return html.split(/\n\n+/)
    .map(p => {
      if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<img') || p.trim() === '') return p;
      return `<p>${p.trim()}</p>`;
    })
    .join('\n');
}

function generateEssayPage(slug, title, date, contentHtml) {
  return `<!doctype html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <title>${title} — Nilset</title>
  <link rel="stylesheet" href="../css/style.css?v=4">
  <style>
    .article { max-width:680px; margin:0 auto; padding:64px 24px; }
    .article h1 { font-size:28px; font-weight:700; margin-bottom:8px; color:var(--fg); }
    .article .meta { font-size:12px; color:var(--fg-muted); margin-bottom:48px; }
    .article p { font-size:16px; line-height:2; margin-bottom:16px; color:var(--fg-secondary); }
    .article img { max-width:100%; border-radius:8px; margin:24px 0; }
    .article blockquote { border-left:3px solid var(--accent); padding-left:16px; margin:24px 0; color:var(--fg-secondary); }
  </style>
</head>
<body>
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="progress-bar" aria-hidden="true"></div>
  <nav>
    <div class="inner">
      <a href="../index.html" class="logo"><span class="sym">∅</span><span class="name">Nilset</span></a>
      <div class="links">
        <a href="../index.html">首页</a><a href="../essays.html">随笔</a><a href="../gallery.html">图片</a><a href="../about.html">关于</a>
        <button class="theme-btn" aria-label="切换主题">☀</button>
      </div>
    </div>
  </nav>
  <main>
    <article class="article">
      <h1>${title}</h1>
      <p class="meta">${date}</p>
      ${contentHtml}
    </article>
  </main>
  <footer>
    <div class="inner">
      <div class="left"><span class="sym">∅</span><span class="txt">© 2026 Mapher · mapher.me</span></div>
      <div style="display:flex; gap:32px; align-items:center;">
        <a href="https://github.com/JopHus23" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:var(--fg-muted); text-decoration:none;">GitHub ↗</a>
        <a href="https://space.bilibili.com/593618091" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:var(--fg-muted); text-decoration:none;">Bilibili ↗</a>
      </div>
    </div>
  </footer>
  <script src="../js/main.js?v=4"></script>
</body>
</html>`;
}

function parseFrontmatter(raw) {
  const lines = raw.trim().split('\n');
  let title = 'Untitled';
  let date = new Date().toISOString().split('T')[0];
  let body = raw;
  if (lines[0] === '---') {
    const endIdx = lines.indexOf('---', 1);
    if (endIdx > 0) {
      lines.slice(1, endIdx).forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) return;
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        if (key === 'title') title = val;
        if (key === 'date') date = val;
      });
      body = lines.slice(endIdx + 1).join('\n');
    }
  }
  return { title, date, body };
}

function publishEssays() {
  if (!fs.existsSync(essaysDir)) {
    console.log('  essays/ not found, skipping.');
    return;
  }
  const files = fs.readdirSync(essaysDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .sort((a, b) => b.replace('.md', '').localeCompare(a.replace('.md', ''), 'zh-CN', { numeric: true }));
  let listItems = '';
  files.forEach((file, i) => {
    const raw = fs.readFileSync(path.join(essaysDir, file), 'utf-8');
    const { title, date, body } = parseFrontmatter(raw);
    const slug = file.replace('.md', '');
    const html = generateEssayPage(slug, title, date, mdToHtml(body));
    fs.writeFileSync(path.join(essaysDir, `${slug}.html`), html, 'utf-8');
    console.log(`  ✓ essays/${slug}.html — ${title}`);
    const excerpt = body.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'))[0] || '';
    listItems += `        <a href="essays/${slug}.html" class="essay-item reveal"><span class="num">${String(i + 1).padStart(2, '0')} ∅</span><div class="content"><h3>${title}</h3><p>${excerpt.substring(0, 80)}${excerpt.length > 80 ? '…' : ''}</p></div><span class="date">${date}</span></a>\n`;
  });
  let listHtml = fs.readFileSync(listFile, 'utf-8');
  listHtml = listHtml.replace(
    /<div>\s*<a href="#" class="essay-item[\s\S]*?<\/div>\s*<\/div>/s,
    `<div>\n${listItems}      </div>`
  );
  fs.writeFileSync(listFile, listHtml, 'utf-8');
  console.log(`  ✓ ${listFile} updated`);
  console.log(`  ${files.length} essays published.`);
}

function publishGallery() {
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  const images = fs.readdirSync(imagesDir)
    .filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => b.replace(/\.[^.]+$/, '').localeCompare(a.replace(/\.[^.]+$/, ''), 'zh-CN', { numeric: true }));
  let galleryHtml = fs.readFileSync(galleryFile, 'utf-8');
  const aspectRatios = ['3/4', '1/1', '4/3'];
  const blocks = images.map((img, i) => {
    const ar = aspectRatios[i % 3];
    return `        <div class="item reveal" style="aspect-ratio:${ar};"><img src="images/${img}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"><div class="corners"><div class="corner"></div><div class="corner"></div><div class="corner"></div><div class="corner"></div></div></div>`;
  }).join('\n');
  galleryHtml = galleryHtml.replace(
    /<div class="gallery-grid">[\s\S]*?<\/div>\s*<\/section>/,
    `<div class="gallery-grid">\n${blocks}\n      </div>\n    </section>`
  );
  fs.writeFileSync(galleryFile, galleryHtml, 'utf-8');
  console.log(`  ✓ ${galleryFile} updated (${images.length} images)`);
}

const mode = process.argv[2] || 'all';
console.log(`\n  Nilset publish [${mode}]\n`);
if (mode === 'essay' || mode === 'all') publishEssays();
if (mode === 'gallery' || mode === 'all') publishGallery();
console.log('');
