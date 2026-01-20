import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';

const FeaturedBlogPosts = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postAPI.getAll();
        if (response.data && response.data.length > 0) {
          setAllPosts(response.data);
        } else {
          setAllPosts([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setAllPosts([]);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    // Vì tất cả posts đều là "Blog" (không có category khác),
    // nên khi chọn "Blog" hoặc "Tất cả" đều hiển thị tất cả posts
    if (selectedCategory === 'Tất cả' || selectedCategory === 'Blog') {
      return allPosts;
    }
    // Nếu có category khác trong tương lai, có thể filter theo category
    return allPosts.filter(post => post.category === selectedCategory);
  }, [allPosts, selectedCategory]);

  // Hiển thị 3 bài viết đầu tiên sau khi filter
  const posts = filteredPosts.slice(0, 3);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 md:mb-4">
            Blog lịch sử
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
            Khám phá những câu chuyện lịch sử hấp dẫn được kể bởi các chuyên gia
          </p>

          {/* Category Filters */}
          <div className="flex justify-center gap-3 md:gap-4">
            <button
              onClick={() => setSelectedCategory('Tất cả')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all ${
                selectedCategory === 'Tất cả'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-blue-100 text-primary hover:bg-blue-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedCategory('Blog')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all ${
                selectedCategory === 'Blog'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-blue-100 text-primary hover:bg-blue-200'
              }`}
            >
              Blog
            </button>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="card group"
                >
                  {/* Post Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {post.image_url ? (
                      <img
                        src={post.image_url.startsWith('data:') || post.image_url.startsWith('http') ? post.image_url : `http://localhost:5000${post.image_url}`}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300/0F4C81/FFFFFF?text=Blog';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-5 md:p-6 flex flex-col gap-3">
                    {/* Metadata Bar: Tag (left) and Reading Time (right) */}
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="bg-primary text-white px-2.5 py-1 rounded font-semibold text-xs">
                        Blog
                      </span>
                      <span className="text-gray-600">{(() => {
                        if (!post.content) return '5 phút';
                        const words = post.content.split(/\s+/).length;
                        const minutes = Math.ceil(words / 200);
                        return `${minutes} phút`;
                      })()}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                      {post.title}
                    </h3>

                    {/* Author and Date */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{post.author || 'Tác giả'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center text-primary font-semibold text-sm sm:text-base mt-2 group-hover:gap-2 gap-1 transition-all">
                      Đọc tiếp
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link
                to="/blog"
                className="inline-block bg-primary text-white px-8 md:px-12 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
              >
                Xem tất cả bài viết
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedBlogPosts;
