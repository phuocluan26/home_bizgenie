import Navbar from '@/components/Navbar';
import PricingTable from '@/components/PricingTable';
import Footer from '@/components/Footer';

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <PricingTable />
        
        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 glow-text">
              Câu hỏi thường gặp
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Tôi có thể thay đổi gói sau khi đăng ký không?',
                  a: 'Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Thay đổi sẽ có hiệu lực ngay lập tức.',
                },
                {
                  q: 'Có thời gian dùng thử miễn phí không?',
                  a: 'Gói Starter hoàn toàn miễn phí vĩnh viễn. Các gói trả phí có 14 ngày dùng thử miễn phí.',
                },
                {
                  q: 'Hỗ trợ thanh toán như thế nào?',
                  a: 'Chúng tôi chấp nhận thanh toán qua chuyển khoản ngân hàng, thẻ tín dụng và ví điện tử.',
                },
                {
                  q: 'Dữ liệu của tôi có an toàn không?',
                  a: 'Chúng tôi sử dụng mã hóa end-to-end và tuân thủ các tiêu chuẩn bảo mật quốc tế. Dữ liệu của bạn được bảo vệ 24/7.',
                },
              ].map((faq, index) => (
                <div key={index} className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 text-[#F66F00]">
                    {faq.q}
                  </h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

