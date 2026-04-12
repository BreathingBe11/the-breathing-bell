import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/session/', '/save/', '/api/'],
    },
    sitemap: 'https://thebreathingbell.com/sitemap.xml',
  }
}
