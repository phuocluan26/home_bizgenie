'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'editor',
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không tìm thấy người dùng');
        return;
      }

      const user = data.data.find((u: any) => u.id === parseInt(id));
      if (!user) {
        setError('Không tìm thấy người dùng');
        return;
      }

      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'editor',
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
      const response = await fetch(`/api/proxy/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Cập nhật người dùng thất bại');
        return;
      }

      router.push('/admin/users');
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
      <h1 className="text-3xl font-bold glow-text mb-8">Sửa người dùng</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên đăng nhập <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vai trò</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F66F00]"
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-3 rounded">
          <p className="text-sm">Lưu ý: Không thể thay đổi mật khẩu ở đây. Người dùng cần tự đổi mật khẩu hoặc admin reset mật khẩu.</p>
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
