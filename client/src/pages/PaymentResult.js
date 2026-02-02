import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { clearCart } from '../utils/cart';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentResult = async () => {
      try {
        // Build query string from params
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
        
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/payment/vnpay-return?${queryString}`);
        
        if (response.data.success) {
          // Clear cart on successful payment
          clearCart();
          window.dispatchEvent(new Event('cartUpdated'));
        }
        
        setResult(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error checking payment result:', error);
        setResult({
          success: false,
          message: 'Không thể xác minh kết quả thanh toán',
        });
        setLoading(false);
      }
    };

    if (searchParams.toString()) {
      checkPaymentResult();
    } else {
      setResult({
        success: false,
        message: 'Không có thông tin thanh toán',
      });
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFDF6' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          {result?.success ? (
            <>
              <div className="mb-6">
                <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-6 text-lg">
                Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
              </p>
              {result.amount && (
                <p className="text-xl font-semibold text-gray-700 mb-6">
                  Số tiền: {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(result.amount)}
                </p>
              )}
              <div className="space-y-3">
                <Link
                  to="/san-pham"
                  className="block w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-light transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
                <Link
                  to="/"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-6 text-lg">
                {result?.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
              </p>
              <div className="space-y-3">
                <Link
                  to="/gio-hang"
                  className="block w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-light transition-colors"
                >
                  Thử lại thanh toán
                </Link>
                <Link
                  to="/"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
