'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product: '',
    needs: '',
    notes: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/proxy/products?status=published');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/proxy/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          product: formData.product,
          needs: formData.needs,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.',
        });
    setFormData({
      name: '',
      email: '',
          product: '',
      needs: '',
      notes: '',
    });
      } else {
        setSubmitMessage({
          type: 'error',
          text: data.error || 'Có lỗi xảy ra. Vui lòng thử lại sau.',
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 glow-text">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Hãy cho chúng tôi biết về nhu cầu của bạn. Chúng tôi sẽ tư vấn
              giải pháp phù hợp nhất.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-[#F66F00]">
                  Thông tin liên hệ
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start glass rounded-xl p-6">
                    <MapPin className="w-6 h-6 text-[#F66F00] mr-4 flex-shrink-0 glow-icon" />
                    <div>
                      <h3 className="font-semibold mb-1">Địa chỉ</h3>
                      <p className="text-gray-400 text-sm">
                        Số 4 Phan Huy Ôn, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí
                        Minh, Việt Nam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start glass rounded-xl p-6">
                    <Mail className="w-6 h-6 text-[#F66F00] mr-4 flex-shrink-0 glow-icon" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a
                        href="mailto:invoice@bizgenie.vn"
                        className="text-gray-400 text-sm hover:text-[#F66F00] transition-colors"
                      >
                        invoice@bizgenie.vn
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start glass rounded-xl p-6">
                    <Phone className="w-6 h-6 text-[#F66F00] mr-4 flex-shrink-0 glow-icon" />
                    <div>
                      <h3 className="font-semibold mb-1">Mã số thuế</h3>
                      <p className="text-gray-400 text-sm">0318961809</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-[#F66F00]">
                  Thời gian làm việc
                </h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                  <p>Thứ 7: 8:00 - 12:00</p>
                  <p>Chủ nhật: Nghỉ</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#F66F00]">
                Gửi tin nhắn
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0A0F0F] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F66F00] focus:ring-1 focus:ring-[#F66F00] transition-colors"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0A0F0F] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F66F00] focus:ring-1 focus:ring-[#F66F00] transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Sản phẩm
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0A0F0F] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F66F00] focus:ring-1 focus:ring-[#F66F00] transition-colors"
                  >
                    <option value="">Chọn sản phẩm</option>
                    <option value="all">Tất cả sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="needs"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Nhu cầu của bạn
                  </label>
                  <textarea
                    id="needs"
                    name="needs"
                    rows={4}
                    value={formData.needs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0A0F0F] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F66F00] focus:ring-1 focus:ring-[#F66F00] transition-colors resize-none"
                    placeholder="Mô tả nhu cầu của doanh nghiệp bạn..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Ghi chú thêm
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0A0F0F] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F66F00] focus:ring-1 focus:ring-[#F66F00] transition-colors resize-none"
                    placeholder="Thông tin bổ sung (nếu có)..."
                  />
                </div>

                {submitMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitMessage.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

