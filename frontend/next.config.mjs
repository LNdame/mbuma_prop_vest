/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing the workspace shared package from outside /frontend.
  transpilePackages: ['@mbuma/shared'],
};

export default nextConfig;
