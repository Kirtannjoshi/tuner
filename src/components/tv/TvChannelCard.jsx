import React from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { useFavorites } from '../../services/favoritesService';

const TvChannelCard = ({ channel }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some(fav => fav.id === channel.id && fav.type === 'tv');

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-video">
        <img
          src={channel.logo || '/placeholder-tv.svg'}
          alt={channel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-tv.svg';
          }}
        />
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          onClick={() => toggleFavorite(channel, 'tv')}
        >
          {isFavorite ? (
            <FaHeart className="text-tuner-pink text-xl" />
          ) : (
            <FaRegHeart className="text-white text-xl" />
          )}
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{channel.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">{channel.category}</span>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-tuner-pink rounded-full text-white hover:bg-opacity-90 transition-colors"
            onClick={() => window.open(channel.streamUrl, '_blank')}
          >
            <FaPlay className="text-sm" />
            <span>Watch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

TvChannelCard.propTypes = {
  channel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    category: PropTypes.string,
    streamUrl: PropTypes.string.isRequired
  }).isRequired
};

export default TvChannelCard;