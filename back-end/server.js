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
const fetchCardPrice = async (cardName, collectorNumber) => {
  const browser = await puppeteer.launch({ headless: true }); // Puppeteer 실행
  const page = await browser.newPage();

  try {
    const url = `https://www.cardkingdom.com/catalog/view?filter[search]=mtg_advanced&filter[name]=${encodeURIComponent(
      cardName
    )}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

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
    console.error('Error fetching price:', error);
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
    const price = await fetchCardPrice(cardName, collectorNumber);
    res.json({ price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch card price' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
