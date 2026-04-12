import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://thebreathingbell.com'
  const now = new Date().toISOString()
  const articles = getAllArticles()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/intake`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...articles.map(article => ({
      url: `${base}/learn/${article.slug}`,
      lastModified: new Date(article.date).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
