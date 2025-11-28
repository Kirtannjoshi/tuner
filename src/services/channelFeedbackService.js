/**
 * Channel Feedback Service
 * Track channel status (working/not working) and user ratings
 * Uses localStorage for MVP (can be upgraded to backend later)
 */

const FEEDBACK_KEY = 'channel_feedback';
const STATUS_KEY = 'channel_status';

/**
 * Get all channel feedback
 * @returns {Object} - Feedback data { channelId: { likes, dislikes, reports } }
 */
export const getChannelFeedback = () => {
    try {
        const data = localStorage.getItem(FEEDBACK_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading feedback:', error);
        return {};
    }
};

/**
 * Get feedback for a specific channel
 */
export const getChannelFeedbackById = (channelId) => {
    const allFeedback = getChannelFeedback();
    return allFeedback[channelId] || { likes: 0, dislikes: 0, reports: 0 };
};

/**
 * Save channel feedback
 */
const saveFeedback = (feedback) => {
    try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
    } catch (error) {
        console.error('Error saving feedback:', error);
    }
};

/**
 * Like a channel
 */
export const likeChannel = (channelId) => {
    const feedback = getChannelFeedback();
    if (!feedback[channelId]) {
        feedback[channelId] = { likes: 0, dislikes: 0, reports: 0 };
    }
    feedback[channelId].likes += 1;
    saveFeedback(feedback);

    // If channel has enough likes, mark as working
    if (feedback[channelId].likes > 2) {
        setChannelStatus(channelId, 'working');
    }
};

/**
 * Dislike a channel
 */
export const dislikeChannel = (channelId) => {
    const feedback = getChannelFeedback();
    if (!feedback[channelId]) {
        feedback[channelId] = { likes: 0, dislikes: 0, reports: 0 };
    }
    feedback[channelId].dislikes += 1;
    saveFeedback(feedback);
};

/**
 * Report channel as not working
 */
export const reportChannel = (channelId, reason = '') => {
    const feedback = getChannelFeedback();
    if (!feedback[channelId]) {
        feedback[channelId] = { likes: 0, dislikes: 0, reports: 0, reasons: [] };
    }
    feedback[channelId].reports += 1;

    if (reason) {
        if (!feedback[channelId].reasons) {
            feedback[channelId].reasons = [];
        }
        feedback[channelId].reasons.push({
            reason,
            timestamp: Date.now()
        });
    }

    saveFeedback(feedback);

    // If channel has too many reports, mark as not working
    if (feedback[channelId].reports > 3) {
        setChannelStatus(channelId, 'not_working');
    }
};

/**
 * Get all channel statuses
 */
export const getChannelStatuses = () => {
    try {
        const data = localStorage.getItem(STATUS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading statuses:', error);
        return {};
    }
};

/**
 * Get status for a specific channel
 * @returns {string} - 'working', 'not_working', or 'unknown'
 */
export const getChannelStatus = (channelId) => {
    const statuses = getChannelStatuses();
    return statuses[channelId] || 'unknown';
};

/**
 * Set channel status
 */
export const setChannelStatus = (channelId, status) => {
    const statuses = getChannelStatuses();
    statuses[channelId] = status;

    try {
        localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
    } catch (error) {
        console.error('Error saving status:', error);
    }
};

/**
 * Get channels by status
 */
export const getChannelsByStatus = (status) => {
    const statuses = getChannelStatuses();
    return Object.entries(statuses)
        .filter(([_, s]) => s === status)
        .map(([id, _]) => id);
};

/**
 * Clear all feedback data
 */
export const clearAllFeedback = () => {
    try {
        localStorage.removeItem(FEEDBACK_KEY);
        localStorage.removeItem(STATUS_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing feedback:', error);
        return false;
    }
};

/**
 * Get feedback statistics
 */
export const getFeedbackStats = () => {
    const feedback = getChannelFeedback();
    const statuses = getChannelStatuses();

    let totalLikes = 0;
    let totalDislikes = 0;
    let totalReports = 0;

    Object.values(feedback).forEach(f => {
        totalLikes += f.likes || 0;
        totalDislikes += f.dislikes || 0;
        totalReports += f.reports || 0;
    });

    const statusCounts = {
        working: 0,
        not_working: 0,
        unknown: 0
    };

    Object.values(statuses).forEach(status => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
        totalChannelsWithFeedback: Object.keys(feedback).length,
        totalLikes,
        totalDislikes,
        totalReports,
        statusCounts
    };
};
