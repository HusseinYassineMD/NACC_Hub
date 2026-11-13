/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client"],
  },
};

export default nextConfig;
