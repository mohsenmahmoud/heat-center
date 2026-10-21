/**
 * End-to-end check of both tabs in a real browser, against the built app in demo mode:
 *   Tab 1: upload image → write script → edit → preview → render MP4 → download → history
 *   Tab 2: generate week → edit (autosave) → regenerate a day → export Markdown/Word → copy all
 *   Tab 3: draft a new brand with AI → restyle → logo → save → video in that brand → switch back
 * Usage: npm run test:e2e   (needs a Chromium: `npx playwright-core install chromium`,
 * or point E2E_BROWSER at any Chrome/Chromium binary).
 */
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 5198;
const BASE = `http://127.0.0.1:${PORT}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qms-e2e-'));
const shots = path.join(root, 'tests/e2e/screenshots');
fs.mkdirSync(shots, { recursive: true });

const results = [];
const step = async (name, fn) => {
  const t0 = Date.now();
  try {
    await fn();
    results.push(`  ✓ ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    console.log(results.at(-1));
  } catch (err) {
    console.log(`  ✗ ${name}\n    ${err.message.split('\n').slice(0, 4).join('\n    ')}`);
    throw err;
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

console.log('Building web UI…');
execSync('npx vite build', { cwd: root, stdio: 'ignore' });

const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.js'], {
  cwd: root,
  env: { ...process.env, MQS_SKIP_DOTENV: '1', MOCK_AI: 'true', PORT: String(PORT), DATA_DIR: dataDir, APP_PASSWORD: '' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => d.toString().includes('Marketing Studio') && resolve());
  server.on('exit', (code) => reject(new Error(`server exited with ${code}`)));
});

// E2E_BROWSER drives the test; BROWSER_EXECUTABLE (if set) is what the server's renderer uses.
const browser = await chromium.launch({ executablePath: process.env.E2E_BROWSER || undefined });
const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));

