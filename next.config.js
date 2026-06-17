/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "tkkelpokwmlicuosyhuo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "tkkelpokwmlicuosyhuo.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
  },
};

module.exports = nextConfig;