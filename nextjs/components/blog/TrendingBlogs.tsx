'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  author?: {
    id: number;
    username: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function TrendingBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/blog?status=published&limit=6&offset=0`);
      const data = await response.json();
      const fetchedPosts = data.data || [];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return 'text-emerald-400';
    const nameUpper = categoryName.toUpperCase();
    const colors: { [key: string]: string } = {
      'PRODUCT': 'text-emerald-400',
      'CASE STUDY': 'text-cyan-400',
      'CASE-STUDY': 'text-cyan-400',
      'HOW TO': 'text-blue-400',
      'HOW-TO': 'text-blue-400',
      'TUTORIAL': 'text-blue-400',
      'NEWS': 'text-purple-400',
    };
    return colors[nameUpper] || 'text-emerald-400';
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060909]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060909]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
              Trending Blogs
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Latest news, technologies, applications and use cases from our team.
            </p>
          </div>
          <Link
            href="/blog"
            className="px-6 py-3 glass border border-[#F66F00]/30 text-[#F66F00] font-semibold rounded-lg hover:bg-[#F66F00]/10 transition-all self-start"
          >
            View all blogs
          </Link>
        </div>

        {/* Blog Grid - 2 columns, 3 rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="glass rounded-xl p-6 hover:bg-gray-800/50 transition-all h-full relative">
                <div className="flex gap-6 h-full">
                  {/* Left: Content */}
                  <div className="flex-1 flex flex-col min-w-0 pr-2">
                    {/* Category Tag */}
                    {post.category && (
                      <span className={`text-xs font-bold uppercase mb-3 ${getCategoryColor(post.category.name)}`}>
                        {post.category.name.toUpperCase()}
                      </span>
                    )}
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#F66F00] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    
                    {/* Author & Date */}
                    <div className="flex items-center gap-2 mt-auto pt-4">
                      {post.author && (
                        <>
                          <div className="w-8 h-8 rounded-full bg-[#F66F00]/20 flex items-center justify-center text-[#F66F00] font-semibold text-xs">
                            {post.author.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white text-sm">{post.author.username}</span>
                          {post.published_at && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-white text-sm">{formatDate(post.published_at)}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Thumbnail - positioned at top right */}
                  {post.featured_image && (
                    <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-800 self-start">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
