/**
 * Smart Recommendation Engine
 * Combines Radio + TV sources with intelligent scoring
 * Filters non-working channels based on user feedback
 */

import { getAllChannels } from './tvService';
import { getTopStations } from './radioService';
import { fetchIPTVPlaylist } from './iptvService';
import { getChannelFeedback, getChannelStatus } from './channelFeedbackService';

/**
 * Calculate similarity score between two genres
 */
const genreSimilarity = (genre1, genre2) => {
    if (!genre1 || !genre2) return 0;

    const g1 = genre1.toLowerCase();
    const g2 = genre2.toLowerCase();

    if (g1 === g2) return 1.0;
    if (g1.includes(g2) || g2.includes(g1)) return 0.7;

    // Genre mapping for related categories
    const relatedGenres = {
        'news': ['politics', 'current affairs', 'documentary'],
        'sports': ['football', 'basketball', 'cricket', 'tennis'],
        'music': ['pop', 'rock', 'jazz', 'classical', 'hip hop'],
        'entertainment': ['comedy', 'drama', 'reality', 'talk show'],
        'kids': ['animation', 'cartoons', 'children', 'family'],
    };

    for (const [main, related] of Object.entries(relatedGenres)) {
        if ((g1.includes(main) && related.some(r => g2.includes(r))) ||
            (g2.includes(main) && related.some(r => g1.includes(r)))) {
            return 0.5;
        }
    }

    return 0;
};

/**
 * Calculate recommendation score for a channel
 */
const calculateScore = (channel, currentMedia, userHistory = [], feedback = {}) => {
    let score = 0;

    // Base score from channel feedback (working status)
    const status = getChannelStatus(channel.id);
    if (status === 'not_working') {
        return -1; // Filter out non-working channels
    }

    const channelFeedback = feedback[channel.id] || { likes: 0, dislikes: 0, reports: 0 };
    const feedbackScore = (channelFeedback.likes - channelFeedback.dislikes) / Math.max(1, channelFeedback.likes + channelFeedback.dislikes + 1);
    score += feedbackScore * 20; // Max 20 points from feedback

    // Genre similarity (max 30 points)
    if (currentMedia && currentMedia.genre) {
        const similarity = genreSimilarity(channel.genre, currentMedia.genre);
        score += similarity * 30;
    }

    // Country match (10 points)
    if (currentMedia && channel.country === currentMedia.country) {
        score += 10;
    }

    // Language match (5 points)
    if (currentMedia && channel.language === currentMedia.language) {
        score += 5;
    }

    // User history bonus (max 15 points)
    const historyCount = userHistory.filter(h => h.id === channel.id).length;
    score += Math.min(historyCount * 5, 15);

    // Popularity bonus (max 10 points)
    if (channel.clickcount) {
        score += Math.min(channel.clickcount / 1000, 10);
    }

    // Penalize if too many reports
    if (channelFeedback.reports > 5) {
        score -= channelFeedback.reports * 2;
    }

    return score;
};

/**
 * Get mixed recommendations (Radio + TV)
 * @param {Object} currentMedia - Currently playing media
 * @param {Object} options - Options
 * @param {number} options.limit - Number of recommendations
 * @param {boolean} options.includeIPTV - Include IPTV channels
 * @param {Array} options.userHistory - User watch history
 * @returns {Promise<Array>} - Recommended channels
 */
