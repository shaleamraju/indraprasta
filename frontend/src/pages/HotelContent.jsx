import React from 'react';
import './HotelContent.css';

// Original site images (local-first with remote fallback). Run the PowerShell script to download.
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
  return (
    <main className="hotel-page">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 id="hero-heading">Flavours Multi Cuisine Restaurant</h1>
            <p className="hero-contact">Phone: <a href="tel:+917893661133">078936 61133</a></p>
          </div>
          <div className="hero-media">
            <img
              src={remoteImages[0].local}
              alt={remoteImages[0].alt}
              loading="lazy"
              onError={(e) => {
                if (e.target.src !== remoteImages[0].remote) e.target.src = remoteImages[0].remote;
              }}
            />
          </div>
        </div>
      </section>

      <section id="about_us" className="section about">
        <h2>About Us</h2>
        <p>
          Visiting Nandyala and looking for a place to stay the night? Perhaps you’re a
          local looking for somewhere for friends or family to stay. Either way, Hotel DR
          Indraprastha is the right place for you. We offer nothing less than top-notch
          rooms, amenities, and services. When you visit us, you’ll find that you have
          everything you need for a comfortable stay.
        </p>
        <p>
          Our team of extraordinary chefs pride themselves on years of experience in the
          food industry. We constantly refine our recipes and services so you always
          want to come back for more.
        </p>
      </section>

      <section id="gallery" className="section gallery" aria-labelledby="gallery-heading" role="region">
        <h2 id="gallery-heading">Gallery</h2>
        <div className="gallery-slider" aria-label="Scrolling gallery of restaurant and hotel images">
          <div className="slider-track">
            {[...remoteImages, ...remoteImages].map((item, i) => (
              <div className="slide" key={i}>
                <img
                  src={item.local}
                  alt={item.alt}
                  loading="lazy"
                  onError={(e) => { if (e.target.src !== item.remote) e.target.src = item.remote; }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="amenities" className="section amenities">
        <h2>Amenities</h2>
        <ul>
          <li>Parking available</li>
          <li>Wifi on the premises</li>
          <li>Wheelchair accessible</li>
          <li>24/7 availability</li>
          <li>Debit & Credit cards accepted</li>
          <li>Good for children</li>
          <li>Bike parking available</li>
        </ul>
      </section>

      <section id="reviews" className="section reviews">
        <h2>Reviews</h2>
        <blockquote>
          "Excellent quality service, recommended A++" — Singh Kishan (15.10.2020)
        </blockquote>
      </section>

      <section id="services" className="section services">
        <h2>Services</h2>
        <ul>
          <li>Accommodations — Deluxe Room</li>
          <li>Food — Lunch, Dinner, Breakfast</li>
        </ul>
      </section>

      <section id="contact_us" className="section contact">
        <h2>Contact Us</h2>
        <p>Address: Padmavathi Nagar, Nandyala, Andhra Pradesh, 518501</p>
        <p>Phone: <a href="tel:+917893661133">078936 61133</a></p>
        <p>Email: <a href="mailto:drhotels.ndl@gmail.com">drhotels.ndl@gmail.com</a></p>
      </section>
    </main>
  );
}
