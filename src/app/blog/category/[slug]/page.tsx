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
  
  const posts = await Promise.all(directories.map(async dir => {
    const fullPath = path.join(blogDir, dir, 'index.tsx')
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    
    // Extract frontmatter from export const frontmatter: BlogPostFrontmatter = {...}
    const frontmatterRegex = /export\s+const\s+frontmatter\s*:\s*BlogPostFrontmatter\s*=\s*({[\s\S]*?})/
    const match = frontmatterRegex.exec(fileContents)
    
    if (!match) {
      console.error(`No frontmatter match found in ${dir}`)
      return null
    }

    try {
      // Parse the frontmatter object
      const frontmatterString = match[1]
      const frontmatter = eval(`(${frontmatterString})`)
      
      return {
        slug: dir,
        frontmatter,
      }
    } catch (error) {
      console.error(`Error parsing frontmatter for ${dir}:`, error)
      return null
    }
  }))

  const validPosts = posts.filter((post): post is BlogPost => post !== null)

  // Normalize the category slug for comparison
  const normalizedCategorySlug = categorySlug.toLowerCase().replace(/-/g, ' ')
    
  const filteredPosts = validPosts
    .filter(post => {
      const isPublished = post.frontmatter.published
      const hasCategory = post.frontmatter.categories.some((category: string) => {
        const normalizedCategory = category.toLowerCase()
        const matches = normalizedCategory === normalizedCategorySlug
        return matches
      })

      return isPublished && hasCategory
    })
    .sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    )
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
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/blog"
          className="text-[#FF6B6B] hover:underline mb-4 inline-block"
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
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-[#FF6B6B]">
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
                    className="bg-[#FFE5E5] text-[#FF6B6B] rounded-full px-3 py-1 text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <span className="inline-block text-[#FF6B6B] font-medium group-hover:underline">
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