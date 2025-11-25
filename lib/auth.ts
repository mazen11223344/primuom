// نظام المصادقة
export interface User {
  id: string
  username?: string
  email: string
  role: 'admin' | 'user'
  name: string
  fullName?: string
  age?: number
  country?: string
}

export interface UserData {
  id: string
  name: string
  fullName: string
  email: string
  age: number
  country: string
  balance: number
  profits: number
  lastDepositDate?: string
  lastProfitCalculationDate?: string
  pendingDeposit?: boolean
  withdrawalPeriod: number
  status: 'active' | 'inactive'
  joinDate: string
}

export interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  message: string
  status: 'open' | 'closed'
  adminReply?: string
  createdAt: string
  repliedAt?: string
}

export interface DepositNetwork {
  id: string
  name: 'TRC20' | 'ERC20' | 'BEP20'
  address: string
  enabled: boolean
}

export interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  amount: number
  network: 'TRC20' | 'ERC20' | 'BEP20'
  walletAddress: string
  walletName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  amountFromProfits?: number
  amountFromBalance?: number
}

// تخزين كلمات المرور محلياً (للمستخدمين فقط)
function getStorageKey(key: string) {
  return `primuom_${key}`
}

// بيانات المستخدمين من API
export async function getUsers(): Promise<UserData[]> {
  try {
    const response = await fetch('/api/users')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  }
  return []
}

export async function saveUsers(users: UserData[]): Promise<boolean> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: { users } })
    })
    if (response.ok) {
      const result = await response.json()
      return result.success === true
    }
    return false
  } catch (error) {
    console.error('Error saving users:', error)
    return false
  }
}

// شبكات الإيداع من API
export async function getDepositNetworks(): Promise<DepositNetwork[]> {
  try {
    const response = await fetch('/api/networks')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching networks:', error)
  }
  // القيم الافتراضية
  return [
    { id: '1', name: 'TRC20', address: '', enabled: true },
    { id: '2', name: 'ERC20', address: '', enabled: true },
    { id: '3', name: 'BEP20', address: '', enabled: true }
  ]
}

export async function saveDepositNetworks(networks: DepositNetwork[]) {
  try {
    await fetch('/api/networks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: networks })
    })
  } catch (error) {
    console.error('Error saving networks:', error)
  }
}

// طلبات السحب من API
export async function getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  try {
    const response = await fetch('/api/withdrawals')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
  }
  return []
}

export async function saveWithdrawalRequests(requests: WithdrawalRequest[]) {
  try {
    await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: requests })
    })
  } catch (error) {
    console.error('Error saving withdrawals:', error)
  }
}

// بيانات كلمات المرور من API
async function getUserPasswords(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/passwords')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching passwords:', error)
  }
  return {}
}

async function saveUserPasswords(passwords: Record<string, string>) {
  try {
    await fetch('/api/passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: passwords })
    })
  } catch (error) {
    console.error('Error saving passwords:', error)
  }
}

async function setUserPassword(userId: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', data: { userId, password } })
    })
    if (response.ok) {
      const result = await response.json()
      return result.success === true
    }
    return false
  } catch (error) {
    console.error('Error setting password:', error)
    return false
  }
}

async function verifyPassword(userId: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', data: { userId, password } })
    })
    if (response.ok) {
      const result = await response.json()
      return result.valid === true
    }
  } catch (error) {
    console.error('Error verifying password:', error)
  }
  return false
}

// بيانات تسجيل الدخول الإداري
const adminUser: User = {
  id: 'admin-1',
  email: 'mohamed@gmail.com',
  role: 'admin',
  name: 'مدير النظام'
}

export async function register(fullName: string, email: string, age: number, country: string, password: string): Promise<User | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const users = await getUsers()
    // التحقق من عدم وجود إيميل مكرر
    if (users.some(u => u.email === email)) {
      return null
    }

    const newUser: UserData = {
      id: Date.now().toString(),
      name: fullName.split(' ')[0] || fullName,
      fullName,
      email,
      age,
      country,
      balance: 0,
      profits: 0,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      pendingDeposit: false,
      withdrawalPeriod: 30
    }

    users.push(newUser)
    const saveResult = await saveUsers(users)
    
    if (!saveResult) {
      console.error('Failed to save users')
      return null
    }

    // حفظ كلمة المرور على السيرفر
    try {
      const passwordResult = await setUserPassword(newUser.id, password)
      if (!passwordResult) {
        console.error('Failed to save password')
        // لا نعيد null هنا لأن المستخدم تم إنشاؤه بالفعل
      }
    } catch (error) {
      console.error('Error setting password:', error)
      // لا نعيد null هنا لأن المستخدم تم إنشاؤه بالفعل
    }

    return {
      id: newUser.id,
      email: newUser.email,
      role: 'user',
      name: newUser.name,
      fullName: newUser.fullName,
      age: newUser.age,
      country: newUser.country
    }
  } catch (error) {
    console.error('Error in register:', error)
    return null
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  // تسجيل دخول الإداري
  if (email === 'mohamed@gmail.com' && password === 'Mohamed123456789#') {
    return adminUser
  }

  // تسجيل دخول المستخدم العادي
  const users = await getUsers()
  const user = users.find(u => u.email === email)
  
  if (user && await verifyPassword(user.id, password)) {
    return {
      id: user.id,
      email: user.email,
      role: 'user',
      name: user.name,
      fullName: user.fullName,
      age: user.age,
      country: user.country
    }
  }

  return null
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  return JSON.parse(userStr)
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

export function logout() {
  setCurrentUser(null)
}

// الحصول على بيانات المستخدم الكاملة
export async function getUserData(userId: string): Promise<UserData | null> {
  const users = await getUsers()
  return users.find(u => u.id === userId) || null
}

// تحديث رصيد المستخدم (مع تحديث تاريخ الإيداع)
export async function updateUserBalance(userId: string, newBalance: number, updateDepositDate: boolean = false) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateBalance',
        data: { userId, balance: newBalance, updateDepositDate }
      })
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error updating balance:', error)
  }
  return null
}

