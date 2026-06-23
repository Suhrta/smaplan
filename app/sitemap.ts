import type { MetadataRoute } from 'next';
import plans from '@/data/plans.json';
import kaisenPlans from '@/data/kaisen-plans.json';
import kaisenContents from '@/data/kaisen-contents.json';
import posts from '@/data/blog-posts.json';

const baseUrl = 'https://smaplan.com';

// 実ページが生成されている回線プランのみ（kaisen-contents にあるもの）。
// これを絞らないと、ページ未生成のIDがsitemapに載って404になる
const kaisenIdsWithPage = new Set(Object.keys(kaisenContents));

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/smaho`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/kaisen`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/carriers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...plans.map(p => ({
      url: `${baseUrl}/carrier/${p.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...kaisenPlans
      .filter(p => kaisenIdsWithPage.has(p.id))
      .map(p => ({
        url: `${baseUrl}/kaisen/${p.id}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ...posts.map(p => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
