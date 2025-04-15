import axios from 'axios';

// Country metadata with flags and regions
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
  'Pakistan': {
    flag: '🇵🇰',
    code: 'PK',
    region: 'Asia'
  },
  'International': {
    flag: '🌍',
    code: 'INT',
    region: 'Global'
  }
};

// Radio stations organized by country
const CURATED_STATIONS = [
  // United Kingdom Stations
  {
    id: 'bbc_radio_1',
    name: 'BBC Radio 1',
    genre: 'pop',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English',
    logo: 'https://sounds.files.bbci.co.uk/3.8.0/networks/bbc_radio_one/blocks-colour_600x600.png',
    streamUrl: 'https://ice55.securenetsystems.net/DASH17'
  },
  {
    id: 'classic_fm',
    name: 'Classic FM',
    genre: 'classical',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Classic_FM_logo.svg/1200px-Classic_FM_logo.svg.png',
    streamUrl: 'https://ice55.securenetsystems.net/DASH38'
  },
  {
    id: 'bbc_radio_2',
    name: 'BBC Radio 2',
    genre: 'variety',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/BBC_Radio_2.svg/1200px-BBC_Radio_2.svg.png',
    streamUrl: 'https://ice55.securenetsystems.net/DASH31'
  },
  {
    id: 'capital_fm',
    name: 'Capital FM',
    genre: 'pop',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuHoONcOkR7unCtHpOmzV8M_NVR7jmAjIv1Q&s',
    streamUrl: 'https://media-ssl.musicradio.com/CapitalUK'
  },
  {
    id: 'asian_sound_radio',
    name: 'Asian Sound Radio',
    genre: 'asian',
    country: 'United Kingdom',
    countryFlag: COUNTRIES['United Kingdom'].flag,
    language: 'English/Hindi/Urdu',
    logo: 'https://www.asiansoundradio.com/wp-content/uploads/2020/08/asian-sound-logo-300x300.png',
    streamUrl: 'https://streaming.radio.co/s27b8e5b4b/listen'
  },

  // United States Stations
  {
    id: 'jazz24',
    name: 'Jazz24',
    genre: 'jazz',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/JAZZ24_logo.svg/1200px-JAZZ24_logo.svg.png',
    streamUrl: 'https://ice55.securenetsystems.net/DASH7'
  },
  {
    id: 'kexp',
    name: 'KEXP',
    genre: 'alternative',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/KEXP_logo.svg/1200px-KEXP_logo.svg.png',
    streamUrl: 'https://ice55.securenetsystems.net/DASH29'
  },
  {
    id: 'npr',
    name: 'NPR',
    genre: 'news',
    country: 'United States',
    countryFlag: COUNTRIES['United States'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/National_Public_Radio_logo.svg/1200px-National_Public_Radio_logo.svg.png',
    streamUrl: 'https://npr-ice.streamguys1.com/live.mp3'
  },

  // Indian Stations - All India Radio (AIR)
  {
    id: 'air_national',
    name: 'AIR National Live Stream',
    genre: 'variety',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/ExBHEdnRQ5.jpeg',
    streamUrl: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio002/hlspbaudio002_Auto.m3u8'
  },
  {
    id: 'air_vividh_bharati',
    name: 'AIR Vividh Bharati',
    genre: 'variety',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/ExBHEdnRQ5.jpeg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8'
  },
  {
    id: 'air_gujarati',
    name: 'AIR Gujarati',
    genre: 'regional',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Gujarati',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/aftj8xk6ebtz.jpg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio135/chunklist.m3u8'
  },
  {
    id: 'air_fm_gold',
    name: 'AIR FM Gold Delhi',
    genre: 'variety',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/aftj8xk6ebtz.jpg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio036/playlist.m3u8'
  },
  {
    id: 'air_fm_rainbow',
    name: 'AIR FM Rainbow Delhi',
    genre: 'variety',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi/English',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/auzs7hezxgfy.jpeg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio039/playlist.m3u8'
  },
  
  // Indian Stations - Commercial Radio
  {
    id: 'radio_mirchi_98',
    name: 'Radio Mirchi 98.3 FM',
    genre: 'bollywood',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/sy4srd7ksbtg.png',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio037/playlist.m3u8'
  },
  {
    id: 'radio_city_91',
    name: 'Radio City 91.1 FM',
    genre: 'bollywood',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/bhevsunaxsxr.png',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio040/playlist.m3u8'
  },
  {
    id: 'red_fm_93',
    name: 'Red FM 93.5',
    genre: 'bollywood',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/udbn8frx5dqp.jpg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio042/playlist.m3u8'
  },
  {
    id: 'big_fm',
    name: 'BIG FM 92.7',
    genre: 'bollywood',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/cmuebysrha3n.jpg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio044/playlist.m3u8'
  },
  {
    id: 'fever_fm',
    name: 'Fever FM 104',
    genre: 'bollywood',
    country: 'India',
    countryFlag: COUNTRIES['India'].flag,
    language: 'Hindi',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/sujmvulxbnqe.jpeg',
    streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio046/playlist.m3u8'
  },

  // Pakistani Stations
  {
    id: 'fm_100_pakistan',
    name: 'FM 100 Pakistan',
    genre: 'variety',
    country: 'Pakistan',
    countryFlag: COUNTRIES['Pakistan'].flag,
    language: 'Urdu',
    logo: 'https://cdn-radiotime-logos.tunein.com/s122108q.png',
    streamUrl: 'https://stream.zeno.fm/nkt6m0xk6rhvv'
  },
  {
    id: 'city_fm_89',
    name: 'City FM 89',
    genre: 'pop',
    country: 'Pakistan',
    countryFlag: COUNTRIES['Pakistan'].flag,
    language: 'Urdu',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/c2h5evbpxgqa.png',
    streamUrl: 'https://stream.zeno.fm/6vhb00mhky8uv'
  },
  {
    id: 'samaa_fm',
    name: 'Samaa FM',
    genre: 'news',
    country: 'Pakistan',
    countryFlag: COUNTRIES['Pakistan'].flag,
    language: 'Urdu',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/nxdu5khyhgqa.jpeg',
    streamUrl: 'https://stream.zeno.fm/8vhb00mhky8uv'
  },
  {
    id: 'mast_fm',
    name: 'Mast FM 103',
    genre: 'pop',
    country: 'Pakistan',
    countryFlag: COUNTRIES['Pakistan'].flag,
    language: 'Urdu',
    logo: 'https://static.mytuner.mobi/media/tvos_radios/uqgxumgxha2c.jpeg',
    streamUrl: 'https://stream.zeno.fm/9vhb00mhky8uv'
  },

  // International Stations
  {
    id: 'radio_paradise',
    name: 'Radio Paradise',
    genre: 'eclectic',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Radio_paradise.svg/640px-Radio_paradise.svg.png',
    streamUrl: 'https://stream.radioparadise.com/aac-128'
  },
  {
    id: 'chill_lounge',
    name: 'Chill Lounge',
    genre: 'lounge',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i1.sndcdn.com/artworks-l4xrO7Dw3eRWgmeK-yZF6RQ-t500x500.jpg',
    streamUrl: 'https://streaming.radio.co/s774887d7a/listen'
  },
  {
    id: 'coffee_house',
    name: 'Coffee House',
    genre: 'acoustic',
    country: 'International',
    countryFlag: COUNTRIES['International'].flag,
    language: 'English',
    logo: 'https://i.pinimg.com/736x/b0/4c/37/b04c37c48e517747c7db5d5e8a340891.jpg',
    streamUrl: 'https://streaming.live365.com/a31982'
  },
];

/**
 * Get available countries with metadata
 * @returns {Object} - Object containing country information
 */
export const getAvailableCountries = () => {
  return COUNTRIES;
};

/**
 * Get all curated radio stations
 * @returns {Array} - Array of station objects
 */
export const getAllStations = () => {
  // Simulate async fetch if needed in future
  // await new Promise(resolve => setTimeout(resolve, 50)); 
  return CURATED_STATIONS;
};

/**
 * Get unique genres from curated stations
 * @returns {Array} - Array of unique genre strings
 */
export const getRadioGenres = () => {
  const genres = new Set(CURATED_STATIONS.map(station => station.genre));
  return ['all', ...genres]; // Add 'all' option if needed, or handle in component
};

// Removed getRadioStations, getStationsByCountry, getStationsByGenre, 
// getPopularStations, searchStations as filtering/sorting will be client-side
// based on getAllStations() in the RadioPage component.
// Favorites service might handle favorite filtering separately. 