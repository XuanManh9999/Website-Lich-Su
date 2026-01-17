import React, { useState } from 'react';
import { chatbotAPI } from '../services/api';

const Chatbot = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  const interactionModes = [
    {
      id: 'explore',
      title: 'Khám Phá Chủ Đề',
      description: 'Hỏi-đáp, tra cứu và tìm hiểu theo sự kiện, nhân vật, giai đoạn lịch sử.',
      color: 'blue',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 'personal',
      title: 'Cá Nhân',
      description: 'Học theo sở thích, độ tuổi và trình độ riêng của bạn.',
      color: 'green',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'challenge',
      title: 'Thử Thách',
      description: 'Làm trắc nghiệm để ôn tập và kiểm tra kiến thức.',
      color: 'orange',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'roadmap',
      title: 'Lộ Trình',
      description: 'Gợi ý học lại, mở rộng hoặc nâng cao nội dung.',
      color: 'purple',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
  ];

  const suggestedQuestions = [
    'Chiến dịch Điện Biên Phủ diễn ra như thế nào?',
    'Ai là vua đầu tiên của triều Nguyễn?',
    'Cách mạng tháng Tám có ý nghĩa gì?',
  ];

  const popularTopics = [
    'Các triều đại phong kiến',
    'Kháng chiến chống thực dân',
    'Văn hóa truyền thống',
  ];

  const aiFeatures = [
    'Trả lời chính xác',
    'Giải thích chi tiết',
    'Tương tác thân thiện',
  ];

  const getModeColors = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        textLight: 'text-blue-500',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        textLight: 'text-green-500',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        textLight: 'text-orange-500',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        textLight: 'text-purple-500',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100',
      },
    };
    return colors[color] || colors.blue;
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    if (!selectedMode) {
      alert('Vui lòng chọn chế độ tương tác trước khi gửi câu hỏi!');
      return;
    }

    const currentQuestion = question;
    setQuestion(''); // Clear input immediately

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: currentQuestion,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: 'Đang tìm kiếm thông tin...',
      loading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Call Gemini AI API
      const response = await chatbotAPI.chat(currentQuestion, selectedMode);
      const aiResponse = response.data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';

      // Replace loading message with actual response
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg.loading);
        return [...filtered, {
          id: Date.now() + 2,
          type: 'ai',
          text: aiResponse,
        }];
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg.loading);
        return [...filtered, {
          id: Date.now() + 2,
          type: 'ai',
          text: 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.',
        }];
      });
    }
  };

  const handleSuggestedQuestionClick = (q) => {
    setQuestion(q);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Main Interactive Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 lg:p-10 mb-8">
          {/* Heading */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Chọn chế độ tương tác:
          </h2>

          {/* Interaction Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            {interactionModes.map((mode) => {
              const colors = getModeColors(mode.color);
              const isSelected = selectedMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 md:p-6 text-left transition-all ${
                    isSelected ? 'ring-2 ring-offset-2 ring-current' : ''
                  } ${colors.hover} transition-all`}
                >
                  <div className={`${colors.text} mb-3`}>{mode.icon}</div>
                  <h3 className={`text-lg md:text-xl font-bold ${colors.text} mb-2`}>
                    {mode.title}
                  </h3>
                  <p className={`text-sm md:text-base ${colors.textLight} leading-relaxed`}>
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Input Field and Send Button */}
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              placeholder="Nhập câu hỏi về lịch sử Việt Nam..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none text-base"
            />
            <button
              onClick={handleSend}
              disabled={!question.trim()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Gửi</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mt-8 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-history-red text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm md:text-base">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Panel - Supplementary Information */}
        <div className="bg-pink-50 rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Suggested Questions */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-history-red mb-4">
                Câu hỏi gợi ý
              </h3>
              <ul className="space-y-3">
                {suggestedQuestions.map((q, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestedQuestionClick(q)}
                      className="text-left text-sm md:text-base text-gray-700 hover:text-history-red transition-colors flex items-start gap-2"
                    >
                      <span className="text-history-red mt-1">•</span>
                      <span>{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Middle Column: Popular Topics */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-history-red mb-4">
                Chủ đề phổ biến
              </h3>
              <ul className="space-y-3">
                {popularTopics.map((topic, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setQuestion(`Hãy kể về ${topic.toLowerCase()}`)}
                      className="text-left text-sm md:text-base text-gray-700 hover:text-history-red transition-colors flex items-start gap-2"
                    >
                      <span className="text-history-red mt-1">•</span>
                      <span>{topic}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: AI Features */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-history-red mb-4">
                Tính năng AI
              </h3>
              <ul className="space-y-3">
                {aiFeatures.map((feature, index) => (
                  <li key={index}>
                    <span className="text-sm md:text-base text-gray-700 flex items-start gap-2">
                      <span className="text-history-red mt-1">•</span>
                      <span>{feature}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
