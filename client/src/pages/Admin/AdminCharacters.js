import React, { useState, useEffect, useMemo } from 'react';
import { characterAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';
import { fileToBase64, validateImage, validateAudio, generateSlug } from '../../utils/fileUtils';

const AdminCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeline, setFilterTimeline] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    timeline: '',
    summary: '',
    content: '',
    image_url: '',
    audio_url: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await characterAPI.getAll();
      setCharacters(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching characters:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  };

  const filteredCharacters = useMemo(() => {
    let filtered = characters;

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (char) =>
          char.name?.toLowerCase().includes(query) ||
          char.slug?.toLowerCase().includes(query) ||
          char.summary?.toLowerCase().includes(query)
      );
    }

    // Timeline filter
    if (filterTimeline) {
      filtered = filtered.filter((char) => char.timeline === filterTimeline);
    }

    return filtered;
  }, [characters, searchTerm, filterTimeline]);

  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCharacters.slice(startIndex, startIndex + itemsPerPage);

  const uniqueTimelines = useMemo(() => {
    return [...new Set(characters.map((char) => char.timeline).filter(Boolean))];
  }, [characters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'timeline') setFilterTimeline(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  // Handle audio upload and convert to base64
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateAudio(file, 10);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      e.target.value = '';
      return;
    }

    try {
      showToast('Đang upload audio...', 'info');
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, audio_url: base64 });
      showToast('Upload audio thành công!', 'success');
    } catch (error) {
      console.error('Error converting audio:', error);
      showToast('Lỗi khi upload audio!', 'error');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharacter) {
        await characterAPI.update(editingCharacter.id, formData);
        showToast('Cập nhật nhân vật thành công!', 'success');
      } else {
        await characterAPI.create(formData);
        showToast('Tạo nhân vật mới thành công!', 'success');
      }
      fetchCharacters();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name || '',
      slug: character.slug || '',
      timeline: character.timeline || '',
      summary: character.summary || '',
      content: character.content || '',
      image_url: character.image_url || '',
      audio_url: character.audio_url || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân vật này?')) {
      try {
        await characterAPI.delete(id);
        showToast('Xóa nhân vật thành công!', 'success');
        fetchCharacters();
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
      name: '',
      slug: '',
      timeline: '',
      summary: '',
      content: '',
      image_url: '',
      audio_url: '',
    });
    setEditingCharacter(null);
    setShowForm(false);
  };

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tên' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'timeline',
      label: 'Thời gian',
      render: (value) => value || '-',
    },
  ];

  const filters = [
    {
      key: 'timeline',
      label: 'Lọc theo thời gian',
      value: filterTimeline,
      options: [{ value: '', label: 'Tất cả' }, ...uniqueTimelines.map((t) => ({ value: t, label: t }))],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Quản Trị Nhân Vật</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            {showForm ? 'Đóng Form' : 'Thêm Nhân Vật Mới'}
          </button>
        </div>

        {/* Search & Filter */}
        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          placeholder="Tìm kiếm theo tên, slug, mô tả..."
        />

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {editingCharacter ? 'Chỉnh Sửa' : 'Thêm Mới'} Nhân Vật
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên nhân vật *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    placeholder="tran-hung-dao"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, slug: generateSlug(formData.name) })}
                    className="mt-2 text-sm text-primary hover:text-primary-light font-medium"
                  >
                    🔄 Tự động tạo từ tên nhân vật
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mốc thời gian
                </label>
                <input
                  type="text"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  placeholder="VD: 1228-1300"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giới thiệu ngắn
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung chi tiết
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y transition-all"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh nhân vật
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
                  />
                  {formData.image_url && (
                    <div className="relative w-full max-w-sm">
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
                    💡 Upload ảnh nhân vật (tự động chuyển sang base64). Tối đa 5MB.
                  </p>
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎵 Audio kể chuyện
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
                  />
                  {formData.audio_url && (
                    <div className="relative p-4 bg-blue-50 rounded-lg">
                      <audio controls className="w-full">
                        <source src={formData.audio_url} type="audio/mpeg" />
                        Trình duyệt không hỗ trợ audio.
                      </audio>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, audio_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Xóa audio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    💡 Upload file audio kể chuyện (MP3, WAV). Tối đa 10MB.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
                >
                  {editingCharacter ? '✅ Cập Nhật' : '➕ Tạo Mới'}
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

        {/* Table */}
        <AdminTable
          data={currentData}
          columns={columns}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={`Không tìm thấy nhân vật nào${searchTerm || filterTimeline ? ' với bộ lọc hiện tại' : ''}`}
        />

        {/* Toast */}
        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminCharacters;
