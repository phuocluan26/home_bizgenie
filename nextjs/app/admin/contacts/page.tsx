'use client';

import { useEffect, useState } from 'react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const url = statusFilter
        ? `/api/proxy/admin/contacts?status=${statusFilter}`
        : '/api/proxy/admin/contacts';
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setContacts(data.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/contacts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchContacts();
      } else {
        alert('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/proxy/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchContacts();
      } else {
        alert('Xóa liên hệ thất bại');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold glow-text">Quản lý Liên hệ</h1>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="read">Đã đọc</option>
            <option value="replied">Đã trả lời</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Tên</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Công ty</th>
              <th className="px-6 py-4 text-left">Tin nhắn</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-left">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className="border-b border-gray-700 hover:bg-gray-700/50"
              >
                <td className="px-6 py-4">{contact.id}</td>
                <td className="px-6 py-4 font-semibold">{contact.name}</td>
                <td className="px-6 py-4">{contact.email}</td>
                <td className="px-6 py-4 text-gray-400">
                  {contact.company || '-'}
                </td>
                <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                  {contact.message}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={contact.status}
                    onChange={(e) => updateStatus(contact.id, e.target.value)}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  >
                    <option value="new">Mới</option>
                    <option value="read">Đã đọc</option>
                    <option value="replied">Đã trả lời</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(contact.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
