import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import MainLayout from '@/app/components/layouts/MainLayout'
import { BlogPost, BlogPostFrontmatter } from '@/types/blog'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${categoryName} Articles | Baisics Blog`,
    description: `Read our articles about ${categoryName.toLowerCase()} on the Baisics blog.`,
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

async function getBlogPosts(categorySlug: string): Promise<BlogPost[]> {
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
    const frontmatter: BlogPostFrontmatter = {
      title: '',
      date: '',
      excerpt: '',
      published: true,
      featured: false,
      categories: [],
      tags: [],
      keywords: []
    }

    // Parse frontmatter line by line
    const lines = frontmatterString.split('\n')
    let currentKey = ''
    let isInArray = false
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      if (!trimmedLine.startsWith('-')) {
        isInArray = false
        const [key, ...values] = trimmedLine.split(':')
        currentKey = key.trim()
        const value = values.join(':').trim()

        if (!value) {
          // This is an array start
          isInArray = true
          continue
        }

        if (value === 'true' || value === 'false') {
          (frontmatter[currentKey as keyof BlogPostFrontmatter] as boolean) = value === 'true'
        } else {
          (frontmatter[currentKey as keyof BlogPostFrontmatter] as string) = value
        }
      } else if (isInArray) {
        // This is an array item
        const value = trimmedLine.substring(1).trim()
        if (value && Array.isArray(frontmatter[currentKey as keyof BlogPostFrontmatter])) {
          (frontmatter[currentKey as keyof BlogPostFrontmatter] as string[]).push(value)
        }
      }
    }
    
    return {
      slug: dir,
      frontmatter,
    }
  })

  const categoryName = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  console.log("Looking for category:", categoryName)
  
  const filteredPosts = posts
    .filter(post => {
      console.log("Post categories:", post.frontmatter.categories)
      return post.frontmatter.published && 
        post.frontmatter.categories.some((category: string) => 
          category.toLowerCase() === categoryName.toLowerCase()
        )
    })
    .sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    )

  console.log("Found posts:", filteredPosts.length)
  return filteredPosts
}

async function CategoryPageContent({ params }: Props) {
  const { slug } = await params
  const posts = await getBlogPosts(slug)
  
  if (posts.length === 0) {
    notFound()
  }

  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  console.log("🚀 ~ CategoryPageContent ~ categoryName:", categoryName)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/blog"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Blog
        </Link>
        <h1 className="text-4xl font-bold">{categoryName} Articles</h1>
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

export default function CategoryPage({ params }: Props) {
  return (
    <MainLayout>
      <CategoryPageContent params={params} />
    </MainLayout>
  )
} 