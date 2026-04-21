import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { generateHeaderImage } from './lib/blog-image.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_PATH = resolve(ROOT, 'data', 'blog-posts.json');

async function main() {
  const posts = JSON.parse(await readFile(POSTS_PATH, 'utf-8'));
  console.log(`Regenerating images for ${posts.length} posts...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const post of posts) {
      const path = await generateHeaderImage({
        browser,
        slug: post.slug,
        title: post.title,
        category: post.category,
      });
      console.log(`  ✓ ${post.slug}.png (${post.category})`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. ${posts.length} images regenerated.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
