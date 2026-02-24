import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Info,
  MapPin,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Calendar,
  Type,
  Globe,
  User,
  Mail,
  Phone,
  Video,
  Banknote,
  Smartphone,
  CreditCard
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

function CreateEvent() {
  const [activeStep, setActiveStep] = useState(1);
  const [eventMode, setEventMode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    ticketPrice: 0,
    attendeeLimit: '',
    registrationDeadline: '',
    googleMapLink: '',
    meetingPlatform: 'Google',
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
    setIsSubmitting(true);

    const requiredFields = ['eventName', 'type', 'mode', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field} field.`);
        setIsSubmitting(false);
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
        credentials: 'include'
      });

      const result = await response.json();
      if (response.ok) {
        navigate(`/myevents`);
      } else {
        alert('❌ Failed to create event: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Submission error:', err);
      alert('Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const handlePrevious = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, name: 'Basic Details', icon: Info },
    { id: 2, name: 'Venue & Mode', icon: MapPin },
    { id: 3, name: 'Payment Info', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="section-container pt-12 max-w-4xl">
        <PageHeader
          title="Create Event"
          subtitle="Share your vision with the world. Create experiences that matter."
        />

        {/* Stepper */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 -z-10" />
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isActive
                        ? 'bg-primary border-primary shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white scale-110'
                        : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                      }`}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={`mt-3 text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-slate-600'
                    }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="card shadow-2xl shadow-indigo-500/5 bg-surface/50 backdrop-blur-xl border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Step 1: Basic Details */}
            {activeStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Event Title</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Type className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        name="eventName"
                        className="input-field w-full pl-12"
                        placeholder="e.g. Pune Tech Expo 2025"
                        value={formData.eventName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Description</label>
                    <textarea
                      name="description"
                      className="input-field w-full min-h-[120px] py-4"
                      placeholder="Tell people what your event is about..."
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Event Type</label>
                    <select
                      name="type"
                      className="input-field w-full appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" className="bg-slate-900">Select Type</option>
                      <option value="Webinar" className="bg-slate-900">Webinar</option>
                      <option value="Conference" className="bg-slate-900">Conference</option>
                      <option value="Meetup" className="bg-slate-900">Meetup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Category</label>
                    <select
                      name="category"
                      className="input-field w-full appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="" className="bg-slate-900">Select Category</option>
                      <option value="Technology" className="bg-slate-900">Technology</option>
                      <option value="Education" className="bg-slate-900">Education</option>
                      <option value="Business" className="bg-slate-900">Business</option>
                      <option value="Entertainment" className="bg-slate-900">Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Start Date & Time</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input
                        type="datetime-local"
                        name="startDate"
                        className="input-field w-full pl-12"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">End Date & Time</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input
                        type="datetime-local"
                        name="endDate"
                        className="input-field w-full pl-12"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Language</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <select name="language" className="input-field w-full pl-12 appearance-none" value={formData.language} onChange={handleInputChange}>
                        <option value="" className="bg-slate-900">Select Language</option>
                        <option value="English" className="bg-slate-900">English</option>
                        <option value="Hindi" className="bg-slate-900">Hindi</option>
                        <option value="Marathi" className="bg-slate-900">Marathi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Event Poster</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="poster-upload"
                      />
                      <label
                        htmlFor="poster-upload"
                        className="input-field w-full flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-primary" />
                        <span className="text-slate-400 truncate">
                          {posterFile ? posterFile.name : 'Choose file...'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Organizer Info
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Name</label>
                      <input
                        name="organizerName"
                        className="input-field w-full"
                        value={formData.organizerName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          name="organizerEmail"
                          className="input-field w-full pl-10"
                          value={formData.organizerEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Venue & Mode */}
            {activeStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Event Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => { setEventMode('Online'); handleInputChange({ target: { name: 'mode', value: 'Online' } }); }}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${eventMode === 'Online'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                      >
                        <Video className="h-8 w-8 mb-3" />
                        <span className="font-bold">Online / Virtual</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEventMode('Offline'); handleInputChange({ target: { name: 'mode', value: 'Offline' } }); }}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${eventMode === 'Offline'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                      >
                        <MapPin className="h-8 w-8 mb-3" />
                        <span className="font-bold">Offline / Venue</span>
                      </button>
                    </div>
                  </div>

                  {eventMode === 'Online' && (
                    <div className="animate-in zoom-in-95 duration-300">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Meeting Platform</label>
                      <select
                        name="meetingPlatform"
                        className="input-field w-full appearance-none cursor-pointer"
                        value={formData.meetingPlatform}
                        onChange={handleInputChange}
                      >
                        <option value="Google" className="bg-slate-900">Google Meet</option>
                        <option value="Jitsi" className="bg-slate-900">Jitsi Meet (Free & Unlimited)</option>
                      </select>
                    </div>
                  )}

                  {eventMode === 'Offline' && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Venue Name</label>
                        <input
                          name="venueName"
                          className="input-field w-full"
                          placeholder="e.g. Grand Ballroom, Marriott Hotel"
                          value={formData.venueName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Address</label>
                        <textarea
                          name="venueAddress"
                          className="input-field w-full min-h-[80px]"
                          placeholder="Full physical address..."
                          value={formData.venueAddress}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Maps Link (Optional)</label>
                        <input
                          name="googleMapLink"
                          className="input-field w-full"
                          placeholder="https://maps.app.goo.gl/..."
                          value={formData.googleMapLink}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Ticket Type</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'ticketType', value: 'Free' } })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.ticketType === 'Free' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        Free Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'ticketType', value: 'Paid' } })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.ticketType === 'Paid' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        Paid Ticket
                      </button>
                    </div>
                  </div>

                  {formData.ticketType === 'Paid' && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Ticket Price (INR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                        <input
                          name="ticketPrice"
                          type="number"
                          className="input-field w-full pl-8"
                          placeholder="499"
                          value={formData.ticketPrice}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Attendee Limit</label>
                    <input
                      name="attendeeLimit"
                      type="number"
                      className="input-field w-full"
                      placeholder="e.g. 100"
                      value={formData.attendeeLimit}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Reg. Deadline</label>
                    <input
                      name="registrationDeadline"
                      type="date"
                      className="input-field w-full"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Info */}
            {activeStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Payout Configuration</h3>
                  <p className="text-sm text-text-secondary mb-6">Select how you want to receive payments for your tickets.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: 'bank', name: 'Bank Account', icon: Banknote },
                      { id: 'upi', name: 'UPI ID', icon: Smartphone },
                      { id: 'paypal', name: 'PayPal', icon: CreditCard }
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => { setPaymentMethod(method.id); handleInputChange({ target: { name: 'paymentMethod', value: method.id } }); }}
                          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                        >
                          <Icon className="h-6 w-6 mb-2" />
                          <span className="text-sm font-bold">{method.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-6">
                    {paymentMethod === 'bank' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-2">Beneficiary Name</label>
                          <input name="beneficiaryName" className="input-field w-full" placeholder="John Doe" value={formData.beneficiaryName} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-2">Account Number</label>
                          <input name="accountNumber" className="input-field w-full" placeholder="XXXX XXXX XXXX" value={formData.accountNumber} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-2">Bank Name</label>
                          <input name="bankName" className="input-field w-full" placeholder="e.g. HDFC Bank" value={formData.bankName} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-2">IFSC Code</label>
                          <input name="ifsc" className="input-field w-full" placeholder="HDFC0001234" value={formData.ifsc} onChange={handleInputChange} />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'upi' && (
                      <div className="animate-in zoom-in-95 duration-300">
                        <label className="block text-sm font-semibold text-text-secondary mb-2">UPI ID</label>
                        <input name="upiId" className="input-field w-full" placeholder="example@upi or 9876543210@ybl" value={formData.upiId} onChange={handleInputChange} />
                      </div>
                    )}

                    {paymentMethod === 'paypal' && (
                      <div className="animate-in zoom-in-95 duration-300">
                        <label className="block text-sm font-semibold text-text-secondary mb-2">PayPal Email</label>
                        <input name="paypalEmail" type="email" className="input-field w-full" placeholder="payout@example.com" value={formData.paypalEmail} onChange={handleInputChange} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <div className="flex gap-4">
                    <div className="bg-primary/20 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary">Ready to launch?</h4>
                      <p className="text-sm text-text-secondary">Please review all your event details before submitting. Once published, some changes may require admin approval.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={activeStep === 1}
                className={`btn-secondary flex items-center gap-2 ${activeStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2 group"
                >
                  Continue <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2 px-10 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Publishing...</>
                  ) : (
                    'Publish Event'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default CreateEvent;
