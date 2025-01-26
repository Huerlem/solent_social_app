const nextConfig = {
  env: {
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  },
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true
  },
  output: 'standalone',
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 'utf-8-validate': 'commonjs utf-8-validate' }];
    return config;
  },
  reactStrictMode: true
};

export default nextConfig;