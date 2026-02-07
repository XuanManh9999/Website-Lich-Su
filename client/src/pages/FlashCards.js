import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizCategoryAPI, quizAPI } from '../services/api';

const FlashCards = () => {
  const [categories, setCategories] = useState([]);
  const [categoryQuestionCounts, setCategoryQuestionCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await quizCategoryAPI.getAll();
        const categoriesData = categoriesResponse.data || [];
        
        // Fetch question counts for each category
        const counts = {};
        await Promise.all(
          categoriesData.map(async (category) => {
            try {
              const questionsResponse = await quizAPI.getAll({ category_id: category.id });
              counts[category.id] = (questionsResponse.data || []).length;
            } catch (err) {
              counts[category.id] = 0;
            }
          })
        );
        
        setCategories(categoriesData);
        setCategoryQuestionCounts(counts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategories([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12" data-aos="fade-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Quizlet card học lịch sử
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Học lịch sử hiệu quả với phương pháp Quizlet card hiện đại, được thiết kế bởi các chuyên gia giáo dục
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Chưa có danh mục quiz nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => {
              const questionCount = categoryQuestionCounts[category.id] || 0;
              const learningTime = Math.ceil(questionCount * 2);
              const difficulty = questionCount <= 5 ? 'Dễ' : questionCount <= 10 ? 'Trung bình' : 'Khó';
              
              return (
                <div key={category.id} className="card group" data-aos="fade-up" data-aos-delay={index * 100}>
                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col h-full">
                  {/* Title with Star */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1 pr-2">
                        {category.name}
                    </h2>
                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 flex-1">
                      {category.description || `Câu hỏi trắc nghiệm về ${category.name}`}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Flashcard Count */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                        <span className="text-sm font-semibold text-gray-700">{questionCount}</span>
                        <span className="text-xs text-gray-500">Câu hỏi</span>
                    </div>

                    {/* Learning Time */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                        <span className="text-sm font-semibold text-gray-700">{learningTime}</span>
                        <span className="text-xs text-gray-500">Phút</span>
                    </div>
                  </div>

                  {/* Difficulty Tag */}
                    {questionCount > 0 && (
                  <div className="mb-6">
                    <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {difficulty}
                    </span>
                  </div>
                    )}

                  {/* Start Button */}
                    {questionCount > 0 ? (
                  <Link
                        to={`/quiz/${category.id}`}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Bắt đầu học
                  </Link>
                    ) : (
                      <div className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-semibold text-center cursor-not-allowed">
                        Chưa có câu hỏi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCards;
