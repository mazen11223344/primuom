'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserData, canWithdraw, updateDailyProfits, addProfitsToCapital, getSupportTickets, createSupportTicket } from '@/lib/auth'
import Link from 'next/link'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [userData, setUserData] = useState<any>(null)
  const [withdrawInfo, setWithdrawInfo] = useState<{ can: boolean; reason?: string; daysRemaining?: number }>({ can: false })
  const [loading, setLoading] = useState(true)
  const [profits, setProfits] = useState(0)
  const [showSupport, setShowSupport] = useState(false)
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [addingProfits, setAddingProfits] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role === 'admin') {
        router.push('/admin')
        return
      }

      setUser(currentUser)
      const data = await getUserData(currentUser.id)
      setUserData(data)

      if (data) {
        const withdrawCheck = await canWithdraw(currentUser.id)
        setWithdrawInfo(withdrawCheck)
        
        // تحديث الأرباح
        const updatedProfits = await updateDailyProfits(currentUser.id)
        const updatedData = await getUserData(currentUser.id)
        setUserData(updatedData)
        setProfits(updatedData?.profits || 0)
        
        // جلب تذاكر الدعم
        const tickets = await getSupportTickets(currentUser.id)
        setSupportTickets(tickets)
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const daysRemaining = withdrawInfo.daysRemaining !== undefined ? withdrawInfo.daysRemaining : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            مرحباً، {userData.fullName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            حسابك الاستثماري
          </p>
        </div>

        {/* Balance Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-100 mb-2">رصيد الحساب</p>
                <h2 className="text-5xl font-bold">
                  ${userData.balance.toLocaleString()}
                </h2>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Time Remaining for Withdrawal */}
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="bg-white/20 rounded-lg p-4 mt-4">
                <p className="text-sm mb-1">الوقت المتبقي للسحب</p>
                <p className="text-2xl font-bold">
                  {daysRemaining} يوم
                </p>
                {!withdrawInfo.can && withdrawInfo.reason && (
                  <p className="text-sm mt-2 text-blue-100">{withdrawInfo.reason}</p>
                )}
              </div>
            )}
            {daysRemaining === 0 && withdrawInfo.can && (
              <div className="bg-green-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold">يمكنك الآن سحب أرباحك!</p>
              </div>
            )}
            {!userData.lastDepositDate && (
              <div className="bg-white/20 rounded-lg p-4 mt-4">
                <p className="text-sm">ابدأ استثمارك الآن من خلال الإيداع</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/account/deposit"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all text-center group"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الإيداع</h3>
            <p className="text-gray-600 dark:text-gray-400">أودع أموالك للبدء في الاستثمار</p>
          </Link>

          <Link
            href="/account/withdraw"
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all text-center group ${
              !withdrawInfo.can ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={(e) => {
              if (!withdrawInfo.can) {
                e.preventDefault()
                alert(withdrawInfo.reason || 'لا يمكنك السحب حالياً')
              }
            }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${
              withdrawInfo.can 
                ? 'bg-blue-100 dark:bg-blue-900' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <svg className={`w-8 h-8 ${
                withdrawInfo.can 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">السحب</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {withdrawInfo.can ? 'سحب أرباح الاستثمار' : withdrawInfo.reason || 'غير متاح حالياً'}
            </p>
          </Link>
        </div>

        {/* Profits Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-green-100 mb-2">الأرباح المتراكمة</p>
                <h2 className="text-5xl font-bold">
                  ${(userData.profits || 0).toLocaleString()}
                </h2>
                <p className="text-sm text-green-100 mt-2">
                  الأرباح: 1% من رأس المال يومياً
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            {(userData.profits || 0) > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (confirm('هل تريد إضافة الأرباح لرأس المال؟')) {
                      setAddingProfits(true)
                      const success = await addProfitsToCapital(user.id)
                      if (success) {
                        const updatedData = await getUserData(user.id)
                        setUserData(updatedData)
                        setProfits(0)
                        alert('تم إضافة الأرباح لرأس المال بنجاح!')
                      }
                      setAddingProfits(false)
                    }
                  }}
                  disabled={addingProfits}
                  className="flex-1 bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all disabled:opacity-50"
                >
                  {addingProfits ? 'جاري الإضافة...' : 'إضافة الأرباح لرأس المال'}
                </button>
                <Link
                  href="/account/withdraw"
                  className="flex-1 bg-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-all text-center"
                >
                  سحب الأرباح
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">معلومات الحساب</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الاسم الكامل</p>
              <p className="font-medium text-gray-900 dark:text-white">{userData.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
              <p className="font-medium text-gray-900 dark:text-white">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">العمر</p>
              <p className="font-medium text-gray-900 dark:text-white">{userData.age} سنة</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">بلد الإقامة</p>
              <p className="font-medium text-gray-900 dark:text-white">{userData.country}</p>
            </div>
            {userData.lastDepositDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ آخر إيداع</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(userData.lastDepositDate).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">الدعم الفني</h3>
            <button
              onClick={() => setShowSupport(!showSupport)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showSupport ? 'إخفاء' : 'تواصل معنا'}
            </button>
          </div>

          {showSupport && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="أدخل موضوع الرسالة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الرسالة
                </label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              <button
                onClick={async () => {
                  if (!supportSubject || !supportMessage) {
                    alert('يرجى ملء جميع الحقول')
                    return
                  }
                  const ticket = await createSupportTicket(
                    user.id,
                    userData.fullName,
                    userData.email,
                    supportSubject,
                    supportMessage
                  )
                  if (ticket) {
                    alert('تم إرسال الرسالة بنجاح!')
                    setSupportSubject('')
                    setSupportMessage('')
                    setShowSupport(false)
                    const tickets = await getSupportTickets(user.id)
                    setSupportTickets(tickets)
                  }
                }}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                إرسال الرسالة
              </button>
            </div>
          )}

          {/* Support Tickets */}
          {supportTickets.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">رسائلك السابقة</h4>
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h5>
                    <span className={`text-xs px-2 py-1 rounded ${
                      ticket.status === 'closed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {ticket.status === 'closed' ? 'مغلقة' : 'مفتوحة'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.message}</p>
                  {ticket.adminReply && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رد الإدارة:</p>
                      <p className="text-sm text-gray-900 dark:text-white">{ticket.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="max-w-4xl mx-auto mt-6 text-center">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('currentUser')
                router.push('/')
              }
            }}
            className="text-red-600 dark:text-red-400 hover:underline"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  )
}

