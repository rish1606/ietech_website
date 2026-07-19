import { Link } from 'react-router-dom';
import Seo from './Seo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <Seo title="Page Not Found" path="/404" noindex />
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#3F618C] mb-4">
        Error 404
      </p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
        Page not found
      </h1>
      <p className="text-neutral-400 max-w-md mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-200 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
