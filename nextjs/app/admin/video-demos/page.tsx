'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface VideoDemo {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  video_type: string;
  youtube_id?: string;
  thumbnail_url?: string;
  status: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminVideoDemosPage() {
  const [videoDemos, setVideoDemos] = useState<VideoDemo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoDemos();
  }, []);

  const fetchVideoDemos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/proxy/admin/video-demos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setVideoDemos(data.data || []);
    } catch (error) {
      console.error('Error fetching video demos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video demo này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/video-demos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchVideoDemos();
      } else {
        alert('Xóa video demo thất bại');
      }
    } catch (error) {
      console.error('Error deleting video demo:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold glow-text">Quản lý Video Demo</h1>
        <Link
          href="/admin/video-demos/create"
          className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
        >
          Thêm video demo mới
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Tiêu đề</th>
              <th className="px-6 py-4 text-left">Loại</th>
              <th className="px-6 py-4 text-left">Thứ tự</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {videoDemos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Chưa có video demo nào
                </td>
              </tr>
            ) : (
              videoDemos.map((demo) => (
                <tr
                  key={demo.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">{demo.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {demo.thumbnail_url && (
                        <img
                          src={demo.thumbnail_url}
                          alt={demo.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{demo.title}</div>
                        {demo.description && (
                          <div className="text-sm text-gray-400 line-clamp-1">
                            {demo.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900 text-blue-200">
                      {demo.video_type === 'youtube' ? 'YouTube' : 'URL'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{demo.order}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        demo.status === 'published'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {demo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/video-demos/${demo.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(demo.id)}
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
