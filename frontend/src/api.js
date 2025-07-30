const API_URL = 'http://localhost:5001/api';

/**
 * Sends a game event to the backend to be tracked.
 * @param {string} type - The type of event (e.g., 'tile_click', 'reset').
 * @param {object} details - Any additional details about the event.
 */
export const trackEvent = async (type, details = {}) => {
  try {
    const response = await fetch(`${API_URL}/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, ...details }),
    });

    if (!response.ok) {
      throw new Error('Failed to track event');
    }

    const data = await response.json();
    console.log('Backend response:', data.message);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Fetches the analytics data from the backend.
 * @returns {Promise<object|null>} The analytics data or null if an error occurs.
 */
export const getAnalytics = async () => {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return null;
    }
};
