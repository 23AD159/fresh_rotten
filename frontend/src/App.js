import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import ProductListing from './pages/ProductListing';
import ProductUpload from './pages/ProductUpload';
import CropRecommendation from './pages/CropRecommendation';
import MarketPrices from './pages/MarketPrices';
import Orders from './pages/Orders';
import WeatherInsights from './pages/WeatherInsights';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Bill from './pages/Bill';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/upload-product" element={<ProductUpload />} />
            <Route path="/crop-recommendation" element={<CropRecommendation />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/weather-insights" element={<WeatherInsights />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/bill" element={<Bill />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
