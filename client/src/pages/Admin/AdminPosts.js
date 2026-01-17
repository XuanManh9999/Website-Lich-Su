import React, { useState, useEffect, useMemo } from 'react';
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
          <h1 className="text-3xl md:text-4xl font-bold text-history-red">Quản Trị Bài Viết</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
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
            <h2 className="text-2xl md:text-3xl font-bold text-history-red mb-6">
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
                    placeholder="bai-viet-moi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL ảnh
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="15"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
                >
                  {editingPost ? 'Cập Nhật' : 'Tạo Mới'}
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
          emptyMessage={`Không tìm thấy bài viết nào${searchTerm ? ' với từ khóa: ' + searchTerm : ''}`}
        />

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminPosts;
