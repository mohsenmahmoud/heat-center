/**
 * Qudra: the brand the studio starts with. It is seeded into the brands table on first run
 * and from then on edited in the Brands tab like any other brand.
 */
export const QUDRA = {
  id: 'qudra',
  name: { ar: 'قُدرة', en: 'Qudra' },
  tagline: {
    ar: 'كل عمليات التدريب في منصة واحدة',
    en: 'All Your Training Operations in One Platform',
  },
  category: 'B2B Training Management System (نظام إدارة التدريب) for academies and training centers in Egypt and the Gulf',
  website: 'qudratms.com',
  contact: '',
  description: 'Promise: the academy runs on a system, not on Excel, WhatsApp groups and memory.',
  audience: 'The academy/training-center owner or manager (B2B). Never write to students or parents.',
  features: `- Operations: branches, courses, trainers, groups/cohorts, students, trainer schedules; filters by branch, trainer, status, category and attendance type (online / in-person / recorded).
- Learning: certificates and certificate templates, student reports, trainer evaluations, learning library.
- Community: student community and discussion topics.
- Finance: payments, collection schedule (installments), payroll, expenses, budget, financial reports.
- Communication: send message, messages inbox, push notifications.
- Student mobile app: current lecture + "Join session" button, attendance %, overdue assignments, pending evaluations, session calendar.
- Multi-branch academies, Arabic-first RTL interface.`,
  voice: `1. Operator, not marketer: concrete scenes from running a training center beat abstract benefits.
2. Short, punchy sentences. One idea per line.
3. Pain first, then the system, then one clear next step.
4. Proof over adjectives. Describe a concrete before/after.
5. Respect the reader. No lecturing, no fear-mongering, no "هل تعلم؟" clichés.`,
  glossary: 'طالب/الطلاب (never متدرب), مدرب, أكاديمية / مركز تدريب (never مدرسة), دورة / برنامج تدريبي, مجموعة / دفعة, محاضرة / جلسة, أقساط, شهادة.',
  rules: 'Never name competitors; compare against "Excel, paper and WhatsApp".',
  ctas: {
    ar: ['احجز ديمو مجاني', 'ابعتلنا "ديمو" على واتساب', 'جرّب قدرة على أكاديميتك'],
    en: ['Book a free demo', 'Message us "demo" on WhatsApp', 'Try Qudra on your academy'],
  },
  hashtags: ['#قدرة', '#إدارة_التدريب', '#مراكز_التدريب'],
  banned: [],
  visual: {
    primary: '#40A664',
    secondary: '#226E3D',
    accent: '#3DAA63',
    dark: '#1D2A22',
    light: '#EAF6EE',
    look: 'gradient',
    fontLatin: 'poppins',
    fontArabic: 'plex',
  },
};
