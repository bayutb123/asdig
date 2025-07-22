/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable stable experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['react', 'react-dom'],
  },

  // Modern JavaScript configuration
  transpilePackages: [],

  // Webpack configuration for modern browsers
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Target modern browsers (ES2020+)
      config.target = ['web', 'es2020'];

      // Optimize for modern JavaScript features
      config.resolve.alias = {
        ...config.resolve.alias,
      };

      // Enable modern module resolution
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
    }

    return config;
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable modern JavaScript features
    styledComponents: false,
    // Optimize React components
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Modern browser optimizations
  modularizeImports: {
    // Optimize lodash imports (if used)
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    // Optimize date-fns imports (if used)
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle analyzer configuration removed for compatibility

  // Optimize for production
  poweredByHeader: false,

  // Static export optimization (removed standalone for compatibility)
  // output: 'standalone',
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
