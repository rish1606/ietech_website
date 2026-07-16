import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db, auth } from '../lib/firebase';
import { doc as firestoreDoc, setDoc as firestoreSetDoc, getDoc as firestoreGetDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Save, Bold, Heading2, Heading3, Link as LinkIcon, List } from 'lucide-react';

interface AdminCMSProps {
  type: 'blog' | 'case_study';
  editId?: string;
  onBack: () => void;
}

export default function AdminCMS({ type, editId, onBack }: AdminCMSProps) {
  const { user, isLoading: authLoading } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    id: '', // URL Slug
    title: '',
    client: '',
    industry: '',
    category: '', // for blogs
    excerpt: '', // for blogs, analogous to shortDescription
    shortDescription: '', // for case studies
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    authorName: 'IETECH Technical Team',
    authorEmail: 'hello@ietech.com',
    image: '',
    content: ''
  });

  useEffect(() => {
    // Reset or fetch depending on editId and type
    async function initData() {
      if (editId) {
        setIsFetching(true);
        try {
          const collectionName = type === 'blog' ? 'blogs' : 'case_studies';
          const docSnap = await firestoreGetDoc(firestoreDoc(db, collectionName, editId));
          if (docSnap.exists()) {
            setFormData({
              ...formData,
              id: docSnap.id,
              ...docSnap.data()
            });
          } else {
            setMessage('Error: Document not found.');
          }
        } catch (error: any) {
          setMessage('Error: ' + error.message);
        } finally {
          setIsFetching(false);
        }
      } else {
        // Defaults for new
        setFormData(prev => ({
          ...prev,
          id: '',
          title: '',
          client: '',
          industry: '',
          category: 'Engineering',
          excerpt: '',
          shortDescription: '',
          image: '',
          content: type === 'blog' ? '## Introduction\\n\\nWrite your blog here...' : '# The Problem\\n\\nDescribe the problem here...\\n\\n# The Solution\\n\\nDescribe the solution here...'
        }));
      }
    }
    initData();
  }, [editId, type]);

  if (authLoading || isFetching) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#3F618C] animate-spin" /></div>;
  }

  const ALLOWED_ADMIN_EMAILS = ['138aditya@gmail.com'];

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 tracking-tighter">Admin Login</h2>
        <p className="text-neutral-400 mb-8">Please sign in to access the CMS editor.</p>
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
          <button onClick={onBack} className="px-6 py-3 bg-neutral-800 text-white font-bold uppercase tracking-wider text-xs hover:bg-neutral-700 transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;

    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newText = before + prefix + selectedText + suffix + after;
    setFormData({ ...formData, content: newText });

    // Reset cursor position inside the tags
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handlePublish = async () => {
    if (!formData.id) {
      setMessage("Error: You must provide a URL Slug (id).");
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      const collectionName = type === 'blog' ? 'blogs' : 'case_studies';
      const docRef = firestoreDoc(db, collectionName, formData.id);
      
      // Clean up data based on type before saving
      const dataToSave: any = {
        title: formData.title,
        date: formData.date,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        image: formData.image,
        content: formData.content,
      };

      if (type === 'case_study') {
        dataToSave.client = formData.client;
        dataToSave.industry = formData.industry;
        dataToSave.shortDescription = formData.shortDescription;
      } else {
        dataToSave.category = formData.category;
        dataToSave.excerpt = formData.excerpt;
      }

      await firestoreSetDoc(docRef, dataToSave);
      setMessage(`Success: ${type === 'blog' ? 'Blog' : 'Case study'} published!`);
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col overflow-hidden h-screen">
      
      {/* CMS Header */}
      <div className="flex-none bg-black border-b border-neutral-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-neutral-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">
            {editId ? 'Edit ' : 'New '} {type === 'blog' ? 'Blog Post' : 'Case Study'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</span>}
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#3F618C] text-black px-6 py-2 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish to Live
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Editor Form */}
        <div className="w-1/2 flex flex-col border-r border-neutral-800 bg-[#111] overflow-y-auto p-6 custom-scrollbar">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6">Metadata</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">URL Slug (ID)</label>
              <input name="id" value={formData.id} onChange={handleChange} disabled={!!editId} placeholder="e.g. tirupati-erp" className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Date</label>
              <input name="date" value={formData.date} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} placeholder="Main Heading" className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
            </div>

            {/* Case Study Specific Fields */}
            {type === 'case_study' && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Client Name</label>
                  <input name="client" value={formData.client} onChange={handleChange} placeholder="e.g. Tirupati Group" className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Industry</label>
                  <input name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Logistics" className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Short Description (Grid View)</label>
                  <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="A short 1-2 sentence summary..." className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
                </div>
              </>
            )}

            {/* Blog Specific Fields */}
            {type === 'blog' && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Category</label>
                  <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Engineering" className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Excerpt (Short Summary)</label>
                  <input name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="A short summary of the blog..." className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Author Name</label>
              <input name="authorName" value={formData.authorName} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Author Email</label>
              <input name="authorEmail" value={formData.authorEmail} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Cover Image URL</label>
              <input name="image" value={formData.image} onChange={handleChange} placeholder="/projects/gautam_building.jpg OR https://..." className="w-full bg-black border border-neutral-800 text-white p-2 text-sm focus:border-[#3F618C] outline-none" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Markdown Content</h2>
            
            {/* Formatting Toolbar */}
            <div className="flex gap-1 bg-black border border-neutral-800 p-1">
              <button title="Bold" onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <Bold className="w-4 h-4" />
              </button>
              <button title="Heading 2" onClick={() => insertMarkdown('\\n## ', '')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <Heading2 className="w-4 h-4" />
              </button>
              <button title="Heading 3" onClick={() => insertMarkdown('\\n### ', '')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <Heading3 className="w-4 h-4" />
              </button>
              <button title="Bullet List" onClick={() => insertMarkdown('\\n- ', '')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <List className="w-4 h-4" />
              </button>
              <button title="Link" onClick={() => insertMarkdown('[', '](https://)')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea 
            ref={textareaRef}
            name="content" 
            value={formData.content} 
            onChange={handleChange} 
            className="w-full flex-1 min-h-[400px] bg-black border border-neutral-800 text-neutral-300 p-4 text-sm font-mono focus:border-[#3F618C] outline-none resize-y"
          />
        </div>

        {/* Right Side: Live Preview (Adapts based on Type) */}
        <div className="w-1/2 bg-black overflow-y-auto custom-scrollbar">
          <div className="p-8 pb-32 max-w-4xl mx-auto">
            
            <div className="mb-6 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#3F618C] inline-block">
                {type === 'blog' ? formData.category || 'CATEGORY' : 'CASE STUDY'} PREVIEW
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 text-center mx-auto leading-[1.1]">
              {formData.title || "Untitled Document"}
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-400 mb-12">
              <span>{formData.date}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              <span>By {formData.authorName}</span>
            </div>

            {formData.image && (
              <div className="w-full aspect-[21/9] bg-neutral-900 border border-neutral-800 mb-16 overflow-hidden">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {type === 'case_study' ? (
              // CASE STUDY PREVIEW FORMAT
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Written by</p>
                  <p className="text-sm font-bold text-white mb-4">{formData.authorName}</p>
                  <a className="text-xs text-[#3F618C] uppercase tracking-wider font-bold inline-block border-b border-[#3F618C] pb-0.5">
                    Reach out to writer
                  </a>
                </div>

                <div className="md:col-span-3">
                  <div className="prose prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-xl prose-h1:uppercase prose-h1:tracking-widest prose-h1:text-[#3F618C] prose-h1:mt-12 prose-h1:mb-4
                    prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:text-[15px]
                    prose-li:text-neutral-400 prose-li:text-[15px]
                    prose-strong:text-white
                    [&>p:first-of-type]:text-xl [&>p:first-of-type]:md:text-[22px] [&>p:first-of-type]:text-neutral-200 [&>p:first-of-type]:font-medium
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              // BLOG PREVIEW FORMAT
              <div className="prose prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                prose-h1:text-2xl prose-h1:md:text-3xl prose-h1:mb-6
                prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-10
                prose-h3:text-lg prose-h3:md:text-xl
                prose-a:text-blue-400 hover:prose-a:text-blue-300
                prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:text-base
                prose-li:text-neutral-300 prose-li:text-base
                prose-strong:text-white prose-strong:font-bold
                prose-blockquote:border-l-[#3F618C] prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-neutral-200"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content}
                </ReactMarkdown>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
