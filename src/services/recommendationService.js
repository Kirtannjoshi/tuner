import { getTopStations } from './radioService';
import { getAllChannels } from './tvService';

/**
 * Unified Recommendation Engine
 * Provides personalized recommendations for both radio stations and TV channels
 */

const HISTORY_KEY = 'tuner_watch_history';
const PREFERENCES_KEY = 'tuner_preferences';
const MAX_HISTORY_ITEMS = 50;

/**
 * Get user's watch/listen history
 */
export const getHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error('Failed to load history:', e);
        return [];
    }
};

/**
 * Add item to history
 */
export const addToHistory = (media) => {
    try {
        const history = getHistory();
        const newItem = {
            id: media.id,
            name: media.name,
            type: media.type,
            genre: media.genre,
            country: media.country,
            logo: media.logo,
            streamUrl: media.streamUrl,
            timestamp: Date.now()
        };

        // Remove duplicate if exists
        const filtered = history.filter(item => item.id !== media.id);

        // Add to beginning
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

        // Update preferences based on this interaction
        updatePreferences(media);
    } catch (e) {
        console.error('Failed to save to history:', e);
    }
};

/**
 * Get user preferences (favorite genres, countries)
 */
export const getPreferences = () => {
    try {
        const prefs = localStorage.getItem(PREFERENCES_KEY);
        return prefs ? JSON.parse(prefs) : {
            genres: {},
            countries: {},
            types: { radio: 0, tv: 0 }
        };
    } catch (e) {
        return {
            genres: {},
            countries: {},
            types: { radio: 0, tv: 0 }
        };
    }
};

/**
 * Update user preferences based on interaction
 */
