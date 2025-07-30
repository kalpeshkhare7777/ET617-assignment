import React, { useState, useEffect, useRef } from 'react';
import { startGameSession, logGameAction, endGameSession } from '../api';

// The items to be matched. Using emojis for fun!
const TILE_ITEMS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

/**
 * Shuffles an array and duplicates its items to create pairs.
 * @returns {Array} An array of tile objects.
 */
const createShuffledTiles = () => {
  const pairedItems = [...TILE_ITEMS, ...TILE_ITEMS];
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
 * The main game board component with advanced event tracking.
 */
export default function GameBoard() {
  const [tiles, setTiles] = useState(createShuffledTiles());
  const [flippedTiles, setFlippedTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [history, setHistory] = useState([]); // For the undo feature
  const [hintedPair, setHintedPair] = useState([]); // For the hint feature
  
  const sessionIdRef = useRef(null);
  
  // This effect runs only once when the component mounts to start a new game session.
  useEffect(() => {
    const initializeGame = async () => {
      const newSessionId = await startGameSession();
      if (newSessionId) {
        sessionIdRef.current = newSessionId;
        logGameAction(newSessionId, 'game_start');
      }
    };
    initializeGame();
  }, []);

  // This effect checks for a win condition whenever the tiles state changes.
  useEffect(() => {
    // Don't check for win on the initial empty board
    if (tiles.length > 0 && tiles.every(tile => tile.isMatched)) {
        if (!isGameWon) { // Prevent multiple win events
            setIsGameWon(true);
            if (sessionIdRef.current) {
                logGameAction(sessionIdRef.current, 'game_end', { outcome: 'win' });
                endGameSession(sessionIdRef.current, 'win');
            }
        }
    }
  }, [tiles, isGameWon]);

  // This effect handles the logic for matching tiles.
  useEffect(() => {
    if (flippedTiles.length < 2) return;

    const [firstIndex, secondIndex] = flippedTiles;
    const firstTile = tiles[firstIndex];
    const secondTile = tiles[secondIndex];
    const isMatch = firstTile.content === secondTile.content;

    if (sessionIdRef.current) {
        logGameAction(sessionIdRef.current, 'match_attempt', {
            tiles: [firstTile.content, secondTile.content],
            isMatch: isMatch,
        });
    }

    if (isMatch) {
      setTiles(prevTiles =>
        prevTiles.map(tile =>
          tile.content === firstTile.content ? { ...tile, isMatched: true } : tile
        )
      );
      setFlippedTiles([]);
    } else {
      setTimeout(() => {
        setTiles(prevTiles =>
          prevTiles.map((tile, index) =>
            index === firstIndex || index === secondIndex ? { ...tile, isFlipped: false } : tile
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
    setHistory(prevHistory => [...prevHistory, { tiles, moves }]);
  };

  /**
   * Handles the click event on a tile.
   */
  const handleTileClick = (index) => {
    if (isGameWon || flippedTiles.length >= 2 || tiles[index].isFlipped) {
      return;
    }

    saveToHistory(); // Save state before the move

    if (sessionIdRef.current) {
        logGameAction(sessionIdRef.current, 'tile_click', { 
            tile: tiles[index].content, 
            tileId: index,
            isFirstTile: flippedTiles.length === 0,
        });
    }

    setMoves(prev => prev + 1);
    setFlippedTiles(prev => [...prev, index]);
    setTiles(prevTiles =>
      prevTiles.map((tile, i) =>
        i === index ? { ...tile, isFlipped: true } : tile
      )
    );
  };

  /**
   * Resets the game to its initial state, starting a new session.
   */
  const handleReset = async () => {
    if (sessionIdRef.current && !isGameWon) {
        // End the current session as 'incomplete' since it was reset
        await endGameSession(sessionIdRef.current, 'incomplete');
    }
    
    // Start a brand new session
    const newSessionId = await startGameSession();
    if (newSessionId) {
        sessionIdRef.current = newSessionId;
        logGameAction(newSessionId, 'game_start');
    }
    
    setTiles(createShuffledTiles());
    setMoves(0);
    setFlippedTiles([]);
    setIsGameWon(false);
    setHistory([]);
  };

  /**
   * Briefly reveals a pair of unmatched cards.
   */
  const handleHint = () => {
    if (sessionIdRef.current) {
      logGameAction(sessionIdRef.current, 'hint');
    }

    const unmatchedTiles = tiles.filter(tile => !tile.isMatched && !tile.isFlipped);
    if (unmatchedTiles.length < 2) return;

    const firstTile = unmatchedTiles[0];
    const matchingTile = unmatchedTiles.find(
      tile => tile.content === firstTile.content && tile.id !== firstTile.id
    );

    if (matchingTile) {
      setHintedPair([firstTile.id, matchingTile.id]);
      setTimeout(() => setHintedPair([]), 800); // Show hint for 0.8 seconds
    }
  };

  /**
   * Reverts the game to the last saved state.
   */
  const handleUndo = () => {
    if (history.length === 0) return;

    if (sessionIdRef.current) {
      logGameAction(sessionIdRef.current, 'undo');
    }

    const lastState = history[history.length - 1];
    setTiles(lastState.tiles);
    setMoves(lastState.moves);
    setHistory(history.slice(0, -1)); // Remove the last state
    setFlippedTiles([]); // Clear any selections
  };

  return (
    <div className="game-container">
      {isGameWon && <div className="win-message">You Won!</div>}
      <div className="game-stats">
        <p>Moves: {moves}</p>
      </div>
      <div className="game-controls">
        <button className="action-btn" onClick={handleHint} disabled={isGameWon}>Hint</button>
        <button className="action-btn" onClick={handleUndo} disabled={history.length === 0 || isGameWon}>Undo</button>
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
