import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCartItemCount } from '../utils/cart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = localStorage.getItem('adminToken');

  // Update cart count when location changes (cart was updated)
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    updateCartCount();
    // Listen for storage changes (when cart is updated in another tab)
    window.addEventListener('storage', updateCartCount);
    // Listen for custom event when cart is updated
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.jpg" 
              alt="Việt Sử Quân Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-md object-cover shadow-lg group-hover:scale-105 transition-transform"
            />
            <span className="text-xl sm:text-2xl font-bold group-hover:opacity-90 transition-opacity">
              Việt Sử Quân
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link 
              to="/" 
              className={`text-sm xl:text-base font-medium transition-colors ${
                location.pathname === '/' ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/san-pham" 
              className={`text-sm xl:text-base font-medium transition-colors ${
                location.pathname === '/san-pham' ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              Sản phẩm
            </Link>
            <Link 
              to="/blog" 
              className={`text-sm xl:text-base font-medium transition-colors ${
                location.pathname === '/blog' ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              Blog lịch sử
            </Link>
            <Link 
              to="/quiz" 
              className={`text-sm xl:text-base font-medium transition-colors ${
                location.pathname === '/quiz' ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              Flash Card
            </Link>
            <Link 
              to="/chatbot" 
              className={`text-sm xl:text-base font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/chatbot' ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chatbot AI
            </Link>
            <Link 
              to="/gio-hang" 
              className={`text-sm xl:text-base font-medium transition-colors flex items-center gap-2 relative ${
                location.pathname === '/gio-hang' ? 'text-white' : 'hover:text-white/80'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {isAdmin ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="text-sm xl:text-base font-medium hover:text-white/80 transition-colors"
                >
                  Admin
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm xl:text-base font-medium transition-colors border border-white/30"
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className={`text-sm xl:text-base font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === '/admin/login' ? 'text-white' : 'hover:text-white/80'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Trang chủ
            </Link>
            <Link 
              to="/san-pham" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Sản phẩm
            </Link>
            <Link 
              to="/blog" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Blog lịch sử
            </Link>
            <Link 
              to="/quiz" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Flash Card
            </Link>
            <Link 
              to="/chatbot" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chatbot AI
            </Link>
            <Link 
              to="/gio-hang" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors relative"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Giỏ hàng
              {cartCount > 0 && (
                <span className="bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {isAdmin ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Admin
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
