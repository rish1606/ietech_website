import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  client: string;
  industry: string;
  status?: string;
  shortDescription?: string;
  date: string;
  authorName: string;
  authorEmail: string;
  image: string;
  content: string;
}

export default function Projects() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(collection(db, 'case_studies'));
        const querySnapshot = await getDocs(q);
        const projects: Project[] = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjectsData(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
  };

  return (
    <section
      id="projects"
      aria-label="Our Projects & Case Studies"
      className="relative pt-16 md:pt-24 pb-24 md:pb-32 bg-transparent transition-colors duration-300 scroll-mt-16 z-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(143,198,242,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="container mx-auto max-w-[1200px] px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto flex flex-col items-center">
          <motion.div {...fadeUp} className="w-full">
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                <div className="h-[1px] w-12 md:w-20 bg-neutral-800" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#3F618C]">
                    Case Studies
                </span>
                <div className="h-[1px] w-12 md:w-20 bg-neutral-800" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white leading-[1.1] mb-4">
              Operational Impact.<br/>
              <span className="text-neutral-500">Built for scale.</span>
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Welcome to our central repository for all case studies and success stories. Here you can explore in-depth technical analyses of the custom software, integrations, and automation pipelines we've built to solve complex industrial problems.
            </p>
          </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#3F618C] animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projectsData.length === 0 && (
          <div className="text-center py-20 border border-white/10 bg-black">
            <h3 className="text-xl text-white font-bold mb-2">No Case Studies Found</h3>
            <p className="text-neutral-500 text-sm">Please log in to the CMS (#/admin) to publish your first case study.</p>
          </div>
        )}

        {/* Simple Grid Layout */}
        {!isLoading && projectsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {projectsData.map((project) => {
              return (
                <div
                  key={project.id}
                  className="bg-transparent border border-white/10 flex flex-col group hover:border-white/30 transition-colors duration-300 relative"
                >
                  {/* Visual Graphic Representation */}
                  <div className="w-full aspect-[4/3] bg-[#0a0a0a] border-b border-white/10 overflow-hidden relative">
                    <img 
                      src={project.image} 
                      alt={`${project.client} Facility`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
                        {project.client}
                      </span>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-3">
                        {project.title}
                      </h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {project.shortDescription || project.content.substring(0, 100) + '...'}
                      </p>
                    </div>

                    {/* Explore More */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <a
                        href={`#/project/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#3F618C] transition-colors group/btn"
                      >
                        <span>Explore more</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
