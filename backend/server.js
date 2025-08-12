const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const GameSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  userEmail: { type: String, required: true, index: true },
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
  userEmail: { type: String, required: true, index: true },
  type: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});
const GameAction = mongoose.model('GameAction', GameActionSchema);


// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists.' });
        user = new User({ email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});


// --- Game Tracking API Routes ---
app.post('/api/game/start', async (req, res) => {
    try {
        const { userEmail } = req.body;
        if (!userEmail) return res.status(400).json({ message: 'userEmail is required.' });
        const newSession = new GameSession({
            sessionId: new mongoose.Types.ObjectId().toString(),
            startTime: new Date(),
            userEmail: userEmail,
        });
        await newSession.save();
        console.log(`Game session started for ${userEmail}: [ID: ${newSession.sessionId}]`);
        res.status(201).json({ sessionId: newSession.sessionId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/game/action', async (req, res) => {
    try {
        const { sessionId, userEmail, type, ...details } = req.body;
        if (!sessionId || !userEmail || !type) {
            return res.status(400).json({ message: 'sessionId, userEmail, and type are required.' });
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

        console.log(`Action logged for ${userEmail}: [Session: ${sessionId}] [Type: ${type}]`);
        res.status(201).json({ message: 'Action logged successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/game/end', async (req, res) => {
    try {
        const { sessionId, outcome } = req.body;
        if (!sessionId || !outcome) return res.status(400).json({ message: 'sessionId and outcome are required.' });
        const session = await GameSession.findOne({ sessionId });
        if (!session) return res.status(404).json({ message: 'Session not found.' });

        session.endTime = new Date();
        session.durationSeconds = (session.endTime - session.startTime) / 1000;
        session.outcome = outcome;
        
        await session.save();
        
        console.log(`Game session ended: [ID: ${sessionId}] [Outcome: ${outcome}]`);
        res.status(200).json({ message: 'Game session ended.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Analytics API Route ---
app.get('/api/analytics', async (req, res) => {
  try {
    // --- UPDATED: Removed the filter to include ALL recent sessions ---
    const recentSessions = await GameSession.find({})
        .sort({ startTime: -1 })
        .limit(50);

    const summaryPipeline = [
        { $match: { outcome: { $ne: 'incomplete' } } }, // Only calculate stats for completed games
        { $group: {
            _id: null,
            totalGames: { $sum: 1 },
            totalWins: { $sum: { $cond: [{ $eq: ['$outcome', 'win'] }, 1, 0] } },
            avgDuration: { $avg: '$durationSeconds' },
            avgMoves: { $avg: '$totalMoves' },
            totalHints: { $sum: '$hintsUsed' },
        }}
    ];
    
    const summaryResult = await GameSession.aggregate(summaryPipeline);
    const summary = summaryResult[0] || { totalGames: 0, totalWins: 0, avgDuration: 0, avgMoves: 0, totalHints: 0 };
    summary.winRate = summary.totalGames > 0 ? (summary.totalWins / summary.totalGames) * 100 : 0;
    
    const actionLog = await GameAction.find().sort({ timestamp: -1 }).limit(100);

    res.status(200).json({ summary, recentSessions, actionLog });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Analytics server running on http://localhost:${PORT}`);
});
