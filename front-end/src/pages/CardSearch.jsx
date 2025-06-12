import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/Datacontext';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import logoImage from '../images/logo.png';
import './css/CardSearch.css';

function CardSearch() {
  const { globalSearchTerm, setGlobalSearchTerm } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardImages, setCardImages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
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

  // 검색어 자동 완성 요청
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 2) {
        try {
          const response = await axios.get(
            `https://api.scryfall.com/cards/autocomplete?q=${searchTerm}`
          );
          setSuggestions(response.data.data);
        } catch (error) {
          console.error('Error fetching autocomplete suggestions', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  // 카드 검색 기능
  const handleSearch = async (term = searchTerm) => {
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

  // Autosuggest 입력 변경 처리
  const handleChange = (event, { newValue }) => {
    setSearchTerm(newValue);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => <div>{suggestion}</div>;

  return (
    <div className="search_page_main">
      <div className='upper_container'>
        <div>
          <img
            className="search_page_logo"
            src={logoImage}
            alt="logo"
            onClick={() => navigate(`/`)}
          />
        </div>
        <h1>Card Search</h1>
        <div className="search_page_search_container">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={({ value }) => setSearchTerm(value)}
            onSuggestionsClearRequested={() => setSuggestions([])}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={{
              placeholder: 'Search for a card',
              value: searchTerm,
              onChange: handleChange,
              onKeyPress: handleKeyPress,
            }}
          />
        </div>
        <div>
          <button
            className="search_page_search_button"
            onClick={() => handleSearch()}>
            Search
          </button>
          {error && <p>{error}</p>}
        </div>
      </div>
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
