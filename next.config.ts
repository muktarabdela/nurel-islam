import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["localhost", "127.0.0.1", "192.168.1.100"],
        unoptimized: true,
    },
};

export default nextConfig;
