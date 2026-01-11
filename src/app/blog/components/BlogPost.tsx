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

export const ShareButtons = ({ title, url }: { title: string; url: string }) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback - do nothing
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-coral dark:text-gray-400 dark:hover:text-coral transition-colors"
          aria-label={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        className="text-gray-500 hover:text-coral dark:text-gray-400 dark:hover:text-coral transition-colors"
        aria-label="Copy link"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )
}

export const BlogCTA = ({
  title = "Ready to put this into practice?",
  description = "Get a personalized workout plan built for your goals in under 2 minutes.",
  buttonText = "Start Free",
  href = "/hi"
}: {
  title?: string
  description?: string
  buttonText?: string
  href?: string
}) => (
  <div className="my-12 p-8 rounded-2xl border" style={{ background: 'linear-gradient(to bottom right, #FFE5E5, white)', borderColor: 'rgba(255, 107, 107, 0.2)' }}>
    <h3 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>{title}</h3>
    <p className="mb-6" style={{ color: '#475569' }}>{description}</p>
    <a
      href={href}
      className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
      style={{
        background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(255, 107, 107, 0.25)'
      }}
    >
      {buttonText}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  </div>
) 