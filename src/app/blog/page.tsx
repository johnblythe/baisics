import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog | Baisics',
  description: 'Read our latest articles about fitness, health, and wellness.',
}

type BlogPost = {
  slug: string
  frontmatter: {
    title: string
    date: string
    excerpt: string
  }
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), 'src/content/blog')
  const directories = fs.readdirSync(blogDir)
  
  const posts = directories.map(dir => {
    const fullPath = path.join(blogDir, dir, 'index.mdx')
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    
    // Split the frontmatter and content
    const frontmatterRegex = /---\r?\n([\s\S]*?)\r?\n---/
    const match = frontmatterRegex.exec(fileContents)
    
    if (!match) {
      throw new Error('No frontmatter found')
    }

    const frontmatterString = match[1]
    
    // Parse frontmatter
    const frontmatter = {
      title: '',
      date: '',
      excerpt: '',
      ...Object.fromEntries(
        frontmatterString.split('\n').map(line => {
          const [key, ...values] = line.split(':')
          return [key.trim(), values.join(':').trim().replace(/^"(.*)"$/, '$1')]
        })
      )
    }
    
    return {
      slug: dir,
      frontmatter,
    }
  })

  return posts.sort((a, b) => 
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  )
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-gray-200 pb-8">
            <Link 
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600">
                {post.frontmatter.title}
              </h2>
              <time className="text-gray-500 text-sm mb-3 block">
                {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <p className="text-gray-700">
                {post.frontmatter.excerpt}
              </p>
              <span className="inline-block mt-4 text-blue-600 font-medium group-hover:underline">
                Read more →
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
} 