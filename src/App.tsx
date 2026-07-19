import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import HowWeThink from './components/HowWeThink';
import Footer from './components/Footer';
import Seo, { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from './components/Seo';
import NotFound from './components/NotFound';
import { useContact } from './context/ContactContext';
import './index.css';

// Route-level components that never render on the landing page are split into
// their own chunks so they (and their Firebase/markdown/admin code) stay out of
// the initial download.
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminCMS = lazy(() => import('./components/AdminCMS'));
const Projects = lazy(() => import('./components/Projects'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const BlogSection = lazy(() => import('./components/BlogSection'));
const BlogDetail = lazy(() => import('./components/BlogDetail'));

const RouteFallback = () => <div className="min-h-screen bg-black" aria-busy="true" />;

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.svg`,
  description: DEFAULT_DESCRIPTION,
  contactPoint: [
    { '@type': 'ContactPoint', email: 'ceojayraj@ietech.ai', telephone: '+91-9558525296', contactType: 'sales' },
    { '@type': 'ContactPoint', email: 'ctoaditya@ietech.ai', telephone: '+91-9313523728', contactType: 'technical support' },
  ],
};

/** Scroll to top on path change, or to the anchored section when a hash is present. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hash) {
      // Let the target section mount, then scroll to it.
      const id = hash.replace('#', '');
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

/** Legacy support: `?connect=rishi` triggers the vCard download once. */
function useVCardDownload() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === 'rishi') {
      const link = document.createElement('a');
      link.href = '/profile.vcf';
      link.download = 'profile.vcf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
}

function HomePage() {
  const { openContact } = useContact();
  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
      <Seo title="i.e tech | Industry 4.0 Solutions" path="/" jsonLd={ORG_JSONLD} />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <About />
          <HowWeThink />
          <Products onContactOpen={openContact} />
        </main>
        <Footer onContactOpen={openContact} />
      </div>
    </div>
  );
}

function BlogsPage() {
  const { openContact } = useContact();
  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
      <Seo
        title="Blogs & Insights"
        path="/blogs"
        description="Insights on AI integration, custom ERP systems, CAD, and modern manufacturing workflows from the i.e tech team."
      />
      <div className="relative z-10 pt-20">
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
          <BlogSection />
        </Suspense>
        <Footer onContactOpen={openContact} />
      </div>
    </div>
  );
}

function ProjectsPage() {
  const { openContact } = useContact();
  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
      <Seo
        title="Customers & Case Studies"
        path="/projects"
        description="Real-world Industry 4.0 deployments: ERP, CNC, foundry, casting and logistics case studies delivered by i.e tech."
      />
      <div className="relative z-10 pt-20">
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
          <Projects />
        </Suspense>
        <Footer onContactOpen={openContact} />
      </div>
    </div>
  );
}

function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <ProjectDetail projectId={slug || ''} onBack={() => navigate('/projects')} />
      </Suspense>
    </div>
  );
}

function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <BlogDetail slug={slug || ''} onBack={() => navigate('/blogs')} />
      </Suspense>
    </div>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  return (
    <>
      <Seo title="Admin" path="/admin" noindex />
      <Suspense fallback={<RouteFallback />}>
        <AdminDashboard onNavigate={(route) => navigate(hashToPath(route))} />
      </Suspense>
    </>
  );
}

function AdminEditPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const type = (params.get('type') as 'blog' | 'case_study') || 'blog';
  const id = params.get('id') || undefined;
  return (
    <>
      <Seo title="Edit Content" path="/admin/edit" noindex />
      <Suspense fallback={<RouteFallback />}>
        <AdminCMS type={type} editId={id} onBack={() => navigate('/admin')} />
      </Suspense>
    </>
  );
}

/** Translate any legacy `#/...` route strings still passed by children to paths. */
function hashToPath(route: string): string {
  return route.replace(/^#/, '') || '/';
}

export default function App() {
  useVCardDownload();
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/project/:slug" element={<ProjectDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/edit" element={<AdminEditPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
