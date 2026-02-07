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
      <section
        className="relative text-white py-20 md:py-28 lg:py-32 overflow-hidden"
        style={{
          // Gradient mới: bao quanh bởi màu chủ đạo đỏ, không dùng vàng
          background:
            'linear-gradient(to bottom, #8F1A1E 0%, #B83236 45%, #5C0F12 100%)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6" data-aos="fade-right">
              <h1 className="flex flex-col gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                  Khám phá
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: '#FFD700' }}>
                  Lịch sử Việt Nam
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/95 leading-relaxed max-w-xl">
                Việt Sử Quân biến lịch sử Việt Nam thành một hành trình trải nghiệm sống động, nơi người chơi không chỉ học để nhớ, mà học để hiểu, suy ngẫm và áp dụng những giá trị lịch sử vào cuộc sống hôm nay.
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
                  Xem video giới thiệu
                </Link>
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex flex-col gap-6 lg:gap-8" data-aos="fade-left">
              {/* Top Row - 2 Cards Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Stat Card 1 - Open Book */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-md">
                  <div className="flex flex-col items-center text-center gap-3">
                    {/* Open book outline icon - Dark reddish-brown */}
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 shadow-sm">
                      {/* Book icon - tối giản */}
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="5"
                          y="6"
                          width="14"
                          height="12"
                          rx="2"
                          stroke="#8F1A1E"
                          strokeWidth="1.7"
                        />
                        <line
                          x1="12"
                          y1="6"
                          x2="12"
                          y2="18"
                          stroke="#8F1A1E"
                          strokeWidth="1.7"
                        />
                      </svg>
                    </div>
                <div>
                      <div
                        className="text-4xl sm:text-5xl font-bold"
                        style={{ color: '#8B4513' }}
                      >
                        1000+
                      </div>
                      <div
                        className="text-base sm:text-lg mt-1"
                        style={{ color: '#8B4513' }}
                      >
                        Bài viết lịch sử
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat Card 2 - Two People */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-md">
                  <div className="flex flex-col items-center text-center gap-3">
                    {/* Two people outline icon - Dark reddish-brown */}
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 shadow-sm">
                      {/* User icon - tối giản */}
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="3.2"
                          stroke="#8F1A1E"
                          strokeWidth="1.7"
                        />
                        <path
                          d="M7 18.2C7.9 15.9 9.7 14.5 12 14.5C14.3 14.5 16.1 15.9 17 18.2"
                          stroke="#8F1A1E"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
              </div>
                <div>
                      <div
                        className="text-4xl sm:text-5xl font-bold"
                        style={{ color: '#8B4513' }}
                      >
                        50K+
                      </div>
                      <div
                        className="text-base sm:text-lg mt-1"
                        style={{ color: '#8B4513' }}
                      >
                        Người học
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card - Star Icon + Slogan */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-md">
                <div className="flex flex-col items-center text-center gap-3">
                  {/* Star icon - viền mảnh, tinh tế */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3.5L13.9 8.05L18.8 8.55L15.2 11.7L16.3 16.5L12 14L7.7 16.5L8.8 11.7L5.2 8.55L10.1 8.05L12 3.5Z"
                        stroke="#8F1A1E"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p
                    className="text-lg sm:text-xl italic leading-relaxed"
                    style={{ color: '#8F1A1E' }}
                  >
                    Lịch sử không chỉ là chuyện kể mà còn là lời hứa tiếp nối
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-8 md:py-12 lg:py-16" data-aos="fade-up">
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
