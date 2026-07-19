import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Seo, { SITE_URL } from './Seo';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  image?: string;
  content: string;
  authorName?: string;
}

interface BlogDetailProps {
  slug: string;
  onBack: () => void;
}

export default function BlogDetail({ slug, onBack }: BlogDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'blogs', slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlog();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-sans">
        <Loader2 className="w-8 h-8 text-[#3F618C] animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Seo title="Post Not Found" path={`/blog/${slug}`} noindex />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <button onClick={onBack} className="text-blue-400 hover:underline">Return to Home</button>
        </div>
      </div>
    );
  }

  // Calculate read time (approx 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const imageAbs = post.image
    ? (post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`)
    : `${SITE_URL}/logo.svg`;
  const description = (post.content || '')
    .replace(/[#*_>`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155) || `${post.title} — insights from i.e tech.`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: imageAbs,
    datePublished: post.date,
    articleSection: post.category,
    author: { '@type': post.authorName ? 'Person' : 'Organization', name: post.authorName || 'i.e tech' },
    publisher: {
      '@type': 'Organization',
      name: 'i.e tech',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.id}`,
  };

  return (
    <article className="min-h-screen bg-black text-white pb-24 font-sans">
      <Seo
        title={post.title}
        path={`/blog/${post.id}`}
        description={description}
        image={imageAbs}
        type="article"
        jsonLd={jsonLd}
      />
      {/* Navbar spacer */}
      <div className="h-24 md:h-32" />

      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {post.image && (
            <div className="w-full aspect-[2/1] md:aspect-[21/9] rounded-2xl md:rounded-[2rem] overflow-hidden mb-12 relative border border-neutral-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <img loading="lazy" decoding="async" 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-400 mb-6">
            <span className="text-[#3F618C]">{post.category || 'Tech'}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span>{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {readTime} min read</span>
            {post.authorName && (
              <>
                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                <span>By {post.authorName}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-12 leading-[1.1]">
            {post.title}
          </h1>

          {/* Markdown Content */}
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
              {post.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </article>
  );
}
