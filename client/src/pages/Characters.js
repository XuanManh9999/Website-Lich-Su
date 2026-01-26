import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { characterAPI } from '../services/api';
import { getSafeImageUrl } from '../utils/imageUtils';

// Helper function to strip HTML tags for preview
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchCharacters();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12" data-aos="fade-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Danh Sách Nhân Vật Lịch Sử
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá tất cả các nhân vật lịch sử vĩ đại của dân tộc Việt Nam
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 text-lg">Đang tải...</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {characters.map((character, index) => (
              <Link
                key={character.id}
                to={`/nhan-vat/${character.slug}`}
                className="card group block"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-6">
                  {character.image_url && (
                    <div className="w-full sm:w-40 md:w-48 h-48 sm:h-40 md:h-48 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <img
                        src={getSafeImageUrl(character.image_url)}
                        alt={character.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2 group-hover:text-primary-light transition-colors">
                      {character.name}
                    </h2>
                    {character.timeline && (
                      <p className="text-sm sm:text-base text-gray-500 italic mb-3">
                        {character.timeline}
                      </p>
                    )}
                    {character.summary && (
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-3">
                        {stripHtml(character.summary)}
                      </p>
                    )}
                    <div className="mt-3 flex items-center text-primary font-semibold text-sm sm:text-base group-hover:gap-2 gap-1 transition-all">
                      Xem chi tiết
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Characters;
