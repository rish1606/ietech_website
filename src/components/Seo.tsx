const SITE_URL = 'https://ietech.ai';
const SITE_NAME = 'i.e tech';
const DEFAULT_DESCRIPTION =
  'Realising Industry 4.0 in real-world industries through AI, software, and intelligent hardware engineering.';
const DEFAULT_IMAGE = `${SITE_URL}/logo.svg`;

interface SeoProps {
  title: string;
  description?: string;
  /** Path only, e.g. "/blogs" or "/blog/my-post". Leading slash required. */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  /** Optional JSON-LD object injected as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown>;
  /** Set true on pages that must never be indexed (e.g. admin). */
  noindex?: boolean;
}

/**
 * Per-page <head> management using React 19's native document metadata: the
 * <title>/<meta>/<link> below are automatically hoisted into <head>, and are
 * removed when this component unmounts (route change). We deliberately do NOT
 * use react-helmet-async — under React 19 it double-manages these tags with the
 * native hoisting and produces duplicate <title>/<link rel=canonical> tags.
 *
 * Because pages are prerendered with a headless browser, whatever ends up in
 * <head> here is captured into the static HTML crawlers and scrapers read.
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
  noindex = false,
}: SeoProps) {
  const canonical = `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}

export { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION };
