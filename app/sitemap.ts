import type { MetadataRoute } from 'next';
import plans from '@/data/plans.json';

const baseUrl = 'https://smaplan.com';

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
      url: `${baseUrl}/carriers`,
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
  ];
}
