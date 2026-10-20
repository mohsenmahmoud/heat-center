import { z } from 'zod';

export const SCENE_TYPES = ['hook', 'pain', 'solution', 'feature', 'proof', 'cta'];
export const TRANSITIONS = ['fade', 'slide', 'wipe', 'flip'];

/** What Claude returns for a video script. Visual assets are attached later by the render pipeline. */
export const AiScriptSchema = z.object({
  title: z.string(),
  scenes: z.array(
    z.object({
      type: z.enum(SCENE_TYPES),
      headline: z.string(),
      subtext: z.string(),
      bullets: z.array(z.string()),
      durationSec: z.number(),
      transition: z.enum(TRANSITIONS),
      stockQuery: z.string(),
      visualIdea: z.string(),
      voiceover: z.string(),
      // 1-based index of the attached image this scene shows; 0 = no image.
      imageIndex: z.number().int().default(0),
    }),
  ),
  cta: z.object({ headline: z.string(), button: z.string() }),
  caption: z.string(),
  hashtags: z.array(z.string()),
});

export const PostSchema = z.object({
  hook: z.string(),
  caption: z.string(),
  visualIdea: z.string(),
  hashtags: z.array(z.string()),
  cta: z.string(),
  format: z.string(),
  bestTime: z.string(),
});

export const AiPlanSchema = z.object({ posts: z.array(PostSchema) });

/** Request bodies coming from the UI. */
export const ScriptRequest = z.object({
  topic: z.string().max(4000).default(''),
  url: z.string().max(2000).default(''),
  imageIds: z.array(z.string().regex(/^[a-f0-9]{16}$/)).max(10).default([]),
  language: z.enum(['ar', 'en']).default('ar'),
  // 40–60s normally; a reference video may ask for 15–90s.
  durationSec: z.number().min(15).max(90).default(45),
  market: z.enum(['egypt', 'gulf', 'both']).default('both'),
  // Blueprint from /api/video/reference: rebuild that video's structure and style for Qudra.
  reference: z.lazy(() => ReferenceInput).nullable().optional(),
});

const ReferenceInput = z.object({
  summary: z.string().max(2000),
  durationSec: z.number().min(1).max(600),
  hookPattern: z.string().max(1000),
  tone: z.string().max(500),
  pacing: z.string().max(500),
  voiceStyle: z.string().max(500),
  textStyle: z.string().max(500),
  scenes: z
    .array(
      z.object({
        type: z.enum(SCENE_TYPES),
        durationSec: z.number().min(0).max(120),
        onScreenText: z.string().max(600),
        voiceover: z.string().max(1500),
        purpose: z.string().max(600),
        visual: z.string().max(800),
        transition: z.enum(TRANSITIONS),
      }),
    )
    .min(1)
    .max(12),
});

export const ReferenceRequest = z
  .object({ url: z.string().max(500).default(''), uploadId: z.string().regex(/^[a-f0-9]{16}$/).nullable().optional(), language: z.enum(['ar', 'en']).default('ar') })
  .refine((v) => v.url.trim() || v.uploadId, { message: 'Add a YouTube link or upload a video' });

export const VoicePreviewRequest = z.object({
  text: z.string().min(1).max(1000),
  language: z.enum(['ar', 'en']).default('ar'),
  voiceName: z.string().max(40).nullable().optional(),
});

const SceneInput = z.object({
  id: z.string().max(40),
  type: z.enum(SCENE_TYPES),
  headline: z.string().max(300),
  subtext: z.string().max(600).default(''),
  bullets: z.array(z.string().max(200)).max(6).default([]),
  durationSec: z.number().min(1).max(20),
  transition: z.enum(TRANSITIONS).default('fade'),
  stockQuery: z.string().max(200).default(''),
  visualIdea: z.string().max(600).default(''),
  voiceover: z.string().max(1000).default(''),
  imageId: z.string().regex(/^[a-f0-9]{16}$/).nullable().optional(),
});

export const VideoScript = z.object({
  title: z.string().max(200),
  language: z.enum(['ar', 'en']),
  aspect: z.enum(['9:16', '1:1', '4:5', '16:9']).default('9:16'),
  scenes: z.array(SceneInput).min(2).max(12),
  cta: z.object({ headline: z.string().max(200), button: z.string().max(80), contact: z.string().max(120).default('') }),
  caption: z.string().max(3000).default(''),
  hashtags: z.array(z.string().max(60)).max(10).default([]),
  topic: z.string().max(4000).default(''),
});

export const RenderRequest = z.object({
  script: VideoScript,
  options: z
    .object({
      visualStyle: z.enum(['motion', 'mix']).default('mix'),
      voiceMode: z.enum(['none', 'ai', 'upload']).default('none'),
      voiceUploadId: z.string().regex(/^[a-f0-9]{16}$/).nullable().optional(),
      voiceName: z.string().max(40).nullable().optional(),
      music: z.string().max(200).nullable().optional(),
      captions: z.boolean().default(true),
      // Set when the video was opened from a weekly-plan day, so the plan can link to it.
      source: z.object({ planId: z.string().regex(/^[a-f0-9]{16}$/), postId: z.string().regex(/^[a-f0-9]{16}$/) }).nullable().optional(),
    })
    .default({}),
});

export const PLATFORM_KEYS = ['linkedin', 'facebook', 'instagram', 'tiktok'];

export const PlanRequest = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  platforms: z.array(z.enum(PLATFORM_KEYS)).min(1).default(PLATFORM_KEYS),
  language: z.enum(['ar', 'en']).default('ar'),
  market: z.enum(['egypt', 'gulf', 'both']).default('both'),
  focus: z.string().max(1500).default(''),
  durationSec: z.number().min(40).max(60).default(45),
});

export const PostUpdate = z.object({
  hook: z.string().max(500),
  caption: z.string().max(5000),
  visualIdea: z.string().max(1500),
  hashtags: z.array(z.string().max(80)).max(15),
  cta: z.string().max(300),
  format: z.string().max(100),
  bestTime: z.string().max(100),
});
