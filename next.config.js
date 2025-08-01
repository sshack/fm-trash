/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy any request that starts with /api/ to the HTTP backend
        source: '/api/:path*',
        destination:
          'http://finmarket-alb-1795497901.us-east-1.elb.amazonaws.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
