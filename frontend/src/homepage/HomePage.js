import React from 'react';

/**
 * The Home Page component, shown after login.
 * @param {object} props - Component props.
 * @param {function} props.onStartGame - The function to call to start the game.
 */
export default function HomePage({ onStartGame }) {
  return (
    <div className="start-screen">
      <h2>Ready to test your memory?</h2>
      <button className="start-btn" onClick={onStartGame}>
        Start Game
      </button>
    </div>
  );
}
