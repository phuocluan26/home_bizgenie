'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
  });

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không tìm thấy danh mục');
        return;
      }

      const category = data.data;
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id ? category.parent_id.toString() : '',
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
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      };

      if (formData.parent_id) {
        payload.parent_id = parseInt(formData.parent_id);
      } else {
        payload.parent_id = null;
      }

      const response = await fetch(`/api/proxy/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Cập nhật danh mục thất bại');
        return;
      }

      router.push('/admin/categories');
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold glow-text mb-8">Sửa danh mục</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên danh mục <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Danh mục cha</label>
          <input
            type="number"
            value={formData.parent_id}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            placeholder="ID của danh mục cha (để trống nếu là danh mục gốc)"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
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
