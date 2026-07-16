import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, limit, where } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  client: string;
  industry: string;
  date: string;
  authorName: string;
  authorEmail: string;
  image: string;
  content: string;
}

export default function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [otherProjects, setOtherProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'case_studies', projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
          
          // Fetch 3 other case studies for the footer
          const otherQ = query(
            collection(db, 'case_studies'),
            where('__name__', '!=', projectId),
            limit(3)
          );
          const otherSnap = await getDocs(otherQ);
          const others: Project[] = [];
          otherSnap.forEach((d) => others.push({ id: d.id, ...d.data() } as Project));
          setOtherProjects(others);
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProject();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-sans">
        <Loader2 className="w-8 h-8 text-[#3F618C] animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-sans">
        <h2 className="text-2xl font-bold mb-4 tracking-tighter">Project Not Found</h2>
        <button
          onClick={onBack}
          className="px-6 py-3 border border-neutral-800 bg-[#3F618C] text-black font-bold uppercase tracking-wider rounded-none hover:opacity-90 transition-all text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans transition-colors duration-300">
      
      {/* Top sticky header bar */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-800/80 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 pt-16 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Tag -> Title -> Date */}
          <div className="mb-6 text-center">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#3F618C] inline-block">
              CASE STUDY
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6 text-center max-w-4xl mx-auto">
            {project.title}
          </h1>

          <p className="text-sm md:text-base text-neutral-400 font-medium mb-12 text-center">
            {project.date}
          </p>

          {/* Hero Image */}
          {project.image && (
            <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-neutral-900 border border-neutral-800 mb-16 overflow-hidden relative">
              <img 
                src={project.image} 
                alt={project.client}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
            
            {/* Left Sidebar: Writer Info */}
            <div className="md:col-span-1">
              <div className="sticky top-32">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Written by</p>
                <p className="text-sm font-bold text-white mb-4">{project.authorName}</p>
                
                <a 
                  href={`mailto:${project.authorEmail}`}
                  className="text-xs text-[#3F618C] hover:text-white transition-colors uppercase tracking-wider font-bold inline-block border-b border-[#3F618C] pb-0.5 hover:border-white"
                >
                  Reach out to writer
                </a>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="md:col-span-3 space-y-8">
              <div className="prose prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                prose-h1:text-xl prose-h1:uppercase prose-h1:tracking-widest prose-h1:text-[#3F618C] prose-h1:mt-12 prose-h1:mb-4
                prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:text-[15px]
                prose-li:text-neutral-400 prose-li:text-[15px]
                prose-strong:text-white
                [&>p:first-of-type]:text-xl [&>p:first-of-type]:md:text-[22px] [&>p:first-of-type]:text-neutral-200 [&>p:first-of-type]:font-medium
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {project.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer: Other Case Studies */}
      <div className="border-t border-neutral-800 bg-[#0a0a0a] pt-20 pb-24 mt-10">
        <div className="container mx-auto px-4 max-w-5xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">More Case Studies</h2>
              <p className="text-sm text-neutral-500">Explore how we've solved problems for other clients.</p>
            </div>
            <button 
              onClick={onBack}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#3F618C] text-black font-bold uppercase tracking-wider text-xs hover:bg-white transition-colors"
            >
              View All Case Studies <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {otherProjects.map(p => (
              <a 
                key={p.id} 
                href={`#/project/${p.id}`}
                className="group block border border-neutral-800 bg-black overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-900 relative">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="p-6">
                  <span className="text-[10px] text-[#3F618C] uppercase tracking-widest font-bold mb-3 block">Case Study</span>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#3F618C] transition-colors">{p.title}</h3>
                </div>
              </a>
            ))}
          </div>

          <button 
            onClick={onBack}
            className="w-full md:hidden flex items-center justify-center gap-2 px-6 py-4 bg-[#3F618C] text-black font-bold uppercase tracking-wider text-xs hover:bg-white transition-colors"
          >
            View All Case Studies <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
}
