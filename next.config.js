/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // Enable Gzip compression
  // Ignore private directory in build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/private/**'],
    };
    return config;
  },
}

module.exports = nextConfig 