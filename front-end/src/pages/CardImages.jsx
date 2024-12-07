import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import logoImage from '../images/logo.png';
import './css/CardImages.css';
import Header from '../components/Header';

function CardImages() {
  const { oracleId } = useParams();
  const [cardVersions, setCardVersions] = useState([]);
  const [flipped, setFlipped] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardVersions = async () => {
      try {
        const response = await axios.get(`https://api.scryfall.com/cards/search?order=released&q=oracleid%3A${oracleId}&unique=prints`);
        const versions = response.data.data.map(card => ({
          id: card.id,
          front: card.image_uris ? card.image_uris.normal : (card.card_faces ? card.card_faces[0].image_uris.normal : null),
          back: card.card_faces ? card.card_faces[1].image_uris.normal : null
        })).filter(card => card.front);
        setCardVersions(versions);
      } catch (error) {
        console.error("Error fetching card versions from Scryfall API", error);
      }
    };

    fetchCardVersions();
  }, [oracleId]);

  const handleFlip = id => {
    setFlipped(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  return (
    <div className='Images_Pages_Main'>
      <Header/>
      <h1>Card Versions</h1>
      <div className="card-container">
        {cardVersions.map((card, index) => (
          <div className="card" key={index}>
            <div className={`card-flip ${flipped[card.id] ? 'flipped' : ''}`}>
              <img
                src={card.front}
                alt="card front"
                className="card-image front"
                onClick={() => navigate(`/details/${card.id}`)}
              />
              {card.back && (
                <img
                  src={card.back}
                  alt="card back"
                  className="card-image back"
                  onClick={() => navigate(`/details/${card.id}`)}
                />
              )}
            </div>
            {card.back && <button
              onClick={() => handleFlip(card.id)}
              className='Card_Flip_Button'
            >Flip</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardImages;
