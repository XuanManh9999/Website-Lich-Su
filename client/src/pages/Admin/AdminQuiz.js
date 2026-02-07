import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { quizAPI, characterAPI, quizCategoryAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

// Helper function to strip HTML tags for preview
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const AdminQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCharacter, setFilterCharacter] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    character_id: '',
    category_id: '',
  });
  const quillRef = useRef(null);
  const itemsPerPage = 10;

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [questionsRes, charactersRes, categoriesRes] = await Promise.all([
        quizAPI.getAll(),
        characterAPI.getAll().catch(() => ({ data: [] })),
        quizCategoryAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setQuestions(questionsRes.data || []);
      setCharacters(charactersRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((q) => {
        const plainText = stripHtml(q.question || '');
        return plainText.toLowerCase().includes(query);
      });
    }

    if (filterCharacter) {
      filtered = filtered.filter((q) => q.character_id?.toString() === filterCharacter);
    }

    if (filterCategory) {
      filtered = filtered.filter((q) => q.category_id?.toString() === filterCategory);
    }

    return filtered;
  }, [questions, searchTerm, filterCharacter, filterCategory]);

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
    if (key === 'category_id') setFilterCategory(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuestionChange = (content) => {
    setFormData({ ...formData, question: content });
  };

  // ReactQuill modules configuration for question
  const questionModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const questionFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        character_id: formData.character_id || null,
        category_id: formData.category_id || null,
      };
      if (editingQuestion) {
        await quizAPI.update(editingQuestion.id, submitData);
        showToast('✅ Cập nhật câu hỏi thành công!', 'success');
      } else {
        await quizAPI.create(submitData);
        showToast('✅ Tạo câu hỏi mới thành công!', 'success');
      }
      fetchData();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
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
      category_id: question.category_id?.toString() || '',
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
      category_id: '',
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await quizCategoryAPI.update(editingCategory.id, categoryFormData);
        showToast('✅ Cập nhật danh mục thành công!', 'success');
      } else {
        await quizCategoryAPI.create(categoryFormData);
        showToast('✅ Tạo danh mục mới thành công!', 'success');
      }
      fetchData();
      resetCategoryForm();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này? Các câu hỏi thuộc danh mục này sẽ không bị xóa nhưng sẽ không còn thuộc danh mục nào.')) {
      try {
        await quizCategoryAPI.delete(id);
        showToast('Xóa danh mục thành công!', 'success');
        fetchData();
      } catch (error) {
        showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
      }
    }
  };

  const getCharacterName = (characterId) => {
    if (!characterId) return 'Chung';
    const character = characters.find((c) => c.id === characterId);
    return character?.name || 'Không xác định';
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Chưa phân loại';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Không xác định';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'question',
      label: 'Câu hỏi',
      render: (value) => {
        if (!value) return '-';
        const plainText = stripHtml(value);
        return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
      },
    },
    {
      key: 'correct_answer',
      label: 'Đáp án đúng',
      render: (value) => value || '-',
    },
    {
      key: 'category_name',
      label: 'Danh mục',
      render: (value, row) => getCategoryName(row.category_id),
    },
    {
      key: 'character_name',
      label: 'Nhân vật',
      render: (value, row) => getCharacterName(row.character_id),
    },
  ];

  const filters = [
    {
      key: 'category_id',
      label: 'Lọc theo danh mục',
      value: filterCategory,
      options: [
        { value: '', label: 'Tất cả' },
        ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
      ],
    },
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
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Quản Trị Câu Hỏi Quiz</h1>
            <p className="text-gray-600 mt-2">Quản lý câu hỏi quiz và gán vào danh mục</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/quiz-categories"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Quản Lý Danh Mục
            </Link>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            {showForm ? 'Đóng Form' : 'Thêm Câu Hỏi Mới'}
          </button>
          </div>
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
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {editingQuestion ? 'Chỉnh Sửa' : 'Thêm Mới'} Câu Hỏi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Câu hỏi *
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.question}
                    onChange={handleQuestionChange}
                    modules={questionModules}
                    formats={questionFormats}
                    placeholder="Viết câu hỏi tại đây..."
                    style={{ minHeight: '120px' }}
                  />
                </div>
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
                    Danh mục Quiz *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nhân vật liên quan (tùy chọn)
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
                  disabled={isSubmitting}
                  className={`bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-primary-light'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>{editingQuestion ? '✅ Cập Nhật' : '➕ Tạo Mới'}</>
                  )}
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
          emptyMessage={`Không tìm thấy câu hỏi nào${searchTerm || filterCharacter || filterCategory ? ' với bộ lọc hiện tại' : ''}`}
        />

        {/* Category Management Form */}
        {showCategoryForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {editingCategory ? 'Chỉnh Sửa' : 'Thêm Mới'} Danh Mục Quiz
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  required
                  placeholder="Ví dụ: Lịch Sử Thế Giới, Lịch Sử Cận Đại Việt Nam..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Mô tả về danh mục này..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>{editingCategory ? '✅ Cập Nhật' : '➕ Tạo Mới'}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>

            {/* Categories List */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Danh sách danh mục</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryFormData({ name: cat.name, description: cat.description || '' });
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(cat.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-gray-600">{cat.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminQuiz;
