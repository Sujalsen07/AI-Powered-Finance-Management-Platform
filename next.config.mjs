/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
      remotePatterns: [
        {
          protocol:"https",
          hostname: "randomuser.me"
        },
      ],
    },
  /* config options here */
  reactCompiler: true,
  // Disable source maps in development to avoid parsing errors
  productionBrowserSourceMaps: false,
};

export default nextConfig;
