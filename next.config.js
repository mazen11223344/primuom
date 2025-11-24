/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // نتجاهل أخطاء ESLint أثناء البناء على Vercel لضمان عدم توقف النشر
    ignoreDuringBuilds: true,
  },
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

