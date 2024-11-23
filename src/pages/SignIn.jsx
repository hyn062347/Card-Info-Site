import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logoImage from './images/logo.png';
import './SignIn.css';
import axios from 'axios';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { redirectTo } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate(redirectTo || '/');
    } catch (error) {
      setErrorMessage(error.response.data.message || 'Invalid credentials');
    }
  };

  return (
    <div className='Sign_In_Main_Page'>
      <div className="Sign_In_Container">
        <img 
          src={logoImage} 
          alt="Logo" 
          className="Sign_In_Logo"
          onClick={()=> navigate(`/`)}
          />
        <h1 className='Sign_In_Container_Text'>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              className='Sign_In_Form_Input'
              type="text"
              id="username"
              placeholder='Name'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              className='Sign_In_Form_Input'
              type="password"
              id="password"
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className='Sign_In_Button'>Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;

