import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the Montserrat TTFs and logo are bundled with the server-side PDF
  // route (public/ is not included in serverless functions by default).
  outputFileTracingIncludes: {
    '/api/pdf': ['./public/fonts/**', './public/logo.png'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'idea-validator-plum.vercel.app',
          },
        ],
        destination: 'https://stellar.beamxsolutions.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
