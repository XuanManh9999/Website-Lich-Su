import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import Pagination from '../components/Pagination';
import { handleImageError, getSafeImageUrl } from '../utils/imageUtils';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const itemsPerPage = 6;

  const categories = ['Tất cả', 'Blog'];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postAPI.getAll();
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Calculate reading time (approximate: 200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return '5';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes.toString();
  };

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    // Vì tất cả posts đều là "Blog" (không có category khác),
    // nên khi chọn "Blog" hoặc "Tất cả" đều hiển thị tất cả posts
    if (selectedCategory === 'Tất cả' || selectedCategory === 'Blog') {
      return posts;
    }
    // Nếu có category khác trong tương lai, có thể filter theo category
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12" data-aos="fade-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Blog lịch sử
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
            Khám phá những câu chuyện lịch sử hấp dẫn được kể bởi các chuyên gia
          </p>

          {/* Category Filters */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-5 py-2.5 rounded-full font-medium text-sm md:text-base transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-primary-50 text-primary hover:bg-primary-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {currentPosts.map((post, index) => {
                const imageUrl = getSafeImageUrl(post.image_url);
                
                const readingTime = calculateReadingTime(post.content);
                const author = post.author || 'Tác giả';
                const postDate = post.created_at 
                  ? new Date(post.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    }).replace(/\//g, '/')
                  : '';

                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="card group block"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => handleImageError(e)}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col gap-4">
                      {/* Metadata Bar */}
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="bg-primary text-white px-2 py-1 rounded font-semibold">
                          Blog
                        </span>
                        <span className="text-gray-600">{readingTime} phút</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {post.title}
                      </h2>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{author}</span>
                        </div>

                        {/* Date */}
                        {postDate && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{postDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Read More Link */}
                      <div className="mt-auto pt-2">
                        <span className="text-primary font-semibold text-sm md:text-base group-hover:text-primary-light transition-colors inline-flex items-center gap-1">
                          Đọc tiếp
                          <span className="transition-transform duration-200 group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div data-aos="fade-up" data-aos-delay="300">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Posts;
