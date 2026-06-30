// import React, { useState } from "react";
// import "./LandingPage.css";

// const allEvents = [
//   {
//     title: "AI in Finance Webinar",
//     date: "April 20, 2025",
//     type: "Webinar",
//     city: "Mumbai",
//     image: "https://via.placeholder.com/300x200?text=Finance+Webinar"
//   },
//   {
//     title: "Tech Expo Conference",
//     date: "April 25, 2025",
//     type: "Conference",
//     city: "Delhi",
//     image: "https://via.placeholder.com/300x200?text=Tech+Expo"
//   },
//   {
//     title: "Startup Meetup",
//     date: "May 1, 2025",
//     type: "Meetup",
//     city: "Bangalore",
//     image: "https://via.placeholder.com/300x200?text=Startup+Meetup"
//   },
//   {
//     title: "Live Coding Stream",
//     date: "May 3, 2025",
//     type: "Live Stream",
//     city: "Pune",
//     image: "https://via.placeholder.com/300x200?text=Live+Stream"
//   },
// ];

// const cities = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Chennai", "Pune"];
// const types = ["All", "Webinar", "Conference", "Meetup", "Live Stream"];

// const LandingPage = () => {
//   const [selectedCity, setSelectedCity] = useState("Pune");
//   const [selectedType, setSelectedType] = useState("All");

//   const filteredEvents = allEvents.filter(event =>
//     (selectedCity === "All Cities" || event.city === selectedCity) &&
//     (selectedType === "All" || event.type === selectedType)
//   );

//   return (
//     <div className="container">
//       <header className="header">
//         <h1 className="logo">BookMyEvent</h1>
//         <input className="search-bar" placeholder="Search events..." />

//         <select className="city-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
//           {cities.map(city => <option key={city}>{city}</option>)}
//         </select>

//         <button className="sign-in">Sign In</button>
//       </header>

//       <div className="type-nav">
//         {types.map(type => (
//           <span
//             key={type}
//             className={`type-link ${selectedType === type ? "active" : ""}`}
//             onClick={() => setSelectedType(type)}
//           >
//             {type}
//           </span>
//         ))}
//       </div>

//       <div className="hero">
//         <div className="hero-text">
//           <h2>Book and Explore Top Virtual Events</h2>
//           <p>From webinars to live streams — join from anywhere, anytime.</p>
//         </div>
//       </div>

//       <section className="event-section">
//         <h2>Upcoming Events</h2>
//         <div className="event-list">
//           {filteredEvents.map((event, idx) => (
//             <div key={idx} className="event-card">
//               <img src={event.image} alt={event.title} />
//               <div className="event-info">
//                 <h3>{event.title}</h3>
//                 <p>{event.date} • {event.city}</p>
//                 <span className="badge">{event.type}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default LandingPage;
