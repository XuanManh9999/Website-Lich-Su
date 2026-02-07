import React, { useState, useEffect, useCallback } from 'react';
import { quizCategoryAPI, quizAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

const AdminQuizCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [categoryStats, setCategoryStats] = useState({}); // Store question counts for each category
  const itemsPerPage = 10;

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const categoriesRes = await quizCategoryAPI.getAll();
      const categoriesData = categoriesRes.data || [];
      
      // Fetch question counts for each category
      const stats = {};
      await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const questionsRes = await quizAPI.getAll({ category_id: category.id });
            stats[category.id] = (questionsRes.data || []).length;
          } catch (err) {
            stats[category.id] = 0;
          }
        })
      );
      
      setCategories(categoriesData);
      setCategoryStats(stats);
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

  const filteredCategories = categories.filter((cat) => {
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      return (
        cat.name?.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };

  const handleSubmit = async (e) => {
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
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || '',
      description: category.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const questionCount = categoryStats[id] || 0;
    if (questionCount > 0) {
      if (!window.confirm(`Danh mục này có ${questionCount} câu hỏi. Bạn có chắc muốn xóa? Các câu hỏi sẽ không bị xóa nhưng sẽ không còn thuộc danh mục nào.`)) {
        return;
      }
    } else {
      if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
        return;
      }
    }
    
    try {
      await quizCategoryAPI.delete(id);
      showToast('Xóa danh mục thành công!', 'success');
      fetchData();
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const resetForm = () => {
    setCategoryFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'name',
      label: 'Tên danh mục',
      render: (value) => value || '-',
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value) => {
        if (!value) return '-';
        return value.length > 50 ? value.substring(0, 50) + '...' : value;
      },
    },
    {
      key: 'question_count',
      label: 'Số câu hỏi',
      render: (value, row) => categoryStats[row.id] || 0,
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('vi-VN');
      },
    },
  ];

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Quản Trị Danh Mục Quiz</h1>
            <p className="text-gray-600 mt-2">Quản lý các danh mục/chủ đề cho câu hỏi quiz</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            {showForm ? 'Đóng Form' : '➕ Thêm Danh Mục Mới'}
          </button>
        </div>

        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={[]}
          onFilterChange={() => {}}
          placeholder="Tìm kiếm theo tên hoặc mô tả..."
        />

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {editingCategory ? 'Chỉnh Sửa' : 'Thêm Mới'} Danh Mục Quiz
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ví dụ: Lịch Sử Thế Giới, Lịch Sử Cận Đại Việt Nam..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tên danh mục sẽ hiển thị cho người dùng khi chọn quiz
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về danh mục này, ví dụ: Câu hỏi về lịch sử các nước trên thế giới..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mô tả sẽ giúp người dùng hiểu rõ hơn về nội dung quiz trong danh mục này
                </p>
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
                    <>{editingCategory ? '✅ Cập Nhật' : '➕ Tạo Mới'}</>
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
          emptyMessage={`Không tìm thấy danh mục nào${searchTerm ? ' với từ khóa tìm kiếm' : ''}`}
        />

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminQuizCategories;

