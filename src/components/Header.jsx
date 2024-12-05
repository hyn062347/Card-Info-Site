import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import logoImage from '../images/logo.png';
import './css/Header.css'

function Header() {

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = ({ newValue }) => {
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

    return (
        <div className='Details_Pages_Search_Bar'>
            {/* searchbar */}
            <img
                src={logoImage}
                alt="logo"
                className='Detail_Pages_Logo'
                onClick={() => navigate(`/`)}
            />
            <input
                type="text"
                inputProps={{
                    placeholder: 'Enter card name...',
                    value: searchTerm,
                    onChange: handleChange,
                    onKeyPress: handleKeyPress
                }}
            />
            <button
                className='Detail_Pages_Search_Button'
                onClick={handleSearch}>Search</button>
        </div>
    );
}

export default Header;