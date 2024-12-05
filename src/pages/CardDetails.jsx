import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import logoImage from '../images/logo.png';
import Header from '../components/Header';
import './css/CardDetails.css';

function CardDetails() {
  const { cardId } = useParams();
  const [cardDetails, setCardDetails] = useState(null);

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

  if (!cardDetails) {
    return <div>Loading...</div>;
  }
  
  const renderLegality = (legalities) => {
    return Object.entries(legalities).map(([format, legality]) => (
      <p key={format}><strong>{format}:</strong> {legality}</p>
    ));
  };

  return (
    <div>
      <Header/>
      <div className='Card_Detail_Box_box'>
        <div className='Card_Detail_Box'>
          {/* UpperUI */}
          {cardDetails.card_faces ?(
            <div className='Flex_Row'>
              {/* card borders */}
              <div className='Card_Details_Image'>
                {/* card_images */}
                <div>
                  {/* image_front */}
                  <img
                    className='card-image'
                    src={cardDetails.card_faces[0].image_uris.normal}
                    alt="Card Front"
                  />
                </div>
                <div>
                  {/* image_back */}
                  <img
                    className='card-image'
                    src={cardDetails.card_faces[1].image_uris.normal}
                    alt="Card Back"
                  />
                </div>
                <div>
                  <p className='Detail_Pages_Card_Number'>
                    <strong>Collector Number: {cardDetails.collector_number}</strong>
                  </p>
                </div>
              </div>
              <div className='Card_Details_Text'>
                {/* card details */}
                <div>
                  {/* front */}
                  <div className='detail_pages_text'>Front</div>
                  <p className="box-style">
                    <strong>Name:</strong> {cardDetails.card_faces[0].name}
                  </p>
                  <p className="box-style">
                    <strong>Mana Cost:</strong>{" "}
                    {cardDetails.card_faces[0].mana_cost}
                  </p>
                  <p className="box-style">
                    <strong>Type:</strong> {cardDetails.card_faces[0].type_line}
                  </p>
                  <p className="box-style">
                    <strong>Oracle Text:</strong>{" "}
                    {cardDetails.card_faces[0].oracle_text}
                  </p>
                </div>
                <div>
                  {/* back */}
                  <div className='detail_pages_text'>Back</div>
                  <p className="box-style">
                    <strong>Name:</strong> {cardDetails.card_faces[1].name}
                  </p>
                  <p className="box-style">
                    <strong>Mana Cost:</strong>{" "}
                    {cardDetails.card_faces[1].mana_cost}
                  </p>
                  <p className="box-style">
                    <strong>Type:</strong> {cardDetails.card_faces[1].type_line}
                  </p>
                  <p className="box-style">
                    <strong>Oracle Text:</strong>{" "}
                    {cardDetails.card_faces[1].oracle_text}
                  </p>
                  <div className='detail_pages_text'>Legalities</div>
                  <p className="box-style">
                    <p className="text-style">
                      <strong>Standard: </strong>
                      {cardDetails.legalities.standard}
                    </p>
                    <p className="text-style">
                      <strong>Pioneer: </strong>
                      {cardDetails.legalities.pioneer}
                    </p>
                    <p className="text-style">
                      <strong>Modern: </strong>
                      {cardDetails.legalities.modern}
                    </p>
                    <p className="text-style">
                      <strong>Legacy: </strong>
                      {cardDetails.legalities.legacy}
                    </p>
                    <p className="text-style">
                      <strong>Vintage: </strong>
                      {cardDetails.legalities.vintage}
                    </p>
                    <p className="text-style">
                      <strong>Pauper: </strong>
                      {cardDetails.legalities.pauper}
                    </p>
                    <p className="text-style">
                      <strong>Commander: </strong>
                      {cardDetails.legalities.commander}
                    </p>
                  </p>
  
                  <p className="box-style">
                    <strong>Set Name: </strong>
                    {cardDetails.set_name}
                  </p>
                </div>
              </div>
            </div>
          ):(
            <div className='Flex_Row'>
              {/* card borders */}
              <div>
                {/* card_images */}
                <div>
                  {/* card_image */}
                  <img
                    className="card-image"
                    src={cardDetails.image_uris.normal}
                    alt="Card Front"
                  />
                </div>
                <div>
                  <p className='Detail_Pages_Card_Number'>
                    <strong>Collector Number: {cardDetails.collector_number}</strong>
                  </p>
                </div>
              </div>
              <div className='Card_Details_Text'>
                {/* card details */}
                <p className="box-style">
                  <strong>Name:</strong> {cardDetails.name}
                </p>
                <p className="box-style">
                  <strong>Mana Cost:</strong> {cardDetails.mana_cost}
                </p>
                <p className="box-style">
                  <strong>Type:</strong> {cardDetails.type_line}
                </p>
                <p className="box-style">
                  <strong>Oracle Text:</strong> {cardDetails.oracle_text}
                </p>
                <div className='detail_pages_text'>Legalities</div>
                <p className="box-style">
                  <p className="text-style">
                    <strong>Standard: </strong>
                    {cardDetails.legalities.standard}
                  </p>
                  <p className="text-style">
                    <strong>Pioneer: </strong>
                    {cardDetails.legalities.pioneer}
                  </p>
                  <p className="text-style">
                    <strong>Modern: </strong>
                    {cardDetails.legalities.modern}
                  </p>
                  <p className="text-style">
                    <strong>Legacy: </strong>
                    {cardDetails.legalities.legacy}
                  </p>
                  <p className="text-style">
                    <strong>Vintage: </strong>
                    {cardDetails.legalities.vintage}
                  </p>
                  <p className="text-style">
                    <strong>Pauper: </strong>
                    {cardDetails.legalities.pauper}
                  </p>
                  <p className="text-style">
                    <strong>Commander: </strong>
                    {cardDetails.legalities.commander}
                  </p>
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
    </div>
  );
}

export default CardDetails;
