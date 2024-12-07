const express = require('express');
const axios = require('axios');
const { load } = require('cheerio'); // cheerio의 load 가져오기

const app = express();
const PORT = 3001;

// CORS 설정 (React와 통신을 허용)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 카드 가격 가져오기 엔드포인트
app.get('/api/price', async (cardName, collectorNumber) => {

  try {
    // const searchUrl = `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=${encodeURIComponent(cardName)}&filter%5Bcategory_id%5D=${encodeURIComponent(setName)}`;
    const searchUrl = `https://www.cardkingdom.com/catalog/view?filter[search]=mtg_advanced&filter[name]=${encodeURIComponent(cardName)}`;
    const response = await axios.get(searchUrl);
    const $ = load(response.data);

    // 가격 정보 스크래핑
    const price = $('.price-container .item-price').first().text().trim();

    res.json({ price: price || 'Price not found' });
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
