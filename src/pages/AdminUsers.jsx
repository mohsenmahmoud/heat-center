import { useState } from 'react'
import { UserPlus, Edit2, Trash2, X, Check, Eye, EyeOff, Shield, User } from 'lucide-react'
import useStore from '../store/useStore'

const REPS = ['ميادة', 'هاجر', 'أسماء', 'غادة']

const emptyForm = { name: '', username: '', password: '', role: 'agent', repName: '', active: true }

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState(user || emptyForm)
  const [showPass, setShowPass] = useState(false)
  const isEdit = !!user

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name || !form.username || (!isEdit && !form.password)) return
    if (form.role === 'agent' && !form.repName) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">{isEdit ? 'تعديل حساب' : 'إضافة حساب جديد'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="مثل: ميادة أحمد" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المستخدم *</label>
            <input value={form.username} onChange={(e) => set('username', e.target.value.trim())}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono" placeholder="مثل: mayadah" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              كلمة المرور {isEdit && <span className="text-gray-400 font-normal">(اتركها فارغة لعدم التغيير)</span>}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 pl-10 font-mono"
                placeholder={isEdit ? '••••••••' : 'كلمة المرور'} dir="ltr" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">الصلاحية *</label>
            <div className="flex gap-3">
              {['agent', 'admin'].map((r) => (
                <button key={r} onClick={() => set('role', r)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.role === r ? 'bg-amber-50 border-amber-400 text-amber-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {r === 'admin' ? <Shield size={15} /> : <User size={15} />}
                  {r === 'admin' ? 'أدمن' : 'سيلز'}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'agent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">مسؤول المبيعات *</label>
              <select value={form.repName} onChange={(e) => set('repName', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">اختر...</option>
                {REPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">الحساب نشط</span>
            <button onClick={() => set('active', !form.active)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors">
            <Check size={16} /> حفظ
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const users = useStore((s) => s.users || [])
  const leads = useStore((s) => s.leads)
  const addUser = useStore((s) => s.addUser)
  const updateUser = useStore((s) => s.updateUser)
  const deleteUser = useStore((s) => s.deleteUser)
  const currentUser = useStore((s) => s.currentUser)

  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSave = (form) => {
    if (editUser) {
      const updates = { ...form }
      if (!updates.password) delete updates.password
      updateUser(editUser.id, updates)
    } else {
      addUser(form)
    }
    setEditUser(null)
  }

  const leadsCount = (repName) => leads.filter((l) => l.assignedTo === repName).length

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">إدارة الحسابات</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} حساب مسجل</p>
        </div>
        <button onClick={() => { setEditUser(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/30">
          <UserPlus size={16} /> إضافة حساب
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-right text-xs font-bold text-gray-500 px-5 py-3">المستخدم</th>
              <th className="text-right text-xs font-bold text-gray-500 px-5 py-3">اسم الدخول</th>
              <th className="text-right text-xs font-bold text-gray-500 px-5 py-3">الصلاحية</th>
              <th className="text-right text-xs font-bold text-gray-500 px-5 py-3">الليدز</th>
              <th className="text-right text-xs font-bold text-gray-500 px-5 py-3">الحالة</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                      {u.repName && <p className="text-xs text-gray-400">{u.repName}</p>}
                    </div>
                    {u.id === currentUser?.id && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">أنت</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{u.username}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                    {u.role === 'admin' ? 'أدمن' : 'سيلز'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-600 font-medium">
                    {u.repName ? leadsCount(u.repName) : '—'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-500 mr-2">{u.active ? 'نشط' : 'موقوف'}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => { setEditUser(u); setShowModal(true) }}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => setConfirmDelete(u)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password hint */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <strong>ملاحظة:</strong> كلمات المرور الافتراضية — أدمن: <span className="font-mono">bonyan2024</span> · ميادة: <span className="font-mono">mayadah123</span> · هاجر: <span className="font-mono">hajer123</span> · أسماء: <span className="font-mono">asmaa123</span> · غادة: <span className="font-mono">ghada123</span>
      </div>

      {showModal && (
        <UserModal
          user={editUser}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditUser(null) }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <p className="text-gray-800 font-bold mb-2">حذف حساب "{confirmDelete.name}"؟</p>
            <p className="text-gray-500 text-sm mb-5">هذا الإجراء لا يمكن التراجع عنه.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteUser(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
                حذف
              </button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
