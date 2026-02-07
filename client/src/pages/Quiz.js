import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI, quizCategoryAPI } from '../services/api';

const Quiz = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await quizCategoryAPI.getAll();
        setCategories(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId) => {
    navigate(`/quiz/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFDF6' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải danh mục quiz...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      {/* Header với nền đỏ */}
      <div 
        className="w-full py-12 md:py-16 mb-8 md:mb-12"
        style={{
          background: 'linear-gradient(135deg, #8F1A1E 0%, #B83236 45%, #5C0F12 100%)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
              Quiz Trắc Nghiệm
            </h1>
            <div className="w-24 h-1 bg-white mx-auto rounded-full mb-4"></div>
            <p className="text-white/90 mt-4 text-base md:text-lg max-w-2xl mx-auto">
              Chọn danh mục quiz để bắt đầu kiểm tra kiến thức của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách danh mục */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có danh mục quiz nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-8 cursor-pointer border-2 border-transparent hover:border-primary group"
              >
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary-light rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Bắt đầu quiz</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
