'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass backdrop-blur-lg bg-[#060909]/80'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold glow-text">BizAgent</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-[#F66F00] transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="text-gray-300 hover:text-[#F66F00] transition-colors"
            >
              Sản phẩm
            </Link>
            <Link
              href="/video-demo"
              className="text-gray-300 hover:text-[#F66F00] transition-colors"
            >
              Video
            </Link>
            <Link
              href="/blog"
              className="text-gray-300 hover:text-[#F66F00] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-[#F66F00] transition-colors"
            >
              Liên hệ
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/contact"
              className="px-6 py-2 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
            >
              Bắt đầu
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-[#F66F00]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              href="/"
              className="block text-gray-300 hover:text-[#F66F00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="block text-gray-300 hover:text-[#F66F00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link
              href="/video-demo"
              className="block text-gray-300 hover:text-[#F66F00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Xem demo
            </Link>
            <Link
              href="/blog"
              className="block text-gray-300 hover:text-[#F66F00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="block text-gray-300 hover:text-[#F66F00] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>
            <div className="pt-4 space-y-2 border-t border-gray-800">
              <Link
                href="/contact"
                className="block w-full px-6 py-2 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg text-center hover:glow-primary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Bắt đầu
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

