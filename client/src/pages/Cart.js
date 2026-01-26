import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartQuantity, getCartTotal, clearCart } from '../utils/cart';
import { handleImageError, getSafeImageUrl } from '../utils/imageUtils';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const items = getCart();
    const total = getCartTotal();
    setCartItems(items);
    setCartTotal(total);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    loadCart();
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartQuantity(productId, newQuantity);
    loadCart();
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      clearCart();
      loadCart();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0 || cartTotal === 0) return;
    navigate('/thanh-toan');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary text-center mb-12" data-aos="fade-up">
            Giỏ Hàng
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center" data-aos="fade-up" data-aos-delay="200">
            <div className="text-6xl mb-6">🛒</div>
            <p className="text-xl text-gray-600 mb-8">Giỏ hàng của bạn đang trống.</p>
            <Link
              to="/san-pham"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
            Giỏ Hàng
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-semibold underline"
            >
              Xóa toàn bộ
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const imageUrl = getSafeImageUrl(item.image_url);

              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="flex flex-col sm:flex-row gap-4 p-4 md:p-6">
                    {/* Product Image */}
                    <Link
                      to={`/san-pham/${item.slug || `product-${item.id}`}`}
                      className="flex-shrink-0 w-full sm:w-32 h-40 sm:h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e)}
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex-1">
                        <Link
                          to={`/san-pham/${item.slug || `product-${item.id}`}`}
                          className="text-xl md:text-2xl font-semibold text-primary hover:text-primary-light transition-colors block mb-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.price)}
                        </p>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-semibold text-gray-700">Số lượng:</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-semibold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                handleQuantityChange(item.id, val);
                              }}
                              min="1"
                              className="w-16 h-8 border-2 border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-semibold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Thành tiền:</p>
                          <p className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.price * item.quantity)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 font-semibold p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-primary mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Số lượng sản phẩm:</span>
                  <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tổng tiền:</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thanh toán
                </button>
                <Link
                  to="/san-pham"
                  className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
