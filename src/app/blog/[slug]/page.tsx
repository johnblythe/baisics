import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import MainLayout from '@/app/components/layouts/MainLayout'
import { BlogPostFrontmatter } from '@/types/blog'

type Props = {
  params: Promise<{
    slug: string
  }>
}

async function getBlogPost(slug: string) {
  try {
    const BlogPost = await import(`@/content/blog/${slug}/index.tsx`)
    return {
      default: BlogPost.default,
      frontmatter: BlogPost.frontmatter as BlogPostFrontmatter
    }
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | Baisics',
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  return {
    title: `${post.frontmatter.title} | Baisics Blog`,
    description: post.frontmatter.metaDescription || post.frontmatter.excerpt,
    keywords: post.frontmatter.keywords,
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

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const PostContent = post.default

  return (
    <MainLayout>
      <main className="flex-grow bg-background">
        <PostContent />
      </main>
    </MainLayout>
  )
}