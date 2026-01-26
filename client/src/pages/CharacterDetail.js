import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { characterAPI, SERVER_BASE_URL } from '../services/api';
import { getSafeImageUrl } from '../utils/imageUtils';
import AudioPlayer from '../components/AudioPlayer';

const CharacterDetail = () => {
  const { slug } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await characterAPI.getBySlug(slug);
        setCharacter(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching character:', error);
        setError('Không tìm thấy nhân vật');
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [slug]);

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

  if (error || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error || 'Không tìm thấy nhân vật'}</p>
        </div>
      </div>
    );
  }

  const audioUrl = character.audio_url 
    ? `${SERVER_BASE_URL}${character.audio_url}`
    : null;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" data-aos="fade-up">
          {/* Image */}
          {character.image_url && (
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" data-aos="zoom-in">
              <img
                src={getSafeImageUrl(character.image_url)}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* Header */}
            <header className="mb-8 pb-6 border-b-2 border-primary">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
                {character.name}
              </h1>
              {character.timeline && (
                <p className="text-lg sm:text-xl text-gray-600 italic">
                  {character.timeline}
                </p>
              )}
            </header>

            {/* Summary */}
            {character.summary && (
              <section className="mb-8" data-aos="fade-up" data-aos-delay="300">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 pb-2 border-b border-gray-200">
                  Giới Thiệu
                </h2>
                <div 
                  className="prose prose-lg prose-primary max-w-none text-base sm:text-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: character.summary || '' 
                  }}
                />
              </section>
            )}

            {/* Audio */}
            {audioUrl && (
              <section className="mb-8" data-aos="fade-up" data-aos-delay="400">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 pb-2 border-b border-gray-200">
                  Nghe Kể Chuyện
                </h2>
                <AudioPlayer audioUrl={audioUrl} />
              </section>
            )}

            {/* Content */}
            {character.content && (
              <section data-aos="fade-up" data-aos-delay="500">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 pb-2 border-b border-gray-200">
                  Chi Tiết
                </h2>
                <div
                  className="prose prose-lg prose-primary max-w-none text-base sm:text-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: character.content || '' 
                  }}
                />
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default CharacterDetail;
