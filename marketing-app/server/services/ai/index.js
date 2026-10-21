import { config, writerProvider } from '../../config.js';
import { errors } from '../../lib/errors.js';
import { ARABIC_FONTS, LATIN_FONTS, LOOKS } from '../../../video/brand-theme.js';
import { brandName, brandSystemPrompt, PLATFORMS } from '../../brand/index.js';
import { AiBrandDraftSchema, AiScriptSchema, AiPlanSchema, PostSchema } from '../schemas.js';
import { generateJson } from './writer.js';
import { mockBrandDraft, mockScript, mockPosts } from './mock.js';

const GEO = {
  egypt: 'in Egypt',
  gulf: 'in the Gulf (KSA, UAE, Kuwait)',
  both: 'in Egypt and the Gulf',
  global: 'in any market',
};

/** Who a piece is for: the brand's audience in the chosen market. */
const audienceFor = (brand, market) => `${(brand.audience || 'the brand\'s target customers').split(/[.\n]/)[0].trim()} ${GEO[market] || GEO.both}`;

/**
 * Writes a 40–60s motion-video script for one brand. `page` holds scraped page text and
 * `images` uploaded images (as base64 content blocks) for the AI to work from.
 */
export async function writeVideoScript({ brand, topic, page, images, language, durationSec, market, reference = null }) {
  if (config.mockAi) return mockScript({ brand, topic: topic || page?.title, language, reference });

  const name = brandName(brand, 'en');
  const structure = reference
    ? `Structure: rebuild the REFERENCE VIDEO below for ${name}. Keep exactly its ${reference.scenes.length} scenes in the same order, with the same scene types, the same relative durations, the same transitions, the same hook pattern, pacing, tone and amount of on-screen text. Use the reference's voiceover style for the voiceover lines. The content must be about ${name} and the topic below; never copy the reference's brand, product names or claims.`
    : `Structure: 6–8 scenes in this order: hook (0–3s, scroll-stopping) → pain → solution (${name}) → 1–3 feature scenes → proof (concrete before/after, no invented numbers) → cta.`;
  const instructions = `Write a ${durationSec}-second vertical (9:16) motion-graphics marketing video script for ${audienceFor(brand, market)}.

${structure}
Each scene:
- headline: on-screen text, max 9 words, the scene's one idea.
- subtext: max 18 words supporting line (may be empty for hook/cta).
- bullets: 0–3 very short items (2–4 words), only where a list helps.
- durationSec: so that all scenes add up to about ${durationSec + 3}s; hook 3–4s, cta 5–6s.
- transition: into the NEXT scene (fade | slide | wipe | flip); vary them.
- stockQuery: 2–5 English words to search stock footage for this scene's background (people, places or objects that fit the audience and product; empty for cta).
- visualIdea: what the motion graphic shows (brief).
- voiceover: the spoken line for this scene, natural and conversational; short enough to say in the scene's duration at about 2 words per second (hook ≤ 9 words, other scenes ≤ 16 words).
- imagePrompt: an English prompt (25–60 words) for a striking photorealistic image that carries this scene's idea for this audience: subject, action, setting, camera angle and mood. Real people, places and objects only; never screens with readable text, never text or logos. Empty for cta.
- screenshotHint: in ${language === 'ar' ? 'Arabic' : 'English'}, one short line telling the marketer which product screenshot or photo would fit this scene best if they want to use their own (e.g. which screen of the product, which section). Empty for hook and cta.
Also return: title (internal, short), cta.headline + cta.button (one CTA), caption for posting the video (≤ 80 words), 3–5 hashtags.
- imageIndex: ${images.length ? `which attached image this scene shows, 1–${images.length} in the order attached; 0 for none. Put each image on the scene whose text describes that screen, use each image at most once, and keep hook and cta at 0.` : 'always 0 (no images attached).'}
${images.length ? `The user attached ${images.length} image(s) (product screenshots), in this order. Look at each one and describe what it actually shows in the scene you put it on.` : ''}`;

  const content = [
    ...images,
    {
      type: 'text',
      text: `${instructions}

<topic>${topic || '(none, use the page content)'}</topic>
${page ? `<page url="${page.url}">\n<title>${page.title}</title>\n${page.text}\n</page>` : ''}
${reference ? `<reference_video>\n${JSON.stringify(reference, null, 1)}\n</reference_video>` : ''}`,
    },
  ];

  return generateJson({ system: brandSystemPrompt(brand, language), content, schema: AiScriptSchema, effort: 'medium' });
}

