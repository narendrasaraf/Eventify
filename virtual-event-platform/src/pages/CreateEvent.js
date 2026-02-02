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
        // Navigate to the route matching the event type (converted to lower case)
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
      <div className="steps">
        <div className={`step ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(1)}>
          1. Event Info
        </div>
        <div className={`step ${activeStep === 2 ? 'active' : ''}`} onClick={() => setActiveStep(2)}>
          2. Venue
        </div>
        <div className={`step ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(3)}>
          3. Payment
        </div>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        {activeStep === 1 && (
          <div className="form-section">
            <fieldset className="full-width">
              <legend>Event Information</legend>
              <label>Name of Event</label>
              <input
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
              />
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Webinar">Webinar</option>
                <option value="Conference">Conference</option>
                <option value="Meetup">Meetup</option>
              </select>
              <label>Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={(e) => {
                  handleInputChange(e);
                  setEventMode(e.target.value);
                }}
              >
                <option value="">Select</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
              </select>
              <label>Start Date & Time</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
              <label>Language</label>
              <select name="language" value={formData.language} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="English">English</option>
              </select>
              <label>Upload Poster</label>
              <input type="file" onChange={handleFileChange} />
            </fieldset>

            <fieldset>
              <legend>Organizer Details</legend>
              <input
                name="organizerName"
                placeholder="Organizer Name"
                onChange={handleInputChange}
              />
              <input
                name="organizerEmail"
                placeholder="Email"
                onChange={handleInputChange}
              />
              <input
                name="contactNumber"
                placeholder="Phone"
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset>
              <legend>Ticketing</legend>
              <select name="ticketType" onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
              <input
                name="attendeeLimit"
                placeholder="Limit"
                onChange={handleInputChange}
              />
              <input
                name="registrationDeadline"
                type="date"
                onChange={handleInputChange}
              />
            </fieldset>
          </div>
        )}

        {activeStep === 2 && (
          <fieldset className="form-section" disabled={eventMode !== 'Offline'}>
            <legend>Venue (Offline only)</legend>
            <input
              name="venueName"
              placeholder="Venue"
              onChange={handleInputChange}
            />
            <input
              name="venueAddress"
              placeholder="Full Address"
              onChange={handleInputChange}
            />
            <input
              name="googleMapLink"
              placeholder="Google Map Link"
              onChange={handleInputChange}
            />
          </fieldset>
        )}

        {activeStep === 3 && (
          <fieldset className="form-section">
            <legend>Payment</legend>
            <select
              name="paymentMethod"
              onChange={(e) => {
                handleInputChange(e);
                setPaymentMethod(e.target.value);
              }}
            >
              <option value="">Select</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="paypal">PayPal</option>
            </select>
            {paymentMethod === 'bank' && (
              <>
                <input
                  name="beneficiaryName"
                  placeholder="Beneficiary Name"
                  onChange={handleInputChange}
                />
                <input
                  name="accountNumber"
                  placeholder="Account Number"
                  onChange={handleInputChange}
                />
                <input
                  name="bankName"
                  placeholder="Bank Name"
                  onChange={handleInputChange}
                />
                <input
                  name="ifsc"
                  placeholder="IFSC Code"
                  onChange={handleInputChange}
                />
              </>
            )}
            {paymentMethod === 'upi' && (
              <input
                name="upiId"
                placeholder="UPI ID"
                onChange={handleInputChange}
              />
            )}
            {paymentMethod === 'paypal' && (
              <input
                name="paypalEmail"
                placeholder="PayPal Email"
                onChange={handleInputChange}
              />
            )}
          </fieldset>
        )}

        <div className="navigation-buttons">
          {activeStep > 1 && (
            <button className='height' type="button" onClick={handlePrevious}>
              Previous
            </button>
          )}
          {activeStep < 3 && (
            <button className='height' type="button" onClick={handleNext}>
              Next
            </button>
          )}
          {activeStep === 3 && <button type="submit">Submit Event</button>}
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
