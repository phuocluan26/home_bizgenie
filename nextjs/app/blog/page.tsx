'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/blog/BlogCard';

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
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const limit = 12;
      const offset = (page - 1) * limit;
      const response = await fetch(`/api/proxy/blog?status=published&limit=${limit}&offset=${offset}`);
      const data = await response.json();
      const newPosts = data.data || [];
      
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === limit);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <main className="min-h-screen bg-[#060909] text-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
              Blog & Tin tức
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Cập nhật những xu hướng và kiến thức mới nhất về công nghệ
            </p>
          </div>

          {loading && posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Chưa có bài viết nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all disabled:opacity-50"
                  >
                    {loading ? 'Đang tải...' : 'Tải thêm'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
