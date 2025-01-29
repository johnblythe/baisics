import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import MainLayout from '@/app/components/layouts/MainLayout'
import { BlogPost, BlogCategory, BlogTag, BlogPostFrontmatter } from '@/types/blog'

export const metadata: Metadata = {
  title: 'Blog | Baisics',
  description: 'Read our latest articles about fitness, health, and wellness.',
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
    const frontmatter: BlogPostFrontmatter & Record<string, string | boolean | string[]> = {
      title: '',
      date: '',
      excerpt: '',
      published: true,
      featured: false,
      categories: [],
      tags: [],
      keywords: [],
    }

    // Split into lines and process each line
    const lines = frontmatterString.split('\n')
    let currentArray: string[] = []
    let currentKey = ''
    
    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      // Check if this is a new key
      if (!line.startsWith('-')) {
        // If we were building an array, add it to frontmatter
        if (currentArray.length > 0 && currentKey) {
          frontmatter[currentKey] = currentArray
          currentArray = []
        }

        const [key, ...values] = line.split(':')
        currentKey = key.trim()
        const value = values.join(':').trim()

        // Handle boolean values
        if (value === 'true' || value === 'false') {
          frontmatter[currentKey] = value === 'true'
          continue
        }

        // Handle non-array values
        if (value && !value.startsWith('[')) {
          frontmatter[currentKey] = value.replace(/^"(.*)"$/, '$1')
          continue
        }
      } else {
        // This is a list item
        const value = line.substring(1).trim()
        if (value) {
          currentArray.push(value)
        }
      }
    }

    // Add the last array if we were building one
    if (currentArray.length > 0 && currentKey) {
      frontmatter[currentKey] = currentArray
    }
    
    return {
      slug: dir,
      frontmatter: frontmatter as BlogPostFrontmatter,
    }
  })

  // Sort by date and filter published posts
  return posts
    .filter(post => post.frontmatter.published)
    .sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    )
}

function getCategories(posts: BlogPost[]): BlogCategory[] {
  const categories = new Map<string, number>()
  
  posts.forEach(post => {
    if (post.frontmatter.categories) {
      post.frontmatter.categories.forEach(category => {
        const count = categories.get(category) || 0
        categories.set(category, count + 1)
      })
    }
  })
  
  return Array.from(categories.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count
  }))
}

function getTags(posts: BlogPost[]): BlogTag[] {
  const tags = new Map<string, number>()
  
  posts.forEach(post => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach(tag => {
        const count = tags.get(tag) || 0
        tags.set(tag, count + 1)
      })
    }
  })
  
  return Array.from(tags.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count
  }))
}

async function BlogPageContent() {
  const posts = await getBlogPosts()
  const categories = getCategories(posts)
  const tags = getTags(posts)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category.slug}>
                    <Link 
                      href={`/blog/category/${category.slug}`}
                      className="text-gray-600 hover:text-blue-600 flex justify-between items-center"
                    >
                      <span>{category.name}</span>
                      <span className="text-gray-400 text-sm">({category.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link
                    key={tag.slug}
                    href={`/blog/tag/${tag.slug}`}
                    className="inline-block bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full px-3 py-1 text-sm"
                  >
                    {tag.name} ({tag.count})
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          
          {/* Featured Posts */}
          {posts.some(post => post.frontmatter.featured) && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Featured Articles</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {posts
                  .filter(post => post.frontmatter.featured)
                  .map((post) => (
                    <article 
                      key={post.slug} 
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 hover:text-blue-600">
                            {post.frontmatter.title}
                          </h3>
                          <time className="text-gray-500 text-sm mb-3 block">
                            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <p className="text-gray-600">
                            {post.frontmatter.excerpt}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
              </div>
            </div>
          )}

          {/* All Posts */}
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
                  <p className="text-gray-700 mb-4">
                    {post.frontmatter.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.frontmatter.categories && post.frontmatter.categories.map(category => (
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
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <MainLayout>
      <BlogPageContent />
    </MainLayout>
  )
}