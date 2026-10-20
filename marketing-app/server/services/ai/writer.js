import { writerProvider } from '../../config.js';
import { errors } from '../../lib/errors.js';
import * as claude from './claude.js';
import * as gemini from './gemini.js';

/** Sends a structured-output request to whichever AI is configured (AI_PROVIDER, or the one with a key). */
export function generateJson(request) {
  const provider = writerProvider();
  if (provider === 'gemini') return gemini.generateJson(request);
  if (provider === 'claude') return claude.generateJson(request);
  throw errors.missingAiKey();
}
