import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../images/logo.png';
import './css/Home.css';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCards = async () => {
      const promises = Array.from({ length: 5 }).map(() =>
        axios.get(`https://api.scryfall.com/cards/random?t=${Date.now()}&r=${Math.random()}`)
      );
      try{
        const responses = await Promise.all(promises);
        setCards(responses.map((res) => res.data));
      } catch (error){
        console.error('Error fetching random cards.', error);
      }
    };

    fetchCards();
  }, []);


  // const SignIn = () => {
  //   navigate(`/signin`);
  // }

  // const SignUp = () => {
  //   navigate(`/signup`);
  // }

  return (
    <div className='home_page'>
      <div className='home_search_logo'>
        <img src={logoImage} alt="logo" className='home_page_logo' />
        <h1>WuffleFoils</h1>
        <button
          onClick={() => navigate('/search')}
          className='home_page_search_button'
        >Search for Cards</button>
      </div>

      <div className='floating_cards_container'>
        {cards.map((card, index) => (
          <img
            key={card.id}
            className={`floating_card card_${index}`}
            src={
              card.image_uris
                ? card.image_uris.normal
                : card.card_faces?.[0]?.image_uris?.normal
            }
            alt={card.name}
            onClick={() => navigate(`/images/${card.oracle_id}`)}
          />
        ))}
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
