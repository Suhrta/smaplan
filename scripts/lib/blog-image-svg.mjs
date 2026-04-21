import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const IMAGES_DIR = resolve(__dirname, '..', '..', 'public', 'blog');

const TEMPLATES = {
  comparison: {
    bgGrad: ['#1D4ED8', '#60A5FA'],
    textColor: '#FFFFFF',
    badgeText: 'COMPARISON',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeBorder: 'rgba(255,255,255,0.45)',
    badgeColor: '#FFFFFF',
  },
  review: {
    bgGrad: ['#0F172A', '#334155'],
    textColor: '#FFFFFF',
    badgeText: 'REVIEW',
    badgeBg: 'rgba(29,78,216,0.18)',
    badgeBorder: '#1D4ED8',
    badgeColor: '#93C5FD',
  },
  guide: {
    bgGrad: ['#EFF6FF', '#BFDBFE'],
    textColor: '#0F172A',
    badgeText: 'GUIDE',
    badgeBg: '#1D4ED8',
    badgeBorder: '#1D4ED8',
    badgeColor: '#FFFFFF',
  },
  knowledge: {
    bgGrad: ['#EFF6FF', '#BFDBFE'],
    textColor: '#0F172A',
    badgeText: 'KNOWLEDGE',
    badgeBg: '#1D4ED8',
    badgeBorder: '#1D4ED8',
    badgeColor: '#FFFFFF',
  },
};

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine) {
  const lines = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSvg(title, category, type) {
  const t = TEMPLATES[category] || TEMPLATES.knowledge;
  const isKaisen = type === 'kaisen';

  const fontSize = title.length >= 36 ? 42 : title.length >= 24 ? 50 : 58;
  const charsPerLine = title.length >= 36 ? 22 : title.length >= 24 ? 18 : 15;
  const lineHeight = fontSize * 1.35;
  const lines = wrapText(title, charsPerLine);
  const maxLines = 4;
  const displayLines = lines.slice(0, maxLines);

  const textBlockHeight = displayLines.length * lineHeight;
  const textStartY = (630 - textBlockHeight) / 2 + fontSize * 0.35;

  const brandColor = t.bgGrad[0] === '#EFF6FF' ? '#1D4ED8' : '#FFFFFF';
  const brandOpacity = t.bgGrad[0] === '#EFF6FF' ? '0.5' : '0.5';

  const typeIcon = isKaisen
    ? `<g transform="translate(96, ${textStartY - fontSize * 0.5 - 70})">
        <path d="M0 28 A36 36 0 0 1 72 28" fill="none" stroke="${brandColor}" stroke-width="3" stroke-linecap="round" opacity="0.2"/>
        <path d="M12 22 A24 24 0 0 1 60 22" fill="none" stroke="${brandColor}" stroke-width="3" stroke-linecap="round" opacity="0.28"/>
        <path d="M22 16 A14 14 0 0 1 50 16" fill="none" stroke="${brandColor}" stroke-width="3" stroke-linecap="round" opacity="0.38"/>
        <circle cx="36" cy="34" r="4" fill="${brandColor}" opacity="0.45"/>
      </g>`
    : `<g transform="translate(96, ${textStartY - fontSize * 0.5 - 75})">
        <rect x="10" y="0" width="40" height="72" rx="8" fill="${brandColor}" opacity="0.1" stroke="${brandColor}" stroke-width="2" opacity="0.2"/>
        <rect x="16" y="10" width="28" height="44" rx="4" fill="${brandColor}" opacity="0.06"/>
        <circle cx="30" cy="62" r="3" fill="${brandColor}" opacity="0.15"/>
      </g>`;

  const titleElements = displayLines.map((line, i) => {
    const y = textStartY + i * lineHeight;
    return `<text x="96" y="${y}" font-family="'Noto Sans JP',system-ui,sans-serif" font-size="${fontSize}" font-weight="900" fill="${t.textColor}" letter-spacing="0.01em">${escapeXml(line)}</text>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bgGrad[0]}"/>
      <stop offset="100%" stop-color="${t.bgGrad[1]}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Type icon -->
  ${typeIcon}

  <!-- Badge -->
  <rect x="96" y="${textStartY - fontSize * 0.5 - 48}" width="${t.badgeText.length * 14 + 36}" height="36" rx="18" fill="${t.badgeBg}" stroke="${t.badgeBorder}" stroke-width="2"/>
  <text x="${96 + 18}" y="${textStartY - fontSize * 0.5 - 24}" font-family="system-ui,sans-serif" font-size="16" font-weight="800" fill="${t.badgeColor}" letter-spacing="0.18em">${t.badgeText}</text>

  <!-- Title -->
  <g>
    ${titleElements}
  </g>

  <!-- Brand -->
  <g transform="translate(1200, 630)">
    <circle cx="-82" cy="-42" r="18" fill="${brandColor}" opacity="0.12"/>
    <text x="-82" y="-35" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="${brandColor}" opacity="${brandOpacity}">S</text>
    <text x="-52" y="-47" font-family="system-ui,sans-serif" font-size="16" font-weight="800" fill="${brandColor}" opacity="${brandOpacity}" letter-spacing="0.04em">SmaPlan</text>
    <text x="-52" y="-31" font-family="system-ui,sans-serif" font-size="10" font-weight="500" fill="${brandColor}" opacity="0.35" letter-spacing="0.06em">smaplan.com</text>
  </g>
</svg>`;
}

export async function generateHeaderImageSvg({ slug, title, category, type }) {
  await mkdir(IMAGES_DIR, { recursive: true });
  const outputPath = resolve(IMAGES_DIR, `${slug}.svg`);
  const svg = buildSvg(title, category, type || 'smaho');
  await writeFile(outputPath, svg, 'utf-8');
  return outputPath;
}
