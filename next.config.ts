import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the Cloudflare tunnel domain to access dev server resources
  // This suppresses the "Cross origin request detected" warning
  experimental: {
    serverActions: {
      allowedOrigins: ["animal-coupon-polyphonic-gave.trycloudflare.com", "localhost:3000"]
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self "https://jeffreyha.my.connect.aws" "https://ause1.le.liveperson.net"), camera=(self "https://jeffreyha.my.connect.aws" "https://ause1.le.liveperson.net"), clipboard-write=(self "https://ause1.le.liveperson.net")'
          },
          {
            key: 'Feature-Policy',
            value: 'microphone https://jeffreyha.my.connect.aws https://ause1.le.liveperson.net; camera https://jeffreyha.my.connect.aws https://ause1.le.liveperson.net; clipboard-write https://ause1.le.liveperson.net'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