// إضافة إيداع
export async function addDeposit(userId: string, amount: number) {
  const users = await getUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].balance += amount
    users[userIndex].lastDepositDate = new Date().toISOString().split('T')[0]
    users[userIndex].pendingDeposit = false
    await saveUsers(users)
  }
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        data: { userId }
      })
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting user:', error)
  }
  return false
}

// حساب الأرباح اليومية (1% من رأس المال)
export async function calculateDailyProfits(userId: string): Promise<number> {
  const user = await getUserData(userId)
  if (!user || user.balance <= 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const lastCalcDate = user.lastProfitCalculationDate || user.lastDepositDate || user.joinDate
  
  if (!lastCalcDate) return 0

  const lastCalc = new Date(lastCalcDate)
  const todayDate = new Date(today)
  const daysDiff = Math.floor((todayDate.getTime() - lastCalc.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 0) return 0

  // حساب الأرباح لكل يوم (1% من رأس المال)
  const dailyProfit = user.balance * 0.01
  const totalProfits = dailyProfit * daysDiff

  return totalProfits
}

// تحديث الأرباح اليومية
export async function updateDailyProfits(userId: string): Promise<number> {
  const users = await getUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return 0

  const user = users[userIndex]
  const newProfits = await calculateDailyProfits(userId)
  
  users[userIndex].profits = (user.profits || 0) + newProfits
  users[userIndex].lastProfitCalculationDate = new Date().toISOString().split('T')[0]
  
  await saveUsers(users)
  return users[userIndex].profits
}

// إضافة الأرباح لرأس المال
export async function addProfitsToCapital(userId: string): Promise<boolean> {
  const users = await getUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return false

  const user = users[userIndex]
  if (user.profits <= 0) return false

  users[userIndex].balance += user.profits
  users[userIndex].profits = 0
  users[userIndex].lastProfitCalculationDate = new Date().toISOString().split('T')[0]
  
  await saveUsers(users)
  return true
}

// التحقق من إمكانية السحب
export async function canWithdraw(userId: string): Promise<{ can: boolean; reason?: string; daysRemaining?: number; maxWithdrawableAmount?: number }> {
  const user = await getUserData(userId)
  if (!user) return { can: false, reason: 'المستخدم غير موجود' }

  if (user.pendingDeposit) {
    return { can: false, reason: 'يوجد إيداع معلق في حسابك' }
  }

  if (!user.lastDepositDate) {
    return { can: false, reason: 'لم تقم بأي إيداع بعد' }
  }

  const lastDeposit = new Date(user.lastDepositDate)
  const today = new Date()
  const daysDiff = Math.floor((today.getTime() - lastDeposit.getTime()) / (1000 * 60 * 60 * 24))
  
  // 6 شهور = 180 يوم
  const capitalLockPeriod = 180
  const canWithdrawCapital = daysDiff >= capitalLockPeriod
  
  // يمكن سحب الأرباح فقط إذا لم تمر 6 شهور
  const profits = user.profits || 0
  
  if (!canWithdrawCapital && profits <= 0) {
    const daysRemainingForCapital = capitalLockPeriod - daysDiff
    return { can: false, reason: `لا يمكنك سحب رأس المال قبل ${capitalLockPeriod} يوم من آخر إيداع. متبقي ${daysRemainingForCapital} يوم. يمكنك سحب الأرباح فقط.`, daysRemaining: daysRemainingForCapital }
  }

  // إذا كان يمكن سحب رأس المال، نتحقق من مدة السحب العادية
  const withdrawalPeriod = user.withdrawalPeriod || 30
  const daysRemaining = withdrawalPeriod - daysDiff

  if (daysDiff < withdrawalPeriod) {
    return { can: false, reason: `يجب أن تمر ${withdrawalPeriod} يوم من آخر إيداع. متبقي ${daysRemaining} يوم`, daysRemaining }
  }

  if (user.balance <= 0 && profits <= 0) {
    return { can: false, reason: 'رصيدك غير كافٍ' }
  }

  // تحديد الحد الأقصى للسحب
  let maxWithdrawableAmount = 0
  if (canWithdrawCapital) {
    // يمكن سحب كل شيء (رأس المال + الأرباح)
    maxWithdrawableAmount = user.balance + profits
  } else {
    // يمكن سحب الأرباح فقط
    maxWithdrawableAmount = profits
  }

  return { can: true, daysRemaining: 0, maxWithdrawableAmount }
}

// إنشاء طلب سحب
export async function createWithdrawalRequest(userId: string, amount: number, network: 'TRC20' | 'ERC20' | 'BEP20', walletAddress: string, walletName: string): Promise<WithdrawalRequest | null> {
  const canWithdrawResult = await canWithdraw(userId)
  if (!canWithdrawResult.can) {
    return null
  }

  const user = await getUserData(userId)
  if (!user) {
    return null
  }
  
  // التحقق من الحد الأقصى للسحب
  const maxAmount = canWithdrawResult.maxWithdrawableAmount || 0
  if (amount > maxAmount) {
    return null
  }
  
  // التحقق من عدم سحب رأس المال قبل 6 شهور
  const lastDeposit = new Date(user.lastDepositDate)
  const today = new Date()
  const daysDiff = Math.floor((today.getTime() - lastDeposit.getTime()) / (1000 * 60 * 60 * 24))
  const capitalLockPeriod = 180 // 6 شهور
  
  if (daysDiff < capitalLockPeriod) {
    // يمكن سحب الأرباح فقط
    const profits = user.profits || 0
    if (amount > profits) {
      return null
    }
  }

  const request: WithdrawalRequest = {
    id: Date.now().toString(),
    userId,
    userName: user.fullName,
    amount,
    network,
    walletAddress,
    walletName,
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  try {
    const response = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', data: request })
    })
    if (response.ok) {
      // خصم المبلغ من الرصيد والأرباح
      const users = await getUsers()
      const userIndex = users.findIndex((u: any) => u.id === userId)
      if (userIndex !== -1) {
        let remainingAmount = amount
        let amountFromProfits = 0
        let amountFromBalance = 0
        const lastDeposit = new Date(users[userIndex].lastDepositDate)
        const today = new Date()
        const daysDiff = Math.floor((today.getTime() - lastDeposit.getTime()) / (1000 * 60 * 60 * 24))
        const capitalLockPeriod = 180 // 6 شهور
        
        // خصم من الأرباح أولاً
        if (users[userIndex].profits > 0) {
          amountFromProfits = Math.min(remainingAmount, users[userIndex].profits)
          users[userIndex].profits -= amountFromProfits
          remainingAmount -= amountFromProfits
        }
        
        // خصم من الرصيد فقط إذا مرت 6 شهور
        if (remainingAmount > 0 && daysDiff >= capitalLockPeriod) {
          amountFromBalance = remainingAmount
          users[userIndex].balance -= amountFromBalance
        } else if (remainingAmount > 0) {
          // لا يمكن سحب رأس المال قبل 6 شهور
          // إعادة الأرباح المخصومة
          users[userIndex].profits += amountFromProfits
          await saveUsers(users)
          return null
        }
        
        // حفظ تفاصيل الخصم في طلب السحب
        request.amountFromProfits = amountFromProfits
        request.amountFromBalance = amountFromBalance
        
        await saveUsers(users)
      }
      return request
    }
  } catch (error) {
    console.error('Error creating withdrawal request:', error)
  }

  return null
}

// الدعم الفني
export async function getSupportTickets(userId?: string): Promise<SupportTicket[]> {
  try {
    const response = await fetch('/api/support')
    if (response.ok) {
      const tickets = await response.json()
      if (userId) {
        return tickets.filter((t: SupportTicket) => t.userId === userId)
      }
      return tickets
    }
  } catch (error) {
    console.error('Error fetching support tickets:', error)
  }
  return []
}

export async function createSupportTicket(userId: string, userName: string, userEmail: string, subject: string, message: string): Promise<SupportTicket | null> {
  try {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        data: { userId, userName, userEmail, subject, message }
      })
    })
    if (response.ok) {
      const result = await response.json()
      return result.ticket
    }
  } catch (error) {
    console.error('Error creating support ticket:', error)
  }
  return null
}

export async function replyToSupportTicket(ticketId: string, adminReply: string): Promise<boolean> {
  try {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reply',
        data: { ticketId, adminReply }
      })
    })
    return response.ok
  } catch (error) {
    console.error('Error replying to support ticket:', error)
  }
  return false
}

export async function deleteSupportTicket(ticketId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        data: { ticketId }
      })
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting support ticket:', error)
  }
  return false
}

// تحديث مدة السحب
export async function updateWithdrawalPeriod(userId: string, withdrawalPeriod: number): Promise<boolean> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateWithdrawalPeriod',
        data: { userId, withdrawalPeriod }
      })
    })
    return response.ok
  } catch (error) {
    console.error('Error updating withdrawal period:', error)
  }
  return false
}
