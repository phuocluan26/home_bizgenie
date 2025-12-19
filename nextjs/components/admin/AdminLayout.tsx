'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/products', label: 'Sản phẩm' },
    { href: '/admin/blog', label: 'Blog' },
    { href: '/admin/categories', label: 'Danh mục' },
    { href: '/admin/video-demos', label: 'Video Demo' },
    { href: '/admin/social-media', label: 'Mạng xã hội' },
    { href: '/admin/contacts', label: 'Liên hệ' },
    { href: '/admin/users', label: 'Người dùng' },
  ];

  return (
    <div className="min-h-screen bg-[#060909] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold glow-text mb-8">BizGenie Admin</h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-[#F66F00] text-[#060909] font-semibold'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          {user && (
            <div className="mb-4">
              <p className="text-sm text-gray-400">Đăng nhập bởi</p>
              <p className="font-semibold">{user.username}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
