#!/usr/bin/env node
/**
 * Post-build prerenderer.
 *
 * Serves the built `dist/` as an SPA, drives a headless browser to each route,
 * lets the app fetch its data and finish entry animations, then snapshots the
 * fully-rendered HTML back into `dist/<route>/index.html`. Crawlers and social
 * scrapers then get real content + per-page <head> tags without any server.
 *
 * It also writes `dist/sitemap.xml` from the same route list.
 *
 * Dynamic routes (blog/case-study slugs) are read from the Firestore REST API,
 * so a rebuild picks up newly published content. Run it as part of the build:
 *   npm run build:static
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 5178;
const ORIGIN = `http://localhost:${PORT}`;
const SITE_URL = 'https://ietech.ai';

// --- read Firebase config from .env (project id + api key) --------------------
function loadEnv() {
  const env = {};
  try {
    const raw = existsSync(join(ROOT, '.env')) ? readFileSync(join(ROOT, '.env'), 'utf8') : '';
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

async function fetchSlugs(projectId, apiKey, collection) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}&pageSize=300`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents || []).map((d) => d.name.split('/').pop());
  } catch {
    return [];
  }
}

// --- minimal static server with SPA fallback ---------------------------------
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.vcf': 'text/vcard', '.xml': 'application/xml', '.txt': 'text/plain',
};

function startServer(template) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        const filePath = join(DIST, urlPath);
        // SPA route (no extension) or missing file -> serve the ORIGINAL template
        // shell from memory. We must NOT read index.html from disk here: once we
        // prerender "/", dist/index.html becomes the homepage snapshot, and reusing
        // it as the shell would bake the homepage's <head> tags into every route.
        if (!extname(urlPath) || !existsSync(filePath)) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(template);
          return;
        }
        const body = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(500);
        res.end('err');
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

// --- render one route --------------------------------------------------------
async function renderRoute(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  // NOTE: don't use networkidle0 — Firebase Auth/Firestore hold persistent
  // connections that never go idle. Load the DOM, then wait for content signals.
  await page.goto(`${ORIGIN}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait until the app has rendered real content: an <h1> exists and no spinner.
  await page
    .waitForFunction(
      () => document.querySelector('h1') && !document.querySelector('.animate-spin'),
      { timeout: 15000 },
    )
    .catch(() => {});

  // Trigger whileInView animations by scrolling the full page, then return to top.
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y < document.body.scrollHeight) setTimeout(step, 120);
        else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
      };
      step();
    });
  });

  await new Promise((r) => setTimeout(r, 500));

  const html = await page.content();
  await page.close();
  return `<!doctype html>\n${html.replace(/^<!doctype html>/i, '').trim()}`;
}

async function writeRoute(route, html) {
  const dir = route === '/' ? DIST : join(DIST, route);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html, 'utf8');
}

function buildSitemap(routes) {
  const urls = routes
    .filter((r) => r !== '/404')
    .map((r) => {
      const loc = `${SITE_URL}${r === '/' ? '/' : r}`;
      const priority = r === '/' ? '1.0' : r.includes('/blog/') || r.includes('/project/') ? '0.7' : '0.8';
      const freq = r === '/' || r === '/blogs' || r === '/projects' ? 'weekly' : 'monthly';
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }
  const env = loadEnv();
  const projectId = env.VITE_FIREBASE_PROJECT_ID || 'ietech-ai';
  const apiKey = env.VITE_FIREBASE_API_KEY || '';

  const [blogSlugs, caseSlugs] = await Promise.all([
    apiKey ? fetchSlugs(projectId, apiKey, 'blogs') : [],
    apiKey ? fetchSlugs(projectId, apiKey, 'case_studies') : [],
  ]);

  const routes = [
    '/', '/blogs', '/projects', '/404',
    ...blogSlugs.map((s) => `/blog/${s}`),
    ...caseSlugs.map((s) => `/project/${s}`),
  ];
  console.log(`[prerender] ${routes.length} routes (${blogSlugs.length} blogs, ${caseSlugs.length} case studies)`);

  // Capture the pristine shell BEFORE any route (including "/") overwrites index.html.
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  // Persist the pristine shell for nginx to serve as the client-side fallback for
  // not-yet-prerendered /blog/* and /project/* slugs (new CMS posts before a rebuild).
  // It must NOT be the homepage snapshot, or homepage content/meta would leak onto
  // those URLs; this pristine template has an empty #root and no per-page meta, so
  // the client renders the correct post + tags.
  await writeFile(join(DIST, '_shell.html'), template, 'utf8');
  const server = await startServer(template);

  // Launch the browser. If Chromium is unavailable (e.g. a constrained CI/Docker
  // build), DON'T fail the whole build: the vite output is already a working SPA.
  // Emit a homepage-only sitemap and exit 0 so the deploy still ships. This trades
  // the SSR/SEO benefit for guaranteed deployability, and logs it loudly.
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (e) {
    console.error('\n[prerender] ⚠️  Could not launch Chromium — SKIPPING prerender.');
    console.error(`[prerender] ⚠️  ${e.message}`);
    console.error('[prerender] ⚠️  Falling back to client-rendered SPA shells (no per-route static SEO).');
    console.error('[prerender] ⚠️  Fix Chromium in the build environment to restore prerendering.\n');
    // Write the plain SPA shell to every known route so nginx still serves valid
    // routes (200, client-rendered) and 404s unknown ones — same routing contract
    // as the prerendered build, just without the baked-in per-page HTML/meta.
    for (const route of routes) {
      const target = route === '/404' ? '/404' : route;
      await writeRoute(target, template);
    }
    await writeFile(join(DIST, '404.html'), template, 'utf8');
    await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(routes), 'utf8');
    server.close();
    return; // exit 0 — deployable SPA
  }

  let ok = 0;
  for (const route of routes) {
    try {
      const html = await renderRoute(browser, route);
      const target = route === '/404' ? '/404' : route;
      await writeRoute(target, html);
      // 404.html at dist root for nginx error_page.
      if (route === '/404') await writeFile(join(DIST, '404.html'), html, 'utf8');
      ok++;
      console.log(`[prerender] ✓ ${route}`);
    } catch (e) {
      console.error(`[prerender] ✗ ${route}: ${e.message}`);
    }
  }

  await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(routes), 'utf8');
  console.log(`[prerender] sitemap.xml written (${routes.length - 1} urls)`);

  await browser.close();
  server.close();
  console.log(`[prerender] done: ${ok}/${routes.length} routes prerendered`);

  // If the browser launched but every route failed, something is genuinely broken
  // (bad build, server not serving) — fail so it's caught before deploy.
  if (ok === 0) {
    console.error('[prerender] ✗ browser launched but 0 routes rendered — failing.');
    process.exit(1);
  }
}

main();
