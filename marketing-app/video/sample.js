import { DEFAULT_VISUAL } from './brand-theme.js';

// Default props for `npm run studio` so the composition can be previewed on its own.
export const sampleProps = {
  mediaBase: '',
  logoSrc: null,
  musicSrc: null,
  voiceSrc: null,
  captions: false,
  brand: { name: { ar: 'قُدرة', en: 'Qudra' }, website: 'qudratms.com', visual: DEFAULT_VISUAL },
  script: {
    title: 'Sample',
    language: 'ar',
    aspect: '9:16',
    cta: { headline: 'احجز ديمو مجاني', button: 'احجز الآن', contact: 'qudratms.com' },
    scenes: [
      { id: 's1', type: 'hook', headline: 'آخر الشهر… وأنت تجمع الحضور من 6 جروبات واتساب؟', subtext: '', bullets: [], durationSec: 4, transition: 'slide', visual: { kind: 'gradient' } },
      { id: 's2', type: 'pain', headline: 'إكسل، ورق، ورسائل متفرقة', subtext: 'ولا أحد يعرف بدقة من دفع القسط.', bullets: ['حضور يدوي', 'أقساط بلا متابعة'], durationSec: 6, transition: 'wipe', visual: { kind: 'gradient' } },
      { id: 's3', type: 'solution', headline: 'قُدرة: كل عمليات التدريب في منصة واحدة', subtext: 'الحضور والأقساط والشهادات في مكان واحد.', bullets: ['جدول التحصيل', 'شهادات'], durationSec: 7, transition: 'flip', visual: { kind: 'gradient' } },
      { id: 's4', type: 'proof', headline: 'يومان لتقرير الشهر', subtext: 'التقرير جاهز وقت ما تحتاجه', bullets: [], durationSec: 6, transition: 'fade', visual: { kind: 'gradient' } },
      { id: 's5', type: 'cta', headline: 'أكاديميتك تشتغل بنظام', subtext: 'احجز ديمو مجاني', bullets: [], durationSec: 6, transition: 'fade', visual: { kind: 'gradient' } },
    ],
  },
};
