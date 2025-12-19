'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  published_at?: string;
  author?: {
    id: number;
    username: string;
    email: string;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/blog/slug/${slug}`);
      const data = await response.json();
      setPost(data.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060909] text-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[#060909] text-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-2xl mb-4">Bài viết không tồn tại</h1>
          <Link href="/blog" className="text-[#F66F00] hover:underline">
            Quay lại danh sách bài viết
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-[#060909] text-white">
      <Navbar />
      
      <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="text-[#F66F00] hover:underline mb-8 inline-block"
          >
            ← Quay lại blog
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-400 mb-6">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-4 text-gray-400 text-sm">
              {post.author && (
                <span>Tác giả: {post.author.username}</span>
              )}
              {post.published_at && (
                <span>• {formatDate(post.published_at)}</span>
              )}
            </div>
          </header>

          {post.featured_image && (
            <div className="mb-12">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      <Footer />
    </main>
  );
}
