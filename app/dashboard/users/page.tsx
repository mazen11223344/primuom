'use client'

import { useState, useEffect } from 'react'
import { getUsers, UserData } from '@/lib/auth'

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    const loadUsers = async () => {
      const usersData = await getUsers()
      setUsers(usersData)
    }
    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          إدارة المستخدمين
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض وإدارة جميع المستخدمين وبياناتهم
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              حالة المستخدم
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  المستخدم
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  الهاتف
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  الرصيد
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  الاستثمارات
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  تاريخ الانضمام
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">-</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${user.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        ${(user.profits || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              إجمالي المستخدمين: <span className="font-semibold text-gray-900 dark:text-white">{filteredUsers.length}</span>
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">إجمالي الأرصدة: </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${filteredUsers.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">إجمالي الاستثمارات: </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ${filteredUsers.reduce((sum: number, u: any) => sum + (u.profits || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

