'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  className?: string;
  threshold?: number;
}

export default function ScrollReveal({ 
  children, 
  direction = 'down', // Mặc định là từ trên xuống
  delay = 0,
  className = '',
  threshold = 0.1
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            // Cho phép animation lại khi scroll lên
            setIsVisible(false);
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -80px 0px', // Trigger sớm hơn một chút
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, threshold]);

  const getTransformClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translate-y-12';
        case 'down':
          return '-translate-y-16'; // Từ trên xuống, bắt đầu ở vị trí cao hơn
        case 'left':
          return 'translate-x-12';
        case 'right':
          return '-translate-x-12';
        case 'fade':
          return '';
        default:
          return '-translate-y-16'; // Mặc định là từ trên xuống
      }
    }
    return '';
  };

  const opacityClass = isVisible ? 'opacity-100' : 'opacity-0';

  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ease-out ${getTransformClass()} ${opacityClass} ${className}`}
      style={{
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
