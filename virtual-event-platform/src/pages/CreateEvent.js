import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateEvent.css';

function CreateEvent() {
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [eventMode, setEventMode] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    type: '',
    mode: '',
    category: '',
    startDate: '',
    endDate: '',
    language: '',
    venueName: '',
    venueAddress: '',
    organizerName: user.fullName || '',
    organizerEmail: user.email || '',
    contactNumber: user.phoneNumber || '',
    ticketType: '',
    attendeeLimit: '',
    registrationDeadline: '',
    googleMapLink: '',
    paymentMethod: '',
    beneficiaryName: '',
    accountNumber: '',
    bankName: '',
    ifsc: '',
    upiId: '',
    paypalEmail: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields
    const requiredFields = ['eventName', 'type', 'mode', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field} field.`);
        return;
      }
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    if (posterFile) form.append('poster', posterFile);

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Event created successfully!');
        navigate(`/myevents`);
      } else {
        console.error(result);
        alert('❌ Failed to create event.');
      }
    } catch (err) {
      console.error('❌ Submission error:', err);
      alert('Error submitting form');
    }
  };

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const handlePrevious = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="app-container">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>Create Event</h1>
        <p style={{ color: '#aaa' }}>Share your vision with the world.</p>
      </div>

      <div className="steps">
        <div className={`step ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(1)}>
          1. Basic Details
        </div>
        <div className={`step ${activeStep === 2 ? 'active' : ''}`} onClick={() => setActiveStep(2)}>
          2. Venue & Mode
        </div>
        <div className={`step ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(3)}>
          3. Payment Info
        </div>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        {activeStep === 1 && (
          <div className="form-section">
            <fieldset>
              <legend>Basic Information</legend>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Name of Event</label>
                <input
                  name="eventName"
                  placeholder="e.g. Pune Tech Expo"
                  value={formData.eventName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Tell people what your event is about..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Event Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Conference">Conference</option>
                  <option value="Meetup">Meetup</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Language</label>
                <select name="language" value={formData.language} onChange={handleInputChange}>
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Upload Poster</label>
                <input type="file" onChange={handleFileChange} />
              </div>

              <legend style={{ marginTop: '30px' }}>Organizer Details</legend>
              <div className="form-group">
                <label>Organizer Name</label>
                <input
                  name="organizerName"
                  value={formData.organizerName}
                  placeholder="Team Eventify"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  name="organizerEmail"
                  value={formData.organizerEmail}
                  placeholder="contact@eventify.in"
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>
          </div>
        )}

        {activeStep === 2 && (
          <div className="form-section">
            <fieldset>
              <legend>Venue & Attendance</legend>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Event Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={(e) => {
                    handleInputChange(e);
                    setEventMode(e.target.value);
                  }}
                >
                  <option value="">Select Mode</option>
                  <option value="Online">Online (Google Meet)</option>
                  <option value="Offline">Offline (Physical Venue)</option>
                </select>
              </div>

              {eventMode === 'Offline' && (
                <>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Venue Name</label>
                    <input
                      name="venueName"
                      placeholder="e.g. HICC Grand Ballroom"
                      value={formData.venueName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Full Address</label>
                    <textarea
                      name="venueAddress"
                      style={{ minHeight: '80px' }}
                      placeholder="Complete location address..."
                      value={formData.venueAddress}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Google Map Link (Optional)</label>
                    <input
                      name="googleMapLink"
                      placeholder="https://maps.app.goo.gl/..."
                      value={formData.googleMapLink}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Ticket Type</label>
                <select name="ticketType" value={formData.ticketType} onChange={handleInputChange}>
                  <option value="">Select</option>
                  <option value="Free">Free Entry</option>
                  <option value="Paid">Paid Ticket</option>
                </select>
              </div>
              <div className="form-group">
                <label>Attendee Limit</label>
                <input
                  name="attendeeLimit"
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.attendeeLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Registration Deadline</label>
                <input
                  name="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>
          </div>
        )}

        {activeStep === 3 && (
          <div className="form-section">
            <fieldset>
              <legend>Payment Configuration</legend>
              <p style={{ gridColumn: '1 / -1', color: '#aaa', fontSize: '0.9rem', marginBottom: '10px' }}>
                Configure how you want to receive payments for tickets (if applicable).
              </p>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Payout Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    handleInputChange(e);
                    setPaymentMethod(e.target.value);
                  }}
                >
                  <option value="">Select Method</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI (PhonePe/GPay/Paytm)</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {paymentMethod === 'bank' && (
                <>
                  <div className="form-group">
                    <label>Beneficiary Name</label>
                    <input
                      name="beneficiaryName"
                      placeholder="Account Holder Name"
                      value={formData.beneficiaryName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      name="accountNumber"
                      placeholder="Enter Number"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      name="bankName"
                      placeholder="e.g. HDFC Bank"
                      value={formData.bankName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>IFSC Code</label>
                    <input
                      name="ifsc"
                      placeholder="HDFC0001234"
                      value={formData.ifsc}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'upi' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>UPI ID</label>
                  <input
                    name="upiId"
                    placeholder="user@upi or 9876543210@ybl"
                    value={formData.upiId}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>PayPal Email</label>
                  <input
                    name="paypalEmail"
                    placeholder="example@paypal.com"
                    value={formData.paypalEmail}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </fieldset>
          </div>
        )}

        <div className="navigation-buttons">
          {activeStep > 1 ? (
            <button type="button" onClick={handlePrevious}>
              Back
            </button>
          ) : <div></div>}

          {activeStep < 3 ? (
            <button type="button" onClick={handleNext} style={{ background: 'rgba(255,255,255,0.1)' }}>
              Continue
            </button>
          ) : (
            <button type="submit">List My Event</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
