import { EventEmitter } from 'node:events';
import { newId } from '../db.js';

/** In-memory render jobs; progress is pushed to the browser over Server-Sent Events. */
const jobs = new Map();
const bus = new EventEmitter();
bus.setMaxListeners(50);

export function createJob(meta = {}) {
  const job = { id: newId(), status: 'queued', stage: 'queued', progress: 0, message: null, error: null, result: null, meta, createdAt: Date.now() };
  jobs.set(job.id, job);
  return job;
}

export function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, patch);
  bus.emit(id, { ...job });
}

export const getJob = (id) => jobs.get(id);

export const activeJob = () => [...jobs.values()].find((j) => j.status === 'running' || j.status === 'queued');

export function subscribe(id, listener) {
  bus.on(id, listener);
  return () => bus.off(id, listener);
}

// Forget finished jobs after an hour so memory stays flat.
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs) if (job.createdAt < cutoff && job.status !== 'running') jobs.delete(id);
}, 10 * 60 * 1000).unref();
