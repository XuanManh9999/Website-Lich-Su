import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { addToCart } from '../utils/cart';
import Toast from '../components/Toast';
import { handleImageError, getSafeImageUrl } from '../utils/imageUtils';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getBySlug(slug);
        if (response.data) {
          setProduct(response.data);
        } else {
          setError('Không tìm thấy sản phẩm');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        if (error.response && error.response.status === 404) {
          setError('Không tìm thấy sản phẩm');
        } else {
          setError('Đã xảy ra lỗi khi tải sản phẩm');
        }
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    } else {
      setError('Slug không hợp lệ');
      setLoading(false);
    }
  }, [slug]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => {
      const newQuantity = prev + change;
      return newQuantity < 1 ? 1 : newQuantity;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    try {
      addToCart(product, quantity);
      setToast({
        isVisible: true,
        message: `Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({
        isVisible: true,
        message: 'Đã xảy ra lỗi khi thêm vào giỏ hàng',
        type: 'error',
      });
    }
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
          <Link
            to="/san-pham"
            className="text-primary hover:underline font-semibold"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getSafeImageUrl(product.image_url);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Quay lại</span>
        </button>

        {/* Product Detail Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" data-aos="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8 lg:p-12">
            {/* Left: Product Image */}
            <div className="flex items-center justify-center" data-aos="zoom-in" data-aos-delay="200">
              <div className="w-full max-w-md">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e)}
                  />
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col gap-6" data-aos="fade-left" data-aos-delay="300">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                {product.name}
              </h1>

              {/* Price */}
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {product.price 
                  ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)
                  : 'Liên hệ'}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-semibold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(val < 1 ? 1 : val);
                    }}
                    min="1"
                    className="w-20 h-10 border-2 border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ hàng
              </button>

              {/* Product Metadata */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <p>Mã sản phẩm: <span className="font-semibold">{product.id}</span></p>
                <p>Danh mục: <span className="font-semibold">Sản phẩm giáo dục</span></p>
              </div>

              {/* Product Description */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
                <div 
                  className="prose prose-lg prose-primary max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: product.description || '<p>Chưa có mô tả cho sản phẩm này.</p>' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
