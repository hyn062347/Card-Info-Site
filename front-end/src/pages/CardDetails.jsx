import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Markdown from 'react-markdown';
import './css/CardDetails.css';

function CardDetails() {
  const { cardId } = useParams();
  const [cardDetails, setCardDetails] = useState(null);
  const [cardKingdomPrice, setCardKingdomPrice] = useState('Loading...');
  const [cardKingdomFoilPrice, setCardKingdomFoilPrice] = useState('Loading...');
  const [cardSummary, setCardSummary] = useState('Loading...');
  
  // Netlify Functions API Base URL 설정
  const API_BASE_URL = '/.netlify/functions';

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const response = await axios.get(`https://api.scryfall.com/cards/${cardId}`);
        setCardDetails(response.data);
      } catch (error) {
        console.error("Error fetching card details from Scryfall API", error);
      }
    };

    fetchCardDetails();
  }, [cardId]);

  useEffect(() => {
    if (cardDetails) {
      const fetchCardKingdomPrice = async (cardName, collectorNumber) => {
        try {
          const simplifiedCardName = cardName.includes('//')
            ? cardName.split('//')[0].trim()
            : cardName;
          const modifiedCollectorNumber = collectorNumber.replace(/\D/g, ''); // 숫자만 남김
          
          const response = await axios.get(`${API_BASE_URL}/getCardKingdomPrice`, {
            params: { cardName: simplifiedCardName, collectorNumber: modifiedCollectorNumber },
          });

          setCardKingdomPrice(response.data.nonFoilPrice);
          setCardKingdomFoilPrice(response.data.foilPrice);
        } catch (error) {
          console.error('Error fetching price:', error);
        }
      };

      fetchCardKingdomPrice(cardDetails.name, cardDetails.collector_number);
    }
  }, [cardDetails]);

  useEffect(() => {
    if (cardDetails) {
      const eventSource = new EventSource(
        `${API_BASE_URL}/getCardSummary?name=${encodeURIComponent(cardDetails.name)}&mana_cost=${encodeURIComponent(cardDetails.mana_cost)}&type_line=${encodeURIComponent(cardDetails.type_line)}&oracle_text=${encodeURIComponent(cardDetails.oracle_text)}`
      );

      console.log(cardDetails.name, cardDetails.type_line, cardDetails.mana_cost, cardDetails.oracle_text);

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close(); // 스트리밍 종료
        } else {
          const formattedData = event.data.replace(/<br>/g, '\n');
          setCardSummary((prev) => (prev === 'Loading...' ? formattedData : prev + formattedData)); // 실시간 데이터 업데이트
        }
      };

      eventSource.onerror = (error) => {
        console.error('Error receiving stream:', error);
        eventSource.close(); // 에러 발생 시 스트리밍 종료
      };

      return () => eventSource.close(); // 컴포넌트 언마운트 시 스트림 종료
    }
  }, [cardDetails]);

  if (!cardDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className='Card_Detail_Box'>
        <div className='image-container'>
          {cardDetails.image_uris ? (
            <img src={cardDetails.image_uris.normal} alt="Card Front" />
          ) : (
            <p>No images available</p>
          )}
          <p className='Detail_Pages_Card_Number'><strong>Collector Number: {cardDetails.collector_number}</strong></p>
        </div>

        <div className='Details_Text'>
          <div className='detail_pages_text'>Card Details</div>
          <p><strong>Name:</strong> {cardDetails.name}</p>
          <p><strong>Mana Cost:</strong> {cardDetails.mana_cost}</p>
          <p><strong>Type:</strong> {cardDetails.type_line}</p>
          <p><strong>Oracle Text:</strong> {cardDetails.oracle_text}</p>

          <div className='detail_pages_text'>Summary</div>
          <p className="box-style"><Markdown>{cardSummary}</Markdown></p>

          <div className='detail_pages_text'>Prices</div>
          <p className='Detail_Pages_Card_Number'><strong>CardKingdom: {cardKingdomPrice}</strong></p>
          <p className='Detail_Pages_Card_Number'><strong>CardKingdom (Foil): {cardKingdomFoilPrice}</strong></p>
        </div>
      </div>
    </div>
  );
}

export default CardDetails;
