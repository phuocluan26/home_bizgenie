'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/products/ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  image_urls?: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory
        ? `/api/proxy/products?status=published&category_id=${selectedCategory}`
        : '/api/proxy/products?status=published';
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/proxy/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#060909] text-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
              Sản phẩm của chúng tôi
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Khám phá các giải pháp công nghệ hiện đại cho doanh nghiệp của bạn
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-lg transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
