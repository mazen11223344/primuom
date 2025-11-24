/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // السماح بالوصول من الشبكة المحلية
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

