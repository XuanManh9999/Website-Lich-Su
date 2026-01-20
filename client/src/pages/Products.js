import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import Pagination from '../components/Pagination';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll();
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Sản phẩm
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
            Khám phá bộ sưu tập sản phẩm giáo dục độc đáo về lịch sử Việt Nam
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none text-base"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm text-gray-600">
                Tìm thấy {filteredProducts.length} sản phẩm
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.' : 'Chưa có sản phẩm nào.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary hover:underline font-semibold"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {currentProducts.map((product) => {
                const productSlug = product.slug || `product-${product.id}`;
                return (
                  <Link
                    key={product.id}
                    to={`/san-pham/${productSlug}`}
                    className="card group"
                  >
                  {product.image_url && (
                    <div className="w-full h-56 sm:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
                    </div>
                  )}
                  <div className="p-6 flex flex-col gap-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary group-hover:text-primary-light transition-colors">
                      {product.name}
                    </h2>
                    {product.price && (
                      <p className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(product.price)}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3 flex-1">
                        {product.description}
                      </p>
                    )}
                    <Link
                      to={`/san-pham/${productSlug}`}
                      className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-light transition-colors mt-auto text-center block"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
