import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Plus, Search, FileText, Briefcase, Pencil } from 'lucide-react';

interface CMSItem {
  id: string;
  type: 'blog' | 'case_study';
  title: string;
  date: string;
  authorName: string;
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CMSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blog' | 'case_study'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const fetchedItems: CMSItem[] = [];
        
        // Fetch Case Studies
        const csQuery = query(collection(db, 'case_studies'));
        const csSnap = await getDocs(csQuery);
        csSnap.forEach((doc) => {
          fetchedItems.push({
            id: doc.id,
            type: 'case_study',
            title: doc.data().title || 'Untitled',
            date: doc.data().date || '',
            authorName: doc.data().authorName || 'Unknown',
          });
        });

        // Fetch Blogs
        const blogQuery = query(collection(db, 'blogs'));
        const blogSnap = await getDocs(blogQuery);
        blogSnap.forEach((doc) => {
          fetchedItems.push({
            id: doc.id,
            type: 'blog',
            title: doc.data().title || 'Untitled',
            date: doc.data().date || '',
            authorName: doc.data().authorName || 'Unknown',
          });
        });

        // Sort by date (descending) -- assuming string format works or just rough sort
        fetchedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching CMS data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (authLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#3F618C] animate-spin" /></div>;
  }

  const ALLOWED_ADMIN_EMAILS = ['138aditya@gmail.com'];

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 tracking-tighter">Admin Login</h2>
        <p className="text-neutral-400 mb-8">Please sign in to access the CMS.</p>
        <button 
          onClick={async () => {
            try {
              const { auth } = await import('../lib/firebase');
              const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
              const provider = new GoogleAuthProvider();
              await signInWithPopup(auth, provider);
            } catch (err) {
              console.error(err);
            }
          }} 
          className="flex items-center gap-3 px-6 py-3 bg-[#3F618C] text-black font-bold uppercase tracking-wider text-xs hover:bg-white transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 tracking-tighter text-red-500">Access Denied</h2>
        <p className="text-neutral-400 mb-8">Your account ({user.email}) is not authorized to access the CMS.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              import('firebase/auth').then(({ signOut }) => {
                import('../lib/firebase').then(({ auth }) => {
                  signOut(auth);
                });
              });
            }}
            className="px-6 py-3 border border-red-500 text-red-500 font-bold uppercase tracking-wider text-xs hover:bg-red-500 hover:text-white transition-colors"
          >
            Sign Out
          </button>
          <button onClick={() => onNavigate('#/')} className="px-6 py-3 bg-neutral-800 text-white font-bold uppercase tracking-wider text-xs hover:bg-neutral-700 transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-neutral-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('#/')} className="text-neutral-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Content Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('#/admin/edit?type=blog')}
            className="flex items-center gap-2 border border-[#3F618C] text-[#3F618C] px-4 py-2 font-bold uppercase tracking-widest text-[10px] hover:bg-[#3F618C] hover:text-black transition-colors"
          >
            <Plus className="w-4 h-4" /> New Blog
          </button>
          <button 
            onClick={() => onNavigate('#/admin/edit?type=case_study')}
            className="flex items-center gap-2 bg-[#3F618C] text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" /> New Case Study
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between mb-8">
          
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filter === 'all' ? 'border-[#3F618C] text-[#3F618C] bg-[#3F618C]/10' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
            >
              All Content
            </button>
            <button 
              onClick={() => setFilter('case_study')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filter === 'case_study' ? 'border-[#3F618C] text-[#3F618C] bg-[#3F618C]/10' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
            >
              Case Studies
            </button>
            <button 
              onClick={() => setFilter('blog')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${filter === 'blog' ? 'border-[#3F618C] text-[#3F618C] bg-[#3F618C]/10' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
            >
              Blogs
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-neutral-800 text-white pl-10 pr-4 py-2 text-sm focus:border-[#3F618C] outline-none"
            />
          </div>

        </div>

        {/* List */}
        <div className="bg-black border border-neutral-800 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-6 h-6 text-[#3F618C] animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              No content found matching your filters.
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer ${index !== filteredItems.length - 1 ? 'border-b border-neutral-800/50' : ''}`}
                onClick={() => onNavigate(`#/admin/edit?type=${item.type}&id=${item.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center shrink-0">
                    {item.type === 'blog' ? <FileText className="w-4 h-4 text-[#3F618C]" /> : <Briefcase className="w-4 h-4 text-[#3F618C]" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold group-hover:text-[#3F618C] transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">{item.type === 'blog' ? 'Blog' : 'Case Study'}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      <span className="text-xs text-neutral-400">{item.date}</span>
                    </div>
                  </div>
                </div>
                
                <button className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
