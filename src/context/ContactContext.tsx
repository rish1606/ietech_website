import { createContext, useContext, useState, type ReactNode } from 'react';
import ContactModal from '../components/ContactModal';

type ContactContextType = {
  openContact: () => void;
  closeContact: () => void;
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

/**
 * Provides a single shared Contact modal for the whole app so any route can
 * open it without prop-drilling through the router Outlet.
 */
export function ContactProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openContact = () => setIsOpen(true);
  const closeContact = () => setIsOpen(false);

  return (
    <ContactContext.Provider value={{ openContact, closeContact }}>
      {children}
      <ContactModal isOpen={isOpen} onClose={closeContact} />
    </ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error('useContact must be used within a ContactProvider');
  return ctx;
}
