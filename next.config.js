/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        // Disables ESLint during builds
        ignoreDuringBuilds: true,
    },
    webpack: config => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
};

module.exports = nextConfig;