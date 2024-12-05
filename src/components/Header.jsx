import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import logoImage from '../images/logo.png';
import './css/Header.css'

function Header() {

  const navigate = useNavigate();

  // 여기부터 AutoSuggest 부분
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const getSuggestionValue = suggestion => suggestion;
  const renderSuggestion = suggestion => (
    <div>
      {suggestion}
    </div>
  );

  const handleChange = (event, { newValue }) => {
    setSearchTerm(newValue);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    navigate(`/search?q=${searchTerm}`);
  }

  useEffect(() => {
    if (searchTerm.length > 2) {
      axios.get(`https://api.scryfall.com/cards/autocomplete?q=${searchTerm}`)
        .then(response => setSuggestions(response.data.data))
        .catch(error => console.error("Error fetching autocomplete suggestions", error));
    }
  }, [searchTerm]);
  // 여기까지 AutoSuggest

  return (
    <div className='header-bar'>
      {/* searchbar */}
      <img
        src={logoImage}
        alt="logo"
        className='header-logo'
        onClick={() => navigate(`/`)}
      />
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
      <button
        className='header-bar-button'
        onClick={handleSearch}>Search</button>
    </div>
  );
}

export default Header;