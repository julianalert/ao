/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les articles du blog (content/blog/*.mdx) sont lus avec fs, y compris lors
  // des régénérations ISR : on les embarque dans toutes les fonctions serverless.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
}

module.exports = nextConfig
