'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserData, canWithdraw, createWithdrawalRequest, getUsers, saveUsers, updateUserBalance } from '@/lib/auth'
import Link from 'next/link'

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    amount: '',
    network: 'TRC20' as 'TRC20' | 'ERC20' | 'BEP20',
    walletAddress: '',
    walletName: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role === 'admin') {
        router.push('/login')
        return
      }
      setUser(currentUser)
      const data = await getUserData(currentUser.id)
      setUserData(data)

      if (data) {
        const withdrawCheck = await canWithdraw(currentUser.id)
        if (!withdrawCheck.can) {
          setError(withdrawCheck.reason || 'لا يمكنك السحب حالياً')
        }
      }
    }
    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    if (!user || !userData) {
      setError('خطأ في البيانات')
      setLoading(false)
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح')
      setLoading(false)
      return
    }

    const totalAvailable = userData.balance + (userData.profits || 0)
    if (amount > totalAvailable) {
      setError(`المبلغ أكبر من رصيدك المتاح. الرصيد المتاح: $${totalAvailable.toLocaleString()}`)
      setLoading(false)
      return
    }

    if (!formData.walletAddress.trim()) {
      setError('يرجى إدخال عنوان المحفظة')
      setLoading(false)
      return
    }

    if (!formData.walletName.trim()) {
      setError('يرجى إدخال اسم المحفظة')
      setLoading(false)
      return
    }

    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500))

    // تحديد المبلغ من الرصيد أو الأرباح
    let amountFromBalance = Math.min(amount, userData.balance)
    let amountFromProfits = amount - amountFromBalance
    
    // إذا كان هناك أرباح، نخصم منها أولاً
    if (userData.profits > 0 && amountFromProfits > 0) {
      const users = await getUsers()
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex].profits = Math.max(0, (users[userIndex].profits || 0) - amountFromProfits)
        if (amountFromBalance > 0) {
          users[userIndex].balance -= amountFromBalance
        }
        await saveUsers(users)
      }
    } else if (amountFromBalance > 0) {
      await updateUserBalance(user.id, userData.balance - amountFromBalance, false)
    }

    const request = await createWithdrawalRequest(
      user.id,
      amount,
      formData.network,
      formData.walletAddress,
      formData.walletName
    )

    if (request) {
      setSuccess(true)
      setFormData({
        amount: '',
        network: 'TRC20',
        walletAddress: '',
        walletName: ''
      })
      // تحديث بيانات المستخدم
      const updatedData = await getUserData(user.id)
      setUserData(updatedData)
    } else {
      const withdrawCheck = await canWithdraw(user.id)
      setError(withdrawCheck.reason || 'فشل في إنشاء طلب السحب')
    }

    setLoading(false)
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const [withdrawCheck, setWithdrawCheck] = useState<{ can: boolean; reason?: string }>({ can: false })

  useEffect(() => {
    const loadWithdrawCheck = async () => {
      if (user) {
        const check = await canWithdraw(user.id)
        setWithdrawCheck(check)
      }
    }
    loadWithdrawCheck()
  }, [user])

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
            السحب
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            سحب أرباح استثمارك
          </p>
        </div>

        {/* Balance Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${userData.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Conditions */}
        {!withdrawCheck.can && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                لا يمكنك السحب حالياً
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {withdrawCheck.reason}
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Form */}
        {withdrawCheck.can && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
                  تم إرسال طلب السحب بنجاح! سيتم مراجعته من قبل الإدارة.
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المبلغ ($)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={userData.balance}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    الحد الأقصى: ${(userData.balance + (userData.profits || 0)).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label htmlFor="network" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الشبكة
                  </label>
                  <select
                    id="network"
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value as 'TRC20' | 'ERC20' | 'BEP20' })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="TRC20">TRC20</option>
                    <option value="ERC20">ERC20</option>
                    <option value="BEP20">BEP20</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان المحفظة
                  </label>
                  <input
                    id="walletAddress"
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="أدخل عنوان المحفظة"
                  />
                </div>

                <div>
                  <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم المحفظة (اختياري)
                  </label>
                  <input
                    id="walletName"
                    type="text"
                    value={formData.walletName}
                    onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="مثال: محفظة Trust Wallet"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري إرسال الطلب...' : 'إرسال طلب السحب'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Conditions Info */}
        <div className="max-w-2xl mx-auto mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            شروط السحب
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm list-disc list-inside">
            <li>يجب أن تمر 30 يوم على الأقل من آخر إيداع</li>
            <li>يجب ألا يكون هناك إيداع معلق في حسابك</li>
            <li>سيتم مراجعة طلبك من قبل الإدارة قبل التحويل</li>
            <li>تأكد من صحة عنوان المحفظة والشبكة المختارة</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

