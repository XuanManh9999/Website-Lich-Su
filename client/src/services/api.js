import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://vietsuquan.io.vn/api";

export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const characterAPI = {
  getAll: () => api.get("/characters"),
  getBySlug: (slug) => api.get(`/characters/slug/${slug}`),
  getById: (id) => api.get(`/characters/${id}`),
  create: (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("timeline", data.timeline || "");
    formData.append("summary", data.summary || "");
    formData.append("content", data.content || "");
    if (data.image) formData.append("image", data.image);
    if (data.audio) formData.append("audio", data.audio);
    return api.post("/characters", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("timeline", data.timeline || "");
    formData.append("summary", data.summary || "");
    formData.append("content", data.content || "");
    if (data.image) formData.append("image", data.image);
    if (data.audio) formData.append("audio", data.audio);
    return api.put(`/characters/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id) => api.delete(`/characters/${id}`),
};

export const adminAPI = {
  login: (username, password) =>
    api.post("/admin/login", { username, password }),
  register: (data) => api.post("/admin/register", data),
  verify: () => api.get("/admin/verify"),
  forgotPassword: (email) => api.post("/admin/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/admin/reset-password", { token, password }),
  getAll: () => api.get("/admin/all"),
  getById: (id) => api.get(`/admin/${id}`),
  update: (id, data) => api.put(`/admin/${id}`, data),
  delete: (id) => api.delete(`/admin/${id}`),
};

export const postAPI = {
  getAll: () => api.get("/posts"),
  getBySlug: (slug) => api.get(`/posts/slug/${slug}`),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("content", data.content || "");
    formData.append("image_url", data.image_url || "");
    // If a new audio file is provided, upload it; otherwise keep existing audio_url (if any)
    if (data.audio) {
      formData.append("audio", data.audio);
    } else if (data.audio_url) {
      formData.append("audio_url", data.audio_url);
    }
    return api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("content", data.content || "");
    formData.append("image_url", data.image_url || "");
    // If a new audio file is provided, upload it; otherwise keep existing audio_url (if any)
    if (data.audio) {
      formData.append("audio", data.audio);
    } else if (data.audio_url) {
      formData.append("audio_url", data.audio_url);
    }
    return api.put(`/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id) => api.delete(`/posts/${id}`),
};

export const productAPI = {
  getAll: () => api.get("/products"),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const quizAPI = {
  getAll: (characterId) =>
    api.get("/quiz", { params: characterId ? { character_id: characterId } : {} }),
  getById: (id) => api.get(`/quiz/${id}`),
  create: (data) => api.post("/quiz", data),
  update: (id, data) => api.put(`/quiz/${id}`, data),
  delete: (id) => api.delete(`/quiz/${id}`),
};

export const chatbotAPI = {
  chat: (message, mode) => api.post("/chatbot/chat", { message, mode }),
};

export const paymentAPI = {
  createPayment: (data) => api.post("/payment/create-payment", data),
  getReturn: (params) => api.get("/payment/vnpay-return", { params }),
};

export const orderAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByOrderId: (orderId) => api.get(`/orders/order/${orderId}`),
  create: (data) => api.post("/orders", data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),
};

export const carouselAPI = {
  getAll: () => api.get("/carousel"),
  getAllForAdmin: () => api.get("/carousel/all"),
  getById: (id) => api.get(`/carousel/${id}`),
  // Dùng FormData + upload file, lưu đường dẫn text vào DB
  create: (data) => {
    const formData = new FormData();
    formData.append("quote", data.quote || "");
    formData.append("author", data.author || "Thiên Sử Ký");
    formData.append("display_order", data.display_order || 0);
    formData.append("is_active", data.is_active !== undefined ? data.is_active : true);
    // imageFile là file upload, image_url (preview) bỏ qua, DB chỉ lưu path text
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    } else if (data.image_url) {
      // Trường hợp dùng URL text thủ công (nếu có)
      formData.append("image_url", data.image_url);
    }
    return api.post("/carousel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    formData.append("quote", data.quote || "");
    formData.append("author", data.author || "Thiên Sử Ký");
    formData.append("display_order", data.display_order || 0);
    formData.append("is_active", data.is_active !== undefined ? data.is_active : true);
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    } else if (data.image_url) {
      formData.append("image_url", data.image_url);
    }
    return api.put(`/carousel/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id) => api.delete(`/carousel/${id}`),
};

export default api;
