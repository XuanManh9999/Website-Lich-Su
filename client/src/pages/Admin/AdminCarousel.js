import React, { useState, useEffect, useMemo } from 'react';
import { carouselAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';
import { fileToBase64, validateImage } from '../../utils/fileUtils';

const AdminCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    quote: '',
    author: 'Thiên Sử Ký',
    display_order: 0,
    is_active: true,
    image_url: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await carouselAPI.getAllForAdmin();
      setSlides(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  };

  const filteredSlides = useMemo(() => {
    let filtered = slides;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (slide) =>
          slide.quote?.toLowerCase().includes(query) ||
          slide.author?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [slides, searchTerm]);

  const totalPages = Math.ceil(filteredSlides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredSlides.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  // Handle image upload and convert to base64
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file, 5);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      e.target.value = '';
      return;
    }

    try {
      showToast('Đang upload ảnh...', 'info');
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, image_url: base64 });
      showToast('Upload ảnh thành công!', 'success');
    } catch (error) {
      console.error('Error converting image:', error);
      showToast('Lỗi khi upload ảnh!', 'error');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        await carouselAPI.update(editingSlide.id, formData);
        showToast('Cập nhật slide thành công!', 'success');
      } else {
        await carouselAPI.create(formData);
        showToast('Tạo slide mới thành công!', 'success');
      }
      fetchSlides();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      quote: slide.quote || '',
      author: slide.author || 'Thiên Sử Ký',
      display_order: slide.display_order || 0,
      is_active: slide.is_active !== undefined ? slide.is_active : true,
      image_url: slide.image_url || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa slide này?')) {
      try {
        await carouselAPI.delete(id);
        showToast('Xóa slide thành công!', 'success');
        fetchSlides();
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
      quote: '',
      author: 'Thiên Sử Ký',
      display_order: 0,
      is_active: true,
      image_url: '',
    });
    setEditingSlide(null);
    setShowForm(false);
  };

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'quote',
      label: 'Câu quote',
      render: (value) => (value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'),
    },
    { key: 'author', label: 'Tác giả', render: (value) => value || '-' },
    {
      key: 'image_url',
      label: 'Ảnh',
      render: (value) => {
        if (!value) return '-';
        const imageUrl = value.startsWith('http') ? value : `http://localhost:5000${value}`;
        return (
          <img
            src={imageUrl}
            alt="Slide"
            className="w-16 h-10 object-cover rounded"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/64x40/0F4C81/FFFFFF?text=Image';
            }}
          />
        );
      },
    },
    { key: 'display_order', label: 'Thứ tự', render: (value) => value ?? 0 },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleString('vi-VN');
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Quản Trị Carousel</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            + Tạo Slide Mới
          </button>
        </div>

        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={[]}
          onFilterChange={handleFilterChange}
          placeholder="Tìm kiếm theo quote, tác giả..."
        />

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-primary mb-6">
              {editingSlide ? 'Chỉnh Sửa Slide' : 'Tạo Slide Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Câu quote <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="quote"
                  value={formData.quote}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Nhập câu quote..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tác giả
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Nhập tên tác giả..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh slide {!editingSlide && <span className="text-red-500">*</span>}
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    required={!editingSlide && !formData.image_url}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
                  />
                  {formData.image_url && (
                    <div className="relative w-full max-w-2xl">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Xóa ảnh"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    💡 Tip: Upload ảnh slide tự động chuyển sang base64. Tối đa 5MB. Kích thước khuyến nghị: 1920x800px.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    id="is_active"
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-history-red"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                    Kích hoạt slide
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
                >
                  {editingSlide ? '✅ Cập Nhật' : '➕ Tạo Mới'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8">
          <AdminTable
            data={currentData}
            columns={columns}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="Chưa có slide nào."
          />
        </div>

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminCarousel;
