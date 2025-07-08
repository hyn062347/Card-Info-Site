import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cardBack from '../images/cardback.jpeg';
import './css/CardImages.css';
import Header from '../components/Header';

function CardImages() {
  const { oracleId } = useParams();
  const [cardVersions, setCardVersions] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardVersions = async () => {
      try {
        const response = await axios.get(`https://api.scryfall.com/cards/search?order=released&q=oracleid%3A${oracleId}&unique=prints`);
        const versions = response.data.data
          .map(card => {
            // single-face or first face for front image
            const front = card.image_uris?.normal
              ?? card.card_faces?.[0]?.image_uris?.normal
              ?? null;
            // second face only if available
            const back = card.card_faces?.[1]?.image_uris?.normal ?? null;
            return { id: card.id, front, back };
          })
          .filter(v => v.front);
        setCardVersions(versions);

        const preloadImages = versions.map(card =>
          new Promise(resolve => {
            const img = new Image();
            img.src = card.front;
            img.onload = resolve;
            img.onerror = resolve;
          })
        );
        await Promise.all(preloadImages);
        setLoading(false);
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
                {loading
          ? Array.from({ length: cardVersions.length}).map((_, index) => (
              <div className="card" key={index}>
                <img src={cardBack} alt="card back" className="card-image" />
              </div>
            ))
          : cardVersions.map((card, index) => (
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
