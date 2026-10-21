import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { brandsRepo } from '../db.js';
import { AppError, errors } from '../lib/errors.js';
import { BrandDraftRequest, BrandInput } from '../services/schemas.js';
import { getBrand, publicBrand, removeLogoFile } from '../services/brands.js';
import { draftBrand } from '../services/ai/index.js';
import { scrapePage } from '../services/scraper.js';
import { cleanVisual, isHex } from '../../video/brand-theme.js';

export const brandsRouter = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// PNG/JPG/WEBP only: an SVG served from this origin could run script.
const LOGO_TYPES = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
const logoUpload = multer({
  storage: multer.diskStorage({
    destination: config.paths.brands,
    filename: (req, file, cb) => cb(null, `${req.params.id}-${crypto.randomBytes(12).toString('hex')}${LOGO_TYPES[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (LOGO_TYPES[file.mimetype]) return cb(null, true);
    cb(errors.validation(`Unsupported logo type ${file.mimetype}`, 'اللوجو لازم يكون صورة PNG أو JPG أو WEBP (يفضّل PNG بخلفية شفافة).'));
  },
});

brandsRouter.get('/', (_req, res) => res.json({ items: brandsRepo.list().map(publicBrand) }));

brandsRouter.get('/:id', wrap(async (req, res) => res.json(publicBrand(getBrand(req.params.id)))));

brandsRouter.post(
  '/',
  wrap(async (req, res) => {
    const input = BrandInput.parse(req.body);
    res.status(201).json(publicBrand(brandsRepo.add({ ...input, logo: null })));
  }),
);

brandsRouter.put(
  '/:id',
  wrap(async (req, res) => {
    const brand = getBrand(req.params.id);
    const input = BrandInput.parse(req.body);
    res.json(publicBrand(brandsRepo.update(brand.id, { ...input, logo: brand.logo || null })));
  }),
);

brandsRouter.delete(
  '/:id',
  wrap(async (req, res) => {
    const brand = getBrand(req.params.id);
    if (brandsRepo.count() <= 1) {
      throw new AppError('LAST_BRAND', 400, 'لازم يفضل براند واحد على الأقل. أضف براند جديد قبل ما تحذف ده.', 'Keep at least one brand. Add another brand before deleting this one.');
    }
    removeLogoFile(brand);
    brandsRepo.remove(brand.id);
    res.json({ ok: true });
  }),
);

brandsRouter.post(
  '/:id/logo',
  (req, _res, next) => {
    try {
      getBrand(req.params.id);
      next();
    } catch (err) {
      next(err);
    }
  },
  logoUpload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) throw errors.validation('No logo received', 'لم يتم استلام اللوجو.');
    const brand = getBrand(req.params.id);
    removeLogoFile(brand);
    res.json(publicBrand(brandsRepo.update(brand.id, { ...brand, logo: req.file.filename })));
  }),
);

brandsRouter.delete(
  '/:id/logo',
  wrap(async (req, res) => {
    const brand = getBrand(req.params.id);
    removeLogoFile(brand);
    res.json(publicBrand(brandsRepo.update(brand.id, { ...brand, logo: null })));
  }),
);

const lines = (list, n, max) => (list || []).map((x) => String(x).trim().slice(0, max)).filter(Boolean).slice(0, n);

// Drafts a full brand from a website and/or a short description. Nothing is saved until the user saves it.
brandsRouter.post(
  '/draft',
  wrap(async (req, res) => {
    const input = BrandDraftRequest.parse(req.body);
    const page = input.url.trim() ? await scrapePage(input.url.trim(), { colors: true }) : null;
    const ai = await draftBrand({ page, notes: input.notes.trim(), language: input.language });
    const host = page ? new URL(page.url).host.replace(/^www\./, '') : '';
    const visual = cleanVisual({
      ...Object.fromEntries(Object.entries(ai.colors || {}).filter(([, c]) => isHex(c))),
      look: ai.look,
      fontLatin: ai.fontLatin,
      fontArabic: ai.fontArabic,
    });
    const draft = BrandInput.parse({
      name: { ar: ai.name.ar.slice(0, 80), en: ai.name.en.slice(0, 80) },
      tagline: { ar: ai.tagline.ar.slice(0, 200), en: ai.tagline.en.slice(0, 200) },
      category: ai.category.slice(0, 300),
      website: host.slice(0, 120),
      contact: '',
      description: ai.description.slice(0, 3000),
      audience: ai.audience.slice(0, 1500),
      features: ai.features.slice(0, 4000),
      voice: ai.voice.slice(0, 3000),
      glossary: ai.glossary.slice(0, 1500),
      rules: ai.rules.slice(0, 2000),
      ctas: { ar: lines(ai.ctas.ar, 6, 120), en: lines(ai.ctas.en, 6, 120) },
      hashtags: lines(ai.hashtags, 10, 60).map((h) => (h.startsWith('#') ? h : `#${h}`)),
      banned: [],
      visual,
    });
    res.json({ draft, siteColors: page?.colors || [] });
  }),
);
