import { z } from 'zod';

const UNSUPPORTED = ['$schema', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'pattern', 'format', 'default'];

/** Claude and Gemini structured outputs both need every object closed and only the supported keywords. */
export function toStrictJsonSchema(zodSchema) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== 'object') return node;
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (UNSUPPORTED.includes(k)) continue;
      out[k] = walk(v);
    }
    if (out.type === 'object') {
      out.additionalProperties = false;
      out.required = Object.keys(out.properties || {});
    }
    if (out.type === 'array' && out.minItems > 1) delete out.minItems;
    if (out.maxItems !== undefined) delete out.maxItems;
    return out;
  };
  return walk(z.toJSONSchema(zodSchema));
}
