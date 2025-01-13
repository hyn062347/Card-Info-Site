import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import ReactMarkdown from 'react-markdown';
import './css/CardDetails.css';

function CardDetails() {
  const { cardId } = useParams();
  const [cardDetails, setCardDetails] = useState(null);
  const [cardKingdomPrice, setCardKingdomPrice] = useState('Loading...');
  const [cardKingdomFoilPrice, setCardKingdomFoilPrice] = useState('Loading...');
  const [cardSummary, setCardSummary] = useState('Loading...');
  const API_BASE_URL = 'http://localhost:3001';

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
          const modifiedCollectorNumber = collectorNumber.replace(/\D/g, ''); // \D는 숫자가 아닌 문자 제거
          const response = await axios.get(`${API_BASE_URL}/api/price`, {
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
        `${API_BASE_URL}/api/summarize-stream?name=${encodeURIComponent(
          cardDetails.name
        )}&mana_cost=${encodeURIComponent(cardDetails.mana_cost)}&type_line=${encodeURIComponent(
          cardDetails.type_line
        )}&oracle_text=${encodeURIComponent(cardDetails.oracle_text)}`
      );

      console.log(cardDetails.name, cardDetails.type_line, cardDetails.mana_cost, cardDetails.oracle_text);
      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close(); // 스트리밍 종료
        } else {
          setCardSummary((prev) => (prev === 'Loading...' ? event.data : prev + event.data)); // 실시간 데이터 업데이트
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

  const paragraphs = cardSummary
    .split('\n\n') // 두 개의 줄바꿈을 기준으로 문단 나눔
    .filter((paragraph) => paragraph.trim() !== '') // 빈 문단 제거
    .map((paragraph, index) => <p key={index}>{paragraph.trim()}</p>); // 문단 렌더링

  const renderLegality = (legalities) => {
    return Object.entries(legalities)
      .filter(([format, legality]) => legality !== "not_legal") // 필터링
      .map(([format, legality]) => (
        <p key={format}>
          <strong className="capitalize">{format}:</strong> {legality}
        </p>
      ));
  };

  const renderDetail = (cardFace) => {
    return (
      <>
        <p className="box-style"><strong>Name:</strong> {cardFace.name}</p>
        <p className="box-style"><strong>Mana Cost:</strong> {cardFace.mana_cost}</p>
        <p className="box-style"><strong>Type:</strong> {cardFace.type_line}</p>
        <p className="box-style"><strong>Oracle Text</strong><br />{cardFace.oracle_text}</p>
      </>
    );
  }

  const renderArt = (cardDetails) => {

    const artType = cardDetails.textless
      ? "Textless"
      : cardDetails.full_art
        ? "Full Art"
        : cardDetails.border_color === "borderless"
          ? "Borderless"
          : cardDetails.frame_effects?.includes("extendedart")
            ? "Extended Art"
            : cardDetails.frame_effects?.includes("showcase")
              ? "Showcase"
              : cardDetails.frame_effects?.includes("etched")
                ? "Etched"
                : "Normal";

    return (
      <p className="Detail_Pages_Card_Number">
        <strong>Art Type:</strong> {artType}
      </p>
    );

  }

  return (
    <div>
      <Header />
      <div className='Card_Detail_Box'>
        {cardDetails.card_faces ? (
          <div className='Flex_Row'>
            <div className='image-container'>
              <img
                src={cardDetails.card_faces[0].image_uris.normal}
                alt="Card Front"
              />
              <img
                src={cardDetails.card_faces[1].image_uris.normal}
                alt="Card Back"
              />
              <p className='Detail_Pages_Card_Number'><strong>Collector Number: {cardDetails.collector_number}</strong></p>
              {renderArt(cardDetails)}
              <p className='Detail_Pages_Card_Number'><strong>CardKingdom: {cardKingdomPrice}</strong></p>
              <p className='Detail_Pages_Card_Number'><strong>CardKingdom(Foil): {cardKingdomFoilPrice}</strong></p>
            </div>
            <div className='Details_Text'>
              {/* card details */}
              <div>
                {/* front */}
                <div className='detail_pages_text'>Front</div>
                {renderDetail(cardDetails.card_faces[0])}
              </div>
              <div>
                {/* back */}
                <div className='detail_pages_text'>Back</div>
                {renderDetail(cardDetails.card_faces[1])}
                <div className='detail_pages_text'>Legalities</div>
                <p className="legalities">
                  {renderLegality(cardDetails.legalities)}
                </p>
                <div className='detail_pages_text'>Other</div>
                <p className="box-style"><strong>Set Name: </strong>{cardDetails.set_name}</p>
                <p className="box-style">
                  <ReactMarkdown>{cardSummary}</ReactMarkdown>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='Flex_Row'>
            <div className='image-container'>
              <img
                src={cardDetails.image_uris.normal}
                alt="Card Front"
              />
              <p className='Detail_Pages_Card_Number'><strong>Collector Number: {cardDetails.collector_number}</strong></p>
              {renderArt(cardDetails)}
              <p className='Detail_Pages_Card_Number'><strong>CardKingdom: {cardKingdomPrice}</strong></p>
              <p className='Detail_Pages_Card_Number'><strong>CardKingdom(Foil): {cardKingdomFoilPrice}</strong></p>
            </div>
            <div className='Details_Text'>
              <div className='detail_pages_text'>Information</div>
              {renderDetail(cardDetails)}
              <div className='detail_pages_text'>Legalities</div>
              <p className="legalities">
                {renderLegality(cardDetails.legalities)}
              </p>
              <div className='detail_pages_text'>Other</div>
              <p className="box-style">
                <strong>Set Name: </strong>
                {cardDetails.set_name}
              </p>
              <p className="box-style">
                <ReactMarkdown>{cardSummary}</ReactMarkdown>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardDetails;
