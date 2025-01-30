'use client'

import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

const components = {
  h1: (props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
    <h1 {...props} className="text-4xl md:text-5xl font-bold mt-12 mb-6 text-foreground" />
  ),
  h2: (props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
    <h2 {...props} className="text-3xl md:text-4xl font-semibold mt-10 mb-4 text-foreground" />
  ),
  h3: (props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
    <h3 {...props} className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground" />
  ),
  p: (props: DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) => (
    <p {...props} className="mb-6 leading-relaxed text-foreground" />
  ),
  ul: (props: DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
    <ul {...props} className="list-disc list-inside mb-6 space-y-2 text-foreground" />
  ),
  ol: (props: DetailedHTMLProps<HTMLAttributes<HTMLOListElement>, HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-inside mb-6 space-y-2 text-foreground" />
  ),
  li: (props: DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement>) => (
    <li {...props} className="ml-4 text-foreground" />
  ),
  a: (props: DetailedHTMLProps<HTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => (
    <a {...props} className="text-primary hover:text-primary/80 underline underline-offset-4" />
  ),
  blockquote: (props: DetailedHTMLProps<HTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>) => (
    <blockquote {...props} className="border-l-4 border-primary/20 pl-6 my-6 italic text-muted-foreground" />
  ),
  code: (props: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => (
    <code {...props} className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono text-foreground" />
  ),
  pre: (props: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>) => (
    <pre {...props} className="bg-muted rounded-lg p-4 overflow-x-auto mb-6 text-sm font-mono text-foreground" />
  ),
}

type Props = {
  source: MDXRemoteSerializeResult
}

export function MDXContent({ source }: Props) {
  return <MDXRemote {...source} components={components} />
} 