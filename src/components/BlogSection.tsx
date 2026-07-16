import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  image?: string;
  excerpt?: string;
  content: string;
  authorName?: string;
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const q = query(collection(db, 'blogs'), limit(3));
        const querySnapshot = await getDocs(q);
        const fetchedPosts: BlogPost[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as BlogPost);
        });
        
        // Sort by date (descending)
        fetchedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <section id="blogs" className="py-24 relative overflow-hidden bg-black text-white">
      {/* Background styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(74,114,164,0.05),transparent_50%)]" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column - Header */}
          <div className="lg:w-1/3 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
                Our<br />Blogs
              </h2>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-sm mb-12">
                Stay updated with our latest insights on AI integration, ERP systems, and modern manufacturing workflows.
              </p>
              
              <div className="relative inline-block group cursor-pointer">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#3F618C]/20 to-[#3F618C]/0 rounded-full blur-xl group-hover:from-[#3F618C]/40 transition-all duration-500" />
                <button 
                  onClick={() => window.location.hash = '#/blog'}
                  className="relative text-sm font-bold tracking-widest uppercase flex items-center gap-2"
                >
                  View All Blogs
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Blog List */}
          <div className="lg:w-2/3 flex flex-col gap-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#3F618C] animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 border border-white/10 bg-black/50 rounded-2xl">
                <h3 className="text-xl text-white font-bold mb-2">No Blogs Found</h3>
                <p className="text-neutral-500 text-sm">Please log in to the CMS (#/admin) to publish your first blog.</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.a
                  key={post.id}
                  href={`#/blog/${post.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex items-start justify-between p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3">
                      <span className="text-[#3F618C]">{post.category || 'Tech'}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-600" />
                      <span className="text-neutral-500">{post.date}</span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-300 max-w-xl">
                      {post.title}
                    </h3>
                  </div>
                  <div className="shrink-0 ml-4 mt-2">
                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-neutral-500 group-hover:text-[#3F618C] transition-colors duration-300" />
                  </div>
                </motion.a>
              ))
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
