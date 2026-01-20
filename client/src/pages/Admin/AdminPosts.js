import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminPosts.css';
import { postAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    image_url: '',
  });
  const quillRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getAll();
      setPosts(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(query) ||
          post.slug?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [posts, searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  // Handle image upload for featured image
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh!', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 5MB!', 'error');
      return;
    }

    try {
      const base64 = await imageToBase64(file);
      setFormData({ ...formData, image_url: base64 });
      showToast('Upload ảnh đại diện thành công!', 'success');
    } catch (error) {
      console.error('Error converting image:', error);
      showToast('Lỗi khi upload ảnh!', 'error');
    }
  };

  // Image handler for ReactQuill editor
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file ảnh!', 'error');
        return;
      }

      // Validate file size (max 2MB for inline images)
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ảnh trong nội dung không được vượt quá 2MB!', 'error');
        return;
      }

      try {
        showToast('Đang upload ảnh...', 'info');
        const base64 = await imageToBase64(file);
        
        // Get Quill editor instance
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        
        // Insert image at cursor position
        quill.insertEmbed(range.index, 'image', base64);
        quill.setSelection(range.index + 1);
        
        showToast('Upload ảnh vào nội dung thành công!', 'success');
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Lỗi khi upload ảnh!', 'error');
      }
    };
  };

  // ReactQuill modules configuration
  const modules = useMemo(
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
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  const formats = [
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await postAPI.update(editingPost.id, formData);
        showToast('Cập nhật bài viết thành công!', 'success');
      } else {
        await postAPI.create(formData);
        showToast('Tạo bài viết mới thành công!', 'success');
      }
      fetchPosts();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      image_url: post.image_url || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await postAPI.delete(id);
        showToast('Xóa bài viết thành công!', 'success');
        fetchPosts();
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
      title: '',
      slug: '',
      content: '',
      image_url: '',
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Tiêu đề',
      render: (value) => value || '-',
    },
    { key: 'slug', label: 'Slug' },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('vi-VN');
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Quản Trị Bài Viết</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            {showForm ? 'Đóng Form' : 'Thêm Bài Viết Mới'}
          </button>
        </div>

        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={[]}
          onFilterChange={handleFilterChange}
          placeholder="Tìm kiếm theo tiêu đề, slug, nội dung..."
        />

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {editingPost ? 'Chỉnh Sửa' : 'Thêm Mới'} Bài Viết
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
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
                    placeholder="bai-viet-moi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const slug = formData.title
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'D')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                      setFormData({ ...formData, slug });
                    }}
                    className="mt-2 text-sm text-primary hover:text-primary-light font-medium"
                  >
                    🔄 Tự động tạo từ tiêu đề
                  </button>
                </div>
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  {formData.image_url && (
                    <div className="relative w-full max-w-md">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        title="Xóa ảnh"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    💡 Tip: Upload ảnh trực tiếp (tự động chuyển sang base64). Tối đa 5MB.
                  </p>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung * 
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    (Sử dụng nút 🖼️ trong thanh công cụ để thêm ảnh vào nội dung)
                  </span>
                </label>
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Viết nội dung bài viết tại đây... Bạn có thể thêm ảnh bằng cách nhấn vào icon hình ảnh trên thanh công cụ."
                    className="h-96"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Ảnh trong nội dung sẽ tự động được lưu dưới dạng base64. Tối đa 2MB/ảnh.
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
                >
                  {editingPost ? '✅ Cập Nhật' : '➕ Tạo Mới'}
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

        <AdminTable
          data={currentData}
          columns={columns}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={`Không tìm thấy bài viết nào${searchTerm ? ' với từ khóa: ' + searchTerm : ''}`}
        />

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminPosts;
