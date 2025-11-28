/**
 * Audio Service - Archive.org & iTunes API Integration
 * Provides search and streaming for audiobooks and podcasts
 */

/**
 * Search Archive.org for audio content (audiobooks, etc.)
 * @param {string} query - Search query
 * @param {string|null} lang - Language filter (hindi, gujarati, french, german, spanish)
 * @returns {Promise<Array>} Array of audio items
 */
export const searchArchive = async (query, lang = null) => {
    try {
        let q = `(${query}) AND mediatype:(audio)`;

        // Language-specific filters
        if (lang) {
            if (lang === 'hindi') q += ` AND (language:hin OR language:hindi)`;
            else if (lang === 'gujarati') q += ` AND (language:guj OR language:gujarati)`;
            else if (lang === 'french') q += ` AND (language:fre OR language:french)`;
            else if (lang === 'german') q += ` AND (language:ger OR language:german)`;
            else if (lang === 'spanish') q += ` AND (language:spa OR language:spanish)`;
            else q += ` AND language:(${lang})`;
        } else {
            // Default: focus on audiobooks
            q += ` AND (collection:librivoxaudio OR subject:audiobook OR format:MP3)`;
        }

        const encodedQ = encodeURIComponent(q);
        const url = `https://archive.org/advancedsearch.php?q=${encodedQ}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&fl[]=downloads&sort[]=downloads+desc&rows=100&page=1&output=json`;

        const response = await fetch(url);
        const data = await response.json();

        return data.response.docs.map(doc => ({
            id: doc.identifier,
            type: 'audio',
            subType: 'audiobook',
            title: doc.title || 'Untitled',
            artist: doc.creator || 'Unknown Artist',
            cover: `https://archive.org/services/img/${doc.identifier}`,
            description: doc.description,
            source: 'Archive.org',
            lang: lang || 'Global',
            streamUrl: null // Will be fetched on play
        }));
    } catch (error) {
        console.error("Archive Search Error:", error);
        return [];
    }
};

/**
 * Search iTunes for podcasts
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of podcast items
 */
export const searchPodcasts = async (query) => {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&entity=podcast&limit=50`;
        const response = await fetch(url);
        const data = await response.json();

        return data.results.map(item => ({
            id: item.collectionId.toString(),
            type: 'audio',
            subType: 'podcast',
            title: item.collectionName,
            artist: item.artistName,
            cover: item.artworkUrl600 || item.artworkUrl100,
            source: 'iTunes',
            feedUrl: item.feedUrl,
            streamUrl: null // Podcasts need feed parsing
        }));
    } catch (error) {
        console.error("Podcast Search Error:", error);
        return [];
    }
};

/**
 * Fetch streamable MP3 URL from Archive.org item
 * @param {string} identifier - Archive.org item identifier
 * @returns {Promise<Object|null>} Object with url and duration, or null
 */
export const fetchArchiveStreamUrl = async (identifier) => {
    try {
        const response = await fetch(`https://archive.org/metadata/${identifier}`);
        const data = await response.json();

        const server = `https://${data.server}${data.dir}`;

        // Find best quality MP3 file (excluding samples)
        const audioFile = data.files.find(f =>
            (f.format === 'VBR MP3' || f.format === '64Kbps MP3' || f.format === '128Kbps MP3' || f.format === 'MP3') &&
            !f.name.endsWith('_sample.mp3')
        );

        if (audioFile) {
            return {
                url: `${server}/${encodeURIComponent(audioFile.name)}`,
                duration: parseFloat(audioFile.length) || 0
            };
        }
        return null;
    } catch (error) {
        console.error("Stream Fetch Error:", error);
        return null;
    }
};

/**
 * Get supported language categories
 * @returns {Array} Array of language options
 */
export const getLanguageCategories = () => {
    return [
        { id: 'all', label: 'All', lang: null },
        { id: 'audiobooks', label: 'Audiobooks', lang: null },
        { id: 'hindi', label: 'Hindi', lang: 'hindi' },
        { id: 'gujarati', label: 'Gujarati', lang: 'gujarati' },
        { id: 'french', label: 'French', lang: 'french' },
        { id: 'german', label: 'German', lang: 'german' },
        { id: 'spanish', label: 'Spanish', lang: 'spanish' },
    ];
};

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 * @param {number} time - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Get default/trending content
 * @returns {Promise<Array>} Array of trending audio items
 */
export const getTrendingAudio = async () => {
    return searchArchive('classic literature OR mystery OR sci-fi');
};
