import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

const contentDir = path.join(process.cwd(), 'content/learn')

export interface Article {
  slug: string
  title: string
  category: string
  categoryLabel: string
  excerpt: string
  readTime: number
  date: string
  content?: string
}

export function getAllArticles(): Article[] {
  const categories = ['body', 'business', 'belonging']
  const articles: Article[] = []

  for (const category of categories) {
    const dir = path.join(contentDir, category)
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data } = matter(raw)
      articles.push(data as Article)
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const categories = ['body', 'business', 'belonging']

  for (const category of categories) {
    const dir = path.join(contentDir, category)
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      if (data.slug === slug) {
        const processed = await remark().use(remarkHtml, { sanitize: false }).process(content)
        return { ...(data as Article), content: processed.toString() }
      }
    }
  }

  return null
}

export function getAllSlugs(): string[] {
  return getAllArticles().map(a => a.slug)
}
