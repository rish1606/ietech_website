import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import AdminCMS from './components/AdminCMS';

// Add a simple URL parser helper
function parseQueryParams(url: string) {
  const parts = url.split('?');
  if (parts.length < 2) return new URLSearchParams();
  return new URLSearchParams(parts[1]);
}
import Products from './components/Products';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import HowWeThink from './components/HowWeThink';
import BlogSection from './components/BlogSection';
import BlogDetail from './components/BlogDetail';
import './index.css';

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.hash);
  const openContact = () => setContactOpen(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === 'rishi') {
      // Trigger the vCard download
      const link = document.createElement('a');
      link.href = '/profile.vcf';
      link.download = 'profile.vcf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL so it doesn't keep downloading on page refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash;
      setRoute(newHash);
      
      // Only force scroll to top if navigating to a completely new "page" (like a blog or project detail).
      // Standard anchor links (#about, #services) should rely on the browser's native smooth scroll.
      if (newHash.startsWith('#/')) {
        window.scrollTo({ top: 0, behavior: 'instant' as any });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle simple route parsing
  const isProjectRoute = route.startsWith('#/project/');
  const activeProjectId = isProjectRoute ? route.substring('#/project/'.length) : null;

  const isBlogRoute = route.startsWith('#/blog/');
  const activeBlogSlug = isBlogRoute ? route.substring('#/blog/'.length) : null;

  if (isProjectRoute && activeProjectId) {
    return (
      <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
        <Navbar />
        <ProjectDetail 
          projectId={activeProjectId} 
          onBack={() => {
            window.location.hash = '#/projects';
          }} 
        />
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    );
  }

  if (isBlogRoute && activeBlogSlug) {
    return (
      <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
        <Navbar />
        <BlogDetail 
          slug={activeBlogSlug} 
          onBack={() => {
            window.location.hash = '#/blogs';
          }} 
        />
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    );
  }

  if (route === '#/admin') {
    return (
      <AdminDashboard onNavigate={(newRoute) => {
        window.location.hash = newRoute;
      }} />
    );
  }

  if (route.startsWith('#/admin/edit')) {
    const params = parseQueryParams(route);
    const type = params.get('type') as 'blog' | 'case_study' || 'blog';
    const id = params.get('id') || undefined;

    return (
      <AdminCMS 
        type={type}
        editId={id}
        onBack={() => {
          window.location.hash = '#/admin';
        }} 
      />
    );
  }

  if (route === '#/projects') {
    return (
      <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
        <div className="relative z-10 pt-20">
          <Navbar />
          <Projects />
          <Footer onContactOpen={openContact} />
        </div>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    );
  }

  if (route === '#/blogs') {
    return (
      <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
        <div className="relative z-10 pt-20">
          <Navbar />
          <BlogSection />
          <Footer onContactOpen={openContact} />
        </div>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased transition-colors duration-300 relative">
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <About />
          <HowWeThink />
          <Products onContactOpen={openContact} />
        </main>
        <Footer onContactOpen={openContact} />
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </div>
  );
}
