import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await adminAPI.forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Đã xảy ra lỗi khi gửi email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-8">
          Quên Mật Khẩu
        </h1>
        
        {success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold mb-2">Email đã được gửi!</p>
              <p>Nếu email {email} tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vòng vài phút.</p>
              <p className="mt-2">Vui lòng kiểm tra hộp thư đến và spam của bạn.</p>
            </div>
            <Link
              to="/admin/login"
              className="block w-full text-center bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-light transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-blue-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email đăng ký
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold text-base hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Nhớ mật khẩu?{' '}
              <Link to="/admin/login" className="text-primary font-semibold hover:underline">
                Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