const updatePreferences = (media) => {
    try {
        const prefs = getPreferences();

        // Increment genre preference
        if (media.genre) {
            prefs.genres[media.genre] = (prefs.genres[media.genre] || 0) + 1;
        }

        // Increment country preference
        if (media.country) {
            prefs.countries[media.country] = (prefs.countries[media.country] || 0) + 1;
        }

        // Increment type preference
        if (media.type) {
            prefs.types[media.type] = (prefs.types[media.type] || 0) + 1;
        }

        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (e) {
        console.error('Failed to update preferences:', e);
    }
};

/**
 * Calculate similarity score between two items
 */
const calculateSimilarity = (item1, item2) => {
    let score = 0;

    // Genre match (highest weight)
    if (item1.genre && item2.genre && item1.genre === item2.genre) {
        score += 3;
    }

    // Country match
    if (item1.country && item2.country && item1.country === item2.country) {
        score += 2;
    }

    // Type match (radio/tv)
    if (item1.type && item2.type && item1.type === item2.type) {
        score += 1;
    }

    return score;
};

/**
 * Get content-based recommendations
 */
const getContentBasedRecommendations = async (currentMedia, allContent) => {
    if (!currentMedia) return [];

    // Calculate similarity scores
    const scored = allContent
        .filter(item => item.id !== currentMedia.id)
        .map(item => ({
            ...item,
            score: calculateSimilarity(currentMedia, item)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, 15);
};

/**
 * Get collaborative filtering recommendations based on history
 */
const getCollaborativeRecommendations = async (allContent) => {
    const history = getHistory();
    const prefs = getPreferences();

    if (history.length === 0) return [];

    // Score items based on user preferences
    const scored = allContent.map(item => {
        let score = 0;

        // Genre preference
        if (item.genre && prefs.genres[item.genre]) {
            score += prefs.genres[item.genre] * 2;
        }

        // Country preference
        if (item.country && prefs.countries[item.country]) {
            score += prefs.countries[item.country];
        }

        // Type preference
        if (item.type && prefs.types[item.type]) {
            score += prefs.types[item.type] * 0.5;
        }

        // Penalize if already in recent history
        const inHistory = history.slice(0, 10).some(h => h.id === item.id);
        if (inHistory) {
            score *= 0.3;
        }

        return { ...item, score };
    });

    return scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15);
};

/**
 * Get trending content (popular items)
 */
const getTrendingRecommendations = async (allContent) => {
    // For radio, use clickcount; for TV, use a default trending score
    return allContent
        .map(item => ({
            ...item,
            trendingScore: item.clickcount || Math.random() * 100
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 15);
};

/**
 * Main recommendation function - returns unified recommendations
 */
export const getRecommendations = async (currentMedia = null, limit = 20) => {
    try {
        // Fetch more content for better variety
        const [radioStations, tvChannels] = await Promise.all([
            getTopStations(60),
            Promise.resolve(getAllChannels())
        ]);

        // Add type field to distinguish radio from TV
        const radioWithType = radioStations.map(r => ({ ...r, type: 'radio' }));
        const tvWithType = tvChannels.map(t => ({ ...t, type: 'tv' }));
        const allContent = [...radioWithType, ...tvWithType];

        let recommendations = [];

        if (currentMedia) {
            // Content-based recommendations (50% weight)
            const contentBased = await getContentBasedRecommendations(currentMedia, allContent);
            recommendations.push(...contentBased.slice(0, Math.floor(limit * 0.5)));

            // Collaborative recommendations (30% weight)
            const collaborative = await getCollaborativeRecommendations(allContent);
            recommendations.push(...collaborative.slice(0, Math.floor(limit * 0.3)));

            // Trending recommendations (20% weight)
            const trending = await getTrendingRecommendations(allContent);
            recommendations.push(...trending.slice(0, Math.floor(limit * 0.2)));
        } else {
            // No current media - use collaborative and trending
            const collaborative = await getCollaborativeRecommendations(allContent);
            const trending = await getTrendingRecommendations(allContent);

            recommendations.push(...collaborative.slice(0, Math.floor(limit * 0.6)));
            recommendations.push(...trending.slice(0, Math.floor(limit * 0.4)));
        }

        // Remove duplicates and limit
        const unique = Array.from(
            new Map(recommendations.map(item => [item.id, item])).values()
        );

        // Mix radio and TV for variety
        const mixed = [];
        const radioRecs = unique.filter(r => r.type === 'radio');
        const tvRecs = unique.filter(r => r.type === 'tv');

        const maxLength = Math.max(radioRecs.length, tvRecs.length);
        for (let i = 0; i < maxLength && mixed.length < limit; i++) {
            if (i < radioRecs.length) mixed.push(radioRecs[i]);
            if (mixed.length < limit && i < tvRecs.length) mixed.push(tvRecs[i]);
        }

        return mixed.slice(0, limit);
    } catch (error) {
        console.error('Failed to get recommendations:', error);
        return [];
    }
};

/**
 * Get recommendations for homepage (mixed, trending-focused)
 */
export const getHomeRecommendations = async (limit = 30) => {
    try {
        // Use the same IPTV Global source as TvPage
        const iptvGlobalUrl = 'https://iptv-org.github.io/iptv/index.m3u';

        const [radioStations, tvChannels] = await Promise.all([
            getTopStations(40),
            // Fetch from IPTV Global source instead of curated list
            import('./tvService').then(module =>
                module.getTvChannelsFromSource({
                    source: iptvGlobalUrl,
                    category: 'all',
                    limit: 50 // Fetch enough to mix
                })
            )
        ]);

        const radioWithType = radioStations.map(r => ({ ...r, type: 'radio' }));
        const tvWithType = tvChannels.map(t => ({ ...t, type: 'tv' }));

        // Mix radio and TV evenly
        const mixed = [];
        const maxItems = Math.max(radioWithType.length, tvWithType.length);

        // Interleave them: 1 Radio, 1 TV, etc.
        for (let i = 0; i < maxItems && mixed.length < limit; i++) {
            if (i < radioWithType.length) mixed.push(radioWithType[i]);
            if (mixed.length < limit && i < tvWithType.length) mixed.push(tvWithType[i]);
        }

        return mixed.slice(0, limit);
    } catch (error) {
        console.error('Failed to get home recommendations:', error);
        return [];
    }
};

/**
 * Clear user history and preferences
 */
export const clearHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem(PREFERENCES_KEY);
    } catch (e) {
        console.error('Failed to clear history:', e);
    }
};
