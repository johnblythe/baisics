import { ReactNode } from 'react';

export interface BlogPostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  metaDescription?: string;
  published: boolean;
  featured?: boolean;
  categories: string[];
  tags: string[];
  keywords?: string[];
  relatedLinks?: ReactNode[];  // For fields that can contain JSX
  benefits?: ReactNode[];      // For fields that can contain JSX
  tips?: ReactNode[];         // For fields that can contain JSX
  warnings?: ReactNode[];     // For fields that can contain JSX
  steps?: ReactNode[];       // For fields that can contain JSX
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  content?: string;
}

export type BlogCategory = {
  name: string;
  slug: string;
  count: number;
}

export type BlogTag = {
  name: string;
  slug: string;
  count: number;
} 