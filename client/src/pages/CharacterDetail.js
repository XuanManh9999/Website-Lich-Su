import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { characterAPI } from '../services/api';
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-history-red"></div>
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
    ? `http://localhost:5000${character.audio_url}`
    : null;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image */}
          {character.image_url && (
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={`http://localhost:5000${character.image_url}`}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* Header */}
            <header className="mb-8 pb-6 border-b-2 border-history-red">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-history-red mb-4">
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
              <section className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-history-red mb-4 pb-2 border-b border-gray-200">
                  Giới Thiệu
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {character.summary}
                </p>
              </section>
            )}

            {/* Audio */}
            {audioUrl && (
              <section className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-history-red mb-4 pb-2 border-b border-gray-200">
                  Nghe Kể Chuyện
                </h2>
                <AudioPlayer audioUrl={audioUrl} />
              </section>
            )}

            {/* Content */}
            {character.content && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold text-history-red mb-4 pb-2 border-b border-gray-200">
                  Chi Tiết
                </h2>
                <div
                  className="text-base sm:text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: character.content.replace(/\n/g, '<br />') 
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
