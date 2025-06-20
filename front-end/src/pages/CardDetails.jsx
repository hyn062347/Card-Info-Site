import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const API_BASE_URL = '/api';
  const SERVERLESS_FNC_URL = '/.netlify/functions';

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
          const response = await axios.get(`${SERVERLESS_FNC_URL}/getCardKingdomPrice`, {
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
      // console.log(cardDetails);
      const eventSource = new EventSource(
        `${API_BASE_URL}/getCardSummary?name=${encodeURIComponent(
          cardDetails.name
        )}&mana_cost=${encodeURIComponent(cardDetails.mana_cost)}&type_line=${encodeURIComponent(
          cardDetails.type_line
        )}&oracle_text=${encodeURIComponent(cardDetails.oracle_text)}`
      );

      // console.log(cardDetails.name, cardDetails.type_line, cardDetails.mana_cost, cardDetails.oracle_text);
      eventSource.onmessage = (event) => {
        // console.log(event.data);
        if (event.data === '[DONE]') {
          eventSource.close(); // 스트리밍 종료
        } else {
          const fromattedData = event.data.replace(/<br>/g, '\n');
          setCardSummary((prev) => (prev === 'Loading...' ? fromattedData : prev + fromattedData)); // 실시간 데이터 업데이트
        }
      };
      // console.log(cardSummary);
      eventSource.onerror = (error) => {
        console.error("❌ OpenAI 스트리밍 오류 (프론트엔드):", error);
        console.error('Error receiving stream:', error);
        eventSource.close(); // 에러 발생 시 스트리밍 종료
      };

      return () => eventSource.close(); // 컴포넌트 언마운트 시 스트림 종료
    }
  }, [cardDetails]);

  if (!cardDetails) {
    return <div>Loading...</div>;
  }

  const renderLegality = (legalities) => {
    return Object.entries(legalities)
      .filter(([format, legality]) => legality !== "not_legal") // 필터링
      .map(([format, legality]) => (
        <p key={format}>
          <strong className="capitalize">{format}:</strong> {legality}
        </p>
      ));
  };

  const renderCommonInfo = (cardDetails) => {
    return (
      <>
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
          <Markdown>{cardSummary}</Markdown>
        </p>
      </>
    );
  }

  const renderCardKingdomPrice = (cardKingdomPrice, cardKingdomFoilPrice, cardDetails) => {
    const cardName = cardDetails.card_faces ? cardDetails.card_faces[0].name : cardDetails.name;
    return (
      <>
        <a
          href={`https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=${encodeURIComponent(cardName)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className='Detail_Pages_Card_Number'><strong>CardKingdom: {cardKingdomPrice}</strong></p>
        </a>
        <a
          href={`https://www.cardkingdom.com/catalog/search?filter%5Btab%5D=mtg_foil&filter%5Bsearch%5D=mtg_advanced&filter%5Bname%5D=${encodeURIComponent(cardName)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className='Detail_Pages_Card_Number'><strong>CardKingdom(Foil): {cardKingdomFoilPrice}</strong></p>
        </a>
      </>
    );
  };

  const renderCardImages = (cardDetails) => {
    // if (cardDetails.card_faces) {
    //   return (
    //     <>
    //       <img
    //         src={cardDetails.card_faces[0].image_uris.normal}
    //         alt="Card Front"
    //       />
    //       <img
    //         src={cardDetails.card_faces[1].image_uris.normal}
    //         alt="Card Back"
    //       />
    //     </>
    //   );
    // }

    // if (cardDetails.image_uris) {
    //   return (
    //     <img
    //       src={cardDetails.image_uris.normal}
    //       alt="Card Front"
    //     />
    //   );
    // }

    // return <p>No images available</p>; // 이미지가 없을 경우 기본 메시지

    const front = cardDetails.image_uris?.normal
      ?? cardDetails.card_faces?.[0]?.image_uris?.normal
      ?? null;

    const back = cardDetails.card_faces?.[1]?.image_uris?.normal ?? null;

    if(front && back){
      return(
        <>
          <img src={front} alt="Card Front" />
          <img src={back} alt="Card Back" />
        </>
      )
    }

    if(front){
      return <img src={front} alt="Card Front" />;
    }

    return <p>No images available.</p>;
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
      : cardDetails.border_color === "borderless"
        ? "Borderless"
        : cardDetails.full_art
          ? "Full Art"
          : cardDetails.frame_effects?.includes("extendedart")
            ? "Extended Art"
            : cardDetails.frame_effects?.includes("showcase")
              ? "Showcase"
              : cardDetails.frame_effects?.includes("etched")
                ? "Etched"
                : cardDetails.frame === "future"
                  ? "Future"
                  : cardDetails.frame === "1997"
                    ? "Retro"
                    : "Normal";

    const promoType = cardDetails.promo_types?.includes("bundle")
      ? "Bundle"
      : cardDetails.promo_types?.includes("prerelease")
        ? "Prerelease"
        : cardDetails.promo_types?.includes("serialized")
          ? "Serialized"
          : "Normal";
    return (
      <>
        <p className='Detail_Pages_Card_Number'><strong>Collector Number: {cardDetails.collector_number}</strong></p>
        <p className="Detail_Pages_Card_Number">
          <strong>Art Type:</strong> {artType}
        </p>
        <p className="Detail_Pages_Card_Number">
          <strong>Promo Type:</strong> {promoType}
        </p>
      </>
    );
  }

  return (
    <div>
      <Header />
      <div className='Card_Detail_Box'>
        {cardDetails.card_faces ? (
          <div className='Flex_Row'>
            <div className='image-container'>
              {renderCardImages(cardDetails)}
              {renderArt(cardDetails)}
              {renderCardKingdomPrice(cardKingdomPrice, cardKingdomFoilPrice, cardDetails)}
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
              </div>
              {/* Details */}
              {renderCommonInfo(cardDetails)}
            </div>
          </div>
        ) : (
          <div className='Flex_Row'>
            <div className='image-container'>
              {renderCardImages(cardDetails)}
              {renderArt(cardDetails)}
              {renderCardKingdomPrice(cardKingdomPrice, cardKingdomFoilPrice, cardDetails)}
            </div>
            <div className='Details_Text'>
              <div className='detail_pages_text'>Information</div>
              {renderDetail(cardDetails)}
              {renderCommonInfo(cardDetails)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardDetails;
