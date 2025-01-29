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