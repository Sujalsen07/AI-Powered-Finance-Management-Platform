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
};

export default nextConfig;
