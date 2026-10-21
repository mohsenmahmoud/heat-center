import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { brandsRepo } from '../db.js';
import { errors } from '../lib/errors.js';
import { QUDRA } from '../brand/qudra.js';
import { cleanVisual } from '../../video/brand-theme.js';

/** First run: the studio starts with Qudra (and its logo), editable like any other brand. */
export function ensureBrands() {
  if (brandsRepo.count() > 0) return;
  let logo = null;
  const source = path.join(config.paths.brand, 'logo.png');
  if (fs.existsSync(source)) {
    logo = `qudra-${crypto.randomBytes(12).toString('hex')}.png`;
    fs.copyFileSync(source, path.join(config.paths.brands, logo));
  }
  const { id, ...data } = QUDRA;
  brandsRepo.add({ ...data, website: config.brand.website, contact: config.brand.whatsapp, logo }, id, { seed: true });
}

export const logoUrl = (brand) => (brand?.logo ? `/brands/${brand.logo}` : null);

/** A brand as the API returns it. */
export const publicBrand = (brand) => ({ ...brand, visual: cleanVisual(brand.visual), logoUrl: logoUrl(brand) });

export function getBrand(id) {
  const brand = brandsRepo.get(id);
  if (!brand) throw errors.notFound('Brand');
  return brand;
}

/** The brand a request names, else the first brand; old work whose brand was deleted falls back too. */
export function resolveBrand(id) {
  return (id && brandsRepo.get(id)) || brandsRepo.list()[0] || { ...QUDRA, logo: null };
}

/** What the video composition needs to draw a brand. */
export const brandProps = (brand) => ({ name: brand.name, website: brand.website || '', visual: cleanVisual(brand.visual) });

export function removeLogoFile(brand) {
  if (brand?.logo) fs.rmSync(path.join(config.paths.brands, path.basename(brand.logo)), { force: true });
}
