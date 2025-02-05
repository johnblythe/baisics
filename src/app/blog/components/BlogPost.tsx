'use client'

import { BlogPostFrontmatter } from '@/types/blog'
import { ReactNode } from 'react'

interface BlogPostProps {
  frontmatter: BlogPostFrontmatter
  children: React.ReactNode
}

export function BlogPost({ frontmatter, children }: BlogPostProps) {
  return (
    <article className="container max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          {frontmatter.title}
        </h1>
        <time className="text-muted-foreground text-sm block">
          {new Date(frontmatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
      </header>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
    </article>
  )
}

// Reusable blog components
export const BlogSection = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <section className={`my-8 ${className}`}>{children}</section>
)

export const BlogQuote = ({ children, author }: { children: React.ReactNode, author?: string }) => (
  <blockquote className="border-l-4 border-primary/20 pl-6 my-6 italic text-muted-foreground">
    {children}
    {author && <footer className="mt-2 text-sm">— {author}</footer>}
  </blockquote>
)

export const BlogTable = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto my-6">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </table>
  </div>
)

export const BlogList = ({ items }: { items: (string | ReactNode)[] }) => ( 
  <ul className="list-disc list-inside space-y-2 my-4">
    {items.map((item, index) => (
      <li key={index} className="text-foreground">{item}</li>
    ))}
  </ul>
)

export const BlogCode = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-6 text-sm font-mono text-foreground">
    <code>{children}</code>
  </pre>
) 