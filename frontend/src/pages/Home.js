import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI Quality Check',
      description: 'Advanced deep learning models analyze product images to ensure only fresh, high-quality produce reaches consumers.'
    },
    {
      icon: '🌾',
      title: 'Crop Recommendations',
      description: 'Get personalized crop suggestions based on soil data and weather conditions for optimal yield.'
    },
    {
      icon: '📊',
      title: 'Real-time Market Prices',
      description: 'Live price updates from Maharashtra government sources to help farmers set competitive prices.'
    },
    {
      icon: '🌤️',
      title: 'Weather Insights',
      description: 'Accurate weather forecasts and farming recommendations to optimize your agricultural decisions.'
    },
    {
      icon: '🚚',
      title: 'Smart Logistics',
      description: 'Seamless delivery coordination with real-time tracking for both farmers and customers.'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Safe and reliable payment processing through trusted payment gateways.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Active Farmers' },
    { number: '2000+', label: 'Happy Customers' },
    { number: '50+', label: 'Product Categories' },
    { number: '95%', label: 'Quality Score' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Fresh From Farm to Your Table</h1>
          <p>Connect directly with local farmers through our AI-powered platform. Get fresh, quality-assured produce at fair prices.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">Join as Farmer</Link>
            <Link to="/register" className="btn btn-secondary">Shop Fresh Produce</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <div className="container">
          <div className="dashboard-header">
            <h2 className="dashboard-title">Why Choose FarmFresh?</h2>
            <p>Our platform combines cutting-edge technology with traditional farming wisdom</p>
          </div>
          
          <div className="grid grid-3">
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <div className="container">
          <div className="dashboard-header">
            <h2 className="dashboard-title">How It Works</h2>
            <p>Simple steps from farm to your doorstep</p>
          </div>
          
          <div className="grid grid-4">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👨‍🌾</div>
              <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>1. Farmer Uploads</h3>
              <p>Farmers upload product images for AI quality verification</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>2. AI Quality Check</h3>
              <p>Our AI model analyzes and approves only quality produce</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>3. Customer Orders</h3>
              <p>Customers browse and order fresh produce</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>4. Fast Delivery</h3>
              <p>Secure payment and quick delivery to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#28a745', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Get Started?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of farmers and customers already using FarmFresh
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn" style={{ backgroundColor: 'white', color: '#28a745' }}>
              Start Selling
            </Link>
            <Link to="/register" className="btn" style={{ backgroundColor: 'transparent', color: 'white', border: '2px solid white' }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
