/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "s3.eu-north-1.amazonaws.com"],
  },
  reactStrictMode: false, // 👈 Disable Strict Mode
};

export default nextConfig;
