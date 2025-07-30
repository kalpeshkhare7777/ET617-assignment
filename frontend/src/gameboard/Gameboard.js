import React, { useState, useEffect } from 'react';
import { trackEvent } from '../api'; // Corrected the import path

// The items to be matched. Using emojis for fun!
const TILE_ITEMS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

/**
 * Shuffles an array and duplicates its items to create pairs.
 * @returns {Array} An array of tile objects.
 */
const createShuffledTiles = () => {
  const pairedItems = [...TILE_ITEMS, ...TILE_ITEMS];
  // Simple shuffle algorithm
  for (let i = pairedItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairedItems[i], pairedItems[j]] = [pairedItems[j], pairedItems[i]];
  }
  return pairedItems.map((item, index) => ({
    id: index,
    content: item,
    isFlipped: false,
    isMatched: false,
  }));
};

/**
 * The main game board component with event tracking.
 */
export default function GameBoard() {
  const [tiles, setTiles] = useState(createShuffledTiles());
  const [flippedTiles, setFlippedTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [hintedPair, setHintedPair] = useState([]);

  // Effect to check for matches whenever two tiles are flipped
  useEffect(() => {
    if (flippedTiles.length < 2) return;

    const [firstIndex, secondIndex] = flippedTiles;
    // It's a match!
    if (tiles[firstIndex].content === tiles[secondIndex].content) {
      setTiles(prevTiles =>
        prevTiles.map(tile =>
          tile.content === tiles[firstIndex].content
            ? { ...tile, isMatched: true }
            : tile
        )
      );
      setFlippedTiles([]);
    } else {
      // Not a match, flip them back after a short delay
      setTimeout(() => {
        setTiles(prevTiles =>
          prevTiles.map((tile, index) =>
            index === firstIndex || index === secondIndex
              ? { ...tile, isFlipped: false }
              : tile
          )
        );
        setFlippedTiles([]);
      }, 1000);
    }
  }, [flippedTiles, tiles]);

  /**
   * Saves the current state to history before making a change.
   */
  const saveToHistory = () => {
    setHistory(prevHistory => [...prevHistory, { tiles: tiles, moves: moves }]);
  };

  /**
   * Handles the click event on a tile.
   * @param {number} index - The index of the clicked tile.
   */
  const handleTileClick = (index) => {
    if (flippedTiles.length >= 2 || tiles[index].isFlipped) {
      return;
    }

    // --- TRACK EVENT ---
    trackEvent('tile_click', { tile: tiles[index].content, tileId: index });

    saveToHistory();

    const newFlippedTiles = [...flippedTiles, index];
    setFlippedTiles(newFlippedTiles);

    setTiles(prevTiles =>
      prevTiles.map((tile, i) =>
        i === index ? { ...tile, isFlipped: true } : tile
      )
    );

    if (newFlippedTiles.length === 2) {
      setMoves(prev => prev + 1);
    }
  };

  /**
   * Resets the game to its initial state.
   */
  const handleReset = () => {
    // --- TRACK EVENT ---
    trackEvent('reset');
    
    setTiles(createShuffledTiles());
    setMoves(0);
    setFlippedTiles([]);
    setHistory([]);
    setHintedPair([]);
  };

  /**
   * Reverts the game to the last saved state.
   */
  const handleUndo = () => {
    if (history.length === 0) return;

    // --- TRACK EVENT ---
    trackEvent('undo');

    const lastState = history[history.length - 1];
    setTiles(lastState.tiles);
    setMoves(lastState.moves);
    setHistory(history.slice(0, -1));
    setFlippedTiles([]);
  };

  /**
   * Briefly reveals a pair of unmatched cards.
   */
  const handleHint = () => {
    // --- TRACK EVENT ---
    trackEvent('hint');

    const unmatchedTiles = tiles.filter(tile => !tile.isMatched);
    if (unmatchedTiles.length < 2) return;

    const firstTile = unmatchedTiles[0];
    const matchingTile = unmatchedTiles.find(
      tile => tile.content === firstTile.content && tile.id !== firstTile.id
    );

    if (matchingTile) {
      setHintedPair([firstTile.id, matchingTile.id]);
      setTimeout(() => setHintedPair([]), 800);
    }
  };

  return (
    <div className="game-container">
      <div className="game-stats">
        <p>Moves: {moves}</p>
      </div>
      <div className="game-controls">
        <button className="action-btn" onClick={handleHint}>Hint</button>
        <button className="action-btn" onClick={handleUndo} disabled={history.length === 0}>Undo</button>
        <button className="action-btn" onClick={handleReset}>Reset</button>
      </div>
      <div className="game-board">
        {tiles.map((tile, index) => (
          <div
            key={tile.id}
            className={`tile-container ${tile.isFlipped || tile.isMatched ? 'flipped' : ''} ${hintedPair.includes(tile.id) ? 'hinted' : ''}`}
            onClick={() => handleTileClick(index)}
          >
            <div className="tile">
              <div className="tile-front">{tile.content}</div>
              <div className="tile-back">?</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
