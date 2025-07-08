import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/Datacontext';
import axios from 'axios';
import logoImage from '../images/logo.png';
import './css/Header.css'

function Header() {
  const { globalSearchTerm, setGlobalSearchTerm } = useContext(DataContext);
  const navigate = useNavigate();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = () => {
    setGlobalSearchTerm(searchTerm);
    navigate(`/search`);
  }

  useEffect(() => {
    if (searchTerm.length > 2) {
      axios.get(`https://api.scryfall.com/cards/autocomplete?q=${searchTerm}`)
        .then(response => setSuggestions(response.data.data))
        .catch(error => console.error("Error fetching autocomplete suggestions", error));
    }
    else {
      // 입력이 짧아지면 이전 제안을 모두 지우기
      setSuggestions([]);
    }
    console.log(globalSearchTerm);
    setHighlightedIndex(-1); // Reset selection
  }, [globalSearchTerm, searchTerm]);


  return (
    <div className='header-bar'>
      <img
        src={logoImage}
        alt="logo"
        className='header-logo'
        onClick={() => navigate(`/`)}
      />
      <div className="custom-autocomplete">
        <input
          ref={inputRef}
          type="text"
          className="header-autocomplete-input"
          value={searchTerm}
          placeholder="Search for a card"
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
              setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter') {
              if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                const selected = suggestions[highlightedIndex];
                setGlobalSearchTerm(selected);
                setSearchTerm(selected);
                navigate('/search');
                inputRef.current?.blur();
              } else {
                handleSearch(); // 기존 입력값으로 검색
                inputRef.current?.blur();
              }
            }
          }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="autocomplete-suggestion-list">
            {suggestions.map((sug, i) => (
              <li
                key={i}
                onMouseDown={() => {
                  setGlobalSearchTerm(sug);
                  setSearchTerm(sug);
                  navigate('/search');
                  inputRef.current?.blur();
                }}
                className={`autocomplete-suggestion ${i === highlightedIndex ? 'highlighted' : ''}`}
              >
                {sug}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Header;