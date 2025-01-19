require('dotenv').config();
const OpenAI = require('openai');
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 3001;
const cors = require('cors');

app.use(cors());
app.use(express.json());

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: Missing OpenAI API key in environment variables.');
  process.exit(1); // Exit the server
}


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

    return price;
  } catch (error) {
    console.error(`Error fetching ${isFoil ? 'foil' : 'non-foil'} price:`, error);
    throw error;
  } finally {
    await browser.close();
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
app.get('/api/summarize-stream', async (req, res) => {
  const { name, mana_cost, type_line, oracle_text } = req.query;
  console.log(name, mana_cost, type_line);
  if (!name || !type_line || !oracle_text) {
    return res.status(400).json({ error: 'All card details are required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant specialized in Magic: The Gathering cards.',
        },
        {
          role: 'user',
          content: `Provide insights on the following Magic: The Gathering card details concisely in korean(under 1500 characters):

Name: ${name}
Mana Cost: ${mana_cost}
Type Line: ${type_line}
Oracle Text: ${oracle_text}

What type of deck this card is commonly used in (e.g., aggro, control, combo).
When or under what circumstances this card is typically played or most effective (e.g., early game, late game, in response to a specific strategy).
`,
        },
      ],
      stream: true,
    });

    for await (const part of response) {
      const content = part.choices[0]?.delta?.content || '';
      if (content) {
        const formattedContent = content.replace(/\. /g, '.\n\n');
        console.log('Streaming content:', JSON.stringify(content));
    res.write(`data: ${formattedContent}\n\n`); // 스트리밍 데이터 전송
      }
    }

    res.write('data: [DONE]\n\n'); // 스트리밍 종료
    res.end();
  } catch (error) {
    console.error('Error streaming response:', error);
    res.status(500).json({ error: 'Failed to summarize card details.' });
  }
});



// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