function slotLine(slot, i) {
  const p = PLATFORMS[slot.platform];
  return `${i + 1}. ${slot.dayName} ${slot.date} | platform: ${p.label} (${p.tone}; ${p.length}; typical format: ${p.format}) | pillar: ${slot.pillar.en}`;
}

// Every day of the plan is a short vertical video; the post fields describe that video and its caption.
const POST_RULES = `Every post is a 40–60 second vertical (9:16) motion-graphics video published on that day's platform.
For each post return: hook (the video's opening line, ≤ 12 words, stops the target customer scrolling), caption (the text published with the video, following the platform length, line breaks between ideas, ends with the CTA idea), visualIdea (the video concept: which product screen, moment or scene carries the story), hashtags (3–5, LinkedIn 2–3), cta (one action), format (e.g. "Reel 9:16", "LinkedIn video", "Short"), bestTime (local posting time, HH:MM).`;

/** Writes all posts of a week in one call so they don't repeat each other. */
export async function writeWeekPlan({ brand, slots, language, market, focus }) {
  if (config.mockAi) return mockPosts({ brand, slots, language });

  const ask = (wanted, written) =>
    generateJson({
      system: brandSystemPrompt(brand, language),
      content: `Create ${wanted.length === slots.length ? 'a 7-day social media content plan' : `the remaining ${wanted.length} day(s) of a 7-day social media content plan`} for ${audienceFor(brand, market)}.
${focus ? `Campaign focus / notes from the marketing team: ${focus}\n` : ''}
Slots (keep this exact order, exactly one post each, ${wanted.length} posts in total):
${wanted.map(slotLine).join('\n')}
${written.length ? `\nDays already written use these hooks; do not repeat their angle: ${written.map((p) => `"${p.hook}"`).join(', ')}\n` : ''}
${POST_RULES}
Each day must take a different angle; do not repeat hooks or scenes across the week.`,
      schema: AiPlanSchema,
      effort: 'medium',
    });

  let posts = (await ask(slots, [])).posts.slice(0, slots.length);
  // Models sometimes stop early: ask once more for just the missing days.
  if (posts.length < slots.length) {
    const more = await ask(slots.slice(posts.length), posts);
    posts = [...posts, ...more.posts].slice(0, slots.length);
  }
  if (posts.length < slots.length) throw errors.aiBadOutput(writerProvider() === 'gemini' ? 'Gemini' : 'Claude');
  return posts;
}

/** Rewrites one day of a plan, aware of the other days so it stays distinct. */
export async function rewritePost({ brand, slot, language, market, focus, otherHooks, instruction }) {
  if (config.mockAi) {
    // Pick a demo hook this week doesn't already use.
    const options = [0, 1, 2, 3, 4, 5, 6].map((seed) => mockPosts({ brand, slots: [{ ...slot, seed }], language })[0]);
    return options.find((p) => !otherHooks.includes(p.hook) && p.hook !== slot.currentHook) || options[0];
  }

  const text = `Rewrite one post of a weekly plan for ${audienceFor(brand, market)}.
${focus ? `Campaign focus: ${focus}\n` : ''}Slot: ${slotLine(slot, 0)}
Current version of this post (write a clearly different one): "${slot.currentHook || ''}"
Other posts this week already use these hooks (stay different): ${otherHooks.map((h) => `"${h}"`).join(', ')}
${instruction ? `Specific request from the marketer: ${instruction}` : 'Give a fresh angle.'}

${POST_RULES}`;
  return generateJson({ system: brandSystemPrompt(brand, language), content: text, schema: PostSchema, effort: 'medium', maxTokens: 8000 });
}

