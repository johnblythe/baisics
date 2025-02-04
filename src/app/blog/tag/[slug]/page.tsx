import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import MainLayout from '@/app/components/layouts/MainLayout'
import { BlogPost } from '@/types/blog'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tagName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${tagName} Articles | Baisics Blog`,
    description: `Read our articles tagged with ${tagName.toLowerCase()} on the Baisics blog.`,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

async function getBlogPosts(tagSlug: string): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), 'src/content/blog')
  const directories = fs.readdirSync(blogDir)
  
  const posts = directories.map(dir => {
    const fullPath = path.join(blogDir, dir, 'index.mdx')
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    
    const frontmatterRegex = /---\r?\n([\s\S]*?)\r?\n---/
    const match = frontmatterRegex.exec(fileContents)
    
    if (!match) {
      throw new Error('No frontmatter found')
    }

    const frontmatterString = match[1]
    
    const frontmatter = {
      title: '',
      date: '',
      excerpt: '',
      published: true,
      featured: false,
      categories: [],
      tags: [],
      keywords: [],
      ...Object.fromEntries(
        frontmatterString.split('\n').map(line => {
          const [key, ...values] = line.split(':')
          const value = values.join(':').trim()
          
          if (value.startsWith('[') || value.startsWith('-')) {
            return [
              key.trim(), 
              value.replace(/[\[\]]/g, '')
                .split('-')
                .map(item => item.trim())
                .filter(Boolean)
            ]
          }
          
          if (value === 'true' || value === 'false') {
            return [key.trim(), value === 'true']
          }
          
          return [key.trim(), value.replace(/^"(.*)"$/, '$1')]
        })
      )
    }
    
    return {
      slug: dir,
      frontmatter,
    }
  })

  const tagName = tagSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return posts
    .filter(post => 
      post.frontmatter.published && 
      post.frontmatter.tags.map((tag: string) => tag.toLowerCase()).includes(tagName.toLowerCase())
    )
    .sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    )
}

async function TagPageContent({ params }: Props) {
  const { slug } = await params
  const posts = await getBlogPosts(slug)
  
  if (posts.length === 0) {
    notFound()
  }

  const tagName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/blog"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Blog
        </Link>
        <h1 className="text-4xl font-bold">Articles Tagged with &ldquo;{tagName}&rdquo;</h1>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-gray-200 pb-8">
            <Link 
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600">
                {post.frontmatter.title.replace(/^"|"$/g, '')}
              </h2>
              <time className="text-gray-500 text-sm mb-3 block">
                {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <p className="text-gray-700 mb-4">
                {post.frontmatter.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.frontmatter.categories.map(category => (
                  <span 
                    key={category}
                    className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.frontmatter.tags.map(tag => (
                  <span 
                    key={tag}
                    className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="inline-block text-blue-600 font-medium group-hover:underline">
                Read more →
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default function TagPage({ params }: Props) {
  return (
    <MainLayout>
      <TagPageContent params={params} />
    </MainLayout>
  )
} 