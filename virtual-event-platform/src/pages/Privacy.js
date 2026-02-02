import React from 'react';
import './PagesStyles.css';

function Privacy() {
    return (
        <div className="page-container">
            <div className="event-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Privacy Policy</h1>
                <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                    <p>Your privacy is important to us.</p>
                    <p>It is Eventify's policy to respect your privacy regarding any information we may collect while operating our website.</p>

                    <h3>1. Information We Collect</h3>
                    <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>

                    <h3>2. How We Use Information</h3>
                    <p>We check the data we store to protect it within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

                    <h3>3. Sharing of Information</h3>
                    <p>We do not share any personally identifying information publicly or with third-parties, except when required to by law.</p>

                    <h3>4. Your Rights</h3>
                    <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</p>
                </div>
            </div>
        </div>
    );
}

export default Privacy;
