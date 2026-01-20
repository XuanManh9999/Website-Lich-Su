import React from 'react';
import { Link } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import FeaturedProducts from '../components/FeaturedProducts';
import FeaturedBlogPosts from '../components/FeaturedBlogPosts';
import FeaturedFlashcards from '../components/FeaturedFlashcards';

const Home = () => {

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary-700 text-white py-20 md:py-28 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6">
              <h1 className="flex flex-col gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                  Khám phá
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Lịch sử Việt Nam
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/95 leading-relaxed max-w-xl">
                Website mang đến cho bạn những câu chuyện lịch sử đầy cảm hứng về các nhân vật vĩ đại của dân tộc Việt Nam qua trải nghiệm kể chuyện bằng giọng nói và tích hợp NFC hiện đại.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link 
                  to="/nhan-vat" 
                  className="btn-primary group"
                >
                  Khám phá ngay
                  <span className="text-xl transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link 
                  to="/quiz" 
                  className="btn-secondary"
                >
                  Xem quiz trắc nghiệm
                </Link>
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex flex-col gap-8 lg:gap-10">
              <div className="flex items-center gap-4">
                <div className="text-5xl sm:text-6xl">📚</div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold">100+</div>
                  <div className="text-base sm:text-lg text-white/90 mt-1">
                    Nhân vật lịch sử
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-5xl sm:text-6xl">👥</div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold">10K+</div>
                  <div className="text-base sm:text-lg text-white/90 mt-1">
                    Người truy cập
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 pt-2">
                <div className="text-4xl sm:text-5xl">🎙️</div>
                <p className="text-lg sm:text-xl italic text-white/95 leading-relaxed">
                  Để lịch sử sống mãi qua từng câu chuyện
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ImageCarousel />
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Featured Blog Posts Section */}
      <FeaturedBlogPosts />

      {/* Featured Flashcards Section */}
      <FeaturedFlashcards />
    </div>
  );
};

export default Home;