export const getRecommendations = async (currentMedia, options = {}) => {
    const {
        limit = 10,
        includeIPTV = true,
        userHistory = [],
    } = options;

    try {
        let allChannels = [];

        // Determine if current media is video or audio
        const isVideo = currentMedia?.type === 'tv';

        // Fetch channels based on current media type
        if (isVideo) {
            // Get TV channels
            const tvChannels = getAllChannels();
            allChannels.push(...tvChannels);

            // Optionally include IPTV channels
            if (includeIPTV) {
                try {
                    const iptvChannels = await fetchIPTVPlaylist(undefined, { useCache: true, limit: 1000 });
                    allChannels.push(...iptvChannels);
                } catch (error) {
                    console.warn('Failed to load IPTV channels for recommendations:', error);
                }
            }
        } else {
            // Get Radio stations
            const radioStations = await getTopStations(100);
            allChannels.push(...radioStations);
        }

        // Filter out current media
        allChannels = allChannels.filter(ch => ch.id !== currentMedia?.id);

        // Get all feedback data
        const feedback = getChannelFeedback();

        // Calculate scores for all channels
        const scoredChannels = allChannels.map(channel => ({
            ...channel,
            score: calculateScore(channel, currentMedia, userHistory, feedback)
        }));

        // Filter out non-working channels (score < 0)
        const workingChannels = scoredChannels.filter(ch => ch.score >= 0);

        // Sort by score (descending)
        workingChannels.sort((a, b) => b.score - a.score);

        // Add some randomness to avoid always showing the same recommendations
        const topCandidates = workingChannels.slice(0, limit * 3);
        const shuffled = topCandidates.sort(() => Math.random() - 0.5);

        // Return top N
        return shuffled.slice(0, limit);
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return [];
    }
};

/**
 * Get recommendations for a specific genre
 */
export const getRecommendationsByGenre = async (genre, options = {}) => {
    const { limit = 10, includeIPTV = true } = options;

    try {
        let allChannels = [];

        // Get TV channels
        const tvChannels = getAllChannels();
        allChannels.push(...tvChannels);

        // Get Radio stations
        const radioStations = await getTopStations(100);
        allChannels.push(...radioStations);

        // Optionally include IPTV
        if (includeIPTV) {
            try {
                const iptvChannels = await fetchIPTVPlaylist(undefined, { useCache: true, limit: 1000 });
                allChannels.push(...iptvChannels);
            } catch (error) {
                console.warn('Failed to load IPTV channels:', error);
            }
        }

        // Filter by genre
        const filtered = allChannels.filter(ch =>
            ch.genre && ch.genre.toLowerCase().includes(genre.toLowerCase())
        );

        // Get feedback
        const feedback = getChannelFeedback();

        // Score and filter
        const scored = filtered.map(ch => ({
            ...ch,
            score: calculateScore(ch, null, [], feedback)
        })).filter(ch => ch.score >= 0);

        // Sort and return
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
    } catch (error) {
        console.error('Error getting genre recommendations:', error);
        return [];
    }
};

/**
 * Get trending channels (highest rated, most watched)
 */
export const getTrendingChannels = async (options = {}) => {
    const { limit = 20, includeIPTV = true } = options;

    try {
        let allChannels = [];

        // Get all sources
        const tvChannels = getAllChannels();
        const radioStations = await getTopStations(100);
        allChannels.push(...tvChannels, ...radioStations);

        if (includeIPTV) {
            try {
                const iptvChannels = await fetchIPTVPlaylist(undefined, { useCache: true, limit: 1000 });
                allChannels.push(...iptvChannels);
            } catch (error) {
                console.warn('Failed to load IPTV channels:', error);
            }
        }

        // Get feedback
        const feedback = getChannelFeedback();

        // Score based on popularity and feedback
        const scored = allChannels.map(ch => {
            const channelFeedback = feedback[ch.id] || { likes: 0, dislikes: 0 };
            const feedbackScore = channelFeedback.likes - channelFeedback.dislikes;
            const popularityScore = ch.clickcount || 0;

            return {
                ...ch,
                score: feedbackScore * 10 + popularityScore
            };
        });

        // Filter working channels
        const working = scored.filter(ch => getChannelStatus(ch.id) !== 'not_working');

        // Sort and return
        working.sort((a, b) => b.score - a.score);
        return working.slice(0, limit);
    } catch (error) {
        console.error('Error getting trending channels:', error);
        return [];
    }
};
