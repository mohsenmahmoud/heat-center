import { Calendar, UserPlus, Clock, LogOut, Shield, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const pageTitles = {
  '/': 'لوحة التحكم',
  '/leads': 'العملاء المحتملون',
  '/pipeline': 'خط الإنتاج',
  '/templates': 'قوالب الرسائل',
  '/kpis': 'مؤشرات الأداء',
  '/playbook': 'دليل المبيعات',
  '/users': 'إدارة الحسابات',
}

export default function Header({ pathname }) {
  const leads = useStore((s) => s.leads)
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()

  const isAdmin = currentUser?.role === 'admin'
  const title = pathname === '/' && !isAdmin ? 'مهامي اليوم' : (pageTitles[pathname] || 'بنيان CRM')

  const today = new Date().toISOString().split('T')[0]
  const myLeads = isAdmin ? leads : leads.filter((l) => l.assignedTo === currentUser?.repName)
  const newToday = myLeads.filter((l) => l.createdAt?.startsWith(today)).length
  const followUpsToday = myLeads.filter((l) => l.followUpDate === today).length

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500">{dateStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/leads', { state: { filterNewToday: true } })}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer">
            <UserPlus size={16} />
            <span className="font-medium">{newToday} جديد اليوم</span>
          </button>
          <button onClick={() => navigate('/leads', { state: { filterFollowUpToday: true } })}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer">
            <Clock size={16} />
            <span className="font-medium">{followUpsToday} متابعة</span>
          </button>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">{currentUser?.name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
              {isAdmin ? <Shield size={10} /> : <User size={10} />}
              {isAdmin ? 'أدمن' : 'سيلز'}
            </p>
          </div>
          <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {currentUser?.name?.[0] || 'م'}
          </div>
          <button onClick={handleLogout} title="تسجيل الخروج"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
