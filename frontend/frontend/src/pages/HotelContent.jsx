import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HotelContent.css';

const remoteImages = [
  {
    local: '/assets/CLIQ4797-copyjpg.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c992_a/image/upload/v1602743758/business/42d0c966-decc-4e3b-88be-be8c03306253/CLIQ4797-copyjpg.jpg',
    alt: 'Restaurant entrance facade with evening lighting'
  },
  {
    local: '/assets/shutterstock_548927521.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1551791787/category/shutterstock_548927521.jpg',
    alt: 'Elegant plated multi cuisine dish presentation'
  },
  {
    local: '/assets/shutterstock_724503046.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1568110680/category/shutterstock_724503046.jpg',
    alt: 'Room interior with ambient lighting'
  },
  {
    local: '/assets/shutterstock_1262587624.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1568029117/category/shutterstock_1262587624.jpg',
    alt: 'Chef preparing food in professional kitchen'
  }
];

export default function HotelContent() {
  const navigate = useNavigate();

  return (
    <main className="hotel-page">
      <section className="hero">
        <div className="hero-overlay">
          <img
            src={remoteImages[0].remote}
            alt="Hotel Luxury"
            className="hero-image"
          />
        </div>
        <div className="hero-content">
          <h1>Experience Luxury at <br /><span>Hotel Indraprastha</span></h1>
          <p>A sanctuary of elegance and comfort in the heart of Nandyala. Where world-class hospitality meets timeless luxury.</p>
          <div className="hero-btns">
            <button onClick={() => navigate('/booking')} className="btn-primary">Book Your Stay →</button>
            <a href="#about_us" className="btn-outline">Explore More</a>
          </div>
        </div>
      </section>

      <section id="about_us" className="section about">
        <div className="about-grid">
          <div className="about-media">
            <img src={remoteImages[2].remote} alt="Luxury Room" className="about-img" />
            <div className="about-blob"></div>
          </div>
          <div className="about-text">
            <h2>Welcome to Indraprastha</h2>
            <div className="accent-line"></div>
            <p>Visiting Nandyala and looking for a place to stay the night? Perhaps you’re a local looking for somewhere for friends or family to stay. Either way, Hotel DR Indraprastha is the right place for you.</p>
            <p>We offer nothing less than top-notch rooms, amenities, and services. When you visit us, you’ll find that you have everything you need for a comfortable stay.</p>
            <div className="about-features">
              <div className="feature-item">✓ Luxury Suites</div>
              <div className="feature-item">✓ Fine Dining</div>
              <div className="feature-item">✓ 24/7 Support</div>
              <div className="feature-item">✓ Free Wifi</div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="section gallery">
        <div className="gallery-header">
          <h2>A Glimpse of Luxury</h2>
          <p>Experience the blend of traditional hospitality and modern luxury.</p>
        </div>
        <div className="gallery-grid">
          {remoteImages.map((img, i) => (
            <div key={i} className="gallery-item">
              <img src={img.remote} alt={img.alt} />
              <div className="gallery-overlay">
                <p>{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="amenities" className="section amenities">
        <div className="section-title">
          <h2>World-Class Amenities</h2>
          <div className="accent-line center"></div>
        </div>
        <div className="amenities-grid">
          {[
            { label: 'Prime Location' },
            { label: 'Free High-Speed Wifi' },
            { label: 'Luxury Bedding' },
            { label: '24/7 Room Service' },
            { label: 'Secure Parking' },
            { label: 'Wheelchair Accessible' },
            { label: 'Credit Cards Accepted' },
            { label: 'Child Friendly' },
          ].map((item, i) => (
            <div key={i} className="amenity-card">
              <div className="amenity-icon">★</div>
              <span className="amenity-label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="section reviews">
        <div className="reviews-container">
          <div className="review-card">
            <div className="review-star">★</div>
            <blockquote className="review-text">
              "Excellent quality service, recommended A++. The staff was incredibly helpful and the rooms were spotless. A truly wonderful stay in Nandyala!"
            </blockquote>
            <div className="review-author">
              <div className="author-avatar">SK</div>
              <div className="author-info">
                <p className="author-name">Singh Kishan</p>
                <p className="author-date">Visited Oct 2020</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact_us" className="section contact">
        <div className="contact-card">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <div className="contact-details">
              <p>📍 Padmavathi Nagar, Nandyala, AP, 518501</p>
              <p>📞 078936 61133</p>
              <p>✉️ drhotels.ndl@gmail.com</p>
            </div>
          </div>
          <div className="contact-cta">
            <p>Ready for a break?</p>
            <button onClick={() => navigate('/booking')} className="btn-secondary">Reserve Now</button>
          </div>
        </div>
      </section>
    </main>
  );
}
