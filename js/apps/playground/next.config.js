/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Transpile TypeScript/JSX from the packages directory
  transpilePackages: ['@epochlab/epoch-dashboard'],
  // Configure webpack to handle files from packages directory
  webpack: (config) => {
    // Ensure proper handling of TypeScript files from monorepo packages
    if (config.resolve) {
      config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', ...(config.resolve.extensions || [])]

      // Add alias for cleaner imports if needed
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@epoch-dashboard': '../../../packages/epoch-dashboard/src',
      }
    }

    return config
  },
}

module.exports = nextConfig