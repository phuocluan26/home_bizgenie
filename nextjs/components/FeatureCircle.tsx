'use client';

import { Shield, Zap, BarChart3, Plug, Headphones } from 'lucide-react';
import featuresData from '@/data/features.json';

const iconMap: { [key: string]: any } = {
  shield: Shield,
  zap: Zap,
  'bar-chart': BarChart3,
  plug: Plug,
  headphones: Headphones,
};

export default function FeatureCircle() {
  const { features, centerAgent } = featuresData;
  // Sử dụng phần trăm để responsive tốt hơn
  const containerSize = 600; // Kích thước container
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;
  const radius = 220; // Tăng radius để các cards xa hơn một chút

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Công nghệ tiên tiến, được thiết kế để phục vụ doanh nghiệp của bạn
          </p>
        </div>

        {/* Mobile: Grid Layout */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Shield;
            return (
              <div
                key={feature.id}
                className="glass rounded-xl p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-3 glow-icon">
                  <IconComponent className="w-8 h-8 text-[#F66F00]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Desktop: Circle Layout */}
        <div className="hidden lg:flex relative items-center justify-center" style={{ minHeight: `${containerSize}px` }}>
          {/* Container để căn giữa */}
          <div className="relative" style={{ width: `${containerSize}px`, height: `${containerSize}px` }}>
            {/* Center Agent Avatar - Căn giữa hoàn toàn */}
            <div 
              className="absolute z-10 glass rounded-full w-32 h-32 flex items-center justify-center animate-pulse-glow"
              style={{
                left: `${centerX - 64}px`,
                top: `${centerY - 64}px`,
              }}
            >
              <div className="text-6xl">{centerAgent.avatar}</div>
            </div>
            
            {/* Center Agent Text - Ngay dưới avatar */}
            <div 
              className="absolute z-20 text-center"
              style={{
                left: '50%',
                top: `${centerY + 80}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-sm font-semibold text-[#F66F00]">
                {centerAgent.name}
              </div>
              <div className="text-xs text-gray-400">{centerAgent.description}</div>
            </div>

            {/* Rotating Circle Background */}
            <div 
              className="absolute border border-[#F66F00]/20 rounded-full animate-rotate-slow"
              style={{
                width: `${containerSize - 100}px`,
                height: `${containerSize - 100}px`,
                left: '50px',
                top: '50px',
              }}
            ></div>

            {/* Feature Icons Around Circle - Phân bố đều 360 độ */}
            {features.map((feature, index) => {
              // Tính góc đều nhau: 5 features = 360/5 = 72 độ mỗi feature
              // Bắt đầu từ góc -90 độ (phía trên) để feature đầu tiên ở trên cùng
              const angle = ((-90 + feature.position.angle) * Math.PI) / 180;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              const IconComponent = iconMap[feature.icon] || Shield;

              return (
                <div
                  key={feature.id}
                  className="absolute glass rounded-xl p-6 w-48 animate-fade-in"
                  style={{
                    left: `${x - 96}px`,
                    top: `${y - 80}px`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <div className="mb-3 glow-icon">
                    <IconComponent className="w-8 h-8 text-[#F66F00]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

