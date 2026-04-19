import type { MetadataRoute } from 'next';
import plans from '@/data/plans.json';
import posts from '@/data/blog-posts.json';

const baseUrl = 'https://smaplan.com';

const kaisenSlugs = [
  'docomo_hikari', 'softbank_hikari', 'au_hikari', 'nuro_hikari',
  'gmobb_hikari', 'rakuten_hikari', 'biglobe_hikari',
  'docomo_home5g', 'softbank_air', 'wimax_home',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/smaho`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kaisen`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/carriers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...plans.map(p => ({
      url: `${baseUrl}/carrier/${p.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...kaisenSlugs.map(id => ({
      url: `${baseUrl}/kaisen/${id}`,
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
