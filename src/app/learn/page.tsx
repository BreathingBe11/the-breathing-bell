import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllArticles } from '@/lib/articles'

export const metadata: Metadata = {
  title: 'Learn — Breathwork Education & Research',
  description: 'Guides on breathwork, yoga nidra, and nervous system regulation — for stress relief, better sleep, and high performance. Backed by science, written for real life.',
  alternates: { canonical: 'https://thebreathingbell.com/learn' },
  openGraph: {
    title: 'Learn | The Breathing Bell',
    description: 'Guides on breathwork, yoga nidra, and nervous system regulation for stress relief, sleep, and performance.',
    url: 'https://thebreathingbell.com/learn',
  },
}

const CATEGORY_ORDER = ['body', 'business', 'belonging']
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  body: 'Nervous system regulation, sleep, and physical rest.',
  business: 'Clarity, focus, and performance under pressure.',
  belonging: 'Showing up for yourself and the people around you.',
}

export default function LearnPage() {
  const articles = getAllArticles()
  const byCategory = CATEGORY_ORDER.map(cat => ({
    key: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    desc: CATEGORY_DESCRIPTIONS[cat],
    articles: articles.filter(a => a.category === cat),
  }))

  return (
    <main
      className="flex flex-col items-center min-h-screen px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-14">
          <Link
            href="/"
            className="text-xs tracking-[0.2em] uppercase mb-8 inline-block"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            ← The Breathing Bell
          </Link>
          <h1
            className="text-4xl font-medium mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            Learn
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
          >
            Breathwork education, research, and tools for your body, work, and life.
          </p>
        </div>

        {/* Articles by category */}
        <div className="flex flex-col gap-14">
          {byCategory.map(({ key, label, desc, articles: catArticles }) => (
            catArticles.length > 0 && (
              <section key={key}>
                <div className="mb-6">
                  <p
                    className="text-xs tracking-[0.2em] uppercase mb-1"
                    style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {desc}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {catArticles.map(article => (
                    <Link
                      key={article.slug}
                      href={`/learn/${article.slug}`}
                      className="learn-card flex flex-col px-6 py-5 rounded-xl"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span
                        className="text-lg font-medium mb-2 leading-snug"
                        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}
                      >
                        {article.title}
                      </span>
                      <span
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                      >
                        {article.excerpt}
                      </span>
                      <span
                        className="text-xs tracking-[0.15em] uppercase"
                        style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
                      >
                        {article.readTime} min read →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>

      </div>
    </main>
  )
}
