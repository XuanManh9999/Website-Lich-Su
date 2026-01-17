import React, { useState, useEffect } from 'react';
import { quizAPI } from '../services/api';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await quizAPI.getAll();
        setQuestions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setScore(0);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-history-red"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Chưa có câu hỏi nào.</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-history-red mb-6">
              Kết Quả Quiz
            </h2>
            <p className="text-2xl md:text-3xl text-gray-700 mb-8">
              Bạn đã trả lời đúng <span className="font-bold text-history-red">{score}</span> / {questions.length} câu
            </p>
            <button
              onClick={handleRestart}
              className="bg-history-red text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-history-red-light transition-colors"
            >
              Làm Lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-history-red text-center mb-8">
          Quiz Trắc Nghiệm
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-right text-sm sm:text-base text-gray-600 font-semibold mb-6">
            Câu {currentQuestion + 1} / {questions.length}
          </div>
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-800 leading-relaxed">
              {question.question}
            </h2>
            <div className="space-y-4">
              <button
                className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === 'A'
                    ? 'border-history-red bg-red-50 text-history-red font-semibold'
                    : 'border-gray-300 hover:border-history-red hover:bg-red-50'
                }`}
                onClick={() => handleAnswerSelect('A')}
              >
                A. {question.option_a}
              </button>
              <button
                className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === 'B'
                    ? 'border-history-red bg-red-50 text-history-red font-semibold'
                    : 'border-gray-300 hover:border-history-red hover:bg-red-50'
                }`}
                onClick={() => handleAnswerSelect('B')}
              >
                B. {question.option_b}
              </button>
              {question.option_c && (
                <button
                  className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === 'C'
                      ? 'border-history-red bg-red-50 text-history-red font-semibold'
                      : 'border-gray-300 hover:border-history-red hover:bg-red-50'
                  }`}
                  onClick={() => handleAnswerSelect('C')}
                >
                  C. {question.option_c}
                </button>
              )}
              {question.option_d && (
                <button
                  className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === 'D'
                      ? 'border-history-red bg-red-50 text-history-red font-semibold'
                      : 'border-gray-300 hover:border-history-red hover:bg-red-50'
                  }`}
                  onClick={() => handleAnswerSelect('D')}
                >
                  D. {question.option_d}
                </button>
              )}
            </div>
            <button
              className="w-full sm:w-auto sm:ml-auto bg-history-red text-white px-8 py-3 rounded-lg font-semibold text-base hover:bg-history-red-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed block sm:inline-block"
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              {currentQuestion < questions.length - 1 ? 'Tiếp Theo' : 'Xem Kết Quả'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
