import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCircle from '@/components/FeatureCircle';
import ProductSlider from '@/components/products/ProductSlider';
import TrendingBlogs from '@/components/blog/TrendingBlogs';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export default function Home() {

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <Hero />

      <ScrollReveal direction="down" delay={200}>
        <FeatureCircle />
      </ScrollReveal>

      {/* Products Section */}
      <ScrollReveal direction="down" delay={300}>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0F0F]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
                Sản phẩm của chúng tôi
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Khám phá các giải pháp công nghệ hiện đại cho doanh nghiệp của bạn
              </p>
              <a
                href="/products"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#F66F00] to-[#F66F00] text-[#060909] font-semibold rounded-lg hover:glow-primary transition-all"
              >
                Xem tất cả sản phẩm
              </a>
            </div>
            <ProductSlider />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="down" delay={200}>
        <TrendingBlogs />
      </ScrollReveal>

      <Footer />
    </main>
  );
}
