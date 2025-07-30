const express = require('express');

const cors = require('cors');

const mongoose = require('mongoose');



// --- Configuration ---

const app = express();

const PORT = process.env.PORT || 5001;

// IMPORTANT: Replace this with your own MongoDB connection string

const MONGO_URI = 'mongodb+srv://kalpeshkhare7777:Zg2MLf5b976zLtCE@memorygame.lrdhry8.mongodb.net/?retryWrites=true&w=majority&appName=MemoryGame';



// --- Middleware ---

app.use(cors());

app.use(express.json());



// --- Database Connection ---

mongoose.connect(MONGO_URI)

.then(() => console.log('Successfully connected to MongoDB.'))

.catch(err => {

console.error('Database connection error:', err);

process.exit(1); // Exit if we can't connect to the database

});



// --- Database Schema and Model ---

// This defines the structure for the documents we'll save in MongoDB.

const gameEventSchema = new mongoose.Schema({

type: {

type: String,

required: true,

},

details: {

type: Object, // Flexible object to store extra info

},

timestamp: {

type: Date,

default: Date.now,

},

});



const GameEvent = mongoose.model('GameEvent', gameEventSchema);





// --- API Routes ---



/**

* @route POST /api/track-event

* @desc Receives and saves a game event to the MongoDB database.

*/

app.post('/api/track-event', async (req, res) => {

try {

// Destructure the type from the rest of the details for cleaner storage

const { type, ...details } = req.body;



// Ensure type is provided

if (!type) {

return res.status(400).json({ message: 'Event type is required.' });

}



const newEvent = new GameEvent({

type: type,

details: details, // Store only the other details

});



await newEvent.save(); // Save the new event to the database



// --- ADDED LOG STATEMENT ---

console.log(`Event saved to database: [Type: ${type}]`);



res.status(201).json({ message: 'Event tracked successfully' });

} catch (error) {

console.error('Error saving event:', error);

res.status(500).json({ message: 'Server error while tracking event' });

}

});



/**

* @route GET /api/analytics

* @desc Retrieves analytics data from the MongoDB database.

*/

app.get('/api/analytics', async (req, res) => {

try {

// Perform database queries to get the stats

const totalClicks = await GameEvent.countDocuments({ type: 'tile_click' });

const totalResets = await GameEvent.countDocuments({ type: 'reset' });

const totalEvents = await GameEvent.countDocuments();


// Get the most recent 50 events for the log, ensuring they have a type

const recentEvents = await GameEvent.find({ type: { $exists: true } }).sort({ timestamp: -1 }).limit(50);



const analyticsData = {

totalEvents,

totalClicks,

totalResets,

events: recentEvents,

};



res.status(200).json(analyticsData);

} catch (error) {

console.error('Error fetching analytics:', error);

res.status(500).json({ message: 'Server error while fetching analytics' });

}

});



/**

* @route GET /api/seed-data

* @desc Adds sample data to the database for testing.

*/

app.get('/api/seed-data', async (req, res) => {

try {

// Check if there's already data to avoid duplicates

const count = await GameEvent.countDocuments();

if (count > 0) {

return res.status(400).json({ message: 'Database already contains data. Seeding aborted.' });

}



const sampleEvents = [

{ type: 'tile_click', details: { tile: '🐶', tileId: 0 } },

{ type: 'tile_click', details: { tile: '🐱', tileId: 1 } },

{ type: 'tile_click', details: { tile: '🐭', tileId: 2 } },

{ type: 'tile_click', details: { tile: '�', tileId: 3 } },

{ type: 'reset', details: {} },

{ type: 'tile_click', details: { tile: '🦊', tileId: 4 } },

{ type: 'hint', details: {} },

];



await GameEvent.insertMany(sampleEvents);



res.status(201).json({ message: `${sampleEvents.length} sample events added to the database.` });



} catch (error) {

console.error('Error seeding data:', error);

res.status(500).json({ message: 'Server error while seeding data.' });

}

});





// --- Start the Server ---

app.listen(PORT, () => {

console.log(`Analytics server running on http://localhost:${PORT}`);

});