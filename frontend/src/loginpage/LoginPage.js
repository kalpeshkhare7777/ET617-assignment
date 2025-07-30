import React, { useState } from 'react';
import './LoginPage.css';

/**
 * A component for the user login screen.
 * @param {object} props - Component props.
 * @param {function} props.onLogin - The function to call when login is successful.
 */
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handles the form submission.
   * In a real application, this is where you would validate credentials.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(); // Proceed to the next page
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome!</h1>
          <p>Please sign in to play the Memory Game.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>
      </div>
  );
}
