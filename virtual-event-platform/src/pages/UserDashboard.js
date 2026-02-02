import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PagesStyles.css';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ dob: '', password: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setEditForm({ dob: parsedUser.dob || '', password: '' });
        fetchBookings(parsedUser._id);
    }, [navigate]);

    const fetchBookings = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/my-bookings/${userId}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, editForm);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update profile');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="success-banner">
                Successfully Logged In
            </div>

            <h1 className="dashboard-title">User Dashboard</h1>

            <div className="profile-section">
                <div className="profile-header">
                    <h2>Profile Details</h2>
                    <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">
                        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" className="form-control" value={user.fullName} disabled style={{ opacity: 0.7 }} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" className="form-control" value={user.email} disabled style={{ opacity: 0.7 }} />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className="form-control"
                                value={editForm.dob}
                                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password (Optional)</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Leave blank to keep current"
                                value={editForm.password}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="save-btn">Save Changes</button>
                    </form>
                ) : (
                    <div className="profile-details">
                        <p><strong>Name:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
                        <p><strong>Date of Birth:</strong> {user.dob || 'Not set'}</p>
                    </div>
                )}
            </div>

            <div className="bookings-section">
                <h2>My Bookings</h2>
                {bookings.length === 0 ? (
                    <p style={{ color: '#aaa' }}>You haven't booked any events yet.</p>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <span className="booking-status">{booking.status}</span>
                                {booking.eventId ? (
                                    <>
                                        <h3>{booking.eventId.eventName}</h3>
                                        <p style={{ color: '#ccc', margin: '5px 0' }}>{booking.eventId.venueName || 'Online Event'}</p>
                                        <p style={{ color: '#8faaff', fontSize: '0.9rem' }}>
                                            {new Date(booking.eventId.startDate).toLocaleDateString()}
                                        </p>
                                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#666' }}>
                                            Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                                        </div>
                                    </>
                                ) : (
                                    <p>Event details unavailable</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
