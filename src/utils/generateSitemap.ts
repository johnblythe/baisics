// @ts-nocheck
const fs = require('fs')
const prettier = require('prettier')
const path = require('path')
const matter = require('gray-matter')

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.baisics.app'

async function generateSitemap() {
  // Import globby dynamically
  const { globby } = await import('globby')

  // Fetch all static routes from pages directory (excluding dynamic routes)
  const pages = await globby([
    'src/app/**/page.tsx',
    '!src/app/**/_*.tsx',
    '!src/app/**/components/**',
    '!src/app/**/layout.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/[**]/**',
    '!src/app/blog/[**]/**',
    '!src/app/workout/**',    // Protected workout pages
    '!src/app/dashboard/**',  // Protected dashboard
    '!src/app/check-in/**',  // Protected dashboard
    '!src/app/profile/**',    // Protected profile pages
    '!src/app/settings/**',   // Protected settings
    '!src/app/purchase/**',   // Purchase flows
    '!src/app/auth/**',       // Auth pages
    '!src/app/api/**',        // API routes
    '!src/app/admin/**',       // Admin routes
    '!src/app/test/**',  // Test pages
    '!src/app/program/**'  // Program pages
  ])

  // Get all MDX files from content directory
  const contentFiles = await globby([
    'src/content/**/*.mdx',
    'src/content/**/*.md',
    '!src/content/admin/**'  // Exclude admin content
  ])

  // Transform the pages into sitemap entries
  const staticPages = pages
    .filter(page => !page.includes('[') && !page.includes(']')) // Exclude any dynamic routes
    .map((page) => {
      // Remove src/app and file extension to get the route
      const path = page
        .replace('src/app', '')
        .replace('/page.tsx', '')
        .replace('.tsx', '')
        .replace('/index', '') // Remove trailing index

      return `
        <url>
          <loc>${DOMAIN}${path}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.7</priority>
        </url>
      `
    })
    .join('')

  // Transform content files into sitemap entries
  const contentEntries = await Promise.all(
    contentFiles.map(async (file) => {
      const content = fs.readFileSync(file, 'utf8')
      const { data } = matter(content)

      if (!data.published) {
        return null
      }
      // Skip draft posts
      if (data.draft) {
        return null
      }

      // Get the slug - for index files, use the directory name
      const isIndex = path.basename(file).startsWith('index.')
      const slug = isIndex 
        ? path.basename(path.dirname(file))
        : path.basename(file).replace(/\.mdx?$/, '')
      
      // Handle date properly
      const fileDate = fs.statSync(file).mtime
      const lastmod = data.publishedAt instanceof Date ? data.publishedAt
        : data.date instanceof Date ? data.date
        : fileDate

      // Construct the URL based on the content type
      const urlPath = file.includes('blog') 
        ? `/blog/${slug}`
        : `/${slug}`

      return `
        <url>
          <loc>${DOMAIN}${urlPath}</loc>
          <lastmod>${lastmod.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${file.includes('blog') ? '0.8' : '0.6'}</priority>
        </url>
      `
    })
  )

  // Filter out null entries (drafts) and join
  const contentEntriesString = contentEntries
    .filter(Boolean)
    .join('')

  // Construct the sitemap XML
  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Home page -->
      <url>
        <loc>${DOMAIN}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <!-- Static pages -->
      ${staticPages}
      <!-- Content pages -->
      ${contentEntriesString}
    </urlset>
  `

  // Format the XML
  const formatted = await prettier.format(sitemap, {
    parser: 'html',
  })

  // Write the sitemap to the public directory
  fs.writeFileSync('public/sitemap.xml', formatted)

  console.log('✅ Sitemap generated successfully!')
  console.log(`📄 Static pages: ${pages.length}`)
  console.log(`📝 Content pages: ${contentEntries.filter(Boolean).length}`)
}

module.exports = generateSitemap