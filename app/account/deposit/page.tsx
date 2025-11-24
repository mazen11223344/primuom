'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getDepositNetworks } from '@/lib/auth'
import Link from 'next/link'

export default function DepositPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [networks, setNetworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role === 'admin') {
        router.push('/login')
        return
      }
      setUser(currentUser)
      const networksData = await getDepositNetworks()
      setNetworks(networksData || [])
      setLoading(false)
    }
    loadData()
  }, [router])

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const enabledNetworks = Array.isArray(networks) ? networks.filter(n => n.enabled) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/account"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة للحساب
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            الإيداع
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            اختر شبكة الإيداع وأرسل الأموال إلى العنوان المحدد
          </p>
        </div>

        {/* Networks */}
        <div className="max-w-4xl mx-auto">
          {enabledNetworks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                لا توجد شبكات إيداع متاحة حالياً
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {enabledNetworks.map((network) => (
                <div
                  key={network.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">{network.name}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {network.name}
                    </h3>
                  </div>

                  {network.address ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          عنوان المحفظة
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={network.address}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(network.address)
                              alert('تم نسخ العنوان!')
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            نسخ
                          </button>
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          ⚠️ تأكد من إرسال الأموال إلى العنوان الصحيح فقط. بعد الإيداع، سيتم تحديث رصيدك من قبل الإدارة.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        لم يتم إضافة عنوان المحفظة بعد
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            تعليمات الإيداع
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm list-disc list-inside">
            <li>اختر إحدى الشبكات المتاحة (TRC20, ERC20, BEP20)</li>
            <li>انسخ عنوان المحفظة وأرسل الأموال إليه</li>
            <li>بعد تأكيد وصول الأموال، سيتم تحديث رصيدك من قبل الإدارة</li>
            <li>تأكد من استخدام العنوان الصحيح للشبكة المختارة</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

