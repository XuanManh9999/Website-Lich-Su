import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';

const FeaturedFlashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await quizAPI.getAll();
        const questions = response.data || [];
        
        if (questions.length > 0) {
          // Create flashcard sets from quiz questions
          const sets = createFlashcardSets(questions);
          setFlashcards(sets.slice(0, 3)); // Show first 3 sets
        } else {
          setFlashcards([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        setFlashcards([]);
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  // Create flashcard sets from questions
  const createFlashcardSets = (questions) => {
    if (!questions || questions.length === 0) {
      return [];
    }

    // Group questions by character_id or create a general set
    const grouped = {};
    questions.forEach(q => {
      const key = q.character_id || 'general';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(q);
    });

    // Convert to flashcard sets
    const sets = Object.keys(grouped).map((key, index) => {
      const questionsInSet = grouped[key];
      const questionCount = questionsInSet.length;
      return {
        id: key === 'general' ? `general-${index}` : `character-${key}`,
        title: key === 'general' 
          ? `Quiz Tổng Hợp ${index + 1}` 
          : `Quiz Nhân Vật Lịch Sử`,
        description: key === 'general'
          ? `Câu hỏi tổng hợp về lịch sử Việt Nam`
          : `Câu hỏi về nhân vật lịch sử`,
        preview: key === 'general'
          ? `Câu hỏi tổng hợp về lịch sử Việt Nam`
          : `Câu hỏi về nhân vật lịch sử`,
        cardsCount: questionCount,
        studyTime: Math.ceil(questionCount * 2), // 2 minutes per card
        difficulty: questionCount <= 5 ? 'Dễ' : questionCount <= 10 ? 'Trung bình' : 'Khó',
        isFavorite: index < 2, // First 2 sets are favorite
        slug: key === 'general' ? `general-${index}` : `character-${key}`,
        questionIds: questionsInSet.map(q => q.id),
      };
    });

    return sets;
  };

  const handleStartLearning = (slug) => {
    // Navigate to quiz page or specific flashcard set
    window.location.href = `/quiz?set=${slug}`;
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 md:mb-4">
            Flash Card học lịch sử
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Học lịch sử hiệu quả với phương pháp flashcard hiện đại, được thiết kế bởi các chuyên gia giáo dục
          </p>
        </div>

        {/* Flashcards List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có bộ flashcard nào.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              {flashcards.map((flashcard) => (
                <div
                  key={flashcard.id}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                    {/* Left: Content */}
                    <div className="flex-1">
                      {/* Title with Star */}
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                          {flashcard.title}
                        </h3>
                        {flashcard.isFavorite && (
                          <svg
                            className="w-6 h-6 md:w-7 md:h-7 text-yellow-400 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                        {flashcard.description}
                      </p>

                      {/* Preview */}
                      <p className="text-sm sm:text-base text-gray-600 italic mb-4 leading-relaxed">
                        Nội dung preview: {flashcard.preview}
                      </p>
                    </div>

                    {/* Right: Stats and Actions */}
                    <div className="flex flex-col items-start md:items-end gap-4 md:min-w-[200px]">
                      {/* Stats */}
                      <div className="flex gap-3 md:flex-col md:gap-3 w-full md:w-auto">
                        {/* Cards Count */}
                        <div className="bg-blue-100 rounded-lg p-3 flex flex-col items-center md:flex-row md:gap-3 flex-1 md:flex-initial min-w-[100px]">
                          <svg
                            className="w-6 h-6 text-primary mb-1 md:mb-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          <div className="text-center md:text-left">
                            <div className="text-xl md:text-2xl font-bold text-primary">
                              {flashcard.cardsCount}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Thẻ học</div>
                          </div>
                        </div>

                        {/* Study Time */}
                        <div className="bg-blue-100 rounded-lg p-3 flex flex-col items-center md:flex-row md:gap-3 flex-1 md:flex-initial min-w-[100px]">
                          <svg
                            className="w-6 h-6 text-primary mb-1 md:mb-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-center md:text-left">
                            <div className="text-xl md:text-2xl font-bold text-primary">
                              {flashcard.studyTime}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Thời gian học</div>
                          </div>
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="w-full md:w-auto">
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {flashcard.difficulty}
                        </span>
                      </div>

                      {/* Start Button */}
                      <button
                        onClick={() => handleStartLearning(flashcard.slug)}
                        className="w-full md:w-auto bg-primary text-white px-6 md:px-8 py-3 rounded-lg font-semibold text-base md:text-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Bắt đầu học
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link
                to="/quiz"
                className="inline-block bg-primary text-white px-8 md:px-12 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
              >
                Xem tất cả bộ flashcard
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedFlashcards;
