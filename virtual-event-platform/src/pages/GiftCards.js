import React, { useState } from 'react';
import './PagesStyles.css';

function GiftCards() {
  const [customAmount, setCustomAmount] = useState('');

  const handleBuy = (amount) => {
    alert(`Redirecting to payment for ₹${amount} Gift Card...`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gift Cards</h1>
        <p>The perfect gift for event enthusiasts. Share the joy of experiences.</p>
      </div>

      <div className="gift-intro">
        <p>Give the gift of experience with Eventify gift cards. Perfect for birthdays, anniversaries, or corporate gifting. Recipients can use gift cards for any event on our platform.</p>
      </div>

      <div className="gift-cards-container">
        <div className="gift-card purple">
          <div className="card-logo">EVENTIFY</div>
          <div className="card-body">
            <h3>Silver Card</h3>
            <div className="amount">₹1,000</div>
          </div>
          <div className="card-footer">
            <p className="description">Access to multiple webinars or small events.</p>
            <button onClick={() => handleBuy(1000)}>Buy Now</button>
          </div>
        </div>

        <div className="gift-card gold">
          <div className="card-logo" style={{ color: '#000' }}>EVENTIFY</div>
          <div className="card-body">
            <h3>Gold Card</h3>
            <div className="amount">₹2,500</div>
          </div>
          <div className="card-footer">
            <p className="description">Ideal for conference registrations.</p>
            <button onClick={() => handleBuy(2500)}>Buy Now</button>
          </div>
        </div>

        <div className="gift-card blue">
          <div className="card-logo">EVENTIFY</div>
          <div className="card-body">
            <h3>Platinum Card</h3>
            <div className="amount">₹5,000</div>
          </div>
          <div className="card-footer">
            <p className="description">Premium gift for corporate VIP access.</p>
            <button onClick={() => handleBuy(5000)}>Buy Now</button>
          </div>
        </div>
      </div>

      <div className="custom-amount">
        <h3>Custom Amount</h3>
        <p>Create a gift card with your own amount, from ₹500 to ₹25,000.</p>
        <div className="custom-amount-input">
          <div className="input-group">
            <span className="currency">₹</span>
            <input
              type="number"
              min="500"
              max="25000"
              step="500"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>
          <button onClick={() => handleBuy(customAmount || 500)}>Create Custom Card</button>
        </div>
      </div>

      <div className="gift-info">
        <h3>How It Works</h3>
        <div className="steps-row" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '30px' }}>
          <div className="info-step" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎁</div>
            <h4>Choose</h4>
            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Select an amount or custom value.</p>
          </div>
          <div className="info-step" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💳</div>
            <h4>Purchase</h4>
            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Complete secure checkout.</p>
          </div>
          <div className="info-step" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📧</div>
            <h4>Deliver</h4>
            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Sent instantly via email.</p>
          </div>
          <div className="info-step" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎟️</div>
            <h4>Redeem</h4>
            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Use on any event booking.</p>
          </div>
        </div>
        <p className="note" style={{ marginTop: '40px', textAlign: 'center', opacity: '0.6' }}>*All gift cards are valid for 1 year from the date of purchase.</p>
      </div>
    </div>
  );
}

export default GiftCards;