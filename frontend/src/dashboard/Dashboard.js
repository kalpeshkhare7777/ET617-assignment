import React, { useState, useEffect } from 'react';

import { getAnalytics } from '../api';

import './Dashboard.css';



/**

* The Dashboard component to display game analytics.

*/

export default function Dashboard() {

const [stats, setStats] = useState(null);

const [loading, setLoading] = useState(true);



// Fetch data from the backend when the component mounts

useEffect(() => {

const fetchData = async () => {

setLoading(true);

const data = await getAnalytics();

setStats(data);

setLoading(false);

};



fetchData();

}, []);



// Show a loading message while data is being fetched

if (loading) {

return <div className="dashboard-container"><h2>Loading Analytics...</h2></div>;

}



// Show an error message if data could not be fetched

if (!stats) {

return <div className="dashboard-container"><h2>Could not load analytics data. Is the backend server running?</h2></div>;

}



return (

<div className="dashboard-container">

<h2>Game Analytics Dashboard</h2>


<div className="stats-grid">

<div className="stat-card">

<h3>Total Tile Clicks</h3>

<p>{stats.totalClicks}</p>

</div>

<div className="stat-card">

<h3>Game Resets</h3>

<p>{stats.totalResets}</p>

</div>

<div className="stat-card">

<h3>Total Events Tracked</h3>

<p>{stats.totalEvents}</p>

</div>

</div>



<div className="event-log">

<h3>Full Event Log (Latest First)</h3>

<ul>

{/* We use slice().reverse() to show the newest events first without changing the original array */}

{stats.events.map((event, index) => (

<li key={event._id || index}>

<strong>{event.type.replace('_', ' ')}</strong>

{event.type === 'tile_click' && ` (${event.details.tile})`}

<span> - {new Date(event.timestamp).toLocaleString()}</span>

</li>

))}

</ul>

</div>

</div>

);

}