let exitCode = 0;
try {
  console.log('\nApp shell');
  await step('opens in Arabic, right-to-left, dark theme', async () => {
    await page.goto(BASE);
    await page.getByRole('tab', { name: 'مولّد الفيديو' }).waitFor();
    assert((await page.getAttribute('html', 'dir')) === 'rtl', 'expected dir=rtl');
    assert(await page.evaluate(() => document.documentElement.classList.contains('dark')), 'expected dark theme');
  });
  await step('switches to English (LTR) and light theme, then back', async () => {
    await page.getByTitle('Language').click();
    await page.getByRole('tab', { name: 'Motion Video' }).waitFor();
    assert((await page.getAttribute('html', 'dir')) === 'ltr', 'expected dir=ltr');
    await page.getByRole('button', { name: 'Theme' }).click();
    assert(!(await page.evaluate(() => document.documentElement.classList.contains('dark'))), 'expected light theme');
    await page.screenshot({ path: path.join(shots, '00-light-en.png') });
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByTitle('Language').click();
    await page.getByRole('tab', { name: 'مولّد الفيديو' }).waitFor();
  });

  console.log('\nTab 1: Motion Video Generator');
  await step('uploads a product screenshot', async () => {
    const png = path.join(dataDir, 'dashboard.png');
    // 2x1 landscape PNG → rendered inside the browser-window mockup.
    fs.writeFileSync(png, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGNgYPj/n4GBgQEADvoB/1vQ4z8AAAAASUVORK5CYII=', 'base64'));
    await page.locator('[data-testid=image-input]').setInputFiles(png);
    await page.locator('img[alt="dashboard.png"]').waitFor();
  });
  await step('writes a script from a topic', async () => {
    await page.getByPlaceholder('مثال: الميزة الجديدة').fill('تذكير الأقساط التلقائي');
    await page.locator('[data-testid=write-script]').click();
    await page.locator('[data-testid=scene]').first().waitFor({ timeout: 60000 });
    const n = await page.locator('[data-testid=scene]').count();
    assert(n >= 6, `expected ≥6 scenes, got ${n}`);
  });
  await step('gives every scene a picture: AI images, plus the uploaded screenshot framed on its scene', async () => {
    await page.locator('[data-testid=visuals-progress]').waitFor({ state: 'detached', timeout: 60000 });
    const kinds = await page.locator('[data-testid=visual-kind]').allInnerTexts();
    assert(kinds.filter((k) => k === 'صورة AI').length >= 4, `expected AI images on most scenes, got ${kinds.join(' | ')}`);
    assert(kinds.some((k) => k.startsWith('لقطة شاشة')), 'the uploaded screenshot should be pinned and shown on a device');
    assert((await page.locator('[data-testid=screenshot-hint]').count()) >= 3, 'scenes should suggest which image to use');
  });
  await step('replaces one scene image with a new AI image and with the user\'s own image', async () => {
    const card = page.locator('[data-testid=scene-visual]').first();
    const before = await card.locator('img').getAttribute('src');
    await card.locator('[data-testid=ai-image]').click();
    await page.waitForFunction(([b]) => document.querySelector('[data-testid=scene-visual] img')?.getAttribute('src') !== b, [before], { timeout: 30000 });
    await card.locator('[data-testid=scene-image-input]').setInputFiles(path.join(dataDir, 'dashboard.png'));
    await card.locator('[data-testid=visual-kind]', { hasText: 'لقطة شاشة' }).waitFor({ timeout: 30000 });
    await card.locator('[data-testid=callout]').fill('جدول التحصيل');
  });
  await step('edits a scene headline and shows it in the live preview', async () => {
    const headline = page.locator('[data-testid=scene]').first().getByLabel('العنوان على الشاشة');
    await headline.fill('آخر الشهر بدون فوضى');
    const player = page.locator('.__remotion-player').first();
    await player.waitFor();
    // Seek to ~2s and check the frame actually painted something (not a blank/black box).
    await page.waitForTimeout(1500);
    await player.click({ position: { x: 150, y: 150 } });
    await page.waitForTimeout(2200);
    await player.click({ position: { x: 150, y: 150 } });
    const shot = await player.screenshot({ path: path.join(shots, '01b-preview.png') });
    assert(shot.length > 15000, 'preview player looks empty');
    await page.screenshot({ path: path.join(shots, '01-video-script.png') });
  });
  await step('renders the MP4 with live progress', async () => {
    await page.locator('[data-testid=render]').click();
    await page.locator('[data-testid=render-progress]').waitFor({ timeout: 15000 });
    await page.screenshot({ path: path.join(shots, '02-video-rendering.png') });
    await page.locator('[data-testid=render-result], [role=alert]').first().waitFor({ timeout: 6 * 60 * 1000 });
    const failed = await page.locator('[role=alert]').count();
    assert(!failed, `render failed: ${failed && (await page.locator('[role=alert]').first().innerText())}`);
    await page.screenshot({ path: path.join(shots, '03-video-done.png') });
  });
  await step('downloads a valid 40–60s MP4 and lists it in history', async () => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-testid=render-result] a[download]').click()]);
    const file = path.join(dataDir, 'download.mp4');
    await download.saveAs(file);
    const head = fs.readFileSync(file).subarray(4, 8).toString();
    assert(head === 'ftyp', 'downloaded file is not an MP4');
    const history = await (await fetch(`${BASE}/api/video/history`)).json();
    assert(history.items.length === 1, 'history should have one video');
    const d = history.items[0].durationSec;
    assert(d >= 40 && d <= 60, `duration ${d}s outside 40–60s`);
    await page.locator('[data-testid=history] article').first().waitFor();
  });

  console.log('\nTab 2: Weekly Content Planner');
  await step('generates a 7-day video plan and writes every day\'s script', async () => {
    await page.getByRole('tab', { name: 'الخطة الأسبوعية' }).click();
    await page.locator('[data-testid=generate-plan]').click();
    await page.locator('[data-testid=post-card]').first().waitFor({ timeout: 60000 });
    const n = await page.locator('[data-testid=post-card]').count();
    assert(n === 7, `expected 7 posts, got ${n}`);
    await page.locator('[data-testid=scripts-progress]', { hasText: '7/7' }).waitFor({ timeout: 5 * 60 * 1000 });
    assert((await page.locator('[data-testid=open-in-video]').count()) === 7, 'every day should have a script');
    await page.screenshot({ path: path.join(shots, '04-planner.png'), fullPage: true });
  });
  await step('autosaves an edited hook', async () => {
    const card = page.locator('[data-testid=post-card]').first();
    await card.locator('textarea').first().fill('هوك معدّل للاختبار');
    await card.getByText('تم الحفظ').waitFor({ timeout: 5000 });
    const plans = await (await fetch(`${BASE}/api/planner`)).json();
    const plan = await (await fetch(`${BASE}/api/planner/${plans.items[0].id}`)).json();
    assert(plan.posts[0].hook === 'هوك معدّل للاختبار', 'edit was not saved');
  });
  await step('opens a day in the video generator, renders it and marks the day as produced', async () => {
    await page.locator('[data-testid=post-card]').first().locator('[data-testid=open-in-video]').click();
    await page.locator('[data-testid=plan-source]').waitFor();
    const scenes = await page.locator('[data-testid=scene]').count();
    assert(scenes >= 6, `expected the plan script in the editor, got ${scenes} scenes`);
    await page.locator('[data-testid=render]').click();
    await page.locator('[data-testid=render-result], [role=alert]').first().waitFor({ timeout: 6 * 60 * 1000 });
    assert(!(await page.locator('[role=alert]').count()), 'render from plan failed');
    await page.getByRole('tab', { name: 'الخطة الأسبوعية' }).click();
    await page.locator('[data-testid=post-card]').first().locator('[data-testid=produced]').waitFor({ timeout: 10000 });
    await page.screenshot({ path: path.join(shots, '05-planner-produced.png') });
  });
  await step('regenerates one day (and rewrites its script)', async () => {
    const card = page.locator('[data-testid=post-card]').nth(1);
    const before = await card.locator('textarea').first().inputValue();
    await card.locator('[data-testid=regen]').click();
    await card.getByPlaceholder('تعليمات اختيارية').fill('اجعله عن الشهادات');
    await card.getByRole('button', { name: 'إعادة توليد' }).first().click();
    await page.waitForFunction(
      ([b]) => document.querySelectorAll('[data-testid=post-card]')[1].querySelector('textarea').value !== b,
      [before],
      { timeout: 60000 },
    );
    await page.locator('[data-testid=scripts-progress]', { hasText: '7/7' }).waitFor({ timeout: 2 * 60 * 1000 });
  });
  await step('exports Markdown and Word', async () => {
    for (const [id, ext] of [['export-md', '.md'], ['export-docx', '.docx']]) {
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator(`[data-testid=${id}]`).click()]);
      assert(download.suggestedFilename().endsWith(ext), `expected ${ext}, got ${download.suggestedFilename()}`);
      const file = path.join(dataDir, `plan${ext}`);
      await download.saveAs(file);
      assert(fs.statSync(file).size > 500, `${ext} export looks empty`);
    }
  });
  await step('copies the whole plan to the clipboard', async () => {
    await page.getByRole('button', { name: 'نسخ الكل' }).click();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    assert(text.includes('هوك معدّل للاختبار') && text.split('———').length === 7, 'clipboard does not contain the plan');
  });

  console.log('\nTab 3: Brands');
  let brandId;
  await step('drafts a new brand from a brief, restyles it and saves it with a logo', async () => {
    await page.getByRole('tab', { name: 'البراندات' }).click();
    await page.locator('[data-testid=brand-list] button').first().waitFor();
    await page.locator('[data-testid=draft-notes]').fill('لومن: إضاءة ذكية للكافيهات والمطاعم');
    await page.locator('[data-testid=draft-brand]').click();
    await page.waitForFunction(() => document.querySelector('[data-testid=brand-name-ar]')?.value === 'لومن', null, { timeout: 30000 });
    await page.getByRole('button', { name: 'داكن فخم' }).click();
    await page.locator('[data-testid=logo-input]').setInputFiles(path.join(dataDir, 'dashboard.png'));
    await page.locator('[data-testid=save-brand]').click();
    await page.getByText('تم حفظ البراند').waitFor({ timeout: 10000 });
    const brands = await (await fetch(`${BASE}/api/brands`)).json();
    assert(brands.items.length === 2, `expected 2 brands, got ${brands.items.length}`);
    const lumen = brands.items.find((b) => b.name.ar === 'لومن');
    assert(lumen.visual.look === 'dark' && lumen.logoUrl, 'look or logo not saved');
    brandId = lumen.id;
    assert((await page.locator('[data-testid=brand-switcher]').inputValue()) === brandId, 'new brand should become the current brand');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(shots, '06-brands.png') });
  });
  await step('writes and renders a video in the new brand, with its own history', async () => {
    await page.getByRole('tab', { name: 'مولّد الفيديو' }).click();
    await page.locator('[data-testid=history] article').first().waitFor({ state: 'detached', timeout: 10000 });
    await page.getByPlaceholder('مثال: الميزة الجديدة').fill('إضاءة الكافيه بالليل');
    await page.locator('[data-testid=write-script]').click();
    await page.waitForFunction(() => [...document.querySelectorAll('[data-testid=scene] input')].some((i) => i.value.includes('لومن')), null, { timeout: 60000 });
    await page.locator('[data-testid=render]').click();
    await page.locator('[data-testid=render-result], [role=alert]').first().waitFor({ timeout: 6 * 60 * 1000 });
    assert(!(await page.locator('[role=alert]').count()), 'render in the new brand failed');
    await page.screenshot({ path: path.join(shots, '07-brand-video.png') });
    const mine = await (await fetch(`${BASE}/api/video/history?brandId=${brandId}`)).json();
    assert(mine.items.length === 1 && mine.items[0].script.brandId === brandId, 'video not stored under the new brand');
  });
  await step('switches back to Qudra and sees its own videos', async () => {
    await page.locator('[data-testid=brand-switcher]').selectOption('qudra');
    await page.waitForFunction(() => document.querySelectorAll('[data-testid=history] article').length === 2, null, { timeout: 10000 });
  });

  assert(consoleErrors.length === 0, `browser errors: ${consoleErrors.join(' | ')}`);
  console.log(`\nAll E2E steps passed. Screenshots: ${shots}`);
} catch (err) {
  exitCode = 1;
  await page.screenshot({ path: path.join(shots, 'failure.png'), fullPage: true }).catch(() => {});
  console.error(`\nE2E failed: ${err.message}`);
} finally {
  await browser.close();
  server.kill();
  fs.rmSync(dataDir, { recursive: true, force: true });
  process.exit(exitCode);
}
