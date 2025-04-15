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
  // United Kingdom Channels
  {
    id: 'bbc_news',
    name: 'BBC News',
    genre: 'news',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/eNPIQ9h.png',
    streamUrl: 'https://vs-hls-push-uk-live.akamaized.net/x=3/i=urn:bbc:pips:service:bbc_news_channel_hd/mobile_wifi_main_sd_abr_v2.m3u8'
  },
  {
    id: 'sky_news',
    name: 'Sky News',
    genre: 'news',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Sky-news-logo.png',
    streamUrl: 'https://linear021-gb-hls1-prd-ak.cdn.skycdp.com/Content/HLS_001_sd/Live/channel(skynews)/index_hd.m3u8'
  },
  
  // US Channels
  {
    id: 'cnn',
    name: 'CNN',
    genre: 'news',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/800px-CNN.svg.png',
    streamUrl: 'https://cnn-cnninternational-1-de.samsung.wurl.tv/playlist.m3u8'
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg TV',
    genre: 'business',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Bloomberg_Television_2016.png',
    streamUrl: 'https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8'
  },
  {
    id: 'nbc_news',
    name: 'NBC News',
    genre: 'news',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/v48mMRT.png',
    streamUrl: 'https://nbcnews2.akamaized.net/hls/live/723426/NBCNewsPlaymaker24x7Linear99a3a827-ua/master.m3u8'
  },
  
  // Indian Channels
  {
    id: 'dd_national',
    name: 'DD National',
    genre: 'entertainment',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/DD_National_2023_Purple.svg/800px-DD_National_2023_Purple.svg.png',
    streamUrl: 'https://ythls.armelin.one/channel/UCnJYChrisBRJHbnkIUzTm7g.m3u8'
  },
  {
    id: 'india_today',
    name: 'India Today',
    genre: 'news',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/0d/India_Today_Logo.png',
    streamUrl: 'https://ythls.armelin.one/channel/UCYPvAwZP8pZhSMW8qs7cVCw.m3u8'
  },
  {
    id: 'ndtv',
    name: 'NDTV 24x7',
    genre: 'news',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/pQ4Y4oT.png',
    streamUrl: 'https://ndtv24x7elemarchana.akamaized.net/hls/live/2003678/ndtv24x7/master.m3u8'
  },
  {
    id: 'zee_news',
    name: 'Zee News',
    genre: 'news',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://i.imgur.com/9nSS5Ii.png',
    streamUrl: 'https://ythls.armelin.one/channel/UCIvaYmXn910QMdemBG3v1pQ.m3u8'
  },
  {
    id: 'dd_bharati',
    name: 'DD Bharati',
    genre: 'culture',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://i.imgur.com/wOi9hgV.png',
    streamUrl: 'https://ythls.armelin.one/channel/UCIAnlTV3O9NYWMI-DwYZaWg.m3u8'
  },
  {
    id: 'aaj_tak',
    name: 'Aaj Tak',
    genre: 'news',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://i.imgur.com/gGGbZRr.png',
    streamUrl: 'https://aajtaklive-amd.akamaized.net/hls/live/2014416/aajtak/aajtaklive/live_720p/chunks.m3u8'
  },
  
  // International Channels
  {
    id: 'euronews',
    name: 'Euronews',
    genre: 'news',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://static.euronews.com/website/images/euronews-logo-primary.svg',
    streamUrl: 'https://shls-live-ak.akamaized.net/out/v1/115bfcde8fa342d182ef846445cdbdcf/index.m3u8'
  },
  {
    id: 'dw',
    name: 'DW English',
    genre: 'news',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/DW_%28TV%29_Logo_2012.png',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8'
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    genre: 'news',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/800px-Aljazeera_eng.svg.png',
    streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8'
  },
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
    id: 'nasa_tv',
    name: 'NASA TV',
    genre: 'science',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/iJldO7U.jpg',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8'
  },
  {
    id: 'fashion_tv',
    name: 'Fashion TV',
    genre: 'lifestyle',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/auHH1Ig.png',
    streamUrl: 'https://fashs043.cloudycdn.services/scte/sftv_adapt/playlist.m3u8'
  },
  {
    id: 'bloomberg_quicktake',
    name: 'Bloomberg Quicktake',
    genre: 'business',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/HL7fwzt.png',
    streamUrl: 'https://bloomberg-quicktake-1-eu.rakuten.wurl.tv/playlist.m3u8'
  },
  {
    id: 'fox_sports',
    name: 'Fox Sports',
    genre: 'sports',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://i.imgur.com/ULcj40x.png',
    streamUrl: 'https://austchannel-live.akamaized.net/hls/live/2002736/austchannel-sport/master.m3u8'
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