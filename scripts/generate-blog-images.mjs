import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { generateHeaderImage, IMAGES_DIR } from './lib/blog-image.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_PATH = resolve(ROOT, 'data', 'blog-posts.json');
const TOPICS_PATH = resolve(ROOT, 'data', 'blog-topics.json');

const force = process.argv.includes('--force');

async function main() {
  const posts = JSON.parse(await readFile(POSTS_PATH, 'utf-8'));
  const topics = JSON.parse(await readFile(TOPICS_PATH, 'utf-8'));
  const topicsBySlug = new Map(topics.map(t => [t.slug, t]));

  const targets = [];
  for (const p of posts) {
    const outPath = resolve(IMAGES_DIR, `${p.slug}.png`);
    if (!force && existsSync(outPath)) continue;
    const category = p.category || topicsBySlug.get(p.slug)?.category || 'knowledge';
    targets.push({ slug: p.slug, title: p.title, category });
  }

  if (targets.length === 0) {
    console.log('All blog images already exist. Use --force to regenerate.');
    return;
  }

  console.log(`Generating ${targets.length} image(s)...`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    for (const t of targets) {
      const outPath = await generateHeaderImage({ browser, ...t });
      console.log(`  ✓ ${t.slug} (${t.category}) → ${outPath}`);
    }
  } finally {
    await browser.close();
  }
  console.log(`\nDone. ${targets.length} image(s) generated.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
