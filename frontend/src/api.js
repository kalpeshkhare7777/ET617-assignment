const API_URL = 'http://localhost:5001/api';

/**
 * Starts a new game session on the backend.
 * @returns {Promise<string|null>} The new session ID, or null on error.
 */
export const startGameSession = async () => {
    try {
        const response = await fetch(`${API_URL}/game/start`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to start session');
        const data = await response.json();
        return data.sessionId;
    } catch (error) {
        console.error('Error starting game session:', error);
        return null;
    }
};

/**
 * Logs a specific action for a given game session.
 * @param {string} sessionId - The ID of the current game session.
 * @param {string} type - The type of action (e.g., 'tile_click', 'hint').
 * @param {object} details - Any additional details about the action.
 */
export const logGameAction = async (sessionId, type, details = {}) => {
    try {
        const response = await fetch(`${API_URL}/game/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, type, ...details }),
        });
        if (!response.ok) throw new Error('Failed to log action');
        // We don't need to log the response here as it can be spammy.
    } catch (error) {
        console.error('Error logging game action:', error);
    }
};

/**
 * Ends a game session on the backend.
 * @param {string} sessionId - The ID of the session to end.
 * @param {string} outcome - The result of the game ('win' or 'loss').
 */
export const endGameSession = async (sessionId, outcome) => {
    try {
        await fetch(`${API_URL}/game/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, outcome }),
        });
    } catch (error) {
        console.error('Error ending game session:', error);
    }
};


/**
 * Fetches the summary analytics data from the backend.
 * @returns {Promise<object|null>} The analytics data or null if an error occurs.
 */
export const getAnalytics = async () => {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return await response.json();
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return null;
    }
};
