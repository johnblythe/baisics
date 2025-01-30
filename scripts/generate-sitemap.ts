const generateSitemapFn = require('../src/utils/generateSitemap');

// Generate sitemap
generateSitemapFn()
  .then(() => {
    process.exit(0)
  })
  .catch((error: any) => {
    console.error('Error generating sitemap:', error)
    process.exit(1)
  }) 