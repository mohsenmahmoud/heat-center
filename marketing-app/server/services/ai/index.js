import { config } from '../../config.js';
import { brandSystemPrompt, PLATFORMS } from '../../brand/qudra.js';
import { AiScriptSchema, AiPlanSchema, PostSchema } from '../schemas.js';
import { generateJson } from './writer.js';
import { mockScript, mockPosts } from './mock.js';

const MARKET = {
  egypt: 'Egyptian academy owners',
  gulf: 'Gulf (KSA, UAE, Kuwait) training-center owners and GMs',
  both: 'academy and training-center owners in Egypt and the Gulf',
};

/**
 * Writes a 40–60s motion-video script. `source` holds topic text, scraped page text
 * and uploaded images (as base64 content blocks) for Claude to work from.
 */
export async function writeVideoScript({ topic, page, images, language, durationSec, market }) {
  if (config.mockAi) return mockScript({ topic: topic || page?.title, language });

  const instructions = `Write a ${durationSec}-second vertical (9:16) motion-graphics marketing video script for ${MARKET[market]}.

Structure: 6–8 scenes in this order: hook (0–3s, scroll-stopping) → pain → solution (Qudra) → 1–3 feature scenes → proof (concrete before/after, no invented numbers) → cta.
Each scene:
- headline: on-screen text, max 9 words, the scene's one idea.
- subtext: max 18 words supporting line (may be empty for hook/cta).
- bullets: 0–3 very short items (2–4 words), only where a list helps.
- durationSec: so that all scenes add up to about ${durationSec + 3}s; hook 3–4s, cta 5–6s.
- transition: into the NEXT scene (fade | slide | wipe | flip); vary them.
- stockQuery: 2–5 English words to search stock footage for this scene's background (people, offices, classrooms; empty for cta).
- visualIdea: what the motion graphic shows (brief).
- voiceover: the spoken line for this scene, natural, fits its duration (~2.3 words/second).
Also return: title (internal, short), cta.headline + cta.button (one CTA), caption for posting the video (≤ 80 words), 3–5 hashtags.
- imageIndex: ${images.length ? `which attached image this scene shows, 1–${images.length} in the order attached; 0 for none. Put each image on the scene whose text describes that screen, use each image at most once, and keep hook and cta at 0.` : 'always 0 (no images attached).'}
${images.length ? `The user attached ${images.length} image(s) (product screenshots), in this order. Look at each one and describe what it actually shows in the scene you put it on.` : ''}`;

  const content = [
    ...images,
    {
      type: 'text',
      text: `${instructions}

<topic>${topic || '(none, use the page content)'}</topic>
${page ? `<page url="${page.url}">\n<title>${page.title}</title>\n${page.text}\n</page>` : ''}`,
    },
  ];

  return generateJson({ system: brandSystemPrompt(language), content, schema: AiScriptSchema, effort: 'medium' });
}

function slotLine(slot, i) {
  const p = PLATFORMS[slot.platform];
  return `${i + 1}. ${slot.dayName} ${slot.date} | platform: ${p.label} (${p.tone}; ${p.length}; typical format: ${p.format}) | pillar: ${slot.pillar.en}`;
}

// Every day of the plan is a short vertical video; the post fields describe that video and its caption.
const POST_RULES = `Every post is a 40–60 second vertical (9:16) motion-graphics video published on that day's platform.
For each post return: hook (the video's opening line, ≤ 12 words, stops an academy owner scrolling), caption (the text published with the video, following the platform length, line breaks between ideas, ends with the CTA idea), visualIdea (the video concept: which Qudra screen or scene carries the story), hashtags (3–5, LinkedIn 2–3), cta (one action), format (e.g. "Reel 9:16", "LinkedIn video", "Short"), bestTime (local posting time, HH:MM).`;

/** Writes all posts of a week in one call so they don't repeat each other. */
export async function writeWeekPlan({ slots, language, market, focus }) {
  if (config.mockAi) return mockPosts({ slots, language });

  const text = `Create a 7-day social media content plan for ${MARKET[market]}.
${focus ? `Campaign focus / notes from the marketing team: ${focus}\n` : ''}
Slots (keep this exact order, one post each):
${slots.map(slotLine).join('\n')}

${POST_RULES}
Each day must take a different angle; do not repeat hooks or scenes across the week.`;

  const result = await generateJson({ system: brandSystemPrompt(language), content: text, schema: AiPlanSchema, effort: 'medium' });
  if (result.posts.length < slots.length) throw new Error('Claude returned fewer posts than requested');
  return result.posts.slice(0, slots.length);
}

/** Rewrites one day of a plan, aware of the other days so it stays distinct. */
export async function rewritePost({ slot, language, market, focus, otherHooks, instruction }) {
  if (config.mockAi) {
    // Pick a demo hook this week doesn't already use.
    const options = [0, 1, 2, 3, 4, 5, 6].map((seed) => mockPosts({ slots: [{ ...slot, seed }], language })[0]);
    return options.find((p) => !otherHooks.includes(p.hook) && p.hook !== slot.currentHook) || options[0];
  }

  const text = `Rewrite one post of a weekly plan for ${MARKET[market]}.
${focus ? `Campaign focus: ${focus}\n` : ''}Slot: ${slotLine(slot, 0)}
Current version of this post (write a clearly different one): "${slot.currentHook || ''}"
Other posts this week already use these hooks (stay different): ${otherHooks.map((h) => `"${h}"`).join(', ')}
${instruction ? `Specific request from the marketer: ${instruction}` : 'Give a fresh angle.'}

${POST_RULES}`;
  return generateJson({ system: brandSystemPrompt(language), content: text, schema: PostSchema, effort: 'medium', maxTokens: 8000 });
}

/** Expands one day of a weekly plan into a full video script built on that day's angle. */
export async function writeDayScript({ post, pillar, platform, language, market, focus, otherHooks, durationSec }) {
  if (config.mockAi) {
    const script = mockScript({ topic: post.hook, language });
    return { ...script, caption: post.caption, hashtags: post.hashtags };
  }
  const topic = `Video for ${post.dayName} ${post.date} on ${PLATFORMS[platform].label} (content pillar: ${pillar.en}).
${focus ? `Campaign focus: ${focus}\n` : ''}Use this exact opening line for the hook scene: "${post.hook}"
Video concept: ${post.visualIdea}
One CTA only: ${post.cta}
The post caption that goes with the video (keep the script consistent with it): ${post.caption}
Other videos this week open with these hooks; do not repeat their angle: ${otherHooks.map((h) => `"${h}"`).join(', ')}`;
  return writeVideoScript({ topic, page: null, images: [], language, durationSec, market });
}
