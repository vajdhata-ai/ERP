/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Suppress non-blocking ESLint warnings during production build on Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to succeed even when there are type errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
