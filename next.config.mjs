/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
};

export default nextConfig;
