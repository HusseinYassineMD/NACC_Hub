/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: ["@libsql/client"],
  },
};

export default nextConfig;
