import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticleBySlug, getAllSlugs } from '@/lib/articles'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `https://thebreathingbell.com/learn/${slug}` },
    openGraph: {
      title: `${article.title} | The Breathing Bell`,
      description: article.excerpt,
      url: `https://thebreathingbell.com/learn/${slug}`,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  return (
    <main
      className="flex flex-col items-center min-h-screen px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-2xl">

        {/* Back link */}
        <Link
          href="/learn"
          className="text-xs tracking-[0.2em] uppercase mb-10 inline-block"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          ← Back to Learn
        </Link>

        {/* Category tag */}
        <p
          className="text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
        >
          {article.categoryLabel}
        </p>

        {/* Title */}
        <h1
          className="text-3xl font-medium mb-4 leading-snug"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
        >
          {article.title}
        </h1>

        {/* Read time */}
        <p
          className="text-xs tracking-[0.15em] uppercase mb-10"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          {article.readTime} min read
        </p>

        {/* Divider */}
        <div className="mb-10" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Article body */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
        />

        {/* Divider */}
        <div className="mt-14 mb-10" style={{ borderTop: '1px solid var(--border)' }} />

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p
            className="text-lg italic"
            style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-display)' }}
          >
            Ready to feel it for yourself?
          </p>
          <Link
            href="/intake"
            className="px-10 py-4 rounded-full text-sm tracking-[0.15em] uppercase transition-all"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--background)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Begin your session
          </Link>
        </div>

      </div>
    </main>
  )
}
