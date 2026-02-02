import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import AdminTable from '../../components/Admin/AdminTable';
import AdminSearchFilter from '../../components/Admin/AdminSearchFilter';
import Toast from '../../components/Toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;

      const response = await orderAPI.getAll(params);
      setOrders(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'status') setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleViewDetail = async (order) => {
    try {
      const response = await orderAPI.getById(order.id);
      setSelectedOrder(response.data);
      setShowDetail(true);
    } catch (error) {
      showToast('Lỗi khi tải chi tiết đơn hàng', 'error');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, notes) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus, notes });
      showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, notes });
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      cancelled: 'Đã hủy',
      refunded: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'order_id',
      label: 'Mã đơn hàng',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Khách hàng',
      render: (value) => value || 'N/A',
    },
    {
      key: 'total_amount',
      label: 'Tổng tiền',
      render: (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value);
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      },
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Lọc theo trạng thái',
      value: filterStatus,
      options: [
        { value: '', label: 'Tất cả' },
        { value: 'pending', label: 'Chờ thanh toán' },
        { value: 'paid', label: 'Đã thanh toán' },
        { value: 'cancelled', label: 'Đã hủy' },
        { value: 'refunded', label: 'Đã hoàn tiền' },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEFDF6' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Quản Trị Đơn Hàng</h1>
        </div>

        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, email, số điện thoại..."
        />

        <AdminTable
          data={orders}
          columns={columns}
          loading={loading}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onEdit={handleViewDetail}
          onDelete={null}
          emptyMessage={`Không tìm thấy đơn hàng nào${searchTerm || filterStatus ? ' với bộ lọc hiện tại' : ''}`}
        />

        {/* Order Detail Modal */}
        {showDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary">
                    Chi Tiết Đơn Hàng #{selectedOrder.order_id}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      setSelectedOrder(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin khách hàng</h3>
                    <div className="bg-[#F7F3E6] p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Tên:</span> {selectedOrder.customer_name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer_email || 'N/A'}</p>
                      <p><span className="font-medium">SĐT:</span> {selectedOrder.customer_phone || 'N/A'}</p>
                      <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.customer_address || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin đơn hàng</h3>
                    <div className="bg-[#F7F3E6] p-4 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Trạng thái:</span>{' '}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusLabel(selectedOrder.status)}
                        </span>
                      </p>
                      <p><span className="font-medium">Tổng tiền:</span>{' '}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(selectedOrder.total_amount)}
                      </p>
                      <p><span className="font-medium">Phương thức:</span> {selectedOrder.payment_method || 'VNPay'}</p>
                      <p><span className="font-medium">Ngày tạo:</span>{' '}
                        {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Sản phẩm</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#F7F3E6]">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Sản phẩm</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">SL</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Giá</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm">{item.product_name}</td>
                              <td className="px-4 py-3 text-sm">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(item.price)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Cập nhật trạng thái</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'paid', 'cancelled', 'refunded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status, null)}
                        disabled={selectedOrder.status === status}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          selectedOrder.status === status
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-light'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                  {selectedOrder.vnpay_transaction_id && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm"><span className="font-medium">Mã giao dịch VNPay:</span> {selectedOrder.vnpay_transaction_id}</p>
                      {selectedOrder.vnpay_response_code && (
                        <p className="text-sm"><span className="font-medium">Mã phản hồi:</span> {selectedOrder.vnpay_response_code}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {toast.isVisible && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default AdminOrders;
