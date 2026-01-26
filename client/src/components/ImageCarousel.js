import React, { useState, useEffect } from 'react';
import { carouselAPI } from '../services/api';
import { handleImageError, getSafeImageUrl } from '../utils/imageUtils';

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await carouselAPI.getAll();
        setSlides(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching carousel slides:', error);
        // Fallback data nếu API lỗi
        setSlides([
          {
            image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200&h=600&fit=crop',
            quote: 'ĐỂ LỊCH SỬ KHÔNG CHỈ LÀ CHUYỆN KỂ MÀ CÒN LÀ LỜI HỨA TIẾP NỐI',
            author: 'Thiên Sử Ký',
          },
          {
            image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=600&fit=crop',
            quote: 'LỊCH SỬ LÀ CÂU CHUYỆN CỦA NHỮNG CON NGƯỜI VĨ ĐẠI',
            author: 'Thiên Sử Ký',
          },
          {
            image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop',
            quote: 'KHÁM PHÁ QUÁ KHỨ ĐỂ HIỂU HIỆN TẠI VÀ XÂY DỰNG TƯƠNG LAI',
            author: 'Thiên Sử Ký',
          },
        ]);
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Tự động chuyển slide mỗi 5 giây

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl" data-aos="zoom-in">
      {/* Background Image */}
      <div className="absolute inset-0">
        {slides.length > 0 && (
          <img
            src={getSafeImageUrl(slides[currentSlide].image_url)}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-opacity duration-700"
            onError={(e) => handleImageError(e)}
          />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
      </div>

      {/* Text Overlay - Beige background on top, photo below */}
      <div className="absolute inset-0 z-10">
        {/* Beige overlay section (top 60-70%) */}
        {slides.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-[60%] sm:h-[65%] md:h-[70%] bg-gradient-to-b from-amber-50 via-amber-50/95 to-transparent flex items-center justify-center px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-4xl w-full">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight uppercase tracking-tight">
                <div 
                  className="prose prose-lg prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: slides[currentSlide].quote || '' 
                  }}
                />
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-primary font-semibold">
                {slides[currentSlide].author || 'Thiên Sử Ký'}
              </p>
            </div>
          </div>
        )}
        {/* Photo shows through bottom part */}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 z-20"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 z-20"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-30">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && slides.length === 0 && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-30">
          <p className="text-gray-600 text-lg">Chưa có slide nào.</p>
        </div>
      )}

      {/* Dots Indicator */}
      {slides.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-primary w-8 md:w-10'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
