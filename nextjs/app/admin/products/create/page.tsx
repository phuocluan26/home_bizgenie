'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TiptapEditor from '@/components/TiptapEditor';

interface Category {
  id: number;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    status: 'draft',
    image_urls: '[]',
    features: '[]',
    specifications: '{}',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/proxy/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      
      // Parse JSON fields
      let imageUrls, features, specifications;
      try {
        imageUrls = JSON.parse(formData.image_urls);
        features = JSON.parse(formData.features);
        specifications = JSON.parse(formData.specifications);
      } catch (err) {
        setError('JSON không hợp lệ trong image_urls, features hoặc specifications');
        setLoading(false);
        return;
      }

      const payload: any = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        short_description: formData.short_description || null,
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        status: formData.status,
        image_urls: imageUrls,
        features: features,
        specifications: specifications,
      };

      const response = await fetch('/api/proxy/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Tạo sản phẩm thất bại');
        return;
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold glow-text mb-8">Thêm sản phẩm mới</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6 max-w-4xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên sản phẩm <span className="text-red-400">*</span>
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
              placeholder="Tự động tạo từ tên nếu để trống"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả ngắn</label>
          <textarea
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả chi tiết</label>
          <TiptapEditor
            content={formData.description}
            onChange={(content) => setFormData({ ...formData, description: content })}
            placeholder="Nhập mô tả chi tiết về sản phẩm..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Danh mục <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URLs (JSON array)</label>
          <textarea
            value={formData.image_urls}
            onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
            rows={3}
            placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00] font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Features (JSON array)</label>
          <textarea
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            rows={3}
            placeholder='["Feature 1", "Feature 2", "Feature 3"]'
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00] font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Specifications (JSON object)</label>
          <textarea
            value={formData.specifications}
            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
            rows={4}
            placeholder='{"key1": "value1", "key2": "value2"}'
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00] font-mono text-sm"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
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
