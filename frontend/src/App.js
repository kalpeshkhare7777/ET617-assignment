import React, { useState } from 'react';
import LoginPage from './loginpage/LoginPage';
import HomePage from './homepage/HomePage';
import GameBoard from './gameboard/Gameboard'
import Dashboard from './dashboard/Dashboard'; // Import the Dashboard
import './memorygame/MemoryGame.css';
import RegisterPage from './loginpage/RegisterPage';

export default function App() {
  // This state determines which page is currently shown to the user.
  const [page, setPage] = useState('login'); // 'login', 'register', 'home', etc.
  // NEW: This state will store the email of the currently logged-in user.
  const [currentUser, setCurrentUser] = useState(null);

  // NEW: This function handles a successful login.
  // It receives the user's email, stores it, and navigates to the home page.
  const handleLoginSuccess = (userEmail) => {
    setCurrentUser(userEmail);
    setPage('home');
  };

  // This function decides which component to render based on the 'page' state.
  const renderContent = () => {
    switch (page) {
      case 'login':
        // We now pass the new login handler to the LoginPage component.
        return <LoginPage 
                  onLoginSuccess={handleLoginSuccess} 
                  onGoToRegister={() => setPage('register')} 
               />;
      case 'register':
        return <RegisterPage 
                  onGoToLogin={() => setPage('login')} 
               />;
      case 'home':
        return <HomePage onStartGame={() => setPage('game')} />;
      case 'game':
        // We pass the current user's email down to the GameBoard.
        return <GameBoard currentUser={currentUser} />;
      case 'dashboard':
        // We pass the current user's email down to the Dashboard.
        return <Dashboard currentUser={currentUser} />;
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setPage('register')} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Memory Game</h1>
        {/* Only show the dashboard button after the user has logged in */}
        {page !== 'login' && page !== 'register' && (
          <nav className="app-nav">
            <button 
              className="nav-btn" 
              onClick={() => setPage(page === 'dashboard' ? 'home' : 'dashboard')}
            >
              {page === 'dashboard' ? 'Back to Home' : 'View Dashboard'}
            </button>
          </nav>
        )}
      </header>
      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}
