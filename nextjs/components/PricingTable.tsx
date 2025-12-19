'use client';

import { Check } from 'lucide-react';
import pricingData from '@/data/pricing.json';

export default function PricingTable() {
  const { plans } = pricingData;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            Bảng giá
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu doanh nghiệp của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass rounded-xl p-8 relative ${
                plan.popular
                  ? 'border-2 border-[#F66F00] glow-primary scale-105'
                  : ''
              } hover:scale-105 transition-transform`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] text-sm font-semibold rounded-full">
                  Phổ biến
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-[#F66F00]">
                    {plan.price === 'Miễn phí' || plan.price === 'Tùy chỉnh'
                      ? plan.price
                      : `${plan.price}₫`}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-[#F66F00] mr-2 flex-shrink-0 mt-0.5 glow-icon" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] hover:glow-primary'
                    : 'glass border border-[#F66F00]/30 text-[#F66F00] hover:bg-[#F66F00]/10'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

