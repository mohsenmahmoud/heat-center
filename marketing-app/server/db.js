import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { config } from './config.js';

let db;

export function getDb() {
  if (db) return db;
  db = new DatabaseSync(config.paths.db);
  // Wait for a concurrent writer (another process or test worker) instead of failing with "database is locked".
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY, original_name TEXT, file_name TEXT NOT NULL,
      mime TEXT, size INTEGER, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, title TEXT, language TEXT,
      topic TEXT, script_json TEXT NOT NULL, file_name TEXT, thumb_name TEXT,
      duration_sec REAL, size_bytes INTEGER
    );
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      week_start TEXT, language TEXT, settings_json TEXT NOT NULL, posts_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, data_json TEXT NOT NULL
    );
  `);
  // Videos and plans made before brands existed belong to Qudra.
  for (const table of ['videos', 'plans']) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
    if (columns.includes('brand_id')) continue;
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN brand_id TEXT NOT NULL DEFAULT 'qudra'`);
    } catch (err) {
      // Another process sharing this database added it first.
      if (!/duplicate column/i.test(err.message)) throw err;
    }
  }
  return db;
}

export const newId = () => crypto.randomBytes(8).toString('hex');
const now = () => new Date().toISOString();

export const uploadsRepo = {
  add({ originalName, fileName, mime, size }) {
    const row = { id: newId(), original_name: originalName, file_name: fileName, mime, size, created_at: now() };
    getDb()
      .prepare('INSERT INTO uploads VALUES (:id, :original_name, :file_name, :mime, :size, :created_at)')
      .run(row);
    return row;
  },
  get: (id) => getDb().prepare('SELECT * FROM uploads WHERE id = ?').get(id),
};

const videoFromRow = (r) =>
  r && {
    id: r.id,
    createdAt: r.created_at,
    title: r.title,
    language: r.language,
    topic: r.topic,
    script: JSON.parse(r.script_json),
    fileName: r.file_name,
    thumbName: r.thumb_name,
    durationSec: r.duration_sec,
    sizeBytes: r.size_bytes,
    brandId: r.brand_id,
  };

export const videosRepo = {
  add(v) {
    const row = {
      id: v.id || newId(),
      created_at: now(),
      title: v.title,
      language: v.language,
      topic: v.topic || '',
      script_json: JSON.stringify(v.script),
      file_name: v.fileName,
      thumb_name: v.thumbName || null,
      duration_sec: v.durationSec,
      size_bytes: v.sizeBytes || 0,
      brand_id: v.brandId || 'qudra',
    };
    getDb()
      .prepare(
        'INSERT INTO videos (id, created_at, title, language, topic, script_json, file_name, thumb_name, duration_sec, size_bytes, brand_id) VALUES (:id, :created_at, :title, :language, :topic, :script_json, :file_name, :thumb_name, :duration_sec, :size_bytes, :brand_id)',
      )
      .run(row);
    return videoFromRow(row);
  },
  list: (brandId) =>
    (brandId
      ? getDb().prepare('SELECT * FROM videos WHERE brand_id = ? ORDER BY created_at DESC LIMIT 100').all(brandId)
      : getDb().prepare('SELECT * FROM videos ORDER BY created_at DESC LIMIT 100').all()
    ).map(videoFromRow),
  get: (id) => videoFromRow(getDb().prepare('SELECT * FROM videos WHERE id = ?').get(id)),
  remove: (id) => getDb().prepare('DELETE FROM videos WHERE id = ?').run(id).changes > 0,
};

const planFromRow = (r) =>
  r && {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    weekStart: r.week_start,
    language: r.language,
    brandId: r.brand_id,
    settings: JSON.parse(r.settings_json),
    posts: JSON.parse(r.posts_json),
  };

export const plansRepo = {
  add({ weekStart, language, settings, posts, brandId }) {
    const t = now();
    const row = {
      id: newId(),
      created_at: t,
      updated_at: t,
      week_start: weekStart,
      language,
      settings_json: JSON.stringify(settings),
      posts_json: JSON.stringify(posts),
      brand_id: brandId || 'qudra',
    };
    getDb()
      .prepare(
        'INSERT INTO plans (id, created_at, updated_at, week_start, language, settings_json, posts_json, brand_id) VALUES (:id, :created_at, :updated_at, :week_start, :language, :settings_json, :posts_json, :brand_id)',
      )
      .run(row);
    return planFromRow(row);
  },
  updatePosts(id, posts) {
    getDb().prepare('UPDATE plans SET posts_json = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(posts), now(), id);
    return plansRepo.get(id);
  },
  /** Merges `patch` into one post of a plan; returns the updated post or null. */
  patchPost(planId, postId, patch) {
    const plan = plansRepo.get(planId);
    const index = plan?.posts.findIndex((p) => p.id === postId) ?? -1;
    if (index < 0) return null;
    plan.posts[index] = { ...plan.posts[index], ...patch };
    plansRepo.updatePosts(planId, plan.posts);
    return plan.posts[index];
  },
  list: (brandId) =>
    (brandId
      ? getDb().prepare('SELECT * FROM plans WHERE brand_id = ? ORDER BY created_at DESC LIMIT 50').all(brandId)
      : getDb().prepare('SELECT * FROM plans ORDER BY created_at DESC LIMIT 50').all()
    ).map(planFromRow),
  get: (id) => planFromRow(getDb().prepare('SELECT * FROM plans WHERE id = ?').get(id)),
  remove: (id) => getDb().prepare('DELETE FROM plans WHERE id = ?').run(id).changes > 0,
};

const brandFromRow = (r) => r && { ...JSON.parse(r.data_json), id: r.id, createdAt: r.created_at, updatedAt: r.updated_at };

export const brandsRepo = {
  /** `seed` skips the insert when the id already exists (two processes starting on one database). */
  add(data, id = newId(), { seed = false } = {}) {
    const t = now();
    const { id: _id, createdAt, updatedAt, ...rest } = data;
    getDb()
      .prepare(`INSERT ${seed ? 'OR IGNORE ' : ''}INTO brands VALUES (?, ?, ?, ?)`)
      .run(id, t, t, JSON.stringify(rest));
    return brandsRepo.get(id);
  },
  update(id, data) {
    const { id: _id, createdAt, updatedAt, ...rest } = data;
    getDb().prepare('UPDATE brands SET data_json = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(rest), now(), id);
    return brandsRepo.get(id);
  },
  list: () => getDb().prepare('SELECT * FROM brands ORDER BY created_at ASC').all().map(brandFromRow),
  get: (id) => brandFromRow(getDb().prepare('SELECT * FROM brands WHERE id = ?').get(id)),
  count: () => getDb().prepare('SELECT COUNT(*) AS n FROM brands').get().n,
  remove: (id) => getDb().prepare('DELETE FROM brands WHERE id = ?').run(id).changes > 0,
};
