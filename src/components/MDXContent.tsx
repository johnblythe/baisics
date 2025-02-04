'use client'

import dynamic from 'next/dynamic'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import components from './MDXComponents'

const MDXRemote = dynamic(() => import('next-mdx-remote').then(mod => mod.MDXRemote), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />
})

type Props = {
  source: MDXRemoteSerializeResult
}

export function MDXContent({ source }: Props) {
  return <MDXRemote {...source} components={components} />
} 