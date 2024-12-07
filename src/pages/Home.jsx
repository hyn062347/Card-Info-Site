import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../images/logo.png';
import './css/Home.css';

function Home() {
  const navigate = useNavigate();

  // const SignIn = () => {
  //   navigate(`/signin`);
  // }

  // const SignUp = () => {
  //   navigate(`/signup`);
  // }
  
  return (
    <div className='home_page'>
      <div>
        <img src={logoImage} alt="logo" className='home_page_logo'/>
        <h1>Foils.com</h1>
        <button 
          onClick={() => navigate('/search')}
          className='home_page_search_button'
          >Search for Cards</button>
      </div>
      {/* <div className='home_page_sign_box'>
        <div 
          className='home_page_sign_button'
          onClick={() => navigate(`/signin`)}
          >Sign In</div>
        <div 
            className='home_page_sign_button'
            onClick={() => navigate(`/signup`)}
          >Sign Up</div>
      </div> */}
    </div>
  );
}

export default Home;
