import { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { notFound } from 'next/navigation'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXContent } from '@/components/MDXContent'
import MainLayout from '@/app/components/layouts/MainLayout'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  
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
    title: `${post.title} | Baisics Blog`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
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

function getBlogPost(slug: string) {
  try {
    const fullPath = path.join(process.cwd(), 'src/content/blog', slug, 'index.mdx')
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      slug,
      content,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      metaDescription: data.metaDescription,
      keywords: data.keywords,
    }
  } catch (error) {
    return null
  }
}

async function BlogPostContent({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const mdxSource = await serialize(post.content)

  return (
    <main className="flex-grow bg-background">
      <article className="container max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{post.title}</h1>
          <time className="text-muted-foreground text-sm block">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </header>
        
        <div className="max-w-none text-foreground">
          <MDXContent source={mdxSource} />
        </div>
      </article>
    </main>
  )
}

export default function BlogPost({ params }: Props) {
  return (
    <MainLayout>
      <BlogPostContent params={params} />
    </MainLayout>
  )
}