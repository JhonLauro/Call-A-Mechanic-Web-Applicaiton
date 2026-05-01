import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="header-content">
            <div className="logo">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span className="logo-text">Call-A-Mechanic</span>
            </div>

            <nav className="header-nav">
              <Link to="/login" className="btn-nav-secondary">Sign In</Link>
              <Link to="/register" className="btn-nav-primary">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Professional Auto Repair <br />
              <span className="text-accent">Made Simple</span>
            </h1>
            <p className="hero-subtitle">
              Connect with certified mechanics in your area for fast, reliable,
              and affordable auto repair services. Get your car back on the road today.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">
                Book a Service
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <button className="btn-hero-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="landing-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Certified Mechanics</h3>
              <p className="feature-description">
                All our mechanics are certified professionals with years of experience
                in automotive repair and maintenance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Tracking</h3>
              <p className="feature-description">
                Track your service request in real-time and stay updated on your
                vehicle's repair progress every step of the way.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Trusted Service</h3>
              <p className="feature-description">
                Join thousands of satisfied customers who trust us for their
                automotive needs. Quality service guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="landing-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50+</div>
              <div className="stat-label">Expert Mechanics</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">25K+</div>
              <div className="stat-label">Services Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.9</div>
              <div className="stat-label">
                <svg className="star-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">
              Join thousands of satisfied customers and experience hassle-free auto repair services.
            </p>
            <Link to="/register" className="btn-cta">Sign Up Now</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>&copy; 2026 Call-A-Mechanic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
