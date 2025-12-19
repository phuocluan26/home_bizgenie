import Link from 'next/link';

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

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const images = product.image_urls || [];
  const features = product.features || [];
  const specifications = product.specifications || {};

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/products"
          className="text-[#F66F00] hover:underline mb-8 inline-block"
        >
          ← Quay lại danh sách sản phẩm
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(1, 5).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-24 bg-gray-900 rounded-lg overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">Không có hình ảnh</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <span className="inline-block px-4 py-2 bg-[#F66F00] text-[#060909] text-sm font-semibold rounded-full mb-4">
                {product.category.name}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="text-xl text-gray-400 mb-8">
                {product.short_description}
              </p>
            )}
            <div className="space-y-4 mb-8">
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Mô tả sản phẩm</h2>
            <div
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Tính năng nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg"
                >
                  <svg
                    className="w-6 h-6 text-[#F66F00] flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Specifications */}
        {Object.keys(specifications).length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Thông số kỹ thuật</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-b border-gray-700 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-300">
                        {key}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
