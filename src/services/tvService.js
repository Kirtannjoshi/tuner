import axios from 'axios';

// Country metadata with flags and regions - matches radio service
const COUNTRIES = {
  'United Kingdom': {
    flag: '🇬🇧',
    code: 'GB',
    region: 'Europe'
  },
  'United States': {
    flag: '🇺🇸',
    code: 'US',
    region: 'North America'
  },
  'India': {
    flag: '🇮🇳',
    code: 'IN',
    region: 'Asia'
  },
  'International': {
    flag: '🌍',
    code: 'INT',
    region: 'Global'
  },
  'Streaming': {
    flag: '🎬',
    code: 'STREAM',
    region: 'Stream'
  }
};

// TV Channels organized by country
const CURATED_CHANNELS = [
  // Indian Channels
  {
    id: 'aaj_tak',
    name: 'Aaj Tak',
    genre: 'news',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://i.pinimg.com/736x/be/1d/5d/be1d5d11523f09687b56c6e4011cc7a5.jpg',
    streamUrl: 'https://aajtaklive-amd.akamaized.net/hls/live/2014416/aajtak/aajtaklive/live_720p/chunks.m3u8'
  },

  // International Channels
  {
    id: 'red_bull_tv',
    name: 'Red Bull TV',
    genre: 'sports',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/7NeBmWX.jpg',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
  },
  {
    id: 'cbs_news',
    name: 'CBS News',
    genre: 'news',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/nki2HDQ.png',
    streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8'
  },
  {
    id: 'abc_news',
    name: 'ABC News',
    genre: 'news',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/V8eTp2V.png',
    streamUrl: 'https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8'
  },
  {
    id: 'france24',
    name: 'France 24',
    genre: 'news',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/61MSiq9.png',
    streamUrl: 'https://d4yh9ygxs0fw6.cloudfront.net/hls/fr24_en/master.m3u8'
  },
  {
    id: 'cgtn',
    name: 'CGTN',
    genre: 'news',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/c5Yj2to.png',
    streamUrl: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8'
  },
  {
    id: 'outdoor_channel',
    name: 'Outdoor Channel',
    genre: 'lifestyle',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/KIEKOt1.png',
    streamUrl: 'https://outdoorchannel-samsungau.amagi.tv/playlist.m3u8'
  },

  // Streaming Channels
  {
    id: 'custom_stream',
    name: 'Custom Stream',
    genre: 'streaming',
    country: 'Streaming',
    countryFlag: COUNTRIES['Streaming'].flag,
    language: 'Various',
    logo: 'https://cdn-icons-png.flaticon.com/512/2640/2640710.png',
    streamUrl: '' // Will be set by user
  },
  {
    id: 'twitch_stream',
    name: 'Twitch Stream',
    genre: 'streaming',
    country: 'Streaming',
    countryFlag: COUNTRIES['Streaming'].flag,
    language: 'Various',
    logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png',
    streamUrl: '' // Will be set by user
  },
  {
    id: 'youtube_stream',
    name: 'YouTube Live',
    genre: 'streaming',
    country: 'Streaming',
    countryFlag: COUNTRIES['Streaming'].flag,
    language: 'Various',
    logo: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    streamUrl: '' // Will be set by user
  }
];

/**
 * Get available countries with metadata
 * @returns {Object} - Object containing country information
 */
export const getAvailableCountries = () => {
  return COUNTRIES;
};

/**
 * Get all curated TV channels
 * @returns {Array} - Array of channel objects
 */
export const getAllChannels = () => {
  return CURATED_CHANNELS;
};

/**
 * Get unique genres from curated channels
 * @returns {Array} - Array of unique genre strings
 */
export const getTvGenres = () => {
  const genres = new Set(CURATED_CHANNELS.map(channel => channel.genre));
  return ['all', ...genres]; // Add 'all' option
};

/**
 * Fetch TV channels with optional filters
 * @param {Object} params - Search parameters
 * @param {string} params.category - Category filter
 * @param {number} params.limit - Number of channels to return
 * @returns {Promise<Array>} - Array of TV channels
 */
export const getTvChannels = async (params = {}) => {
  try {
    let channels = [...CURATED_CHANNELS];

    // Filter channels based on category
    if (params.category && params.category !== 'all') {
      channels = channels.filter(channel =>
        channel.genre === params.category
      );
    }

    // Apply limit if provided
    if (params.limit && channels.length > params.limit) {
      channels = channels.slice(0, params.limit);
    }

    return channels;
  } catch (error) {
    console.error('Error fetching TV channels:', error);
    return [];
  }
};

