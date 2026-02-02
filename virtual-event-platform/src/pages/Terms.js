import React from 'react';
import './PagesStyles.css';

function Terms() {
    return (
        <div className="page-container">
            <div className="event-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Terms of Service</h1>
                <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                    <p>Welcome to Eventify.</p>
                    <p>By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

                    <h3>1. Use License</h3>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on Eventify's website for personal, non-commercial transitory viewing only.</p>

                    <h3>2. Disclaimer</h3>
                    <p>The materials on Eventify's website are provided on an 'as is' basis. Eventify makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

                    <h3>3. Limitations</h3>
                    <p>In no event shall Eventify or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Eventify's website.</p>
                </div>
            </div>
        </div>
    );
}

export default Terms;
