import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logoImage from './images/logo.png';
import './SignUp.css';
import axios from 'axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add the logic to handle the sign-up process, e.g., API call
    setMessage('Successfully Signed Up!');
    console.log('Email:', email, 'Password:', password);
  };

  return (
    <div className="signup-form">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;