/**
 * Get available TV channel categories (same as genres)
 * @returns {Array<string>} - Array of category names
 */
export const getTvCategories = () => {
  return getTvGenres();
};

/**
 * Get channels by category
 * @param {string} category - Category to filter by
 * @param {number} limit - Maximum number of channels to return
 * @returns {Promise<Array>} - Array of filtered TV channels
 */
export const getChannelsByCategory = async (category, limit = 24) => {
  try {
    if (category === 'all') {
      return await getTvChannels({ limit });
    }

    const channels = CURATED_CHANNELS.filter(channel => channel.genre === category);

    if (limit && channels.length > limit) {
      return channels.slice(0, limit);
    }

    return channels;
  } catch (error) {
    console.error(`Error fetching ${category} channels:`, error);
    return [];
  }
};

/**
 * Get channels by country
 * @param {string} country - Country code
 * @param {number} limit - Number of channels to return
 * @returns {Promise<Array>} - Array of TV channels
 */
export const getChannelsByCountry = async (country, limit = 24) => {
  try {
    let channels = [...CURATED_CHANNELS];

    // Filter channels based on country
    if (country && country !== 'all') {
      channels = channels.filter(channel =>
        channel.country === country || COUNTRIES[channel.country]?.code === country
      );
    }

    // Apply limit if provided
    if (limit && channels.length > limit) {
      channels = channels.slice(0, limit);
    }

    return channels;
  } catch (error) {
    console.error('Error fetching channels by country:', error);
    return [];
  }
};

/**
 * Search channels by name or other properties
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of matching channels
 */
export const searchChannels = async (query, limit = 24) => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    const results = CURATED_CHANNELS.filter(channel =>
      channel.name.toLowerCase().includes(lowerQuery) ||
      channel.genre.toLowerCase().includes(lowerQuery) ||
      channel.country.toLowerCase().includes(lowerQuery) ||
      channel.language.toLowerCase().includes(lowerQuery)
    );

    if (limit && results.length > limit) {
      return results.slice(0, limit);
    }

    return results;
  } catch (error) {
    console.error('Error searching channels:', error);
    return [];
  }
};

// Additional functions can be added as needed for filtering, searching, etc.

/**
 * Decrypt/decode stream URL if encrypted
 * @param {string} url - Stream URL (may be encrypted)
 * @returns {string} - Decrypted URL
 */
const decryptStreamUrl = (url) => {
  if (!url) return '';

  try {
    // Check if URL is Base64 encoded
    if (url.match(/^[A-Za-z0-9+/=]+$/) && !url.includes('http')) {
      return atob(url);
    }

    // Check if URL has common encryption patterns
    if (url.includes('|') || url.includes('#')) {
      // Split by delimiter and take the actual URL part
      const parts = url.split(/[|#]/);
      return parts[0].trim();
    }

    // Return as-is if no encryption detected
    return url.trim();
  } catch (error) {
    console.warn('Error decrypting URL:', error);
    return url;
  }
};

/**
 * Parse M3U playlist content
 * @param {string} content - M3U playlist text content
 * @returns {Array} - Array of parsed channel objects
 */
const parseM3UPlaylist = (content) => {
  const channels = [];
  const lines = content.split('\n');
  let currentChannel = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse #EXTINF line
    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};

      // Extract channel name (after last comma)
      const nameMatch = line.match(/,(.+)$/);
      if (nameMatch) {
        currentChannel.name = nameMatch[1].trim();
      }

      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) {
        currentChannel.logo = logoMatch[1];
      }

      // Extract group-title (genre/category)
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) {
        currentChannel.genre = groupMatch[1].toLowerCase();
      }

      // Extract tvg-country
      const countryMatch = line.match(/tvg-country="([^"]+)"/);
      if (countryMatch) {
        const countryCode = countryMatch[1].toUpperCase();
        currentChannel.country = countryCode;
        currentChannel.countryFlag = getCountryFlag(countryCode);
      }

      // Extract tvg-language
      const langMatch = line.match(/tvg-language="([^"]+)"/);
      if (langMatch) {
        currentChannel.language = langMatch[1];
      }
    }
    // Parse stream URL line
    else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.streamUrl = decryptStreamUrl(line);
      currentChannel.id = `iptv_${channels.length + 1}`;
      currentChannel.type = 'tv';

      // Set defaults if missing
      if (!currentChannel.logo) {
        currentChannel.logo = 'https://cdn-icons-png.flaticon.com/512/3039/3039393.png';
      }
      if (!currentChannel.genre) {
        currentChannel.genre = 'general';
      }
      if (!currentChannel.country) {
        currentChannel.country = 'INT';
        currentChannel.countryFlag = '🌍';
      }
      if (!currentChannel.language) {
        currentChannel.language = 'Various';
      }

      channels.push({ ...currentChannel });
      currentChannel = {};
    }
  }

  return channels;
};

