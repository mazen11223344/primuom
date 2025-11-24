'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/account')
      }
    }
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* اسم التطبيق */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Primuom
          </h1>
          
          {/* الجملة */}
          <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-12">
            نظام استثماري متكامل
          </p>

          {/* الأزرار */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              إنشاء الحساب
            </Link>
            
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
            >
              تسجيل الدخول
            </Link>
            
            <Link
              href="/admin/login"
              className="w-full sm:w-auto bg-gray-800 dark:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl"
            >
              الحساب الإداري
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

