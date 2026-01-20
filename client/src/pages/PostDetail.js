import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import '../styles/prose.css';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      try {
        // Fetch current post
        const postResponse = await postAPI.getBySlug(slug);
        if (postResponse.data) {
          setPost(postResponse.data);
          
          // Fetch related posts (exclude current post)
          try {
            const allPostsResponse = await postAPI.getAll();
            const allPosts = allPostsResponse.data || [];
            const related = allPosts
              .filter(p => p.id !== postResponse.data.id && p.slug !== slug)
              .slice(0, 3); // Get 3 related posts
            setRelatedPosts(related);
          } catch (error) {
            console.error('Error fetching related posts:', error);
            setRelatedPosts([]);
          }
        } else {
          setError('Không tìm thấy bài viết');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        if (error.response && error.response.status === 404) {
          setError('Không tìm thấy bài viết');
        } else {
          setError('Đã xảy ra lỗi khi tải bài viết');
        }
        setLoading(false);
      }
    };
    if (slug) {
      fetchPostAndRelated();
    } else {
      setError('Slug không hợp lệ');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Không tìm thấy bài viết'}</p>
          <button
            onClick={() => navigate('/blog')}
            className="text-primary hover:underline font-semibold"
          >
            Quay lại danh sách blog
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = post.image_url 
    ? (post.image_url.startsWith('data:') || post.image_url.startsWith('http') ? post.image_url : `http://localhost:5000${post.image_url}`)
    : 'https://via.placeholder.com/1200x600/0F4C81/FFFFFF?text=Blog';

  // Calculate reading time (approximate: 200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return '5 phút';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} phút`;
  };

  const readingTime = calculateReadingTime(post.content);
  const author = post.author || 'Tác giả';
  const postDate = post.created_at 
    ? new Date(post.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Quay lại</span>
        </button>

        {/* Blog Post */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tag */}
          <div className="px-6 md:px-8 pt-6 md:pt-8">
            <span className="inline-block bg-blue-100 text-primary px-3 py-1 rounded-full text-sm font-semibold">
              Blog
            </span>
          </div>

          {/* Header */}
          <header className="px-6 md:px-8 pt-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-gray-600 mb-8">
              {/* Author */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{author}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{postDate}</span>
              </div>

              {/* Reading Time */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{readingTime} đọc</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x600/0F4C81/FFFFFF?text=Blog';
              }}
            />
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-8 md:py-12">
            <div 
              className="prose prose-lg prose-primary max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: post.content || '<p>Chưa có nội dung.</p>' 
              }}
            />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPosts.map((relatedPost) => {
                const relatedImageUrl = relatedPost.image_url 
                  ? (relatedPost.image_url.startsWith('data:') || relatedPost.image_url.startsWith('http') ? relatedPost.image_url : `http://localhost:5000${relatedPost.image_url}`)
                  : 'https://via.placeholder.com/400x300/0F4C81/FFFFFF?text=Blog';
                
                const relatedReadingTime = (() => {
                  if (!relatedPost.content) return '5';
                  const words = relatedPost.content.split(/\s+/).length;
                  const minutes = Math.ceil(words / 200);
                  return minutes.toString();
                })();
                
                const relatedAuthor = relatedPost.author || 'Tác giả';
                const relatedPostDate = relatedPost.created_at 
                  ? new Date(relatedPost.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    }).replace(/\//g, '/')
                  : '';

                return (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="card group block"
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={relatedImageUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300/0F4C81/FFFFFF?text=Blog';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col gap-4">
                      {/* Metadata Bar */}
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="bg-primary text-white px-2.5 py-1 rounded font-semibold text-xs">
                          Blog
                        </span>
                        <span className="text-gray-600">{relatedReadingTime} phút</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {relatedPost.title}
                      </h3>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{relatedAuthor}</span>
                        </div>

                        {/* Date */}
                        {relatedPostDate && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{relatedPostDate}</span>
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
          </section>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
