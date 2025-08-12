const API_URL = 'http://localhost:5001/api';

// --- Authentication Functions ---
export const registerUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};


// --- Game Session and Analytics Functions ---
export const startGameSession = async (userEmail) => {
    try {
        const response = await fetch(`${API_URL}/game/start`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail }),
        });
        if (!response.ok) throw new Error('Failed to start session');
        const data = await response.json();
        return data.sessionId;
    } catch (error) {
        console.error('Error starting game session:', error);
        return null;
    }
};

export const logGameAction = async (sessionId, userEmail, type, details = {}) => {
    try {
        await fetch(`${API_URL}/game/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, userEmail, type, ...details }),
        });
    } catch (error) {
        console.error('Error logging game action:', error);
    }
};

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
