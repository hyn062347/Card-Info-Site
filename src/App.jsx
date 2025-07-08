import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DataProvider } from './context/Datacontext';
import Home from './pages/Home';
import CardSearch from './pages/CardSearch';
import CardImages from './pages/CardImages';
import CardDetails from './pages/CardDetails';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<CardSearch />} />
          <Route path="/images/:oracleId" element={<CardImages />} />
          <Route path="/details/:cardId" element={<CardDetails />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
