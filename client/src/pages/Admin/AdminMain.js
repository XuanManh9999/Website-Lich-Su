import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await adminAPI.verify();
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Tổng Quan', icon: '📊' },
    { path: '/admin/carousel', label: 'Carousel', icon: '🖼️' },
    { path: '/admin/characters', label: 'Nhân Vật', icon: '👤' },
    { path: '/admin/posts', label: 'Bài Viết', icon: '📝' },
    { path: '/admin/products', label: 'Sản Phẩm', icon: '🛍️' },
    { path: '/admin/quiz', label: 'Câu Hỏi Quiz', icon: '❓' },
    { path: '/admin/orders', label: 'Đơn Hàng', icon: '💰' },
    { path: '/admin/admins', label: 'Quản Trị Viên', icon: '👥' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-history-red text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-history-red-light flex items-center justify-between">
          <h1 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>
            Admin Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-history-red-light rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-white text-history-red font-semibold'
                  : 'hover:bg-history-red-light'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className={sidebarOpen ? 'block' : 'hidden'}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-history-red-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-history-red-light transition-colors"
            title={!sidebarOpen ? 'Đăng xuất' : ''}
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminMain;
