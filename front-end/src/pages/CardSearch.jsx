import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/Datacontext';
import axios from 'axios';
import './css/CardSearch.css';
import Header from '../components/Header';

function CardSearch() {
  const { globalSearchTerm, setGlobalSearchTerm } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardImages, setCardImages] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Global search term 처리
  useEffect(() => {
    if (globalSearchTerm && !hasSearched) {
      setSearchTerm(globalSearchTerm);
      handleSearch(globalSearchTerm);
      setHasSearched(true);
      setGlobalSearchTerm('');
    }
  }, [globalSearchTerm]);

  // 카드 검색 기능
  const handleSearch = async (term = searchTerm) => {
    console.log("Search");
    try {
      if (term.length > 2) {
        const response = await axios.get(
          `https://api.scryfall.com/cards/search?q=${term}`
        );
        const cards = response.data.data;

        if (cards.length === 0) {
          setError('No cards found.');
          setCardImages([]);
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
          setError('');
        }
      }
    } catch (error) {
      setError('Error fetching data from Scryfall API');
    }
  };


  return (
    <div className="search_page_main">
      <Header/>
      <div className="search_page_cards_container">
        {cardImages.map((card, index) => (
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
