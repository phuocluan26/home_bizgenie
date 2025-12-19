'use client';

import { FileText, Calendar, Calculator, Bot, TrendingUp, Home, MessageSquare, Phone } from 'lucide-react';
import Link from 'next/link';
import FloatingCard from './FloatingCard';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & CTA */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="glow-text">Ứng dụng AI</span>
                <br />
                <span className="text-white">cho doanh nghiệp</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                AI Agent hỗ trợ giám sát - phân tích - tư vấn - hỗ trợ nghiệp vụ.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all text-lg">
                Bắt đầu miễn phí
              </button>
              <Link 
                href="/video-demo"
                className="px-8 py-4 glass border border-[#F66F00]/30 text-[#F66F00] font-semibold rounded-lg hover:bg-[#F66F00]/10 transition-all text-lg text-center"
              >
                Xem demo
              </Link>
            </div>
          </div>

          {/* Right: Floating Analytics Cards */}
          {/* Bảng 3x3 với 8 bong bóng ở 8 ô ngoài, ô giữa trống */}
          <div className="hidden lg:grid grid-cols-3 grid-rows-3 gap-x-4 gap-y-2 w-full">
            {/* Hàng 1 */}
            {/* Ô 1: Trên trái */}
            <FloatingCard
              title="BizOCR - Optical Character Recognition"
              value="80 - 90%"
              subtitle="Số thời gian nhập liệu doanh nghiệp có thể tiết kiệm"
              icon={<FileText className="w-4 h-4 text-[#F66F00]" />}
              delay={0}
              className="w-full aspect-square"
            />
            
            {/* Ô 2: Trên giữa */}
            <FloatingCard
              title="BizSMR - Smart Meeting Room"
              value="225 - 280 giờ/tháng"
              subtitle="Thời gian tiết kiệm được cho bộ phận Hành chính"
              icon={<Calendar className="w-4 h-4 text-[#F66F00]" />}
              delay={0.2}
              className="w-full aspect-square"
            />
            
            {/* Ô 3: Trên phải */}
            <FloatingCard
              title="BizHKD - Hộ kinh doanh"
              value="Giảm 70%"
              subtitle="Thời gian làm báo cáo, dự báo thuế chính xác 85 - 90%"
              icon={<Calculator className="w-4 h-4 text-[#F66F00]" />}
              delay={0.4}
              className="w-full aspect-square"
            />
            
            {/* Hàng 2 */}
            {/* Ô 4: Giữa trái */}
            <FloatingCard
              title="BizIVR - Interactive Voice Response"
              value="Giảm 40 - 60%"
              subtitle="Khối lượng cuộc gọi thủ công. Nhận diện nhu cầu chính xác 90%. Rút ngắn 50% thời gian chờ"
              icon={<Phone className="w-4 h-4 text-[#F66F00]" />}
              delay={0.6}
              className="w-full aspect-square"
            />
            
            {/* Ô 5: Giữa giữa - BizAgent */}
            <div className="w-full aspect-square glass rounded-xl p-4 animate-float glow-primary flex items-center justify-center">
              <div className="text-2xl font-bold text-[#F66F00]">BizAgent</div>
            </div>
            
            {/* Ô 6: Giữa phải */}
            <FloatingCard
              title="BizAIA - AI Agent"
              value="Giảm 40 - 60%"
              subtitle="Thời gian trao đổi nội bộ. Giảm lỗi quên việc lên đến 80%. Tăng hiệu suất nhóm 20 - 30%"
              icon={<Bot className="w-4 h-4 text-[#F66F00]" />}
              delay={0.8}
              className="w-full aspect-square"
            />
            
            {/* Hàng 3 */}
            {/* Ô 7: Dưới trái */}
            <FloatingCard
              title="BizCBB - Chatbot Box"
              value="Giảm 50 - 70%"
              subtitle="Thời gian hỗ trợ học tập. Tăng hiệu suất tự học 30 - 45%. Giảm tải công việc giáo viên 40%"
              icon={<MessageSquare className="w-4 h-4 text-[#F66F00]" />}
              delay={1}
              className="w-full aspect-square"
            />
            
            {/* Ô 8: Dưới giữa */}
            <FloatingCard
              title="BizSHA - Smart Home AI"
              value="Giảm 70%"
              subtitle="Tỉ lệ rủi ro sự cố. Tiết kiệm 10 - 15% điện năng. Tăng mức độ an toàn lên 90%"
              icon={<Home className="w-4 h-4 text-[#F66F00]" />}
              delay={1.2}
              className="w-full aspect-square"
            />
            
            {/* Ô 9: Dưới phải */}
            <FloatingCard
              title="BizSAA - Sale AI Agent"
              value="Tăng 20 - 40%"
              subtitle="Doanh thu online. Tăng tỉ lệ phản hồi 96 - 100%. Giảm chi phí CSKH 25 - 35%"
              icon={<TrendingUp className="w-4 h-4 text-[#F66F00]" />}
              delay={1.4}
              className="w-full aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

