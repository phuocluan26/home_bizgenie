'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

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

export default function ProductSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxy/products?status=published&limit=10');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-xl">Chưa có sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="relative px-12 md:px-16">
      {/* Navigation Buttons */}
      {products.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F66F00] text-[#060909] flex items-center justify-center hover:glow-primary transition-all shadow-lg hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F66F00] text-[#060909] flex items-center justify-center hover:glow-primary transition-all shadow-lg hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[350px] lg:w-[400px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
