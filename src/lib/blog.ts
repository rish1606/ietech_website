export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
}

export function parseFrontmatter(markdownContent: string): Omit<BlogPost, 'slug'> {
  const frontmatterRegex = /---\n([\s\S]*?)\n---/;
  const match = frontmatterRegex.exec(markdownContent);
  
  let content = markdownContent;
  const metadata: Record<string, string> = {};

  if (match) {
    const frontmatter = match[1];
    content = markdownContent.replace(match[0], '').trim();

    frontmatter.split('\n').forEach(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex > 0) {
        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        metadata[key] = value;
      }
    });
  }

  return {
    title: metadata.title || 'Untitled',
    date: metadata.date || '',
    category: metadata.category || 'General',
    image: metadata.image || '',
    excerpt: metadata.excerpt || '',
    content
  };
}

export function getAllPosts(): BlogPost[] {
  // Vite feature to import all matching files synchronously
  const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default', eager: true });
  
  const posts: BlogPost[] = Object.entries(modules).map(([path, rawContent]) => {
    // Extract slug from filename (e.g. '../content/blog/my-post.md' -> 'my-post')
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const parsed = parseFrontmatter(rawContent as string);
    
    return {
      slug,
      ...parsed
    };
  });

  // Sort by date descending (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug);
}
