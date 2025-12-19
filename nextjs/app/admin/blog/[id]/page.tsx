'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TiptapEditor from '@/components/TiptapEditor';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order: number;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft',
    published_at: '',
  });

  useEffect(() => {
    fetchPost();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/proxy/blog-categories');
      const data = await response.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching blog categories:', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không tìm thấy bài viết');
        return;
      }

      const post = data.data;
      const publishedAt = post.published_at 
        ? new Date(post.published_at).toISOString().slice(0, 16)
        : '';

      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image: post.featured_image || '',
        category_id: post.category_id ? String(post.category_id) : '',
        status: post.status || 'draft',
        published_at: publishedAt,
      });
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        featured_image: formData.featured_image || null,
        status: formData.status,
      };

      if (formData.category_id) {
        payload.category_id = parseInt(formData.category_id);
      } else {
        payload.category_id = null;
      }

      if (formData.published_at) {
        payload.published_at = formData.published_at;
      } else {
        payload.published_at = null;
      }

      const response = await fetch(`/api/proxy/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Cập nhật bài viết thất bại');
        return;
      }

      router.push('/admin/blog');
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || fetchingCategories) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold glow-text mb-8">Sửa bài viết</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6 max-w-4xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả ngắn (Excerpt)</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nội dung <span className="text-red-400">*</span>
          </label>
          <TiptapEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Nhập nội dung bài viết..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Hình ảnh đại diện</label>
            <input
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Danh mục</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ngày xuất bản</label>
          <input
            type="datetime-local"
            value={formData.published_at}
            onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
          <p className="text-xs text-gray-400 mt-1">Để trống nếu chưa muốn xuất bản</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
