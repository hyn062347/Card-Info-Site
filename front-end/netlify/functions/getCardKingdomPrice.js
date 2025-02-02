const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');


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
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

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
      
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const possibleFormats = generatePossibleFormats(collectorNumber);
    const price = await page.evaluate((possibleFormats) => {
      const items = document.querySelectorAll('.productItemWrapper');

      for (const item of items) {
        const numberElement = item.querySelector('.collector-number');
        const priceElement = item.querySelector('.stylePrice');

        if (numberElement && priceElement) {
          const number = numberElement.textContent
            .trim()
            .replace('Collector #: ', '')
            .replace(/\D/g, ''); 

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
    return 'Error fetching price';
  } finally {
    await browser.close();
  }
};

// Netlify Function Handler
exports.handler = async (event) => {
  const { cardName, collectorNumber } = event.queryStringParameters;

  if (!cardName || !collectorNumber) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'cardName and collectorNumber are required' }),
    };
  }

  try {
    const [nonFoilPrice, foilPrice] = await Promise.all([
      fetchCardPrice(cardName, collectorNumber, false),
      fetchCardPrice(cardName, collectorNumber, true),
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ nonFoilPrice, foilPrice }),
    };
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch card prices' }),
    };
  }
};
