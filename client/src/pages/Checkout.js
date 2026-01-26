import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, getCartTotal, clearCart } from '../utils/cart';
import { orderAPI, paymentAPI } from '../services/api';
import { handleImageError, getSafeImageUrl } from '../utils/imageUtils';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    province: '',
    district: '',
    ward: '',
    address_detail: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'vnpay'

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const items = getCart();
    const total = getCartTotal();
    
    if (items.length === 0) {
      navigate('/gio-hang');
      return;
    }

    setCartItems(items);
    setCartTotal(total);
    loadProvinces();
  }, [navigate]);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
      alert('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại.');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
      return;
    }

    try {
      setLoadingDistricts(true);
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]);
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
    } catch (error) {
      console.error('Error loading districts:', error);
      alert('Không thể tải danh sách quận/huyện. Vui lòng thử lại.');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      setFormData(prev => ({ ...prev, ward: '' }));
      return;
    }

    try {
      setLoadingWards(true);
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await response.json();
      setWards(data.wards || []);
      setFormData(prev => ({ ...prev, ward: '' }));
    } catch (error) {
      console.error('Error loading wards:', error);
      alert('Không thể tải danh sách phường/xã. Vui lòng thử lại.');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setFormData(prev => ({ ...prev, province: e.target.options[e.target.selectedIndex].text, district: '', ward: '' }));
    loadDistricts(provinceCode);
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setFormData(prev => ({ ...prev, district: e.target.options[e.target.selectedIndex].text, ward: '' }));
    loadWards(districtCode);
  };

  const handleWardChange = (e) => {
    setFormData(prev => ({ ...prev, ward: e.target.options[e.target.selectedIndex].text }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Vui lòng nhập họ tên';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email không hợp lệ';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    if (!formData.address_detail.trim()) {
      newErrors.address_detail = 'Vui lòng nhập địa chỉ chi tiết';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate order ID
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11).replace(/[^a-zA-Z0-9]/g, '');
      const orderId = `ORDER${timestamp}${randomStr}`.substring(0, 100);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_slug: item.slug,
        quantity: item.quantity,
        price: item.price,
      }));

      // Build full address
      const fullAddress = `${formData.address_detail}, ${formData.ward}, ${formData.district}, ${formData.province}`;

      // Create order in database
      const orderData = {
        order_id: orderId,
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_address: fullAddress,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        address_detail: formData.address_detail.trim(),
        items: orderItems,
        total_amount: cartTotal,
        payment_method: paymentMethod,
      };

      const orderResponse = await orderAPI.create(orderData);

      // Handle different payment methods
      if (paymentMethod === 'cod') {
        // COD: Clear cart and redirect to success page
        clearCart();
        navigate(`/dat-hang-thanh-cong?orderId=${orderId}`);
      } else {
        // VNPay: Create payment and redirect to VNPay
        const orderDescription = `Thanh toan don hang ${cartItems.length} san pham`;
        
        const customerInfo = {
          name: formData.customer_name.trim(),
          email: formData.customer_email.trim(),
          phone: formData.customer_phone.trim(),
          address: fullAddress,
        };

        const paymentResponse = await paymentAPI.createPayment({
          amount: cartTotal,
          orderDescription,
          orderType: 'other',
          orderId,
          customerInfo,
          items: orderItems,
        });

        if (paymentResponse.data.paymentUrl) {
          // Clear cart
          clearCart();
          // Redirect to VNPay payment page
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          alert('Lỗi khi tạo link thanh toán');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary text-center mb-8" data-aos="fade-up">
          Thanh Toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2" data-aos="fade-right">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Thông tin giao hàng</h2>

              {/* Customer Name */}
              <div className="mb-6">
                <label htmlFor="customer_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.customer_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ và tên"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.customer_name}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-6">
                <label htmlFor="customer_email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.customer_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
                {errors.customer_email && (
                  <p className="mt-1 text-sm text-red-500">{errors.customer_email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label htmlFor="customer_phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.customer_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0123456789"
                />
                {errors.customer_phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.customer_phone}</p>
                )}
              </div>

              {/* Province */}
              <div className="mb-6">
                <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  id="province"
                  name="province"
                  value={provinces.find(p => p.name === formData.province)?.code || ''}
                  onChange={handleProvinceChange}
                  disabled={loadingProvinces}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.province ? 'border-red-500' : 'border-gray-300'
                  } ${loadingProvinces ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-500">{errors.province}</p>
                )}
              </div>

              {/* District */}
              <div className="mb-6">
                <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  name="district"
                  value={districts.find(d => d.name === formData.district)?.code || ''}
                  onChange={handleDistrictChange}
                  disabled={!formData.province || loadingDistricts}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.province || loadingDistricts ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingDistricts ? 'Đang tải...' : !formData.province ? 'Chọn tỉnh/thành phố trước' : 'Chọn quận/huyện'}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-500">{errors.district}</p>
                )}
              </div>

              {/* Ward */}
              <div className="mb-6">
                <label htmlFor="ward" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <select
                  id="ward"
                  name="ward"
                  value={wards.find(w => w.name === formData.ward)?.code || ''}
                  onChange={handleWardChange}
                  disabled={!formData.district || loadingWards}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.ward ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.district || loadingWards ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingWards ? 'Đang tải...' : !formData.district ? 'Chọn quận/huyện trước' : 'Chọn phường/xã'}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="mt-1 text-sm text-red-500">{errors.ward}</p>
                )}
              </div>

              {/* Address Detail */}
              <div className="mb-6">
                <label htmlFor="address_detail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address_detail"
                  name="address_detail"
                  value={formData.address_detail}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    errors.address_detail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Số nhà, tên đường, tòa nhà..."
                />
                {errors.address_detail && (
                  <p className="mt-1 text-sm text-red-500">{errors.address_detail}</p>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors resize-none"
                  placeholder="Ghi chú thêm cho đơn hàng..."
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Hình thức thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Bạn sẽ thanh toán khi nhận được sản phẩm</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-gray-900">Thanh toán qua VNPay</div>
                      <div className="text-sm text-gray-600">Thanh toán trực tuyến qua cổng VNPay</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận và thanh toán'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1" data-aos="fade-left">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-primary mb-6">Đơn hàng của bạn</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const imageUrl = getSafeImageUrl(item.image_url);

                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => handleImageError(e)}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        <p className="text-primary font-semibold mt-1">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-primary pt-2 border-t border-gray-200">
                  <span>Tổng cộng:</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(cartTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
