'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent_name?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Xóa danh mục thất bại');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold glow-text">Quản lý Danh mục</h1>
        <Link
          href="/admin/categories/create"
          className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
        >
          Thêm danh mục mới
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Tên danh mục</th>
              <th className="px-6 py-4 text-left">Slug</th>
              <th className="px-6 py-4 text-left">Danh mục cha</th>
              <th className="px-6 py-4 text-left">Mô tả</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">{category.id}</td>
                  <td className="px-6 py-4 font-semibold">{category.name}</td>
                  <td className="px-6 py-4 text-gray-400">{category.slug}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {category.parent_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
