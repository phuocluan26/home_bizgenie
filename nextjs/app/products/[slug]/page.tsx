'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetail from '@/components/products/ProductDetail';

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  image_urls?: string[];
  features?: string[];
  specifications?: Record<string, any>;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/products/slug/${slug}`);
      const data = await response.json();
      setProduct(data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060909] text-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#060909] text-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-2xl mb-4">Sản phẩm không tồn tại</h1>
          <Link href="/products" className="text-[#F66F00] hover:underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060909] text-white">
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
    </main>
  );
}
