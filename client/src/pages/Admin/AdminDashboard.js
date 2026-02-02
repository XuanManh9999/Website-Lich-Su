import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { characterAPI, postAPI, productAPI, quizAPI, adminAPI, orderAPI, carouselAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    carousel: 0,
    characters: 0,
    posts: 0,
    products: 0,
    quiz: 0,
    orders: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [carousel, characters, posts, products, quiz, orders, admins] = await Promise.all([
        carouselAPI.getAllForAdmin().catch(() => ({ data: [] })),
        characterAPI.getAll().catch(() => ({ data: [] })),
        postAPI.getAll().catch(() => ({ data: [] })),
        productAPI.getAll().catch(() => ({ data: [] })),
        quizAPI.getAll().catch(() => ({ data: [] })),
        orderAPI.getAll({ page: 1, limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
        adminAPI.getAll().catch(() => ({ data: [] })),
      ]);

      setStats({
        carousel: carousel.data?.length || 0,
        characters: characters.data?.length || 0,
        posts: posts.data?.length || 0,
        products: products.data?.length || 0,
        quiz: quiz.data?.length || 0,
        orders: orders.data?.pagination?.total || 0,
        admins: admins.data?.length || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Carousel', count: stats.carousel, path: '/admin/carousel', color: 'bg-pink-500', icon: '🖼️' },
    { label: 'Nhân Vật', count: stats.characters, path: '/admin/characters', color: 'bg-blue-500', icon: '👤' },
    { label: 'Bài Viết', count: stats.posts, path: '/admin/posts', color: 'bg-green-500', icon: '📝' },
    { label: 'Sản Phẩm', count: stats.products, path: '/admin/products', color: 'bg-yellow-500', icon: '🛍️' },
    { label: 'Câu Hỏi Quiz', count: stats.quiz, path: '/admin/quiz', color: 'bg-purple-500', icon: '❓' },
    { label: 'Đơn Hàng', count: stats.orders, path: '/admin/orders', color: 'bg-indigo-500', icon: '💰' },
    { label: 'Quản Trị Viên', count: stats.admins, path: '/admin/admins', color: 'bg-blue-500', icon: '👥' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
          Tổng Quan Hệ Thống
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className={`${card.color} rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">{card.label}</p>
                  <p className="text-4xl font-bold">{card.count}</p>
                </div>
                <span className="text-5xl">{card.icon}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Quản Lý Nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statCards.map((card) => (
          <Link 
                key={card.path}
                to={card.path}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="font-semibold text-gray-700">{card.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
