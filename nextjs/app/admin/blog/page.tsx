'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  published_at?: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const url = statusFilter 
        ? `/api/proxy/admin/blog?status=${statusFilter}`
        : '/api/proxy/admin/blog';
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/blog/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert('Xóa bài viết thất bại');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold glow-text">Quản lý Blog</h1>
        <Link
          href="/admin/blog/create"
          className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
        >
          Thêm bài viết mới
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm font-medium">Lọc theo trạng thái:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setLoading(true);
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
        >
          <option value="">Tất cả</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Tiêu đề</th>
              <th className="px-6 py-4 text-left">Slug</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-left">Ngày xuất bản</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-gray-700 hover:bg-gray-700/50"
              >
                <td className="px-6 py-4">{post.id}</td>
                <td className="px-6 py-4 font-semibold">{post.title}</td>
                <td className="px-6 py-4 text-gray-400">{post.slug}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      post.status === 'published'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('vi-VN')
                    : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
