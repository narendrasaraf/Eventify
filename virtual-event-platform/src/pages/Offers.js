import React from 'react';
import './PagesStyles.css';

function Offers() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Special Offers</h1>
        <p>Take advantage of limited-time deals and discounts</p>
      </div>
      
      <div className="offers-list">
        <div className="offer-card">
          <div className="offer-image">
            <img src="https://img.freepik.com/free-vector/abstract-new-arrival-composition-with-flat-design_23-2147886198.jpg?uid=R184053610&ga=GA1.1.1075604796.1735994136&semt=ais_hybrid&w=740" alt="New User Offer" />
          </div>
          <div className="offer-content">
            <h3 className="offer-title">Welcome Offer: 20% Off Your First Event</h3>
            <p className="offer-description">
              New to BookMyEvent? Get 20% off your first event creation package. 
              Valid for all packages, including Professional and Enterprise.
            </p>
            <div className="offer-code">NEWUSER20</div>
            <p className="offer-expiry">Valid until: May 31, 2025</p>
          </div>
        </div>
        
        <div className="offer-card">
          <div className="offer-image">
            <img src="https://img.freepik.com/free-vector/cash-back-offers-vector-banners-with-flying-coins_91128-1715.jpg?uid=R184053610&ga=GA1.1.1075604796.1735994136&semt=ais_hybrid&w=740" alt="Conference Discount" />
          </div>
          <div className="offer-content">
            <h3 className="offer-title">Conference Special: 15% Off Registration</h3>
            <p className="offer-description">
              Planning to attend any conference listed on our platform? Use this code 
              during checkout to get 15% off your registration fee.
            </p>
            <div className="offer-code">CONF15</div>
            <p className="offer-expiry">Valid until: June 15, 2025</p>
          </div>
        </div>
        
        <div className="offer-card">
          <div className="offer-image">
            <img src="https://img.freepik.com/premium-vector/15-discount-gift-card_455918-3404.jpg?uid=R184053610&ga=GA1.1.1075604796.1735994136&semt=ais_hybrid&w=740" alt="Referral Bonus" />
          </div>
          <div className="offer-content">
            <h3 className="offer-title">Refer a Friend: ₹500 Credit</h3>
            <p className="offer-description">
              Refer a friend to BookMyEvent and both of you will receive ₹500 in booking 
              credits when they create their first event or register for an event worth ₹1000 or more.
            </p>
            <button className="register-button">Get Referral Link</button>
          </div>
        </div>
        
        <div className="offer-card">
          <div className="offer-image">
            <img src="https://img.freepik.com/free-vector/gradient-student-discount-label_52683-122369.jpg?uid=R184053610&ga=GA1.1.1075604796.1735994136&semt=ais_hybrid&w=740" alt="Student Discount" />
          </div>
          <div className="offer-content">
            <h3 className="offer-title">Student Discount: 25% Off All Events</h3>
            <p className="offer-description">
              Students can enjoy 25% off registration fees for any event. 
              Simply verify your student status by registering with your college email.
            </p>
            <div className="offer-code">STUDENT25</div>
            <p className="offer-expiry">Ongoing offer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Offers;