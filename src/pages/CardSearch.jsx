import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/Datacontext';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import logoImage from '../images/logo.png';
import './css/CardSearch.css';

function CardSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cardImages, setCardImages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const { globalSearchTerm } = useContext(DataContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length > 2) {
      axios.get(`https://api.scryfall.com/cards/autocomplete?q=${searchTerm}`)
        .then(response => setSuggestions(response.data.data))
        .catch(error => console.error("Error fetching autocomplete suggestions", error));
    }
    if(globalSearchTerm && !hasSearched){
      setSearchTerm(globalSearchTerm);
      console.log(globalSearchTerm, searchTerm);
      handleSearch(globalSearchTerm);
      setHasSearched(true);
    }
  }, [globalSearchTerm, searchTerm]);

  const handleChange = (event, { newValue }) => {
    setSearchTerm(newValue);
  };

  const handleSearch = async (searchTerm) => {
    try {
      const response = await axios.get(`https://api.scryfall.com/cards/search?q=${searchTerm}`);
      const cards = response.data.data;
      if (cards.length === 0) {
        setError('No cards found.');
        setCardImages([]);
      } else {
        const images = cards.map(card => {
          if (card.image_uris) {
            return { id: card.id, oracle_id: card.oracle_id, front: card.image_uris.normal, back: null };
          } else if (card.card_faces) {
            return {
              id: card.id,
              oracle_id: card.oracle_id,
              front: card.card_faces[0].image_uris.normal,
              back: card.card_faces[1].image_uris.normal
            };
          }
          return { id: card.id, oracle_id: card.oracle_id, front: null, back: null };
        }).filter(card => card.front);
        setCardImages(images);
        setError('');
      }
    } catch (error) {
      setError('Error fetching data from Scryfall API');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getSuggestionValue = suggestion => suggestion;

  const renderSuggestion = suggestion => (
    <div>
      {suggestion}
    </div>
  );

  return (
    <div className='search_page_main'>
      <div>
        <div>
          <img
            className='search_page_logo'
            src={logoImage} 
            alt="logo" 
            onClick={()=> navigate(`/`)}
            />
        </div>
        <h1>Card Search</h1>
        <div className='search_page_search_container'>
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
              onKeyPress: handleKeyPress
            }}
          />
        </div>
        <div>
          <button 
            className='search_page_search_button'
            onClick={handleSearch}>Search</button>
          {error && <p>{error}</p>}
        </div>
      </div>
      <div className='search_page_cards_container'>
        {cardImages.map((card, index) => (
          <div 
            className='search_page_card_box'
            key={index}>
            <img 
              className='search_page_card_image'
              width={350}
              src={card.front} 
              alt="card front" 
              onMouseOver={e => e.currentTarget.src = card.back || card.front}
              onMouseOut={e => e.currentTarget.src = card.front}
              onClick={() => navigate(`/images/${card.oracle_id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardSearch;
