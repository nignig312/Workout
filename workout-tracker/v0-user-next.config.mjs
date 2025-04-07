/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This ensures compatibility with Cloudflare Pages
  output: 'standalone',
  // Avoid using Node.js APIs that aren't available in Cloudflare
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
