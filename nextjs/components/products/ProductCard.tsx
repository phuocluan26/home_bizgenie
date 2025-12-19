import Link from 'next/link';
import Image from 'next/image';

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls[0] 
    : '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all group cursor-pointer">
        <div className="relative h-64 bg-gray-900 overflow-hidden">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {product.category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-[#F66F00] text-[#060909] text-sm font-semibold rounded-full">
                {product.category.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-[#F66F00] transition-colors">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="text-gray-400 text-sm line-clamp-2">
              {product.short_description}
            </p>
          )}
          <div className="mt-4 flex items-center text-[#F66F00] text-sm font-semibold">
            Tìm hiểu thêm
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
