import type { MetadataRoute } from 'next';
import { getAllProjects } from '@/lib/projects';
import { getPublishedPosts } from '@/lib/writing';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    {
      url: absoluteUrl('/projects'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/resume'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/code'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // /writing is omitted while it has no posts. An empty page in the index is a
  // small cost with no upside.
  const writingRoutes: MetadataRoute.Sitemap =
    getPublishedPosts().length === 0
      ? []
      : [
          {
            url: absoluteUrl('/writing'),
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.5,
          },
        ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: project.featured ? 0.9 : 0.6,
  }));

  return [...staticRoutes, ...writingRoutes, ...projectRoutes];
}
