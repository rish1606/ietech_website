import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import './index.css';

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);

  return (
    <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white font-sans antialiased transition-colors duration-300">
      <Navbar onContactOpen={openContact} />
      <main>
        <Hero />
        <Products onContactOpen={openContact} />
        <Footer onContactOpen={openContact} />
      </main>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
