/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-corp/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
