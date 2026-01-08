import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import MainLayout from '@/app/components/layouts/MainLayout'
import { BlogCTA, ShareButtons } from '../components/BlogPost'
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

  const title = `${post.frontmatter.title} | Baisics Blog`
  const description = post.frontmatter.metaDescription || post.frontmatter.excerpt
  const url = `https://baisics.app/blog/${slug}`

  return {
    title,
    description,
    keywords: post.frontmatter.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.frontmatter.title,
      description,
      url,
      siteName: 'Baisics',
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: ['Baisics'],
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description,
    },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.metaDescription || post.frontmatter.excerpt,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: 'Baisics',
      url: 'https://baisics.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Baisics',
      url: 'https://baisics.app',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://baisics.app/blog/${slug}`,
    },
    keywords: post.frontmatter.keywords?.join(', '),
  }

  return (
    <MainLayout>
      <Script
        id="json-ld"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <main className="flex-grow bg-background">
        <PostContent />
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
            <ShareButtons
              title={post.frontmatter.title}
              url={`https://baisics.app/blog/${slug}`}
            />
          </div>
          <BlogCTA />
        </div>
      </main>
    </MainLayout>
  )
}