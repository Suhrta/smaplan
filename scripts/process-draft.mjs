import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRAFTS_DIR = resolve(ROOT, 'data', 'drafts');
const POSTS_PATH = resolve(ROOT, 'data', 'blog-posts.json');

async function main() {
  const [draftId, action] = process.argv.slice(2);

  if (!draftId || !action) {
    throw new Error('Usage: process-draft.mjs <draft_id> <approve|reject>');
  }
  if (!draftId.match(/^[a-f0-9]{16}$/)) {
    throw new Error(`Invalid draft ID: ${draftId}`);
  }

  const draftPath = resolve(DRAFTS_DIR, `${draftId}.json`);
  if (!existsSync(draftPath)) {
    throw new Error(`Draft not found: ${draftPath}`);
  }

  const draft = JSON.parse(await readFile(draftPath, 'utf-8'));

  if (action === 'approve') {
    const posts = existsSync(POSTS_PATH)
      ? JSON.parse(await readFile(POSTS_PATH, 'utf-8'))
      : [];

    const duplicate = posts.find(p => p.slug === draft.slug);
    if (duplicate) {
      console.log(`Slug "${draft.slug}" already exists. Removing draft.`);
      await unlink(draftPath);
      return;
    }

    const post = {
      slug: draft.slug,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      type: draft.type,
      publishedAt: new Date().toISOString().split('T')[0],
      content: draft.content,
    };

    posts.push(post);
    await writeFile(POSTS_PATH, JSON.stringify(posts, null, 2) + '\n', 'utf-8');
    await unlink(draftPath);
    console.log(`✓ Approved: "${draft.title}" → blog-posts.json (total: ${posts.length})`);
  } else if (action === 'reject') {
    await unlink(draftPath);
    console.log(`✓ Rejected and removed: "${draft.title}"`);
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
