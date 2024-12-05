import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CardSearch from './pages/CardSearch';
import CardImages from './pages/CardImages';
import CardDetails from './pages/CardDetails';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
// 나중에 작업할때 지워야됨
import Header from './components/Header';
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
        {/* 헤더 테스트용 주소. 나중에 지울것. */}
        <Route path="/Header" element={<Header/>}/>
      </Routes>
    </Router>
  );
}

export default App;
