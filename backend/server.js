const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = 'mongodb+srv://kalpeshkhare7777:Zg2MLf5b976zLtCE@memorygame.lrdhry8.mongodb.net/memorygamedb?retryWrites=true&w=majority&appName=MemoryGame';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// --- Database Schemas ---
const GameSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationSeconds: { type: Number },
  outcome: { type: String, enum: ['win', 'loss', 'incomplete'], default: 'incomplete' },
  totalMoves: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  undosUsed: { type: Number, default: 0 },
});
const GameSession = mongoose.model('GameSession', GameSessionSchema);

const GameActionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});
const GameAction = mongoose.model('GameAction', GameActionSchema);


// --- API Endpoints for Detailed Tracking ---

/**
 * @route   POST /api/game/start
 * @desc    Starts a new game session.
 */
app.post('/api/game/start', async (req, res) => {
    try {
        const newSession = new GameSession({
            sessionId: new mongoose.Types.ObjectId().toString(),
            startTime: new Date(),
        });
        await newSession.save();
        // --- ADDED LOG ---
        console.log(`Game session started: [Session ID: ${newSession.sessionId}]`);
        res.status(201).json({ sessionId: newSession.sessionId });
    } catch (error) {
        console.error('Error starting game session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/game/action
 * @desc    Logs a specific action for a game session.
 */
app.post('/api/game/action', async (req, res) => {
    try {
        const { sessionId, type, details } = req.body;
        if (!sessionId || !type) {
            return res.status(400).json({ message: 'sessionId and type are required.' });
        }
        
        const newAction = new GameAction({ sessionId, type, details });
        await newAction.save();

        const update = {};
        if (type === 'tile_click') update.$inc = { totalMoves: 1 };
        if (type === 'hint') update.$inc = { hintsUsed: 1 };
        if (type === 'undo') update.$inc = { undosUsed: 1 };
        
        if (Object.keys(update).length > 0) {
            await GameSession.updateOne({ sessionId }, update);
        }
        
        // --- LOG STATEMENT ---
        console.log(`Action logged: [Session: ${sessionId}] [Type: ${type}]`);
        res.status(201).json({ message: 'Action logged successfully.' });
    } catch (error) {
        console.error('Error logging action:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/game/end
 * @desc    Ends a game session.
 */
app.post('/api/game/end', async (req, res) => {
    try {
        const { sessionId, outcome } = req.body;
        if (!sessionId || !outcome) {
            return res.status(400).json({ message: 'sessionId and outcome are required.' });
        }

        const session = await GameSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        session.endTime = new Date();
        session.durationSeconds = (session.endTime - session.startTime) / 1000;
        session.outcome = outcome;
        
        await session.save();
        
        // --- ADDED LOG ---
        console.log(`Game session ended: [Session ID: ${sessionId}] [Outcome: ${outcome}]`);
        res.status(200).json({ message: 'Game session ended.' });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * @route   GET /api/analytics
 * @desc    Retrieves and calculates advanced analytics.
 */
app.get('/api/analytics', async (req, res) => {
  try {
    const recentSessions = await GameSession.find({ outcome: { $ne: 'incomplete' } })
        .sort({ startTime: -1 })
        .limit(50);

    const summaryPipeline = [
        {
            $group: {
                _id: null,
                totalGames: { $sum: 1 },
                totalWins: { $sum: { $cond: [{ $eq: ['$outcome', 'win'] }, 1, 0] } },
                avgDuration: { $avg: '$durationSeconds' },
                avgMoves: { $avg: '$totalMoves' },
                totalHints: { $sum: '$hintsUsed' },
            }
        }
    ];
    
    const summaryResult = await GameSession.aggregate(summaryPipeline);
    const summary = summaryResult[0] || { totalGames: 0, totalWins: 0, avgDuration: 0, avgMoves: 0, totalHints: 0 };
    summary.winRate = summary.totalGames > 0 ? (summary.totalWins / summary.totalGames) * 100 : 0;

    res.status(200).json({ summary, recentSessions });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Analytics server running on http://localhost:${PORT}`);
});
