import axios from 'axios';

/**
 * IPTV Service - Handle large IPTV playlists (10,000+ channels)
 * Features: Chunked loading, caching, deduplication, proxy support
 */

// Popular IPTV.org playlist URLs
export const IPTV_SOURCES = {
    IPTV_ORG_WORLD: 'https://iptv-org.github.io/iptv/index.m3u',
    IPTV_ORG_COUNTRIES: 'https://iptv-org.github.io/iptv/index.country.m3u',
    IPTV_ORG_LANGUAGES: 'https://iptv-org.github.io/iptv/index.language.m3u',
    IPTV_ORG_CATEGORIES: 'https://iptv-org.github.io/iptv/index.category.m3u',
};

// CORS Proxies for fallback
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
];

// Cache configuration
const CACHE_KEY = 'iptv_channels_cache';
const CACHE_EXPIRY_KEY = 'iptv_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get country flag emoji from country code
 */
const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode === 'INT' || countryCode === 'UNDEFINED' || countryCode.length !== 2) {
        return '🌍';
    }

    try {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    } catch {
        return '🌍';
    }
};

/**
 * Decrypt/decode stream URL
 */
const decryptStreamUrl = (url) => {
    if (!url) return '';

    try {
        // Base64 decoding
        if (url.match(/^[A-Za-z0-9+/=]+$/) && !url.includes('http')) {
            return atob(url);
        }

        // Remove encryption markers
        if (url.includes('|') || url.includes('#')) {
            const parts = url.split(/[|#]/);
            return parts[0].trim();
        }

        // URL decode
        if (url.includes('%')) {
            return decodeURIComponent(url);
        }

        return url.trim();
    } catch (error) {
        console.warn('Error decrypting URL:', error);
        return url;
    }
};

/**
 * Parse M3U playlist content
 */
const parseM3UPlaylist = (content) => {
    const channels = [];
    const lines = content.split('\n');
    let currentChannel = {};
    let channelIndex = 0;

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

            // Extract tvg-id
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            if (idMatch) {
                currentChannel.tvgId = idMatch[1];
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
            currentChannel.id = currentChannel.tvgId || `iptv_${channelIndex++}`;
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
 * Fetch playlist with proxy fallback
 */
const fetchPlaylistWithProxy = async (url) => {
    // Try direct fetch first
    try {
        console.log('📡 Fetching IPTV playlist directly...');
        const response = await axios.get(url, {
            timeout: 30000,
            headers: {
                'Accept': 'application/x-mpegURL, text/plain, */*',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        console.log('✅ Direct fetch successful');
        return response.data;
    } catch (directError) {
        console.log('❌ Direct fetch failed, trying proxies...');
    }

    // Try CORS proxies
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy + encodeURIComponent(url);
            console.log(`🔄 Trying proxy: ${proxy.split('?')[0]}...`);
            const response = await axios.get(proxyUrl, {
                timeout: 30000,
                headers: {
                    'Accept': 'application/x-mpegURL, text/plain, */*'
                }
            });
            console.log('✅ Proxy fetch successful');
            return response.data;
        } catch (proxyError) {
            console.log(`❌ Proxy failed: ${proxyError.message}`);
            continue;
        }
    }

    throw new Error('Failed to fetch playlist from all sources');
};

/**
 * Get cached channels
 */
const getCachedChannels = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        if (cached && expiry && Date.now() < parseInt(expiry)) {
            console.log('📦 Using cached IPTV channels');
            return JSON.parse(cached);
        }
    } catch (error) {
        console.warn('Cache read error:', error);
    }
    return null;
};

/**
 * Set cached channels
 */
const setCachedChannels = (channels) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(channels));
        localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
        console.log(`💾 Cached ${channels.length} channels`);
    } catch (error) {
        console.warn('Cache write error:', error);
    }
};

/**
 * Deduplicate channels by stream URL
 */
const deduplicateChannels = (channels) => {
    const seen = new Set();
    return channels.filter(channel => {
        if (seen.has(channel.streamUrl)) {
            return false;
        }
        seen.add(channel.streamUrl);
        return true;
    });
};

/**
 * Fetch and parse IPTV playlist
 * @param {string} playlistUrl - M3U playlist URL
 * @param {Object} options - Options
 * @param {boolean} options.useCache - Use cached data if available
 * @param {number} options.limit - Maximum channels to return
 * @returns {Promise<Array>} - Array of TV channels
 */
export const fetchIPTVPlaylist = async (playlistUrl = IPTV_SOURCES.IPTV_ORG_WORLD, options = {}) => {
    const { useCache = true, limit = null } = options;

    try {
        // Check cache first
        if (useCache) {
            const cached = getCachedChannels();
            if (cached) {
                return limit ? cached.slice(0, limit) : cached;
            }
        }

        // Fetch playlist
        console.log(`📡 Fetching IPTV playlist from: ${playlistUrl}`);
        const content = await fetchPlaylistWithProxy(playlistUrl);

        // Parse M3U content
        console.log('📝 Parsing M3U content...');
        let channels = parseM3UPlaylist(content);
        console.log(`✅ Parsed ${channels.length} channels`);

        // Deduplicate
        channels = deduplicateChannels(channels);
        console.log(`✅ After deduplication: ${channels.length} channels`);

        // Cache the results
        setCachedChannels(channels);

        // Apply limit if specified
        if (limit && channels.length > limit) {
            console.log(`⚠️ Limiting to ${limit} channels`);
            return channels.slice(0, limit);
        }

        return channels;
    } catch (error) {
        console.error('❌ Error fetching IPTV playlist:', error);
        throw error;
    }
};

/**
 * Get channels by category
 */
export const getIPTVChannelsByCategory = async (category, options = {}) => {
    const channels = await fetchIPTVPlaylist(undefined, options);

    if (category === 'all') {
        return channels;
    }

    return channels.filter(channel =>
        channel.genre.toLowerCase().includes(category.toLowerCase())
    );
};

/**
 * Get channels by country
 */
export const getIPTVChannelsByCountry = async (country, options = {}) => {
    const channels = await fetchIPTVPlaylist(undefined, options);

    if (country === 'all') {
        return channels;
    }

    return channels.filter(channel =>
        channel.country === country || channel.country.toLowerCase().includes(country.toLowerCase())
    );
};

/**
 * Search IPTV channels
 */
export const searchIPTVChannels = async (query, options = {}) => {
    const channels = await fetchIPTVPlaylist(undefined, options);

    if (!query || query.trim() === '') {
        return channels;
    }

    const lowerQuery = query.toLowerCase().trim();

    return channels.filter(channel =>
        channel.name.toLowerCase().includes(lowerQuery) ||
        channel.genre.toLowerCase().includes(lowerQuery) ||
        channel.country.toLowerCase().includes(lowerQuery) ||
        (channel.language && channel.language.toLowerCase().includes(lowerQuery))
    );
};

/**
 * Get unique categories from IPTV channels
 */
export const getIPTVCategories = async () => {
    const channels = await fetchIPTVPlaylist();
    const categories = new Set(channels.map(ch => ch.genre));
    return ['all', ...Array.from(categories).sort()];
};

/**
 * Get unique countries from IPTV channels
 */
export const getIPTVCountries = async () => {
    const channels = await fetchIPTVPlaylist();
    const countries = new Set(channels.map(ch => ch.country));
    return ['all', ...Array.from(countries).sort()];
};

/**
 * Clear IPTV cache
 */
export const clearIPTVCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        console.log('🗑️ IPTV cache cleared');
        return true;
    } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
    }
};
