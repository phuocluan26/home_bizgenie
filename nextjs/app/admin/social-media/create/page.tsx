'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSocialMediaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    platform: 'facebook',
    url: '',
    icon_name: '',
    order: 0,
    is_active: true,
  });

  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'zalo', label: 'Zalo' },
    { value: 'other', label: 'Khác' },
  ];

  const defaultIcons: Record<string, string> = {
    facebook: 'Facebook',
    linkedin: 'Linkedin',
    twitter: 'Twitter',
    youtube: 'Youtube',
    instagram: 'Instagram',
    tiktok: 'Music',
    zalo: 'MessageCircle',
    other: 'Link',
  };

  const handlePlatformChange = (platform: string) => {
    setFormData({
      ...formData,
      platform,
      icon_name: defaultIcons[platform] || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const payload: any = {
        platform: formData.platform,
        url: formData.url,
        order: formData.order || 0,
        is_active: formData.is_active,
      };

      if (formData.icon_name) {
        payload.icon_name = formData.icon_name;
      }

      const response = await fetch('/api/proxy/admin/social-media-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Tạo liên kết thất bại');
        return;
      }

      router.push('/admin/social-media');
    } catch (err: any) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold glow-text mb-8">Thêm liên kết mạng xã hội mới</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nền tảng <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.platform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          >
            {platforms.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            placeholder="https://..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tên Icon (Lucide React)</label>
          <input
            type="text"
            value={formData.icon_name}
            onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
            placeholder="Facebook, Linkedin, Twitter, etc."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
          <p className="text-xs text-gray-400 mt-1">
            Tên icon từ lucide-react (ví dụ: Facebook, Linkedin, Twitter). Để trống sẽ tự động chọn theo nền tảng.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thứ tự hiển thị</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-[#F66F00] focus:ring-[#F66F00]"
            />
            <span>Hiển thị trên website</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo liên kết'}
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
