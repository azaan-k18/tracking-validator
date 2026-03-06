/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        typedRoutes: true
    },
    async rewrites() {
        const apiTarget = process.env.BACKEND_INTERNAL_URL || "http://backend:5000";
        return [
            {
                source: "/backend/:path*",
                destination: `${apiTarget}/:path*`
            }
        ];
    },
};

export default nextConfig;
