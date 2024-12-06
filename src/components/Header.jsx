import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import logoImage from '../images/logo.png';
import './css/Header.css'

function Header({setSearchTerm}) {

  const navigate = useNavigate();

  // 여기부터 AutoSuggest 부분
  const [suggestions, setSuggestions] = useState([]);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
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
    setSearchTerm(localSearchTerm);
    navigate('/search');
  };

  useEffect(() => {
    if (localSearchTerm.length > 2) {
      axios.get(`https://api.scryfall.com/cards/autocomplete?q=${localSearchTerm}`)
        .then(response => setSuggestions(response.data.data))
        .catch(error => console.error("Error fetching autocomplete suggestions", error));
    }
  }, [localSearchTerm]);
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
          value: localSearchTerm,
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