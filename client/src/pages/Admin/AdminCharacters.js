import React, { useState, useEffect, useMemo } from 'react';
import { characterAPI, adminAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

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
    image: null,
    audio: null,
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
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
      image: null,
      audio: null,
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
      image: null,
      audio: null,
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
          <h1 className="text-3xl md:text-4xl font-bold text-history-red">Quản Trị Nhân Vật</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
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
            <h2 className="text-2xl md:text-3xl font-bold text-history-red mb-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ảnh nhân vật
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Audio kể chuyện (MP3)
                  </label>
                  <input
                    type="file"
                    name="audio"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
                >
                  {editingCharacter ? 'Cập Nhật' : 'Tạo Mới'}
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
