/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les articles du blog (content/blog/*.mdx) sont lus avec fs, y compris lors
  // des régénérations ISR : on les embarque dans toutes les fonctions serverless.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
  // La page 1 de l'index du blog est /blog
  async redirects() {
    return [{ source: '/blog/page/1', destination: '/blog', permanent: true }]
  },
}

module.exports = nextConfig
