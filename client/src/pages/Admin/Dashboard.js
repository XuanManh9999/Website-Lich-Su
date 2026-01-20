import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterAPI, adminAPI } from '../../services/api';
import { fileToBase64, validateImage, validateAudio, generateSlug } from '../../utils/fileUtils';

const Dashboard = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    timeline: '',
    summary: '',
    content: '',
    image_url: '',
    audio_url: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCharacters();
  }, []);

  const checkAuth = async () => {
    try {
      await adminAPI.verify();
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await characterAPI.getAll();
      setCharacters(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching characters:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file, 5);
    if (!validation.valid) {
      alert(validation.error);
      e.target.value = '';
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, image_url: base64 });
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Lỗi khi upload ảnh!');
      e.target.value = '';
    }
  };

  // Handle audio upload
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateAudio(file, 10);
    if (!validation.valid) {
      alert(validation.error);
      e.target.value = '';
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, audio_url: base64 });
    } catch (error) {
      console.error('Error converting audio:', error);
      alert('Lỗi khi upload audio!');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharacter) {
        await characterAPI.update(editingCharacter.id, formData);
      } else {
        await characterAPI.create(formData);
      }
      fetchCharacters();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      slug: character.slug,
      timeline: character.timeline || '',
      summary: character.summary || '',
      content: character.content || '',
      image_url: character.image_url || '',
      audio_url: character.audio_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân vật này?')) {
      try {
        await characterAPI.delete(id);
        fetchCharacters();
      } catch (error) {
        alert('Có lỗi xảy ra');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Quản Trị Nhân Vật
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            {showForm ? 'Đóng Form' : 'Thêm Nhân Vật Mới'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
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
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
                  />
                  {formData.image_url && (
                    <div className="relative mt-2 w-32 h-32">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎵 Audio kể chuyện
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
                  />
                  {formData.audio_url && (
                    <div className="relative mt-2 p-2 bg-blue-50 rounded-lg">
                      <audio controls className="w-full">
                        <source src={formData.audio_url} type="audio/mpeg" />
                      </audio>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, audio_url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
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

        {/* Characters List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Danh Sách Nhân Vật ({characters.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {characters.map((character) => (
                  <tr key={character.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{character.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{character.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{character.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(character)}
                          className="bg-green-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(character.id)}
                          className="bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
