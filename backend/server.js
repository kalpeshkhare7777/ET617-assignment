const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

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

// New Schema for User Authentication
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

// Schema for a single game session
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

// Schema for individual actions within a game
const GameActionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});
const GameAction = mongoose.model('GameAction', GameActionSchema);


// --- NEW Authentication API Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user.
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        user = new User({ email, password });

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Logs in a user.
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        
        // In a real app, you would generate and return a JWT token here
        res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// --- Game Analytics API Routes ---
app.post('/api/game/start', async (req, res) => {
    try {
        const newSession = new GameSession({
            sessionId: new mongoose.Types.ObjectId().toString(),
            startTime: new Date(),
        });
        await newSession.save();
        console.log(`Game session started: [Session ID: ${newSession.sessionId}]`);
        res.status(201).json({ sessionId: newSession.sessionId });
    } catch (error) {
        console.error('Error starting game session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/game/action', async (req, res) => {
    try {
        const { sessionId, type, details } = req.body;
        if (!sessionId || !type) {
            return res.status(400).json({ message: 'sessionId and type are required.' });
        }
        
        const newAction = new GameAction({ sessionId, userEmail, type, details });
        await newAction.save();

        const update = {};
        if (type === 'tile_click') update.$inc = { totalMoves: 1 };
        if (type === 'hint') update.$inc = { hintsUsed: 1 };
        if (type === 'undo') update.$inc = { undosUsed: 1 };
        
        if (Object.keys(update).length > 0) {
            await GameSession.updateOne({ sessionId }, update);
        }

        console.log(`Action logged: [Session: ${sessionId}] [Type: ${type}]`);
        res.status(201).json({ message: 'Action logged successfully.' });
    } catch (error) {
        console.error('Error logging action:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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
        
        console.log(`Game session ended: [Session ID: ${sessionId}] [Outcome: ${outcome}]`);
        res.status(200).json({ message: 'Game session ended.' });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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
    
    const actionLog = await GameAction.find().sort({ timestamp: -1 }).limit(100);

    res.status(200).json({ summary, recentSessions, actionLog });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

app.get('/api/game/log/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const actions = await GameAction.find({ sessionId }).sort({ timestamp: 1 });
        res.status(200).json(actions);
    } catch (error) {
        console.error('Error fetching session log:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Analytics server running on http://localhost:${PORT}`);
});
