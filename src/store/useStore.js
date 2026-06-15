import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialLeads = [
  {
    id: '1',
    name: 'أحمد محمد السيد',
    phone: '01012345678',
    whatsappPhone: '',
    email: '',
    parentType: 'أب',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Facebook',
    stage: 'ليد جديد',
    assignedTo: 'ميادة',
    createdAt: '2026-06-01T09:00:00Z',
    followUpDate: '',
    students: [{ name: 'يوسف', age: '10', track: 'Scratch', onlineOffline: 'أونلاين', gradeLevel: 'الصف الخامس' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '2',
    name: 'منى حسن إبراهيم',
    phone: '01123456789',
    whatsappPhone: '',
    email: '',
    parentType: 'أم',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Instagram',
    stage: 'تم التواصل',
    assignedTo: 'هاجر',
    createdAt: '2026-05-28T10:30:00Z',
    followUpDate: '2026-06-15',
    students: [{ name: 'ريم', age: '8', track: 'Scratch', onlineOffline: 'أونلاين', gradeLevel: 'الصف الثالث' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '3',
    name: 'طارق عبد الرحمن',
    phone: '01554567890',
    whatsappPhone: '',
    email: '',
    parentType: 'أب',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Facebook',
    stage: 'تريال محجوز',
    assignedTo: 'أسماء',
    createdAt: '2026-05-25T14:00:00Z',
    followUpDate: '2026-06-13',
    students: [{ name: 'عمر', age: '14', track: 'Web Development', onlineOffline: 'أونلاين', gradeLevel: 'الصف الثامن' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '4',
    name: 'هدى سمير علي',
    phone: '01005678901',
    whatsappPhone: '',
    email: '',
    parentType: 'أم',
    leadType: 'B2C',
    b2bSource: '',
    source: 'WhatsApp',
    stage: 'مهتم',
    assignedTo: 'ميادة',
    createdAt: '2026-05-20T11:00:00Z',
    followUpDate: '2026-06-12',
    students: [
      { name: 'لينا', age: '12', track: 'Web Development', onlineOffline: 'أونلاين', gradeLevel: 'الصف السادس' },
      { name: 'سارة', age: '10', track: 'Scratch', onlineOffline: 'أونلاين', gradeLevel: 'الصف الرابع' },
    ],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '5',
    name: 'كريم محمود عثمان',
    phone: '01226789012',
    whatsappPhone: '',
    email: '',
    parentType: 'أب',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Facebook',
    stage: 'لا يرد',
    assignedTo: 'هاجر',
    createdAt: '2026-05-18T15:30:00Z',
    followUpDate: '',
    students: [{ name: 'آدم', age: '9', track: 'Scratch', onlineOffline: 'أوف لاين', gradeLevel: 'الصف الرابع' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 3,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '6',
    name: 'رانيا فاروق النجار',
    phone: '01067890123',
    whatsappPhone: '',
    email: '',
    parentType: 'أم',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Facebook',
    stage: 'تم التسجيل',
    assignedTo: 'أسماء',
    createdAt: '2026-05-15T09:00:00Z',
    followUpDate: '',
    students: [{ name: 'مريم', age: '11', track: 'AI', onlineOffline: 'أونلاين', gradeLevel: 'الصف الخامس' }],
    value: '3000',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '7',
    name: 'سامي عادل حسين',
    phone: '01118901234',
    whatsappPhone: '',
    email: '',
    parentType: 'أب',
    leadType: 'B2B',
    b2bSource: 'مدرسة المنهل',
    source: 'B2B',
    stage: 'تم التسجيل',
    assignedTo: 'غادة',
    createdAt: '2026-05-12T13:00:00Z',
    followUpDate: '',
    students: [{ name: 'زياد', age: '15', track: 'Web Development', onlineOffline: 'أوف لاين', gradeLevel: 'الصف التاسع' }],
    value: '4000',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '8',
    name: 'ليلى حمدي صالح',
    phone: '01099012345',
    whatsappPhone: '',
    email: '',
    parentType: 'أم',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Instagram',
    stage: 'غير مهتم',
    assignedTo: 'ميادة',
    createdAt: '2026-05-10T10:00:00Z',
    followUpDate: '',
    students: [{ name: 'كريم', age: '7', track: 'Scratch', onlineOffline: 'أونلاين', gradeLevel: 'الصف الأول' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 1,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '9',
    name: 'عمرو جمال الدين',
    phone: '01280123456',
    whatsappPhone: '',
    email: '',
    parentType: 'أب',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Organic',
    stage: 'حضر التريال',
    assignedTo: 'غادة',
    createdAt: '2026-06-07T16:00:00Z',
    followUpDate: '2026-06-14',
    students: [{ name: 'سلمى', age: '13', track: 'Mobile Development', onlineOffline: 'أونلاين', gradeLevel: 'الصف السابع' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
  {
    id: '10',
    name: 'داليا وائل منصور',
    phone: '01031234567',
    whatsappPhone: '',
    email: '',
    parentType: 'أم',
    leadType: 'B2C',
    b2bSource: '',
    source: 'Facebook',
    stage: 'تفاوض',
    assignedTo: 'هاجر',
    createdAt: '2026-06-05T11:00:00Z',
    followUpDate: '2026-06-12',
    students: [{ name: 'تامر', age: '16', track: 'AI', onlineOffline: 'أونلاين', gradeLevel: 'الصف العاشر' }],
    value: '',
    paymentType: '',
    discount: '',
    noAnswerCount: 0,
    callRecordLink: '',
    notes: '',
  },
]

const initialTemplates = [
  {
    id: 't1',
    name: 'رسالة الترحيب الأولى',
    category: 'ترحيب',
    content: `السلام عليكم ورحمة الله وبركاته 🌟

أهلاً {اسم_الوالد}،

شكراً جزيلاً على اهتمامك ببرامج بنيان التعليمية لتعلم البرمجة للأطفال.

يسعدنا أن نخبرك أن طفلك {اسم_الطفل} ({عمر_الطفل} سنوات) في العمر المثالي لبدء رحلته مع عالم التكنولوجيا والبرمجة! 🚀

في بنيان، نؤمن أن كل طفل يمكنه التعلم بالطريقة الصحيحة والممتعة.

هل تودّ أن نرسل لك تفاصيل البرامج المتاحة؟`,
  },
  {
    id: 't2',
    name: 'تأكيد موعد التريال',
    category: 'موعد',
    content: `مرحباً {اسم_الوالد} 😊

نذكّركم بالجلسة التجريبية المجانية المحجوزة لطفلكم {اسم_الطفل}:

📅 التاريخ: {التاريخ}
⏰ الوقت: {الوقت}
💻 الكورس: {اسم_الكورس}

الجلسة التجريبية مجانية تماماً وستعطيكم فكرة شاملة عن أسلوب التدريس.

يرجى التأكيد بكلمة "تأكيد" للاحتفاظ بالموعد.

نتطلع لرؤيتكم! 🌟`,
  },
  {
    id: 't3',
    name: 'متابعة بعد التريال',
    category: 'متابعة',
    content: `السلام عليكم {اسم_الوالد} 🌺

نتمنى أن الجلسة التجريبية لطفلكم {اسم_الطفل} قد أعجبته وأعجبتكم!

كان من الرائع أن نرى حماسه وتفاعله مع المحتوى. هذا يوضح أن لديه الاستعداد والموهبة للتميز في عالم البرمجة 💡

للتسجيل في كورس {اسم_الكورس}، الخطوة التالية بسيطة جداً. هل لديك أي استفسارات؟

نحن هنا دائماً لمساعدتك 😊`,
  },
  {
    id: 't4',
    name: 'عرض خاص',
    category: 'عروض',
    content: `🎉 عرض خاص لـ {اسم_الوالد}!

بمناسبة اهتمامكم ببرامج بنيان، يسعدنا تقديم عرض حصري لطفلكم {اسم_الطفل}:

🔥 خصم 15% عند الدفع كاش
🎁 خصم 10% لأكثر من طالب
⏳ العرض ساري حتى: {التاريخ}

لا تفوّت هذه الفرصة لمنح طفلك أفضل بداية في عالم التكنولوجيا!

للتسجيل الآن، رد بـ "نعم" وسنكمل الإجراءات فوراً 🚀`,
  },
]

const initialKpis = {
  targets: {
    calls: 60,
    whatsapp: 45,
    contacts: 30,
    trialsBooked: 15,
    trialsAttended: 12,
    closed: 6,
    revenue: 18000,
  },
  reps: [
    {
      id: 'r1',
      name: 'ميادة',
      avatar: 'مي',
      monthly: { leads: 18, conversions: 5, revenue: 15000, calls: 48, whatsapp: 35, trialsBooked: 9, trialsAttended: 7 },
      weekly: { leads: 5, conversions: 1, revenue: 3500, calls: 12, whatsapp: 9, trialsBooked: 2, trialsAttended: 2 },
      quarterly: { leads: 52, conversions: 15, revenue: 45000, calls: 140, whatsapp: 105, trialsBooked: 27, trialsAttended: 21 },
    },
    {
      id: 'r2',
      name: 'هاجر',
      avatar: 'هج',
      monthly: { leads: 15, conversions: 4, revenue: 12000, calls: 42, whatsapp: 30, trialsBooked: 7, trialsAttended: 5 },
      weekly: { leads: 4, conversions: 1, revenue: 3000, calls: 10, whatsapp: 8, trialsBooked: 2, trialsAttended: 1 },
      quarterly: { leads: 44, conversions: 12, revenue: 36000, calls: 126, whatsapp: 90, trialsBooked: 21, trialsAttended: 15 },
    },
    {
      id: 'r3',
      name: 'أسماء',
      avatar: 'أس',
      monthly: { leads: 20, conversions: 7, revenue: 21000, calls: 55, whatsapp: 42, trialsBooked: 12, trialsAttended: 10 },
      weekly: { leads: 6, conversions: 2, revenue: 6000, calls: 14, whatsapp: 11, trialsBooked: 3, trialsAttended: 2 },
      quarterly: { leads: 60, conversions: 21, revenue: 63000, calls: 165, whatsapp: 126, trialsBooked: 36, trialsAttended: 30 },
    },
    {
      id: 'r4',
      name: 'غادة',
      avatar: 'غا',
      monthly: { leads: 12, conversions: 3, revenue: 9000, calls: 36, whatsapp: 27, trialsBooked: 6, trialsAttended: 4 },
      weekly: { leads: 3, conversions: 1, revenue: 2500, calls: 9, whatsapp: 7, trialsBooked: 1, trialsAttended: 1 },
      quarterly: { leads: 36, conversions: 9, revenue: 27000, calls: 108, whatsapp: 81, trialsBooked: 18, trialsAttended: 12 },
    },
  ],
  chartData: [
    { month: 'يناير', ميادة: 3, هاجر: 2, أسماء: 4, غادة: 2 },
    { month: 'فبراير', ميادة: 4, هاجر: 3, أسماء: 5, غادة: 2 },
    { month: 'مارس', ميادة: 4, هاجر: 3, أسماء: 6, غادة: 3 },
    { month: 'أبريل', ميادة: 5, هاجر: 4, أسماء: 7, غادة: 3 },
    { month: 'مايو', ميادة: 5, هاجر: 4, أسماء: 7, غادة: 3 },
    { month: 'يونيو', ميادة: 5, هاجر: 4, أسماء: 7, غادة: 3 },
  ],
}

const initialActivities = []

const initialUsers = [
  { id: 'u0', name: 'المدير', username: 'admin', password: 'bonyan2024', role: 'admin', repName: '', active: true },
  { id: 'u1', name: 'ميادة', username: 'mayadah', password: 'mayadah123', role: 'agent', repName: 'ميادة', active: true },
  { id: 'u2', name: 'هاجر', username: 'hajer', password: 'hajer123', role: 'agent', repName: 'هاجر', active: true },
  { id: 'u3', name: 'أسماء', username: 'asmaa', password: 'asmaa123', role: 'agent', repName: 'أسماء', active: true },
  { id: 'u4', name: 'غادة', username: 'ghada', password: 'ghada123', role: 'agent', repName: 'غادة', active: true },
]

const useStore = create(
  persist(
    (set, get) => ({
      leads: initialLeads,
      templates: initialTemplates,
      kpis: initialKpis,
      activities: initialActivities,
      users: initialUsers,
      currentUser: null,

      addLead: (lead) => {
        const newLead = { ...lead, id: Date.now().toString(), createdAt: new Date().toISOString(), noAnswerCount: 0 }
        set((state) => ({ leads: [newLead, ...state.leads] }))
        get().addActivity({ type: 'new_lead', leadId: newLead.id, leadName: newLead.name, description: 'تم إضافة ليد جديد', rep: newLead.assignedTo, stage: newLead.stage })
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }))
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }))
      },

      moveLead: (id, newStage) => {
        const lead = get().leads.find((l) => l.id === id)
        if (lead) {
          set((state) => ({
            leads: state.leads.map((l) => (l.id === id ? { ...l, stage: newStage } : l)),
          }))
          get().addActivity({ type: 'stage_change', leadId: id, leadName: lead.name, description: `تم نقل إلى: ${newStage}`, rep: lead.assignedTo, fromStage: lead.stage, stage: newStage })
        }
      },

      incrementNoAnswer: (id) => {
        const lead = get().leads.find((l) => l.id === id)
        if (lead) {
          const newCount = (lead.noAnswerCount || 0) + 1
          set((state) => ({
            leads: state.leads.map((l) => l.id === id ? { ...l, noAnswerCount: newCount, stage: 'لا يرد' } : l),
          }))
          get().addActivity({ type: 'no_answer', leadId: id, leadName: lead.name, description: `لا يرد — المحاولة ${newCount}`, rep: lead.assignedTo, stage: 'لا يرد' })
        }
      },

      addTemplate: (template) => {
        const newTemplate = { ...template, id: 't' + Date.now() }
        set((state) => ({ templates: [newTemplate, ...state.templates] }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
      },

      addActivity: (activity) => {
        const newActivity = { ...activity, id: 'a' + Date.now(), createdAt: new Date().toISOString() }
        set((state) => ({ activities: [newActivity, ...state.activities.slice(0, 99)] }))
      },

      login: (username, password) => {
        const users = (get().users?.length ? get().users : initialUsers)
        const user = users.find((u) => u.username === username && u.password === password && u.active)
        if (user) { set({ currentUser: user }); return true }
        return false
      },

      logout: () => set({ currentUser: null }),

      addUser: (user) => {
        const newUser = { ...user, id: 'u' + Date.now(), active: true }
        set((state) => ({ users: [...(state.users || initialUsers), newUser] }))
      },

      updateUser: (id, updates) => {
        set((state) => ({ users: (state.users || initialUsers).map((u) => u.id === id ? { ...u, ...updates } : u) }))
        // update currentUser if it's the same user
        const cu = get().currentUser
        if (cu && cu.id === id) set({ currentUser: { ...cu, ...updates } })
      },

      deleteUser: (id) => {
        set((state) => ({ users: (state.users || initialUsers).filter((u) => u.id !== id) }))
      },
    }),
    {
      name: 'bonyan-crm-v3',
      version: 3,
      migrate: (old) => ({
        ...old,
        users: (old.users?.length ? old.users : initialUsers),
        currentUser: null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.users || state.users.length === 0)) {
          state.users = initialUsers
        }
      },
    }
  )
)

export default useStore
