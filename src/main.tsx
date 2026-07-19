import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './hooks/useTheme.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ContactProvider } from './context/ContactContext.tsx'

// NOTE: we intentionally use createRoot (not hydrateRoot) even though pages are
// prerendered. The prerendered HTML is a headless-browser snapshot that captures
// framer-motion's mid-animation inline styles, which would mismatch the client's
// initial render on essentially every animated element. Re-rendering cleanly on
// the client avoids a storm of hydration warnings; the prerendered HTML still does
// its job for crawlers and first paint.
//
// Because we re-render (not hydrate), React 19's native metadata would ADD a second
// copy of the SEO tags on top of the ones baked into the prerendered <head>. Strip
// the prerendered SEO tags first so the <Seo> component's render stays the single
// source of truth (and JS-executing crawlers see exactly one canonical/title).
for (const sel of [
  'title',
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
]) {
  document.head.querySelectorAll(sel).forEach((el) => el.remove());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ContactProvider>
            <App />
          </ContactProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