/** Expands one day of a weekly plan into a full video script built on that day's angle. */
export async function writeDayScript({ brand, post, pillar, platform, language, market, focus, otherHooks, durationSec }) {
  if (config.mockAi) {
    const script = mockScript({ brand, topic: post.hook, language });
    return { ...script, caption: post.caption, hashtags: post.hashtags };
  }
  const topic = `Video for ${post.dayName} ${post.date} on ${PLATFORMS[platform].label} (content pillar: ${pillar.en}).
${focus ? `Campaign focus: ${focus}\n` : ''}Use this exact opening line for the hook scene: "${post.hook}"
Video concept: ${post.visualIdea}
One CTA only: ${post.cta}
The post caption that goes with the video (keep the script consistent with it): ${post.caption}
Other videos this week open with these hooks; do not repeat their angle: ${otherHooks.map((h) => `"${h}"`).join(', ')}`;
  return writeVideoScript({ brand, topic, page: null, images: [], language, durationSec, market });
}

const DRAFT_SYSTEM = `You are a senior brand strategist and art director. You turn a product's website or a short brief into a complete brand profile that an AI copywriter and a motion-graphics template will follow.
Be factual: only describe features, audiences and promises the source supports. Never invent statistics, clients or prices.`;

/** Drafts a whole brand (identity, voice, visuals) from a website and/or a short description. Not saved. */
export async function draftBrand({ page, notes, language }) {
  if (config.mockAi) return mockBrandDraft({ page, notes, language });

  const text = `Create a brand profile for the product described below.

Return:
- name.ar / name.en: the brand name in Arabic and English (transliterate if it only exists in one language).
- tagline.ar / tagline.en: one short line each.
- category: what the product is and for which market, one line (English).
- description: the product's promise and what it replaces or improves, 2–4 sentences (English).
- audience: the decision maker every piece speaks to, plus who NOT to write for if relevant (English, 1–2 sentences).
- features: the real features from the source as a "- " bullet list grouped by area (English).
- voice: 4–6 numbered voice rules that fit this brand and audience (English).
- glossary: preferred words in ${language === 'ar' ? 'Arabic' : 'English'} (and words to avoid), one line; empty if nothing specific.
- rules: extra brand rules, one per line (e.g. what to compare against instead of naming competitors); may be empty.
- ctas.ar / ctas.en: 3 short calls to action each.
- hashtags: 3–5 hashtags in ${language === 'ar' ? 'Arabic' : 'English'}, starting with #.
- colors: #RRGGBB values. primary = the main brand colour; secondary = a darker companion used at the end of gradients; accent = a highlight for ticks and keywords; dark = a near-black tone of the palette for dark scenes and text; light = a very light tint for chips and soft text.${page?.colors?.length ? ` The website uses these colours, most used first: ${page.colors.join(', ')}. Base the palette on them.` : ' Pick colours that fit the category and feel of the brand.'}
- look: one of ${LOOKS.join(' | ')} (gradient = vivid brand gradients, solid = flat brand colour, dark = premium dark scenes lit by the brand colour, light = clean light scenes with brand accents).
- fontLatin: one of ${LATIN_FONTS.map((f) => f.id).join(' | ')}. fontArabic: one of ${ARABIC_FONTS.map((f) => f.id).join(' | ')}. Match the brand's personality (playfair = elegant/luxury, montserrat = bold, inter = neutral tech, poppins = friendly modern).

${notes ? `<brief>\n${notes}\n</brief>` : ''}
${page ? `<website url="${page.url}">\n<title>${page.title}</title>\n${page.text}\n</website>` : ''}`;
  return generateJson({ system: DRAFT_SYSTEM, content: text, schema: AiBrandDraftSchema, effort: 'medium', maxTokens: 8000 });
}
