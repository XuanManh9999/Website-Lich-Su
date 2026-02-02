import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    timeline: '',
    summary: '',
    content: '',
    image_url: '',
    audio_url: '',
  });
  const summaryQuillRef = useRef(null);
  const contentQuillRef = useRef(null);
  const itemsPerPage = 10;

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const fetchCharacters = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

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

  const handleSummaryChange = (content) => {
    setFormData({ ...formData, summary: content });
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  // Convert image file to base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Image handler for ReactQuill editor (summary)
  const summaryImageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file ảnh!', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showToast('Ảnh trong giới thiệu không được vượt quá 2MB!', 'error');
        return;
      }

      try {
        showToast('Đang upload ảnh...', 'info');
        const base64 = await imageToBase64(file);
        
        const quill = summaryQuillRef.current.getEditor();
        const range = quill.getSelection();
        
        quill.insertEmbed(range.index, 'image', base64);
        quill.setSelection(range.index + 1);
        
        showToast('Upload ảnh vào giới thiệu thành công!', 'success');
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Lỗi khi upload ảnh!', 'error');
      }
    };
  }, []);

  // Image handler for ReactQuill editor (content)
  const contentImageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file ảnh!', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showToast('Ảnh trong nội dung không được vượt quá 2MB!', 'error');
        return;
      }

      try {
        showToast('Đang upload ảnh...', 'info');
        const base64 = await imageToBase64(file);
        
        const quill = contentQuillRef.current.getEditor();
        const range = quill.getSelection();
        
        quill.insertEmbed(range.index, 'image', base64);
        quill.setSelection(range.index + 1);
        
        showToast('Upload ảnh vào nội dung thành công!', 'success');
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Lỗi khi upload ảnh!', 'error');
      }
    };
  }, []);

  // ReactQuill modules configuration
  const summaryModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: summaryImageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [summaryImageHandler]
  );

  const contentModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: contentImageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [contentImageHandler]
  );

  const summaryFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
    'image',
  ];

  const contentFormats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
    'video',
  ];

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
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      if (editingCharacter) {
        await characterAPI.update(editingCharacter.id, formData);
        showToast('✅ Cập nhật nhân vật thành công!', 'success');
      } else {
        await characterAPI.create(formData);
        showToast('✅ Tạo nhân vật mới thành công!', 'success');
      }
      fetchCharacters();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
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
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={summaryQuillRef}
                    theme="snow"
                    value={formData.summary}
                    onChange={handleSummaryChange}
                    modules={summaryModules}
                    formats={summaryFormats}
                    placeholder="Viết giới thiệu ngắn về nhân vật..."
                    style={{ minHeight: '150px' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Ảnh trong giới thiệu sẽ tự động được lưu dưới dạng base64. Tối đa 2MB/ảnh.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung chi tiết
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={contentQuillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={contentModules}
                    formats={contentFormats}
                    placeholder="Viết nội dung chi tiết về nhân vật tại đây... Bạn có thể thêm ảnh bằng cách nhấn vào icon hình ảnh trên thanh công cụ."
                    style={{ minHeight: '350px' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Ảnh trong nội dung sẽ tự động được lưu dưới dạng base64. Tối đa 2MB/ảnh.
                </p>
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
                  disabled={isSubmitting}
                  className={`bg-primary text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2 ${
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
                    <>{editingCharacter ? '✅ Cập Nhật' : '➕ Tạo Mới'}</>
                  )}
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
