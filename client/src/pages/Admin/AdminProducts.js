import React, { useState, useEffect, useMemo } from 'react';
import { productAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    image_url: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.slug?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

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
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
      };
      if (editingProduct) {
        await productAPI.update(editingProduct.id, submitData);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await productAPI.create(submitData);
        showToast('Tạo sản phẩm mới thành công!', 'success');
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await productAPI.delete(id);
        showToast('Xóa sản phẩm thành công!', 'success');
        fetchProducts();
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
      description: '',
      price: '',
      image_url: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tên sản phẩm' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'price',
      label: 'Giá',
      render: (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value);
      },
    },
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
          <h1 className="text-3xl md:text-4xl font-bold text-history-red">Quản Trị Sản Phẩm</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
          >
            {showForm ? 'Đóng Form' : 'Thêm Sản Phẩm Mới'}
          </button>
        </div>

        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={[]}
          onFilterChange={handleFilterChange}
          placeholder="Tìm kiếm theo tên, slug, mô tả..."
        />

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-history-red mb-6">
              {editingProduct ? 'Chỉnh Sửa' : 'Thêm Mới'} Sản Phẩm
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên sản phẩm *
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
                    placeholder="san-pham-moi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1000"
                    placeholder="100000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
                  />
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
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none resize-y"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-history-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-history-red-light transition-colors"
                >
                  {editingProduct ? 'Cập Nhật' : 'Tạo Mới'}
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
          emptyMessage={`Không tìm thấy sản phẩm nào${searchTerm ? ' với từ khóa: ' + searchTerm : ''}`}
        />

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminProducts;
