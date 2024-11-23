import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CardSearch from './CardSearch';
import CardImages from './CardImages';
import CardDetails from './CardDetails';
import SignIn from './SignIn';
import SignUp from './SignUp';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<CardSearch />} />
        <Route path="/images/:oracleId" element={<CardImages />} />
        <Route path="/details/:cardId" element={<CardDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
