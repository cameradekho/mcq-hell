/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "s3.eu-north-1.amazonaws.com"],
  },
 experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  reactStrictMode: false, // 👈 Disable Strict Mode
};

export default nextConfig;
