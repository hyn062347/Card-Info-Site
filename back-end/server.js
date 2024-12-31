require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 3001;
const cors = require('cors');

app.use(cors());

app.use(express.json());

// 가능한 모든 Collector Number 형식을 생성하는 함수
const generatePossibleFormats = (collectorNumber) => {
  const normalized = collectorNumber.replace(/\D/g, ''); // 숫자만 남김
  const length = normalized.length;

  const formats = [normalized];
  if (length <= 1) formats.push(normalized.padStart(2, '0')); // 6 -> 06
  if (length <= 2) formats.push(normalized.padStart(3, '0')); // 23 -> 023
  if (length <= 3) formats.push(normalized.padStart(4, '0')); // 132 -> 0132
  console.log(formats);
  return formats;
};

// Puppeteer를 사용하여 카드 가격을 가져오는 함수
const fetchCardPrice = async (cardName, collectorNumber, isFoil = false) => {
  const browser = await puppeteer.launch({ headless: true }); // Puppeteer 실행
  const page = await browser.newPage();

  try {
    // 불필요한 리소스 차단
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'script', 'media', 'xhr', 'fetch'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const baseUrl = isFoil
      ? `https://www.cardkingdom.com/catalog/search?filter[tab]=mtg_foil&filter%5Bsearch%5D=mtg_advanced&filter%5Bname%5D=${encodeURIComponent(
          cardName
        )}`
      : `https://www.cardkingdom.com/catalog/view?filter[search]=mtg_advanced&filter[name]=${encodeURIComponent(
          cardName
        )}`;
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); // HTML 로딩만 대기

    // Collector Number와 매칭되는 가격을 가져옴
    const possibleFormats = generatePossibleFormats(collectorNumber); // 가능한 모든 형식 생성
    const price = await page.evaluate((possibleFormats) => {
      const items = document.querySelectorAll('.productItemWrapper');

      for (const item of items) {
        const numberElement = item.querySelector('.collector-number');
        const priceElement = item.querySelector('.stylePrice');

        if (numberElement && priceElement) {
          const number = numberElement.textContent
            .trim()
            .replace('Collector #: ', '')
            .replace(/\D/g, ''); // 숫자만 남김

          if (possibleFormats.includes(number)) {
            return priceElement.textContent.trim();
          }
        }
      }

      return 'Price not found';
    }, possibleFormats);

    await browser.close();
    return price;
  } catch (error) {
    console.error(`Error fetching ${isFoil ? 'foil' : 'non-foil'} price:`, error);
    await browser.close();
    throw error;
  }
};

// API 엔드포인트
app.get('/api/price', async (req, res) => {
  const { cardName, collectorNumber } = req.query;

  if (!cardName || !collectorNumber) {
    return res.status(400).json({ error: 'cardName and collectorNumber are required' });
  }

  try {
    const [nonFoilPrice, foilPrice] = await Promise.all([
      fetchCardPrice(cardName, collectorNumber, false),
      fetchCardPrice(cardName, collectorNumber, true),
    ]);
    res.json({ nonFoilPrice, foilPrice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch card prices' });
  }
});

//AI Service
const OPEN_API_KEY = process.env.OPEN_API_KEY;

app.post('/api/summarize', async (req, res) => {
  const { cardDetails } = req.body;

  if (!cardDetails) {
    return res.status(400).json({ error: 'Card details are required for summarization.' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes card details.',
          },
          {
            role: 'user',
            content: `Summarize the following card details: ${JSON.stringify(cardDetails)}`,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('Error summarizing card details:', error);
    res.status(500).json({ error: 'Failed to summarize card details.' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
