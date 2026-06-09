import { Bell, Calendar, UserPlus, Clock } from 'lucide-react'
import useStore from '../store/useStore'

const pageTitles = {
  '/': 'لوحة التحكم',
  '/leads': 'العملاء المحتملون',
  '/pipeline': 'خط الإنتاج',
  '/templates': 'قوالب الرسائل',
  '/kpis': 'مؤشرات الأداء',
  '/playbook': 'دليل المبيعات',
}

export default function Header({ pathname }) {
  const leads = useStore((s) => s.leads)
  const title = pageTitles[pathname] || 'بنيان CRM'

  const today = new Date().toISOString().split('T')[0]
  const newToday = leads.filter((l) => l.createdAt?.startsWith(today)).length
  const followUpsToday = leads.filter((l) => l.followUpDate === today).length

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

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
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
            <UserPlus size={16} />
            <span className="font-medium">{newToday} عميل اليوم</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm">
            <Clock size={16} />
            <span className="font-medium">{followUpsToday} متابعة اليوم</span>
          </div>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          {followUpsToday > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {followUpsToday}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          م
        </div>
      </div>
    </header>
  )
}
