import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCityList } from '../config/citiesConfig';

const PRICE_SERVICE_PORT = process.env.REACT_APP_PRICE_SERVICE_PORT || 5000;
const MARKET_SERVICE_ROOT = `http://localhost:${PRICE_SERVICE_PORT}`;
const PREDICT_PRICE_ENDPOINT = `${MARKET_SERVICE_ROOT}/predict_price`;

// Shared city list and helper across component (so it's available for initial state)
const cityList = getCityList();
const defaultRegion = cityList[0] || '';
const cityAt = (idx) => `${cityList[idx % cityList.length]}, Tamil Nadu`;

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [freshness, setFreshness] = useState({});
  const [checkingId, setCheckingId] = useState(null);
  const [region, setRegion] = useState(defaultRegion);
  const [livePrices, setLivePrices] = useState({});
  const [productQuantities, setProductQuantities] = useState({}); // Track quantity inputs per product
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000';

  const categories = ['all', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Herbs', 'Spices', 'Dairy'];

  // Helper function to get imageFile based on crop type
  const getImageFileForCrop = (crop, name) => {
    const imageMap = {
      'apple': 'a_f002.png',
      'banana': 'b_f002.png',
      'orange': 'orange.png',
      'capsicum': 'c_f003.png',
      'cucumber': 'cucumberrrr.png',
      'potato': 'potato.jpeg',
      'tomato': 'download.jpeg',
      'carrot': 'download (1).jpeg',
      'onion': 'o_f001.png',
      'mixed': 'rot.jpeg'
    };
    if (crop && imageMap[crop.toLowerCase()]) {
      return imageMap[crop.toLowerCase()];
    }
    // Fallback: use a default image if crop not found
    return 'download.jpeg';
  };

  // Products with imageFile for ML prediction (matching backend/uploads)
  const mockProducts = [
    { id: 1, name: 'Apple Batch A', crop: 'apple', category: 'Fruits', price: 150, unit: 'kg', farmer: 'Demo Orchard', rating: 4.8, image: '🍎', imageFile: 'a_f002.png', description: 'Handpicked apples from our demo orchard', stock: 20, location: cityAt(0), harvestDate: '2024-01-15', isFresh: true },
    { id: 2, name: 'Apple Batch B', crop: 'apple', category: 'Fruits', price: 90, unit: 'kg', farmer: 'Demo Orchard', rating: 3.8, image: '🍎', imageFile: 'a_r002.png', description: 'Another lot of apples from a different batch', stock: 10, location: cityAt(1), harvestDate: '2024-01-10', isFresh: true },
    { id: 3, name: 'Banana Bunch A', crop: 'banana', category: 'Fruits', price: 60, unit: 'dozen', farmer: 'Demo Grove', rating: 4.7, image: '🍌', imageFile: 'b_f002.png', description: 'Sweet yellow bananas from demo grove', stock: 25, location: cityAt(2), harvestDate: '2024-01-14', isFresh: true },
    { id: 4, name: 'Banana Bunch B', crop: 'banana', category: 'Fruits', price: 35, unit: 'dozen', farmer: 'Demo Grove', rating: 3.6, image: '🍌', imageFile: 'b_r002.png', description: 'Another banana batch suitable for shakes and baking', stock: 12, location: cityAt(3), harvestDate: '2024-01-08', isFresh: true },
    { id: 5, name: 'Orange Lot A', crop: 'orange', category: 'Fruits', price: 80, unit: 'kg', farmer: 'Demo Orchard', rating: 4.6, image: '🍊', imageFile: 'orange.png', description: 'Oranges from the main orchard lot', stock: 22, location: cityAt(4), harvestDate: '2024-01-13', isFresh: true },
    { id: 6, name: 'Orange Lot B', crop: 'orange', category: 'Fruits', price: 45, unit: 'kg', farmer: 'Demo Orchard', rating: 3.7, image: '🍊', imageFile: 'o_r001.png', description: 'Alternate orange lot ideal for juicing', stock: 8, location: cityAt(5), harvestDate: '2024-01-07', isFresh: true },
    { id: 7, name: 'Capsicum Crate', crop: 'capsicum', category: 'Vegetables', price: 70, unit: 'kg', farmer: 'Demo Farm', rating: 4.7, image: '🫑', imageFile: 'c_f003.png', description: 'Mixed colour capsicums from demo farm', stock: 30, location: cityAt(6), harvestDate: '2024-01-12', isFresh: true },
    { id: 8, name: 'Cucumber Lot', crop: 'cucumber', category: 'Vegetables', price: 40, unit: 'kg', farmer: 'Demo Farm', rating: 4.6, image: '🥒', imageFile: 'cucumberrrr.png', description: 'Field-fresh cucumbers harvested this week', stock: 26, location: cityAt(7), harvestDate: '2024-01-11', isFresh: true },
    { id: 9, name: 'Potato Sack', crop: 'potato', category: 'Vegetables', price: 32, unit: 'kg', farmer: 'Demo Farm', rating: 4.5, image: '🥔', imageFile: 'potato.jpeg', description: 'Table potatoes suitable for everyday cooking', stock: 40, location: cityAt(8), harvestDate: '2024-01-10', isFresh: true },
    { id: 10, name: 'Mixed Veg Pack', crop: 'mixed', category: 'Vegetables', price: 20, unit: 'kg', farmer: 'Demo Farm', rating: 3.2, image: '⚠️', imageFile: 'rot.jpeg', description: 'Assorted vegetables from mixed lot', stock: 15, location: cityAt(9), harvestDate: '2024-01-05', isFresh: true },
    { id: 11, name: 'Fresh Tomatoes', crop: 'tomato', category: 'Vegetables', price: 35, unit: 'kg', farmer: 'Rajesh Patel', rating: 4.8, image: '🍅', imageFile: 'download.jpeg', description: 'Fresh, red tomatoes harvested this morning', stock: 50, location: cityAt(0), harvestDate: '2024-01-15', isFresh: true },
    { id: 12, name: 'Organic Spinach', crop: 'spinach', category: 'Vegetables', price: 40, unit: 'kg', farmer: 'Priya Singh', rating: 4.9, image: '🥬', imageFile: getImageFileForCrop('spinach', 'Organic Spinach'), description: 'Organic spinach grown without pesticides', stock: 25, location: cityAt(1), harvestDate: '2024-01-14', isFresh: true },
    { id: 13, name: 'Sweet Corn', crop: 'corn', category: 'Vegetables', price: 25, unit: 'kg', farmer: 'Suresh Reddy', rating: 4.7, image: '🌽', imageFile: getImageFileForCrop('corn', 'Sweet Corn'), description: 'Sweet and juicy corn kernels', stock: 40, location: cityAt(2), harvestDate: '2024-01-13', isFresh: true },
    { id: 14, name: 'Fresh Carrots', crop: 'carrot', category: 'Vegetables', price: 30, unit: 'kg', farmer: 'Lakshmi Devi', rating: 4.6, image: '🥕', imageFile: 'download (1).jpeg', description: 'Orange carrots rich in vitamins', stock: 35, location: cityAt(3), harvestDate: '2024-01-12', isFresh: true },
    { id: 15, name: 'Bananas', crop: 'banana', category: 'Fruits', price: 52, unit: 'dozen', farmer: 'Ramesh Kumar', rating: 4.5, image: '🍌', imageFile: 'b_f002.png', description: 'Yellow bananas, perfect for daily consumption', stock: 30, location: cityAt(4), harvestDate: '2024-01-11', isFresh: true },
    { id: 16, name: 'Apples', crop: 'apple', category: 'Fruits', price: 150, unit: 'kg', farmer: 'Anita Sharma', rating: 4.8, image: '🍎', imageFile: 'a_f002.png', description: 'Red apples from Kashmir region', stock: 20, location: cityAt(5), harvestDate: '2024-01-10', isFresh: true },
    { id: 17, name: 'Wheat', crop: 'wheat', category: 'Grains', price: 25, unit: 'kg', farmer: 'Bharat Patel', rating: 4.4, image: '🌾', imageFile: getImageFileForCrop('wheat', 'Wheat'), description: 'Whole wheat grains for healthy cooking', stock: 100, location: cityAt(6), harvestDate: '2024-01-09', isFresh: true },
    { id: 18, name: 'Rice', crop: 'rice', category: 'Grains', price: 40, unit: 'kg', farmer: 'Vijay Singh', rating: 4.6, image: '🍚', imageFile: getImageFileForCrop('rice', 'Rice'), description: 'Basmati rice with long grains', stock: 80, location: cityAt(7), harvestDate: '2024-01-08', isFresh: true },
    { id: 19, name: 'Lentils', crop: 'lentil', category: 'Pulses', price: 97, unit: 'kg', farmer: 'Sunita Devi', rating: 4.7, image: '🫘', imageFile: getImageFileForCrop('lentil', 'Lentils'), description: 'Red lentils rich in protein', stock: 45, location: cityAt(8), harvestDate: '2024-01-07', isFresh: true },
    { id: 20, name: 'Chickpeas', crop: 'chickpea', category: 'Pulses', price: 75, unit: 'kg', farmer: 'Raj Kumar', rating: 4.5, image: '🫘', imageFile: getImageFileForCrop('chickpea', 'Chickpeas'), description: 'White chickpeas for various dishes', stock: 60, location: cityAt(9), harvestDate: '2024-01-06', isFresh: true },
    { id: 21, name: 'Fresh Mint', crop: 'mint', category: 'Herbs', price: 80, unit: 'kg', farmer: 'Meera Patel', rating: 4.9, image: '🌿', imageFile: getImageFileForCrop('mint', 'Fresh Mint'), description: 'Fresh mint leaves for chutneys and tea', stock: 15, location: cityAt(10), harvestDate: '2024-01-15', isFresh: true },
    { id: 22, name: 'Turmeric', crop: 'turmeric', category: 'Spices', price: 200, unit: 'kg', farmer: 'Ganesh Rao', rating: 4.8, image: '🟡', imageFile: getImageFileForCrop('turmeric', 'Turmeric'), description: 'Pure turmeric powder for cooking', stock: 25, location: cityAt(11), harvestDate: '2024-01-05', isFresh: true },
    { id: 23, name: 'Green Grapes', crop: 'grape', category: 'Fruits', price: 120, unit: 'kg', farmer: 'Sudha Narayan', rating: 4.7, image: '🍇', imageFile: getImageFileForCrop('grape', 'Green Grapes'), description: 'Seedless grapes, crisp and sweet', stock: 28, location: cityAt(0), harvestDate: '2024-01-14', isFresh: true },
    { id: 24, name: 'Watermelon', crop: 'watermelon', category: 'Fruits', price: 25, unit: 'kg', farmer: 'Arun Prakash', rating: 4.6, image: '🍉', imageFile: getImageFileForCrop('watermelon', 'Watermelon'), description: 'Juicy watermelon, field-ripened', stock: 18, location: cityAt(1), harvestDate: '2024-01-13', isFresh: true },
    { id: 25, name: 'Papaya', crop: 'papaya', category: 'Fruits', price: 45, unit: 'kg', farmer: 'Deepa Murali', rating: 4.5, image: '🥭', imageFile: getImageFileForCrop('papaya', 'Papaya'), description: 'Sweet papaya with soft texture', stock: 22, location: cityAt(2), harvestDate: '2024-01-12', isFresh: true },
    { id: 26, name: 'Pomegranate', crop: 'pomegranate', category: 'Fruits', price: 160, unit: 'kg', farmer: 'Harish Babu', rating: 4.8, image: '🍎', imageFile: getImageFileForCrop('pomegranate', 'Pomegranate'), description: 'Deep red arils packed with juice', stock: 16, location: cityAt(3), harvestDate: '2024-01-11', isFresh: true },
    { id: 27, name: 'Cauliflower', crop: 'cauliflower', category: 'Vegetables', price: 48, unit: 'kg', farmer: 'Kavya Iyer', rating: 4.6, image: '🥦', imageFile: getImageFileForCrop('cauliflower', 'Cauliflower'), description: 'Tender florets ideal for roasting', stock: 32, location: cityAt(4), harvestDate: '2024-01-10', isFresh: true },
    { id: 28, name: 'Capsicum', crop: 'capsicum', category: 'Vegetables', price: 60, unit: 'kg', farmer: 'Mohan Lal', rating: 4.5, image: '🫑', imageFile: 'c_f003.png', description: 'Mixed color capsicums, crunchy and sweet', stock: 30, location: cityAt(5), harvestDate: '2024-01-09', isFresh: true },
    { id: 29, name: 'Red Onions', crop: 'onion', category: 'Vegetables', price: 30, unit: 'kg', farmer: 'Savitha R', rating: 4.4, image: '🧅', imageFile: 'o_f001.png', description: 'Firm onions with strong aroma', stock: 55, location: cityAt(6), harvestDate: '2024-01-08', isFresh: true },
    { id: 30, name: 'Potatoes', crop: 'potato', category: 'Vegetables', price: 32, unit: 'kg', farmer: 'Girish Naidu', rating: 4.3, image: '🥔', imageFile: 'potato.jpeg', description: 'Starchy potatoes, great for fries', stock: 70, location: cityAt(7), harvestDate: '2024-01-07', isFresh: true },
    { id: 31, name: 'Cucumbers', crop: 'cucumber', category: 'Vegetables', price: 28, unit: 'kg', farmer: 'Nila Krishna', rating: 4.5, image: '🥒', imageFile: 'cucumberrrr.png', description: 'Cool and crisp cucumbers', stock: 45, location: cityAt(8), harvestDate: '2024-01-06', isFresh: true },
    { id: 32, name: 'Beetroot', crop: 'beetroot', category: 'Vegetables', price: 38, unit: 'kg', farmer: 'Pavithra Mani', rating: 4.6, image: '🫒', imageFile: getImageFileForCrop('beetroot', 'Beetroot'), description: 'Earthy beetroot rich in nutrients', stock: 34, location: cityAt(9), harvestDate: '2024-01-05', isFresh: true },
    { id: 33, name: 'Okra (Lady Finger)', crop: 'okra', category: 'Vegetables', price: 42, unit: 'kg', farmer: 'Ravi Chandran', rating: 4.5, image: '🧄', imageFile: getImageFileForCrop('okra', 'Okra'), description: 'Tender pods, minimal seeds', stock: 38, location: cityAt(0), harvestDate: '2024-01-14', isFresh: true },
    { id: 34, name: 'Brinjal (Eggplant)', crop: 'eggplant', category: 'Vegetables', price: 44, unit: 'kg', farmer: 'Sangeetha M', rating: 4.4, image: '🍆', imageFile: getImageFileForCrop('eggplant', 'Brinjal'), description: 'Glossy purple brinjals, low seeds', stock: 29, location: cityAt(1), harvestDate: '2024-01-13', isFresh: true },
    { id: 35, name: 'Pineapple', crop: 'pineapple', category: 'Fruits', price: 65, unit: 'kg', farmer: 'Jeeva Kumar', rating: 4.6, image: '🍍', imageFile: getImageFileForCrop('pineapple', 'Pineapple'), description: 'Sweet-sour pineapples, field-ripened', stock: 24, location: cityAt(2), harvestDate: '2024-01-12', isFresh: true },
    { id: 36, name: 'Mango (Banganapalli)', crop: 'mango', category: 'Fruits', price: 120, unit: 'kg', farmer: 'Lakshman Rao', rating: 4.9, image: '🥭', imageFile: getImageFileForCrop('mango', 'Mango'), description: 'Aromatic mangoes, naturally ripened', stock: 20, location: cityAt(3), harvestDate: '2024-01-11', isFresh: true },
    { id: 37, name: 'Strawberries', crop: 'strawberry', category: 'Fruits', price: 180, unit: 'kg', farmer: 'Manju Thomas', rating: 4.7, image: '🍓', imageFile: getImageFileForCrop('strawberry', 'Strawberries'), description: 'Bright berries, hand-picked at dawn', stock: 15, location: cityAt(4), harvestDate: '2024-01-10', isFresh: true },
    { id: 38, name: 'Sapota (Chikoo)', crop: 'sapota', category: 'Fruits', price: 70, unit: 'kg', farmer: 'Nirmala Devi', rating: 4.5, image: '🥔', imageFile: getImageFileForCrop('sapota', 'Sapota'), description: 'Sweet chikoo with caramel notes', stock: 26, location: cityAt(5), harvestDate: '2024-01-09', isFresh: true },
    { id: 39, name: 'Guava', crop: 'guava', category: 'Fruits', price: 55, unit: 'kg', farmer: 'Om Prakash', rating: 4.4, image: '🍏', imageFile: getImageFileForCrop('guava', 'Guava'), description: 'Crunchy guavas rich in Vitamin C', stock: 33, location: cityAt(6), harvestDate: '2024-01-08', isFresh: true },
    { id: 40, name: 'Dragon Fruit', crop: 'dragonfruit', category: 'Fruits', price: 220, unit: 'kg', farmer: 'Preethi Raj', rating: 4.6, image: '🐉', imageFile: getImageFileForCrop('dragonfruit', 'Dragon Fruit'), description: 'Exotic fruit, mildly sweet flesh', stock: 12, location: cityAt(7), harvestDate: '2024-01-07', isFresh: true },
    { id: 41, name: 'Fresh Ginger', crop: 'ginger', category: 'Spices', price: 95, unit: 'kg', farmer: 'Siva K', rating: 4.6, image: '🫚', imageFile: getImageFileForCrop('ginger', 'Fresh Ginger'), description: 'Fiery ginger with strong aroma', stock: 28, location: cityAt(8), harvestDate: '2024-01-06', isFresh: true },
    { id: 42, name: 'Fresh Garlic', crop: 'garlic', category: 'Spices', price: 120, unit: 'kg', farmer: 'Tara Menon', rating: 4.7, image: '🧄', imageFile: getImageFileForCrop('garlic', 'Fresh Garlic'), description: 'White garlic, firm cloves', stock: 30, location: cityAt(9), harvestDate: '2024-01-05', isFresh: true },
    { id: 43, name: 'Leafy Coriander', crop: 'coriander', category: 'Herbs', price: 18, unit: 'bunch', farmer: 'Uma Shankar', rating: 4.8, image: '🌿', imageFile: getImageFileForCrop('coriander', 'Leafy Coriander'), description: 'Fragrant coriander bunches', stock: 60, location: cityAt(0), harvestDate: '2024-01-14', isFresh: true },
    { id: 44, name: 'Curry Leaves', crop: 'curryleaves', category: 'Herbs', price: 12, unit: 'bunch', farmer: 'Vani G', rating: 4.8, image: '🌿', imageFile: getImageFileForCrop('curryleaves', 'Curry Leaves'), description: 'Aromatic curry leaves for tadka', stock: 65, location: cityAt(1), harvestDate: '2024-01-13', isFresh: true },
    { id: 45, name: 'Baby Corn', crop: 'babycorn', category: 'Vegetables', price: 90, unit: 'kg', farmer: 'Yogesh N', rating: 4.6, image: '🌽', imageFile: getImageFileForCrop('babycorn', 'Baby Corn'), description: 'Tender baby corn, ready to sauté', stock: 22, location: cityAt(2), harvestDate: '2024-01-12', isFresh: true },
    { id: 46, name: 'Broccoli', crop: 'broccoli', category: 'Vegetables', price: 110, unit: 'kg', farmer: 'Zara F', rating: 4.7, image: '🥦', imageFile: getImageFileForCrop('broccoli', 'Broccoli'), description: 'Tight florets, vibrant green', stock: 18, location: cityAt(3), harvestDate: '2024-01-11', isFresh: true },
    { id: 47, name: 'Sweet Potatoes', crop: 'sweetpotato', category: 'Vegetables', price: 58, unit: 'kg', farmer: 'Anbu Selvan', rating: 4.6, image: '🍠', imageFile: getImageFileForCrop('sweetpotato', 'Sweet Potatoes'), description: 'Sweet potatoes, naturally sweet', stock: 27, location: cityAt(4), harvestDate: '2024-01-10', isFresh: true },
    { id: 48, name: 'Pumpkin', crop: 'pumpkin', category: 'Vegetables', price: 32, unit: 'kg', farmer: 'Bhavna T', rating: 4.4, image: '🎃', imageFile: getImageFileForCrop('pumpkin', 'Pumpkin'), description: 'Deep orange pumpkin, firm flesh', stock: 25, location: cityAt(5), harvestDate: '2024-01-09', isFresh: true },
    { id: 49, name: 'Bottle Gourd', crop: 'bottlegourd', category: 'Vegetables', price: 24, unit: 'kg', farmer: 'Chandan V', rating: 4.3, image: '🥒', imageFile: getImageFileForCrop('bottlegourd', 'Bottle Gourd'), description: 'Tender bottle gourd, light green skin', stock: 36, location: cityAt(6), harvestDate: '2024-01-08', isFresh: true },
    { id: 50, name: 'Mushrooms', crop: 'mushroom', category: 'Vegetables', price: 160, unit: 'kg', farmer: 'Divya P', rating: 4.7, image: '🍄', imageFile: getImageFileForCrop('mushroom', 'Mushrooms'), description: 'Button mushrooms, clean and firm', stock: 14, location: cityAt(7), harvestDate: '2024-01-07', isFresh: true },
    { id: 51, name: 'Fresh Lime', crop: 'lime', category: 'Fruits', price: 18, unit: 'dozen', farmer: 'Eashwar K', rating: 4.6, image: '🍋', imageFile: getImageFileForCrop('lime', 'Fresh Lime'), description: 'Juicy limes packed with zing', stock: 40, location: cityAt(8), harvestDate: '2024-01-06', isFresh: true },
    { id: 52, name: 'Pearl Millet (Bajra)', crop: 'bajra', category: 'Grains', price: 48, unit: 'kg', farmer: 'Farhan S', rating: 4.5, image: '🌾', imageFile: getImageFileForCrop('bajra', 'Pearl Millet'), description: 'Locally grown bajra, sun-dried', stock: 50, location: cityAt(9), harvestDate: '2024-01-05', isFresh: true },
    { id: 53, name: 'Barnyard Millet', crop: 'millet', category: 'Grains', price: 62, unit: 'kg', farmer: 'Gopika L', rating: 4.5, image: '🌾', imageFile: getImageFileForCrop('millet', 'Barnyard Millet'), description: 'Light millet, quick to cook', stock: 45, location: cityAt(0), harvestDate: '2024-01-14', isFresh: true },
    { id: 54, name: 'Fresh Paneer', crop: 'paneer', category: 'Dairy', price: 320, unit: 'kg', farmer: 'Hari Om Dairy', rating: 4.9, image: '🧀', imageFile: getImageFileForCrop('paneer', 'Fresh Paneer'), description: 'Soft paneer, packed same day', stock: 18, location: cityAt(1), harvestDate: '2024-01-13', isFresh: true },
    { id: 55, name: 'Country Eggs', crop: 'egg', category: 'Dairy', price: 110, unit: 'dozen', farmer: 'Indira Poultry', rating: 4.8, image: '🥚', imageFile: getImageFileForCrop('egg', 'Country Eggs'), description: 'Free-range eggs, protein rich', stock: 22, location: cityAt(2), harvestDate: '2024-01-12', isFresh: true },
    { id: 56, name: 'Fresh Yogurt', crop: 'yogurt', category: 'Dairy', price: 90, unit: 'kg', farmer: 'Jayanth Dairy', rating: 4.7, image: '🥛', imageFile: getImageFileForCrop('yogurt', 'Fresh Yogurt'), description: 'Thick curd, set in earthen pots', stock: 20, location: cityAt(3), harvestDate: '2024-01-11', isFresh: true },
    // A couple of items flagged as not-so-fresh to let customers decide
    { id: 57, name: 'Late Harvest Tomatoes', crop: 'tomato', category: 'Vegetables', price: 22, unit: 'kg', farmer: 'Kumar M', rating: 3.9, image: '🍅', imageFile: 'download.jpeg', description: 'Softer tomatoes, suitable for sauces', stock: 18, location: cityAt(4), harvestDate: '2024-01-04', isFresh: false },
    { id: 58, name: 'Ripened Bananas', crop: 'banana', category: 'Fruits', price: 28, unit: 'dozen', farmer: 'Latha S', rating: 4.0, image: '🍌', imageFile: 'b_r002.png', description: 'Very ripe bananas, great for shakes', stock: 16, location: cityAt(5), harvestDate: '2024-01-03', isFresh: false }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Fetch live prices for selected region based on weather-aware price service
  useEffect(() => {
    const fetchRegionPrices = async () => {
      if (!region) return;
      try {
        const crops = Array.from(
          new Set(
            mockProducts
              .map((p) => p.crop)
              .filter(Boolean)
          )
        );
        if (!crops.length) return;
        const responses = await Promise.all(
          crops.map((crop) =>
            axios.post(
              PREDICT_PRICE_ENDPOINT,
              {
                crop,
                city: region,
                buyer_qty: 1,
                seller_qty: 5,
              },
              { timeout: 10000 }
            )
          )
        );
        const prices = {};
        responses.forEach((res, idx) => {
          prices[crops[idx]] = res.data?.predicted_price ?? null;
        });
        setLivePrices(prices);
      } catch (err) {
        console.error('Failed to fetch live prices for region', region, err);
        setLivePrices({});
      }
    };

    fetchRegionPrices();
  }, [region]);

  useEffect(() => {
    // Filter and sort products
    const term = searchTerm.trim().toLowerCase();

    let filtered = products.filter(product => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const matchesRegion =
        !region || product.location.toLowerCase().includes(region.toLowerCase());

      if (!matchesCategory || !matchesRegion) return false;

      if (term === '') return true;

      const nameWords = product.name.toLowerCase().split(/\s+/);
      const farmerWords = product.farmer.toLowerCase().split(/\s+/);

      const matchesSearch =
        nameWords.some(word => word.startsWith(term)) ||
        farmerWords.some(word => word.startsWith(term)) ||
        product.category.toLowerCase().startsWith(term);

      return matchesSearch;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy, region]);

  const addToCart = (product) => {
    const quantity = productQuantities[product.id] || 1;
    if (quantity <= 0 || quantity > product.stock) {
      alert(`Please enter a valid quantity (1-${product.stock})`);
      return;
    }
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      const updatedCart = existingItem
        ? prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
        : [...prev, { ...product, quantity: quantity }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    // Reset quantity input after adding to cart
    setProductQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const checkFreshnessForProduct = async (product) => {
    // Use product.imageFile or fallback to a default image
    const imageFile = product.imageFile || getImageFileForCrop(product.crop, product.name);
    if (!imageFile) {
      alert('No image available for freshness check');
      return;
    }
    setCheckingId(product.id);
    setFreshness(prev => ({
      ...prev,
      [product.id]: { ...prev[product.id], status: 'loading', error: null }
    }));
    try {
      const res = await fetch(`${API_BASE_URL}/predict_uploaded?file=${encodeURIComponent(imageFile)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to check freshness');
      }
      setFreshness(prev => ({
        ...prev,
        [product.id]: {
          status: 'done',
          label: data.prediction,
          confidence: data.confidence
        }
      }));
    } catch (err) {
      setFreshness(prev => ({
        ...prev,
        [product.id]: { status: 'error', error: err.message }
      }));
    } finally {
      setCheckingId(null);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading fresh farm products...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">🛒 Fresh Farm Products</h1>
          <p>Discover quality-assured produce directly from local farmers</p>
        </div>

        {/* Region, Filters and Search */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Select Region:
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="form-input"
                  style={{ minWidth: '170px' }}
                >
                  {cityList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input"
                  style={{ minWidth: '150px' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Sort By:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                  style={{ minWidth: '150px' }}
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                  Search:
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  placeholder="Search products or farmers..."
                  style={{ minWidth: '200px' }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                {filteredProducts.length} products found
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div style={{
                fontSize: '3rem',
                textAlign: 'center',
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e9ecef'
              }}>
                {product.image}
              </div>

              <div className="product-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="product-title">{product.name}</span>
                  <button
                    onClick={() => checkFreshnessForProduct(product)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    disabled={checkingId === product.id}
                  >
                    {checkingId === product.id ? 'Checking...' : 'Model Quality'}
                  </button>
                </div>
                <div className="product-price">
                  ₹
                  {product.crop && livePrices[product.crop] != null
                    ? livePrices[product.crop].toFixed(2)
                    : product.price}
                  /{product.unit}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                  by {product.farmer}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#ffc107', marginBottom: '0.5rem' }}>
                  ⭐ {product.rating}/5.0
                </div>
                {(() => {
                  const f = freshness[product.id];
                  if (!f || f.status === 'idle') return null;
                  if (f.status === 'loading') return null;
                  if (f.status === 'error') {
                    return (
                      <div style={{ fontSize: '0.8rem', color: '#dc3545', marginBottom: '0.5rem' }}>
                        Could not check quality. Please try again.
                      </div>
                    );
                  }
                  const isFreshPred =
                    typeof f.label === 'string' &&
                    f.label.toLowerCase().includes('fresh');
                  return (
                    <div
                      style={{
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        color: isFreshPred ? '#2e7d32' : '#c26a00',
                        fontWeight: 600
                      }}
                    >
                      {isFreshPred ? 'Predicted: Fresh' : 'Predicted: Rotten'}
                      {typeof f.confidence === 'number'
                        ? ` • ${(f.confidence * 100).toFixed(1)}%`
                        : ''}
                    </div>
                  );
                })()}

                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
                  {product.description}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '1rem' }}>
                  <div>📍 {product.location}</div>
                  <div>📅 Harvested: {product.harvestDate}</div>
                  <div>📦 Stock: {product.stock} {product.unit}</div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Products Found</h3>
            <p style={{ color: '#6c757d' }}>
              Try adjusting your search criteria or browse all categories.
            </p>
          </div>
        )}

        {/* Shopping Cart Sidebar */}
        {cart.length > 0 && (
          <div style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '300px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e9ecef' }}>
              <h4 style={{ margin: 0, color: '#28a745' }}>🛒 Shopping Cart</h4>
            </div>

            <div style={{ padding: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{
                  padding: '0.5rem',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        ₹{item.price}/{item.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      style={{
                        padding: '2px 8px',
                        border: '1px solid #e9ecef',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      style={{
                        padding: '2px 8px',
                        border: '1px solid #e9ecef',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem' }}>
                  <span>Total:</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/cart')}>
                  View Cart & Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;
