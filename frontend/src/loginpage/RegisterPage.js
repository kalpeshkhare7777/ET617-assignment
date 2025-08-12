import React, { useState } from 'react';
import { registerUser } from '../api';
import './LoginPage.css'; // We can reuse the same styles

/**
 * A component for the user registration screen.
 * @param {object} props - Component props.
 * @param {function} props.onGoToLogin - Function to navigate back to the login page.
 */
export default function RegisterPage({ onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const response = await registerUser(email, password);

    if (response.message.includes('successfully')) {
      setMessage(response.message + ' You can now log in.');
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h1>Create Account</h1>
        <p>Sign up to start playing.</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="form-footer">
        Already have an account?{' '}
        <button className="link-btn" onClick={onGoToLogin}>
          Sign In
        </button>
      </p>
    </div>
  );
}
