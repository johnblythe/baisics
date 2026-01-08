import fs from 'fs'
import path from 'path'
import { BlogPost, BlogPostFrontmatter } from '@/types/blog'

async function getBlogPosts(): Promise<BlogPost[]> {
  const postsDirectory = path.join(process.cwd(), 'src/content/blog')
  const folders = fs.readdirSync(postsDirectory)

  const posts = await Promise.all(
    folders.map(async (folder) => {
      try {
        const { frontmatter } = await import(`@/content/blog/${folder}/index.tsx`)
        if (!frontmatter.published) {
          return null
        }
        return {
          slug: folder,
          frontmatter: frontmatter as BlogPostFrontmatter
        }
      } catch {
        return null
      }
    })
  )

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = await getBlogPosts()
  const siteUrl = 'https://baisics.app'

  const rssItems = posts
    .slice(0, 20)
    .map((post) => {
      const pubDate = new Date(post.frontmatter.date).toUTCString()
      return `
    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.frontmatter.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.frontmatter.categories?.map(cat => `<category>${escapeXml(cat)}</category>`).join('\n      ') || ''}
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Baisics Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Expert fitness guides, workout tips, and science-backed training advice from Baisics.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
