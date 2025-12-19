'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Mail, MapPin } from 'lucide-react';

interface SocialMediaLink {
  id: number;
  platform: string;
  url: string;
  icon_name?: string;
  order: number;
  is_active: boolean;
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const response = await fetch('/api/proxy/social-media-links?active_only=true');
      const data = await response.json();
      if (data.data) {
        // Sort by order
        const sorted = [...data.data].sort((a: SocialMediaLink, b: SocialMediaLink) => a.order - b.order);
        setSocialLinks(sorted);
      }
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName?: string, platform?: string) => {
    if (!iconName) {
      // Fallback to platform-based icon
      const iconMap: Record<string, string> = {
        facebook: 'Facebook',
        linkedin: 'Linkedin',
        twitter: 'Twitter',
        youtube: 'Youtube',
        instagram: 'Instagram',
        tiktok: 'Music',
        zalo: 'MessageCircle',
      };
      iconName = platform ? iconMap[platform.toLowerCase()] || 'Link' : 'Link';
    }

    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Link;
    return IconComponent;
  };

  return (
    <footer className="border-t border-gray-800 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold glow-text">BizGenie</h3>
            <p className="text-sm text-gray-400">
              CÔNG TY TNHH GIẢI PHÁP & CÔNG NGHỆ BIZGENIE
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-[#F66F00]" />
                <span>
                  Số 4 Phan Huy Ôn, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí Minh,
                  Việt Nam
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#F66F00]" />
                <a
                  href="mailto:invoice@bizgenie.vn"
                  className="hover:text-[#F66F00] transition-colors"
                >
                  invoice@bizgenie.vn
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-xs">MST: 0318961809</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#F66F00]">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-[#F66F00] transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-400 hover:text-[#F66F00] transition-colors"
                >
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 hover:text-[#F66F00] transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-[#F66F00]">Pháp lý</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#F66F00] transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#F66F00] transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#F66F00] transition-colors"
                >
                  Chính sách cookie
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-[#F66F00]">Theo dõi chúng tôi</h4>
            {loading ? (
              <div className="flex space-x-4">
                <div className="w-10 h-10 glass rounded-lg animate-pulse" />
                <div className="w-10 h-10 glass rounded-lg animate-pulse" />
                <div className="w-10 h-10 glass rounded-lg animate-pulse" />
              </div>
            ) : socialLinks.length > 0 ? (
              <div className="flex space-x-4 flex-wrap gap-2">
                {socialLinks.map((link) => {
                  const IconComponent = getIcon(link.icon_name, link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glow-primary transition-all"
                      aria-label={link.platform}
                    >
                      <IconComponent className="w-5 h-5 text-[#F66F00]" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Chưa có liên kết mạng xã hội</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} CÔNG TY TNHH GIẢI PHÁP & CÔNG NGHỆ
            BIZGENIE. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}