/**
 * Get country flag emoji from country code
 * @param {string} countryCode - 2-letter country code
 * @returns {string} - Flag emoji
 */
const getCountryFlag = (countryCode) => {
  if (!countryCode || countryCode === 'INT' || countryCode === 'UNDEFINED') {
    return '🌍';
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
};

/**
 * Fetch and parse IPTV playlist from URL
 * @param {string} playlistUrl - M3U playlist URL
 * @param {number} limit - Maximum number of channels to return (default: no limit)
 * @returns {Promise<Array>} - Array of TV channels
 */
export const fetchIPTVPlaylist = async (playlistUrl, limit = null) => {
  try {
    console.log(`📡 Fetching IPTV playlist from: ${playlistUrl}`);

    let content = null;
    let fetchError = null;

    // Try direct fetch first
    try {
      console.log('Trying direct fetch...');
      const response = await axios.get(playlistUrl, {
        timeout: 30000,
        headers: {
          'Accept': 'application/x-mpegURL, text/plain, */*'
        }
      });
      content = response.data;
      console.log('✅ Direct fetch successful');
    } catch (directError) {
      console.log('❌ Direct fetch failed:', directError.message);
      fetchError = directError;
    }

    // If direct fetch failed, try CORS proxies
    if (!content) {
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(playlistUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(playlistUrl)}`,
        `https://cors-anywhere.herokuapp.com/${playlistUrl}`
      ];

      for (const proxyUrl of proxies) {
        try {
          console.log(`Trying proxy: ${proxyUrl.split('?')[0]}...`);
          const response = await axios.get(proxyUrl, {
            timeout: 30000,
            headers: {
              'Accept': 'application/x-mpegURL, text/plain, */*'
            }
          });
          content = response.data;
          console.log('✅ Proxy fetch successful');
          break;
        } catch (proxyError) {
          console.log(`❌ Proxy failed: ${proxyError.message}`);
          continue;
        }
      }
    }

    if (!content) {
      throw new Error('Failed to fetch playlist from all sources');
    }

    // Parse the M3U content
    console.log('📝 Parsing M3U content...');
    const channels = parseM3UPlaylist(content);
    console.log(`✅ Parsed ${channels.length} channels from playlist`);

    // Apply limit if specified
    if (limit && channels.length > limit) {
      console.log(`⚠️ Limiting to ${limit} channels`);
      return channels.slice(0, limit);
    }

    return channels;
  } catch (error) {
    console.error('❌ Error fetching IPTV playlist:', error);
    console.log('⚠️ Returning curated channels as fallback');
    // Return curated channels as fallback
    return CURATED_CHANNELS;
  }
};

/**
 * Get TV channels from selected source (curated or IPTV playlist)
 * @param {Object} params - Parameters
 * @param {string} params.source - Source URL or 'INTERNAL_FEATURED'
 * @param {string} params.category - Category filter
 * @param {number} params.limit - Maximum channels to return
 * @returns {Promise<Array>} - Array of TV channels
 */
export const getTvChannelsFromSource = async (params = {}) => {
  try {
    const { source, category, limit } = params;

    // Use curated channels for internal/featured source
    if (!source || source === 'INTERNAL_FEATURED') {
      return await getTvChannels({ category, limit });
    }

    // Fetch from IPTV playlist
    const channels = await fetchIPTVPlaylist(source, limit);

    // Filter by category if specified
    if (category && category !== 'all') {
      return channels.filter(ch => ch.genre === category);
    }

    return channels;
  } catch (error) {
    console.error('Error getting TV channels from source:', error);
    return CURATED_CHANNELS;
  }
};