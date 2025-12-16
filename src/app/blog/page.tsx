import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import MainLayout from '@/app/components/layouts/MainLayout'
import { BlogPost, BlogCategory, BlogTag, BlogPostFrontmatter } from '@/types/blog'

export const metadata: Metadata = {
  title: 'Blog | Baisics',
  description: 'Read our latest articles about fitness, health, and wellness.',
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
      } catch (error) {
        console.error(`Error loading blog post ${folder}:`, error)
        return null
      }
    })
  )

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

function getCategories(posts: BlogPost[]): BlogCategory[] {
  const categoryCounts = posts.reduce((acc, post) => {
    post.frontmatter.categories?.forEach(category => {
      const slug = category.toLowerCase().replace(/\s+/g, '-')
      acc[slug] = acc[slug] || { name: category, slug, count: 0 }
      acc[slug].count++
    })
    return acc
  }, {} as Record<string, BlogCategory>)

  return Object.values(categoryCounts)
    .sort((a, b) => b.count - a.count)
}

function getTags(posts: BlogPost[]): BlogTag[] {
  const tagCounts = posts.reduce((acc, post) => {
    post.frontmatter.tags?.forEach(tag => {
      const slug = tag.toLowerCase().replace(/\s+/g, '-')
      acc[slug] = acc[slug] || { name: tag, slug, count: 0 }
      acc[slug].count++
    })
    return acc
  }, {} as Record<string, BlogTag>)

  return Object.values(tagCounts)
    .sort((a, b) => b.count - a.count)
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Categories</h2>
              <ul className="space-y-2">
                {categories.filter(category => category.count > 0 && category.name !== 'Uncategorized').map(category => (
                  <li key={category.slug}>
                    <Link 
                      href={`/blog/category/${category.slug}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-[#FF6B6B] dark:hover:text-[#FF6B6B] flex justify-between items-center"
                    >
                      <span>{category.name}</span>
                      <span className="text-gray-400 dark:text-gray-500 text-sm">({category.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link
                    key={tag.slug}
                    href={`/blog/tag/${tag.slug}`}
                    className="inline-block bg-gray-100 dark:bg-gray-800 hover:bg-[#FFE5E5] dark:hover:bg-[#FF6B6B]/20 text-gray-700 dark:text-gray-300 hover:text-[#FF6B6B] dark:hover:text-[#FF6B6B] rounded-full px-3 py-1 text-sm"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">Blog</h1>
          
          {/* Featured Posts */}
          {posts.some(post => post.frontmatter.featured && post.frontmatter.published) && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Featured Articles</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {posts
                  .filter(post => post.frontmatter.featured && post.frontmatter.published)
                  .map((post) => (
                    <article 
                      key={post.slug} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-gray-800 transition-shadow bg-white dark:bg-gray-800"
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 hover:text-[#FF6B6B] dark:hover:text-[#FF6B6B]">
                            {post.frontmatter.title}
                          </h3>
                          <time className="text-gray-500 dark:text-gray-400 text-sm mb-3 block">
                            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <p className="text-gray-600 dark:text-gray-300">
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
            {posts
              .filter(post => post.frontmatter.published)
              .map((post) => (
                <article key={post.slug} className="border-b border-gray-200 dark:border-gray-700 pb-8">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-[#FF6B6B] dark:group-hover:text-[#FF6B6B]">
                      {post.frontmatter.title}
                    </h2>
                    <time className="text-gray-500 dark:text-gray-400 text-sm mb-3 block">
                      {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {post.frontmatter.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.frontmatter.categories && post.frontmatter.categories.map(category => (
                        <span 
                          key={category}
                          className="bg-[#FFE5E5] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] dark:text-[#FF6B6B] rounded-full px-3 py-1 text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <span className="inline-block text-[#FF6B6B] dark:text-[#FF6B6B] font-medium group-hover:underline">
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