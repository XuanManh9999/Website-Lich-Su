import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['Tất cả', 'Flashcard', 'Sách', 'Mô hình']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll();
        if (response.data && response.data.length > 0) {
          setProducts(response.data.slice(0, 3)); // Hiển thị 3 sản phẩm đầu tiên
        } else {
          setProducts([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const scrollCategories = (direction) => {
    const container = document.getElementById('categories-container');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 md:mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập sản phẩm giáo dục độc đáo về lịch sử Việt Nam
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 md:mb-12 relative">
          <div className="flex items-center gap-4">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                scrollPosition <= 0
                  ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                  : 'border-gray-400 text-gray-600 hover:border-primary hover:text-primary'
              }`}
              disabled={scrollPosition <= 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Categories Container */}
            <div
              id="categories-container"
              className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-3 pb-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-blue-100 text-primary hover:bg-blue-200'
                    }`}
                  >
                    {category === 'Flashcard' ? 'Bộ flashcard học lịch sử thú vị' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-400 text-gray-600 hover:border-primary hover:text-primary flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {products.map((product) => {
                const productSlug = product.slug || `product-${product.id}`;
                return (
                  <Link
                    key={product.id}
                    to={`/san-pham/${productSlug}`}
                    className="card group"
                  >
                    {/* Product Image */}
                    <div className="relative h-56 sm:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {product.image_url ? (
                        <img
                          src={
                            product.image_url.startsWith('data:') || product.image_url.startsWith('http')
                              ? product.image_url
                              : `http://localhost:5000${product.image_url}`
                          }
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x500/0F4C81/FFFFFF?text=Product';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 md:p-6 flex flex-col gap-3">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {product.name}
                      </h3>

                      {/* Author/Details */}
                      {product.description && (
                        <div className="text-sm text-gray-600 space-y-1">
                          {product.description.split('•').slice(0, 3).map((item, idx) => (
                            item.trim() && (
                              <p key={idx} className="flex items-start">
                                {idx > 0 && <span className="mr-2">•</span>}
                                <span className={idx === 0 ? '' : 'ml-1'}>{item.trim()}</span>
                              </p>
                            )
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      {product.price && (
                        <div className="text-2xl md:text-3xl font-bold text-primary mt-2">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(product.price)}
                        </div>
                      )}

                      {/* Buy Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/san-pham/${productSlug}`;
                        }}
                        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold text-base hover:bg-primary-light transition-colors mt-auto"
                      >
                        Mua ngay
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link
                to="/san-pham"
                className="inline-block bg-primary text-white px-8 md:px-12 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
