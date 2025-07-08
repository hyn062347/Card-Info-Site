import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/Datacontext';
import axios from 'axios';
import './css/CardSearch.css';
import Header from '../components/Header';
import cardBack from '../images/cardback.jpeg';

function CardSearch() {
  const { globalSearchTerm, setGlobalSearchTerm } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardImages, setCardImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Global search term 처리
  useEffect(() => {
    if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
      handleSearch(globalSearchTerm);
      setGlobalSearchTerm('');
    }
  }, [globalSearchTerm]);

  // 카드 검색 기능
  const handleSearch = async (term = searchTerm) => {
    setLoading(true);
    try {
      if (term.length > 2) {
        const response = await axios.get(
          `https://api.scryfall.com/cards/search?q=${term}`
        );
        const cards = response.data.data;

        if (cards.length === 0) {
          setError('No cards found.');
          setCardImages([]);
          setLoading(false);
        } else {
          const images = cards.map((card) => {
            if (card.image_uris) {
              return {
                id: card.id,
                oracle_id: card.oracle_id,
                front: card.image_uris.normal,
                back: null,
              };
            } else if (card.card_faces) {
              return {
                id: card.id,
                oracle_id: card.oracle_id,
                front: card.card_faces[0].image_uris.normal,
                back: card.card_faces[1].image_uris.normal,
              };
            }
            return { id: card.id, oracle_id: card.oracle_id, front: null, back: null };
          }).filter((card) => card.front);

          setCardImages(images);

          const preloadImages = images.map(card =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = card.front;
              img.onload = resolve;
              img.onerror = resolve;
            })
          );

          await Promise.all(preloadImages);
          setLoading(false);
          setError('');
        }
      }
    } catch (error) {
      setError('Error fetching data from Scryfall API');
      setLoading(false);
    }
  };


  return (
    <div className="search_page_main">
      <Header />
      <div className="search_page_cards_container">
        {loading
          ? Array.from({ length: cardImages.length}).map((_, index) => (
            <div className="search_page_card_box" key={index}>
              <img
                className="search_page_card_image"
                width={350}
                src={cardBack}
                alt="card back"
              />
            </div>
          ))
          : cardImages.map((card, index) => (
            <div className="search_page_card_box" key={index}>
              <img
                className="search_page_card_image"
                width={350}
                src={card.front}
                alt="card front"
                onMouseOver={(e) => (e.currentTarget.src = card.back || card.front)}
                onMouseOut={(e) => (e.currentTarget.src = card.front)}
                onClick={() => navigate(`/images/${card.oracle_id}`)}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default CardSearch;
