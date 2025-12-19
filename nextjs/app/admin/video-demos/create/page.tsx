'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateVideoDemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    video_type: 'url', // 'url' or 'youtube'
    status: 'draft',
    order: '0',
  });

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

      const response = await fetch('/api/proxy/admin/video-demos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Tạo video demo thất bại');
        return;
      }

      router.push('/admin/video-demos');
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold glow-text mb-8">Thêm video demo mới</h1>

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
            placeholder="Ví dụ: Demo sản phẩm BizGenie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
            placeholder="Mô tả về video demo này..."
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
            placeholder="https://www.youtube.com/watch?v=... hoặc https://example.com/video.mp4"
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
            {loading ? 'Đang tạo...' : 'Tạo video demo'}
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
