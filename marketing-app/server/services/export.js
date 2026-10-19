import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { PILLARS, PLATFORMS } from '../brand/qudra.js';

const L = {
  ar: { title: 'خطة المحتوى الأسبوعية', week: 'أسبوع يبدأ', platform: 'المنصة', pillar: 'المحور', format: 'الشكل', time: 'أفضل وقت', hook: 'الهوك', caption: 'الكابشن', visual: 'الفكرة البصرية', hashtags: 'الهاشتاجات', cta: 'الدعوة لإجراء (CTA)' },
  en: { title: 'Weekly Content Plan', week: 'Week starting', platform: 'Platform', pillar: 'Pillar', format: 'Format', time: 'Best time', hook: 'Hook', caption: 'Caption', visual: 'Visual idea', hashtags: 'Hashtags', cta: 'CTA' },
};

const pillarName = (key, lang) => PILLARS.find((p) => p.key === key)?.[lang] || key;
const platformName = (key) => PLATFORMS[key]?.label || key;

export function planToMarkdown(plan) {
  const lang = plan.language;
  const t = L[lang];
  const out = [`# ${t.title} — Qudra`, '', `**${t.week}:** ${plan.weekStart}`, ''];
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
      '---',
      '',
    );
  }
  return out.join('\n');
}

export async function planToDocx(plan) {
  const lang = plan.language;
  const rtl = lang === 'ar';
  const t = L[lang];
  const font = rtl ? 'Arial' : 'Calibri';
  const align = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const run = (text, opts = {}) => new TextRun({ text, font, rightToLeft: rtl, size: 22, ...opts });
  const para = (children, opts = {}) => new Paragraph({ children, bidirectional: rtl, alignment: align, spacing: { after: 120 }, ...opts });
  const field = (label, value) => para([run(`${label}: `, { bold: true, color: '016332' }), run(value)]);

  const children = [
    para([run(`${t.title} — Qudra`, { bold: true, size: 36, color: '2C894D' })], { heading: HeadingLevel.TITLE }),
    para([run(`${t.week}: ${plan.weekStart}`, { color: '868C87' })]),
  ];
  for (const p of plan.posts) {
    children.push(
      para([run(`${p.dayName} · ${p.date}`, { bold: true, size: 28, color: '1D2A22' })], { heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 } }),
      field(t.platform, platformName(p.platform)),
      field(t.pillar, pillarName(p.pillar, lang)),
      field(t.format, p.format),
      field(t.time, p.bestTime),
      field(t.hook, p.hook),
      para([run(`${t.caption}:`, { bold: true, color: '016332' })]),
      ...p.caption.split('\n').map((line) => para([run(line)], { spacing: { after: 60 } })),
      field(t.visual, p.visualIdea),
      field(t.cta, p.cta),
      field(t.hashtags, p.hashtags.join(' ')),
    );
  }
  const doc = new Document({ creator: 'Qudra Marketing Studio', title: t.title, sections: [{ properties: {}, children }] });
  return Packer.toBuffer(doc);
}
