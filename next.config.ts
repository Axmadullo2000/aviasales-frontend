import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*', // Исходящий путь
                destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`, // Конечный путь
            },
        ]
    },
};

export default nextConfig;
