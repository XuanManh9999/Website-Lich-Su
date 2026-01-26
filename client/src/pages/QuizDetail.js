import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';

const QuizDetail = () => {
  const { id } = useParams();
  // const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({}); // Store answers for each question
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState({
    title: 'Mini test',
    description: 'Câu hỏi tổng hợp về lịch sử Việt Nam giai đoạn kháng chiến chống Pháp',
    cardCount: 5,
    learningTime: 10,
    difficulty: 'Dễ',
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await quizAPI.getAll();
        const allQuestions = response.data || [];
        
        // For now, use first 5 questions or all available
        const quizQuestions = allQuestions.slice(0, Math.min(5, allQuestions.length));
        setQuestions(quizQuestions);
        
        // Update quiz info
        if (quizQuestions.length > 0) {
          setQuizInfo({
            title: 'Mini test',
            description: 'Câu hỏi tổng hợp về lịch sử Việt Nam giai đoạn kháng chiến chống Pháp',
            cardCount: quizQuestions.length,
            learningTime: Math.ceil(quizQuestions.length * 2),
            difficulty: 'Dễ',
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    // Save answer to answers object
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
    setShowAnswer(false);
  };

  const handleNext = () => {
    // Save current answer before moving
    if (selectedAnswer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Load saved answer for next question if exists
      const nextAnswer = answers[currentQuestion + 1] || '';
      setSelectedAnswer(nextAnswer);
      setShowAnswer(false);
    } else {
      // Quiz completed - calculate score and show results
      calculateScore();
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    // Save current answer before moving
    if (selectedAnswer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }

    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Load saved answer for previous question if exists
      const prevAnswer = answers[currentQuestion - 1] || '';
      setSelectedAnswer(prevAnswer);
      setShowAnswer(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleStartQuiz = () => {
    setHasStarted(true);
    setAnswers({});
    setSelectedAnswer('');
    setScore(0);
    setCurrentQuestion(0);
    setIsCompleted(false);
  };

  const calculateScore = () => {
    // Save current answer before calculating
    const finalAnswers = {
      ...answers,
      [currentQuestion]: selectedAnswer || answers[currentQuestion]
    };

    let correctCount = 0;
    questions.forEach((q, index) => {
      const userAnswer = finalAnswers[index];
      if (userAnswer && userAnswer === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setAnswers({});
    setScore(0);
    setIsCompleted(false);
    setShowAnswer(false);
    setHasStarted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Không tìm thấy câu hỏi nào.</p>
          <Link
            to="/quiz"
            className="text-primary hover:underline font-semibold"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Results screen
  if (isCompleted) {
    const correctCount = score;
    const wrongCount = questions.length - correctCount;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        {/* Red Header */}
        <div className="bg-primary text-white py-6 md:py-8 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Kết quả Quiz</h1>
            <p className="text-lg md:text-xl opacity-90">{quizInfo.title}</p>
          </div>
        </div>

        {/* Results Card */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center" data-aos="fade-up">
            {/* Score Circle */}
            <div className="flex justify-center mb-8" data-aos="zoom-in" data-aos-delay="200">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - percentage / 100)}`}
                    className="text-primary transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-primary">
                      {percentage}%
                    </div>
                    <div className="text-sm md:text-base text-gray-600 mt-1">Hoàn thành</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="mb-8" data-aos="fade-up" data-aos-delay="300">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Bạn đã trả lời đúng {correctCount} / {questions.length} câu
              </h2>
              
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-green-600">{correctCount}</span>
                  <span className="text-sm text-gray-600">Câu đúng</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-red-600">{wrongCount}</span>
                  <span className="text-sm text-gray-600">Câu sai</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8" data-aos="fade-up" data-aos-delay="400">
              <Link
                to="/quiz"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Quay lại danh sách
              </Link>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion] || selectedAnswer;

  // Pre-start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        {/* Red Header */}
        <div className="bg-primary text-white py-6 md:py-8 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/quiz"
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Quay lại danh sách</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{quizInfo.title}</h1>
            <p className="text-lg md:text-xl opacity-90">{quizInfo.description}</p>
            <div className="flex items-center gap-4 md:gap-6 mt-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>{quizInfo.cardCount} thẻ</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{quizInfo.learningTime} phút</span>
              </div>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {quizInfo.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center" data-aos="fade-up" data-aos-delay="300">
          <button
            onClick={handleStartQuiz}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 mx-auto transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            Bắt đầu Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Red Header */}
      <div className="bg-primary text-white py-4 md:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/quiz"
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại danh sách</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{quizInfo.title}</h1>
          <p className="text-base md:text-lg opacity-90">{quizInfo.description}</p>
          <div className="flex items-center gap-4 md:gap-6 mt-3">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{quizInfo.cardCount} thẻ</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{quizInfo.learningTime} phút</span>
            </div>
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs md:text-sm font-semibold">
              {quizInfo.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base text-gray-700 font-semibold">
              Câu {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-sm md:text-base text-gray-700 font-semibold">
              {Math.round(progress)}% hoàn thành
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            Câu hỏi {currentQuestion + 1}
          </h2>
          <div 
            className="text-xl sm:text-2xl md:text-3xl text-gray-900 leading-relaxed mb-8 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: question.question || '' 
            }}
          />

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = question[`option_${option.toLowerCase()}`];
              if (!optionText) return null;

              const isSelected = currentAnswer === option;
              const isCorrectAnswer = question.correct_answer === option;
              const showResult = showAnswer && isCorrectAnswer;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-blue-50 text-primary font-semibold'
                      : showResult
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-300 hover:border-primary hover:bg-blue-50'
                  }`}
                >
                  {option}. {optionText}
                </button>
              );
            })}
          </div>

          {/* Show Answer Button (in card) */}
          <div className="mb-8">
            <button
              onClick={handleShowAnswer}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-light transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Xem đáp án
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Câu trước
          </button>

          <button
            onClick={handleShowAnswer}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-light transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Xem đáp án
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {currentQuestion === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
