'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditVideoDemoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    video_type: 'url',
    status: 'draft',
    order: '0',
  });

  useEffect(() => {
    fetchVideoDemo();
  }, [id]);

  const fetchVideoDemo = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/video-demos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không tìm thấy video demo');
        return;
      }

      // Find the video demo by ID
      const demo = data.data.find((d: any) => d.id === parseInt(id));
      if (!demo) {
        setError('Không tìm thấy video demo');
        return;
      }

      setFormData({
        title: demo.title || '',
        description: demo.description || '',
        video_url: demo.video_url || '',
        video_type: demo.video_type || 'url',
        status: demo.status || 'draft',
        order: demo.order?.toString() || '0',
      });
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleVideoUrlChange = (url: string) => {
    // Auto-detect YouTube URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setFormData({ ...formData, video_url: url, video_type: 'youtube' });
    } else if (url) {
      setFormData({ ...formData, video_url: url, video_type: 'url' });
    } else {
      setFormData({ ...formData, video_url: url });
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
        description: formData.description || null,
        video_url: formData.video_url,
        video_type: formData.video_type,
        status: formData.status,
        order: parseInt(formData.order) || 0,
      };

      const response = await fetch(`/api/proxy/admin/video-demos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Cập nhật video demo thất bại');
        return;
      }

      router.push('/admin/video-demos');
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
      <h1 className="text-3xl font-bold glow-text mb-8">Sửa video demo</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6 max-w-4xl">
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
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            URL Video <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={formData.video_url}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
          <p className="mt-2 text-sm text-gray-400">
            Hỗ trợ YouTube URL hoặc video URL trực tiếp. Hệ thống sẽ tự động nhận diện loại video.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Loại video</label>
            <select
              value={formData.video_type}
              onChange={(e) => setFormData({ ...formData, video_type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            >
              <option value="url">URL (Video trực tiếp)</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thứ tự hiển thị</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              min="0"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            />
            <p className="mt-1 text-xs text-gray-400">Số nhỏ hơn sẽ hiển thị trước</p>
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
