'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SocialMediaLink {
  id: number;
  platform: string;
  url: string;
  icon_name?: string;
  order: number;
  is_active: boolean;
}

export default function AdminSocialMediaPage() {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/proxy/admin/social-media-links', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLinks(data.data || []);
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên kết mạng xã hội này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/social-media-links/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchLinks();
      } else {
        const data = await response.json();
        alert(data.error || 'Xóa liên kết thất bại');
      }
    } catch (error) {
      console.error('Error deleting social media link:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold glow-text">Quản lý Mạng xã hội</h1>
        <Link
          href="/admin/social-media/create"
          className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
        >
          Thêm liên kết mới
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Nền tảng</th>
              <th className="px-6 py-4 text-left">URL</th>
              <th className="px-6 py-4 text-left">Icon</th>
              <th className="px-6 py-4 text-left">Thứ tự</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Chưa có liên kết mạng xã hội nào
                </td>
              </tr>
            ) : (
              links.map((link) => (
                <tr
                  key={link.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">{link.id}</td>
                  <td className="px-6 py-4 font-semibold capitalize">
                    {link.platform}
                  </td>
                  <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F66F00] transition-colors"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {link.icon_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{link.order}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        link.is_active
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {link.is_active ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/social-media/${link.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(link.id)}
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
