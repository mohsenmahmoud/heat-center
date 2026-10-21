import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { PILLARS, PLATFORMS, brandName } from '../brand/index.js';
import { cleanVisual } from '../../video/brand-theme.js';
import { voiceoverText } from './scripts.js';

const L = {
  ar: { script: 'سكريبت الفيديو', scene: 'مشهد', onScreen: 'على الشاشة', voice: 'التعليق الصوتي', fullVoice: 'نص التعليق الصوتي كاملاً', noScript: 'لم يُكتب السكريبت بعد.', title: 'خطة المحتوى الأسبوعية', week: 'أسبوع يبدأ', platform: 'المنصة', pillar: 'المحور', format: 'الشكل', time: 'أفضل وقت', hook: 'الهوك', caption: 'الكابشن', visual: 'الفكرة البصرية', hashtags: 'الهاشتاجات', cta: 'الدعوة لإجراء (CTA)' },
  en: { script: 'Video script', scene: 'Scene', onScreen: 'On screen', voice: 'Voiceover', fullVoice: 'Full voiceover text', noScript: 'Script not written yet.', title: 'Weekly Content Plan', week: 'Week starting', platform: 'Platform', pillar: 'Pillar', format: 'Format', time: 'Best time', hook: 'Hook', caption: 'Caption', visual: 'Visual idea', hashtags: 'Hashtags', cta: 'CTA' },
};

const sec = (s) => `${Number(s.durationSec).toFixed(1).replace(/\.0$/, '')}s`;

const pillarName = (key, lang) => PILLARS.find((p) => p.key === key)?.[lang] || key;
const platformName = (key) => PLATFORMS[key]?.label || key;

export function planToMarkdown(plan, brand) {
  const lang = plan.language;
  const t = L[lang];
  const out = [`# ${t.title} — ${brandName(brand, lang)}`, '', `**${t.week}:** ${plan.weekStart}`, ''];
  for (const p of plan.posts) {
    out.push(
      `## ${p.dayName} · ${p.date}`,
      '',
      `- **${t.platform}:** ${platformName(p.platform)}`,
      `- **${t.pillar}:** ${pillarName(p.pillar, lang)}`,
      `- **${t.format}:** ${p.format}`,
      `- **${t.time}:** ${p.bestTime}`,
      '',
      `**${t.hook}:** ${p.hook}`,
      '',
      `**${t.caption}:**`,
      '',
      p.caption,
      '',
      `**${t.visual}:** ${p.visualIdea}`,
      '',
      `**${t.cta}:** ${p.cta}`,
      '',
      `**${t.hashtags}:** ${p.hashtags.join(' ')}`,
      '',
      `### 🎬 ${t.script}`,
      '',
    );
    if (!p.script) {
      out.push(`_${t.noScript}_`, '', '---', '');
      continue;
    }
    p.script.scenes.forEach((s, i) => {
      out.push(`**${t.scene} ${i + 1} · ${s.type} · ${sec(s)}**`, '', `- ${t.onScreen}: ${s.headline}${s.subtext ? ` — ${s.subtext}` : ''}`);
      if (s.bullets?.length) out.push(`- • ${s.bullets.join(' • ')}`);
      if (s.voiceover) out.push(`- ${t.voice}: ${s.voiceover}`);
      out.push('');
    });
    out.push(`**CTA:** ${p.script.cta.headline} · ${p.script.cta.button}`, '', `**${t.fullVoice}:**`, '', '```', voiceoverText(p.script), '```', '', '---', '');
  }
  return out.join('\n');
}

export async function planToDocx(plan, brand) {
  const lang = plan.language;
  const visual = cleanVisual(brand?.visual);
  const [main, deep, ink] = [visual.primary, visual.secondary, visual.dark].map((c) => c.replace('#', '').toUpperCase());
  const rtl = lang === 'ar';
  const t = L[lang];
  const font = rtl ? 'Arial' : 'Calibri';
  const align = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const run = (text, opts = {}) => new TextRun({ text, font, rightToLeft: rtl, size: 22, ...opts });
  const para = (children, opts = {}) => new Paragraph({ children, bidirectional: rtl, alignment: align, spacing: { after: 120 }, ...opts });
  const field = (label, value) => para([run(`${label}: `, { bold: true, color: deep }), run(value)]);

  const children = [
    para([run(`${t.title} — ${brandName(brand, lang)}`, { bold: true, size: 36, color: main })], { heading: HeadingLevel.TITLE }),
    para([run(`${t.week}: ${plan.weekStart}`, { color: '868C87' })]),
  ];
  for (const p of plan.posts) {
    children.push(
      para([run(`${p.dayName} · ${p.date}`, { bold: true, size: 28, color: ink })], { heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 } }),
      field(t.platform, platformName(p.platform)),
      field(t.pillar, pillarName(p.pillar, lang)),
      field(t.format, p.format),
      field(t.time, p.bestTime),
      field(t.hook, p.hook),
      para([run(`${t.caption}:`, { bold: true, color: deep })]),
      ...p.caption.split('\n').map((line) => para([run(line)], { spacing: { after: 60 } })),
      field(t.visual, p.visualIdea),
      field(t.cta, p.cta),
      field(t.hashtags, p.hashtags.join(' ')),
      para([run(`🎬 ${t.script}`, { bold: true, size: 26, color: main })], { spacing: { before: 200, after: 120 } }),
    );
    if (!p.script) {
      children.push(para([run(t.noScript, { italics: true, color: '868C87' })]));
      continue;
    }
    p.script.scenes.forEach((s, i) => {
      children.push(para([run(`${t.scene} ${i + 1} · ${s.type} · ${sec(s)}`, { bold: true, color: ink })], { spacing: { before: 120, after: 60 } }));
      children.push(field(t.onScreen, `${s.headline}${s.subtext ? ` — ${s.subtext}` : ''}`));
      if (s.voiceover) children.push(field(t.voice, s.voiceover));
    });
    children.push(field('CTA', `${p.script.cta.headline} · ${p.script.cta.button}`));
  }
  const doc = new Document({ creator: 'Marketing Studio', title: `${t.title} — ${brandName(brand, lang)}`, sections: [{ properties: {}, children }] });
  return Packer.toBuffer(doc);
}
