import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
