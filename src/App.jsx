import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CardSearch from './pages/CardSearch';
import CardImages from './pages/CardImages';
import CardDetails from './pages/CardDetails';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<CardSearch searchTerm={searchTerm}/>} />
        <Route path="/images/:oracleId" element={<CardImages />} />
        <Route path="/details/:cardId" element={<CardDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
