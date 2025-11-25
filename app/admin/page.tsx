'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUsers, getUserData, updateUserBalance, getDepositNetworks, saveDepositNetworks, getWithdrawalRequests, saveWithdrawalRequests, getSupportTickets, replyToSupportTicket, updateWithdrawalPeriod, deleteUserAccount, UserData, DepositNetwork, WithdrawalRequest, SupportTicket } from '@/lib/auth'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [users, setUsers] = useState<UserData[]>([])
  const [networks, setNetworks] = useState<DepositNetwork[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'users' | 'networks' | 'withdrawals' | 'support'>('users')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newBalance, setNewBalance] = useState('')
  const [updateDepositDate, setUpdateDepositDate] = useState(true)
  const [editingWithdrawalPeriod, setEditingWithdrawalPeriod] = useState<string | null>(null)
  const [newWithdrawalPeriod, setNewWithdrawalPeriod] = useState('')
  const [editingNetwork, setEditingNetwork] = useState<string | null>(null)
  const [newNetworkAddress, setNewNetworkAddress] = useState('')
  const [replyingTicket, setReplyingTicket] = useState<string | null>(null)
  const [adminReply, setAdminReply] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    setUser(currentUser)
    refreshData()
  }, [router])

  const refreshData = async () => {
    setLoading(true)
    try {
      const [usersData, networksData, withdrawalsData, supportData, passwordsData] = await Promise.all([
        getUsers(),
        getDepositNetworks(),
        getWithdrawalRequests(),
        getSupportTickets(),
        fetch('/api/passwords').then(res => res.json())
      ])
      setUsers(usersData)
      setNetworks(networksData)
      setWithdrawalRequests(withdrawalsData)
      setSupportTickets(supportData)
      setPasswords(passwordsData || {})
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBalance = async (userId: string) => {
    const balance = parseFloat(newBalance)
    if (isNaN(balance) || balance < 0) {
      alert('يرجى إدخال مبلغ صحيح')
      return
    }
    await updateUserBalance(userId, balance, updateDepositDate)
    setEditingUser(null)
    setNewBalance('')
    setUpdateDepositDate(true)
    await refreshData()
    alert('تم تحديث الرصيد بنجاح')
  }

  const handleUpdateNetwork = async (networkId: string) => {
    try {
      const response = await fetch('/api/networks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: { networkId, address: newNetworkAddress }
        })
      })
      if (response.ok) {
        setEditingNetwork(null)
        setNewNetworkAddress('')
        await refreshData()
        alert('تم تحديث عنوان الشبكة بنجاح')
      }
    } catch (error) {
      console.error('Error updating network:', error)
      alert('حدث خطأ أثناء تحديث العنوان')
    }
  }

  const handleApproveWithdrawal = async (requestId: string) => {
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: { withdrawalId: requestId, status: 'approved' }
        })
      })
      if (response.ok) {
        await refreshData()
        alert('تم الموافقة على طلب السحب')
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error)
      alert('حدث خطأ أثناء الموافقة على الطلب')
    }
  }

  const handleRejectWithdrawal = async (requestId: string) => {
    const request = withdrawalRequests.find(r => r.id === requestId)
    if (request) {
      // إعادة المبلغ للمستخدم
      const user = await getUserData(request.userId)
      if (user) {
        await updateUserBalance(request.userId, user.balance + request.amount, false)
      }
    }
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: { withdrawalId: requestId, status: 'rejected' }
        })
      })
      if (response.ok) {
        await refreshData()
        alert('تم رفض طلب السحب وإعادة المبلغ للمستخدم')
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      alert('حدث خطأ أثناء رفض الطلب')
    }
  }

  const handleDeleteUser = async (targetUser: UserData) => {
    if (!confirm(`هل أنت متأكد من حذف حساب ${targetUser.fullName}؟`)) return
    setDeletingUserId(targetUser.id)
    const success = await deleteUserAccount(targetUser.id)
    if (success) {
      await refreshData()
      alert('تم حذف المستخدم بنجاح')
    } else {
      alert('حدث خطأ أثناء حذف المستخدم')
    }
    setDeletingUserId(null)
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const pendingRequests = withdrawalRequests.filter(r => r.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              القسم الإداري
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة المستخدمين والاستثمارات
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('currentUser')
                router.push('/')
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              المستخدمون ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('networks')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'networks'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              شبكات الإيداع
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'withdrawals'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              طلبات السحب
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'support'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              الدعم الفني
              {supportTickets.filter(t => t.status === 'open').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {supportTickets.filter(t => t.status === 'open').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">البريد</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">كلمة المرور</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">العمر</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">البلد</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الرصيد</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الأرباح</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">مدة السحب</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">آخر إيداع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {passwords[u.id] || 'غير متوفر'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{u.age}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{u.country}</td>
                      <td className="px-6 py-4">
                        {editingUser === u.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={newBalance}
                                onChange={(e) => setNewBalance(e.target.value)}
                                className="w-32 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                placeholder={u.balance.toString()}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={updateDepositDate}
                                onChange={(e) => setUpdateDepositDate(e.target.checked)}
                                className="w-4 h-4"
                                id={`update-date-${u.id}`}
                              />
                              <label htmlFor={`update-date-${u.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                                تحديث تاريخ الإيداع
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateBalance(u.id)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUser(null)
                                  setNewBalance('')
                                  setUpdateDepositDate(true)
                                }}
                                className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${u.balance.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ${(u.profits || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingWithdrawalPeriod === u.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newWithdrawalPeriod}
                              onChange={(e) => setNewWithdrawalPeriod(e.target.value)}
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                              placeholder={(u.withdrawalPeriod || 30).toString()}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">يوم</span>
                            <button
                              onClick={async () => {
                                const period = parseInt(newWithdrawalPeriod)
                                if (isNaN(period) || period < 1) {
                                  alert('يرجى إدخال عدد أيام صحيح')
                                  return
                                }
                                await updateWithdrawalPeriod(u.id, period)
                                setEditingWithdrawalPeriod(null)
                                setNewWithdrawalPeriod('')
                                await refreshData()
                                alert('تم تحديث مدة السحب بنجاح')
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => {
                                setEditingWithdrawalPeriod(null)
                                setNewWithdrawalPeriod('')
                              }}
                              className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">
                            {u.withdrawalPeriod || 30} يوم
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {u.lastDepositDate ? new Date(u.lastDepositDate).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setEditingUser(u.id)
                              setNewBalance(u.balance.toString())
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            تعديل الرصيد
                          </button>
                          <button
                            onClick={() => {
                              setEditingWithdrawalPeriod(u.id)
                              setNewWithdrawalPeriod((u.withdrawalPeriod || 30).toString())
                            }}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                          >
                            تعديل المدة
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={deletingUserId === u.id}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingUserId === u.id ? 'جاري الحذف...' : 'حذف الحساب'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Networks Tab */}
        {activeTab === 'networks' && (
          <div className="grid md:grid-cols-3 gap-6">
            {networks.map((network) => (
              <div key={network.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{network.name}</h3>
                {editingNetwork === network.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        عنوان المحفظة
                      </label>
                      <input
                        type="text"
                        value={newNetworkAddress}
                        onChange={(e) => setNewNetworkAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="أدخل العنوان"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateNetwork(network.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => {
                          setEditingNetwork(null)
                          setNewNetworkAddress('')
                        }}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">العنوان الحالي</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                        {network.address || 'لم يتم إضافة عنوان'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingNetwork(network.id)
                        setNewNetworkAddress(network.address)
                      }}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {network.address ? 'تعديل العنوان' : 'إضافة عنوان'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">المستخدم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الشبكة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">عنوان المحفظة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">اسم المحفظة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {withdrawalRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد طلبات سحب
                      </td>
                    </tr>
                  ) : (
                    withdrawalRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{request.userName}</td>
                        <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                          ${request.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{request.network}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                          {request.walletAddress}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{request.walletName || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {request.status === 'approved' ? 'موافق عليه' : request.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {new Date(request.createdAt).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveWithdrawal(request.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                موافقة
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(request.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">المستخدم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">البريد</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الموضوع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الرسالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {supportTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد رسائل دعم فني
                      </td>
                    </tr>
                  ) : (
                    supportTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ticket.userName}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{ticket.userEmail}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{ticket.subject}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">{ticket.message}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'closed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {ticket.status === 'closed' ? 'مغلقة' : 'مفتوحة'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {new Date(ticket.createdAt).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          {ticket.status === 'open' ? (
                            <div className="space-y-2">
                              {replyingTicket === ticket.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white text-sm"
                                    placeholder="اكتب ردك هنا..."
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={async () => {
                                        if (!adminReply.trim()) {
                                          alert('يرجى كتابة رد')
                                          return
                                        }
                                        const success = await replyToSupportTicket(ticket.id, adminReply)
                                        if (success) {
                                          setReplyingTicket(null)
                                          setAdminReply('')
                                          await refreshData()
                                          alert('تم إرسال الرد بنجاح')
                                        }
                                      }}
                                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                    >
                                      إرسال
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyingTicket(null)
                                        setAdminReply('')
                                      }}
                                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReplyingTicket(ticket.id)
                                    setAdminReply('')
                                  }}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                  رد
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {ticket.adminReply}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

