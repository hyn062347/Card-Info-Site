import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import './css/CardDetails.css';

function CardDetails() {
  const { cardId } = useParams();
  const [ cardDetails, setCardDetails ] = useState(null);
  const [ cardKingdomPrice, setCardKingdomPrice] = useState('Loading...');

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const response = await axios.get(`https://api.scryfall.com/cards/${cardId}`);
        setCardDetails(response.data);
      } catch (error) {
        console.error("Error fetching card details from Scryfall API", error);
      }
    };


    const fetchCardKingdomPrice = async (cardName, collectorNumber) => {
      try{
        const response = await axios.get('http://localhost:3001/api/price',{
          params:{ cardName, collectorNumber},
        });
        console.log('Price:', response.data.price);
        return response.data.price;
      } catch(error){
        console.error('Error fetching price:', error);
      }
    };

    fetchCardDetails();
  }, [cardId]);

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
              {renderArt(cardDetails.card_faces[0])}
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
                <p className="box-style">
                  {renderLegality(cardDetails.legalities)}
                </p>
                <p className="box-style"><strong>Set Name: </strong>{cardDetails.set_name}</p>
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
            </div>
            <div className='Details_Text'>
              <div className='detail_pages_text'>Information</div>
              {renderDetail(cardDetails)}
              <div className='detail_pages_text'>Legalities</div>
              <p className="box-style">
                {renderLegality(cardDetails.legalities)}
              </p>
              <p className="box-style">
                <strong>Set Name: </strong>
                {cardDetails.set_name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardDetails;