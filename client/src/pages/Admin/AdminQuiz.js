import React, { useState, useEffect, useMemo } from 'react';
import { quizAPI, characterAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

const AdminQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCharacter, setFilterCharacter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    character_id: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, charactersRes] = await Promise.all([
        quizAPI.getAll(),
        characterAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setQuestions(questionsRes.data || []);
      setCharacters(charactersRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((q) => q.question?.toLowerCase().includes(query));
    }

    if (filterCharacter) {
      filtered = filtered.filter((q) => q.character_id?.toString() === filterCharacter);
    }

    return filtered;
  }, [questions, searchTerm, filterCharacter]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'character_id') setFilterCharacter(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        character_id: formData.character_id || null,
      };
      if (editingQuestion) {
        await quizAPI.update(editingQuestion.id, submitData);
        showToast('Cập nhật câu hỏi thành công!', 'success');
      } else {
        await quizAPI.create(submitData);
        showToast('Tạo câu hỏi mới thành công!', 'success');
      }
      fetchData();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question || '',
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_answer: question.correct_answer || 'A',
      character_id: question.character_id?.toString() || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      try {
        await quizAPI.delete(id);
        showToast('Xóa câu hỏi thành công!', 'success');
        fetchData();
        if (currentPage > totalPages && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      character_id: '',
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const getCharacterName = (characterId) => {
    if (!characterId) return 'Chung';
    const character = characters.find((c) => c.id === characterId);
    return character?.name || 'Không xác định';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'question',
      label: 'Câu hỏi',
      render: (value) => (value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'),
    },
    {
      key: 'correct_answer',
      label: 'Đáp án đúng',
      render: (value) => value || '-',
    },
    {
      key: 'character_id',
      label: 'Nhân vật',
      render: (value) => getCharacterName(value),
    },
  ];

  const filters = [
    {
      key: 'character_id',
      label: 'Lọc theo nhân vật',
      value: filterCharacter,
      options: [
        { value: '', label: 'Tất cả' },
        ...characters.map((c) => ({ value: c.id.toString(), label: c.name })),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-history-red">Quản Trị Câu Hỏi Quiz</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
          >
            {showForm ? 'Đóng Form' : 'Thêm Câu Hỏi Mới'}
          </button>
        </div>

        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          placeholder="Tìm kiếm theo câu hỏi..."
        />

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-history-red mb-6">
              {editingQuestion ? 'Chỉnh Sửa' : 'Thêm Mới'} Câu Hỏi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Câu hỏi *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đáp án A *
                  </label>
                  <input
                    type="text"
                    name="option_a"
                    value={formData.option_a}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đáp án B *
                  </label>
                  <input
                    type="text"
                    name="option_b"
                    value={formData.option_b}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đáp án C
                  </label>
                  <input
                    type="text"
                    name="option_c"
                    value={formData.option_c}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đáp án D
                  </label>
                  <input
                    type="text"
                    name="option_d"
                    value={formData.option_d}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đáp án đúng *
                  </label>
                  <select
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nhân vật liên quan
                  </label>
                  <select
                    name="character_id"
                    value={formData.character_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  >
                    <option value="">Chung (không liên quan)</option>
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
                >
                  {editingQuestion ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <AdminTable
          data={currentData}
          columns={columns}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={`Không tìm thấy câu hỏi nào${searchTerm || filterCharacter ? ' với bộ lọc hiện tại' : ''}`}
        />

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminQuiz;
