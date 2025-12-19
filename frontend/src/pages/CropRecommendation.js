import React, { useState, useEffect } from 'react';

const CropRecommendation = () => {
  const [soilData, setSoilData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    temperature: '',
    rainfall: '',
    humidity: '',
    soilType: ''
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const soilTypes = [
    'Clay', 'Loam', 'Sandy', 'Silt', 'Black Soil', 'Red Soil', 'Laterite', 'Mountain'
  ];

  useEffect(() => {
    // Get user data to pre-fill soil type if available
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.soilType) {
        setSoilData(prev => ({ ...prev, soilType: user.soilType }));
      }
    }
  }, []);

  const handleChange = (e) => {
    setSoilData({
      ...soilData,
      [e.target.name]: e.target.value
    });
  };

  const analyzeSoil = async () => {
    // Validate required fields
    const requiredFields = ['nitrogen', 'phosphorus', 'potassium', 'ph', 'temperature', 'rainfall', 'humidity', 'soilType'];
    const missingFields = requiredFields.filter(field => !soilData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setRecommendations(null);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate recommendations based on soil data
      const recs = generateRecommendations(soilData);
      setRecommendations(recs);
    } catch (err) {
      setError('Failed to analyze soil data. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendations = (data) => {
    const { nitrogen, phosphorus, potassium, ph, temperature, rainfall, humidity, soilType } = data;
    
    let recommendations = {
      bestCrops: [],
      moderateCrops: [],
      avoidCrops: [],
      soilHealth: '',
      suggestions: [],
      riskFactors: []
    };

    // Nitrogen analysis
    if (nitrogen < 50) {
      recommendations.suggestions.push('Low nitrogen levels detected. Consider adding organic fertilizers or legume cover crops.');
      recommendations.riskFactors.push('Nitrogen deficiency may limit crop growth');
    } else if (nitrogen > 200) {
      recommendations.suggestions.push('High nitrogen levels. Avoid excessive fertilizer application.');
    }

    // Phosphorus analysis
    if (phosphorus < 30) {
      recommendations.suggestions.push('Low phosphorus levels. Consider bone meal or rock phosphate applications.');
      recommendations.riskFactors.push('Phosphorus deficiency affects root development');
    }

    // pH analysis
    if (ph < 6.0) {
      recommendations.suggestions.push('Soil is acidic. Consider liming to raise pH levels.');
      recommendations.bestCrops.push('Potatoes', 'Blueberries', 'Raspberries');
    } else if (ph > 7.5) {
      recommendations.suggestions.push('Soil is alkaline. Consider sulfur applications to lower pH.');
      recommendations.bestCrops.push('Asparagus', 'Beans', 'Broccoli');
    } else {
      recommendations.bestCrops.push('Most crops will grow well in neutral pH soil');
    }

    // Temperature and rainfall analysis
    if (temperature > 25 && rainfall > 100) {
      recommendations.bestCrops.push('Rice', 'Corn', 'Sugarcane', 'Cotton');
    } else if (temperature < 20 && rainfall < 50) {
      recommendations.bestCrops.push('Wheat', 'Barley', 'Oats', 'Peas');
    }

    // Soil type specific recommendations
    switch (soilType.toLowerCase()) {
      case 'clay':
        recommendations.bestCrops.push('Rice', 'Wheat', 'Cabbage', 'Broccoli');
        recommendations.suggestions.push('Clay soil retains water well but may need organic matter for better drainage.');
        break;
      case 'loam':
        recommendations.bestCrops.push('Most crops grow well in loam soil');
        recommendations.suggestions.push('Loam soil is ideal for farming. Maintain organic matter content.');
        break;
      case 'sandy':
        recommendations.bestCrops.push('Root vegetables', 'Carrots', 'Potatoes', 'Onions');
        recommendations.suggestions.push('Sandy soil drains quickly. Add organic matter to improve water retention.');
        break;
      case 'black soil':
        recommendations.bestCrops.push('Cotton', 'Sugarcane', 'Wheat', 'Soybeans');
        recommendations.suggestions.push('Black soil is rich in minerals. Monitor for proper drainage.');
        break;
      case 'red soil':
        recommendations.bestCrops.push('Groundnuts', 'Millets', 'Pulses');
        recommendations.suggestions.push('Red soil may need pH adjustment and organic matter addition.');
        break;
    }

    // Overall soil health assessment
    const healthScore = calculateHealthScore(data);
    if (healthScore >= 80) {
      recommendations.soilHealth = 'Excellent - Your soil is in great condition for farming';
    } else if (healthScore >= 60) {
      recommendations.soilHealth = 'Good - Minor improvements can enhance crop yields';
    } else if (healthScore >= 40) {
      recommendations.soilHealth = 'Fair - Several improvements needed for optimal farming';
    } else {
      recommendations.soilHealth = 'Poor - Significant soil improvement required before farming';
    }

    return recommendations;
  };

  const calculateHealthScore = (data) => {
    let score = 100;
    
    // Deduct points for deficiencies
    if (data.nitrogen < 50) score -= 20;
    if (data.phosphorus < 30) score -= 20;
    if (data.potassium < 50) score -= 15;
    if (data.ph < 6.0 || data.ph > 7.5) score -= 15;
    if (data.temperature < 15 || data.temperature > 35) score -= 10;
    
    return Math.max(0, score);
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🌾 AI Crop Recommendation System</h2>
              <p>Get personalized crop suggestions based on your soil analysis and environmental conditions</p>
            </div>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <div className="grid grid-2">
              {/* Soil Data Input Form */}
              <div>
                <h3 style={{ marginBottom: '1.5rem', color: '#28a745' }}>Soil Analysis Data</h3>
                
                <div className="form-group">
                  <label className="form-label">Nitrogen (N) - ppm *</label>
                  <input
                    type="number"
                    name="nitrogen"
                    value={soilData.nitrogen}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0-300"
                    min="0"
                    max="300"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Typical range: 50-200 ppm</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Phosphorus (P) - ppm *</label>
                  <input
                    type="number"
                    name="phosphorus"
                    value={soilData.phosphorus}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Typical range: 30-80 ppm</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Potassium (K) - ppm *</label>
                  <input
                    type="number"
                    name="potassium"
                    value={soilData.potassium}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0-200"
                    min="0"
                    max="200"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Typical range: 50-150 ppm</small>
                </div>

                <div className="form-group">
                  <label className="form-label">pH Level *</label>
                  <input
                    type="number"
                    name="ph"
                    value={soilData.ph}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="4.0-9.0"
                    min="4.0"
                    max="9.0"
                    step="0.1"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Optimal range: 6.0-7.5</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Temperature (°C) *</label>
                  <input
                    type="number"
                    name="temperature"
                    value={soilData.temperature}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="10-40"
                    min="10"
                    max="40"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Average growing season temperature</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Rainfall (mm/month) *</label>
                  <input
                    type="number"
                    name="rainfall"
                    value={soilData.rainfall}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0-500"
                    min="0"
                    max="500"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Monthly average rainfall</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Humidity (%) *</label>
                  <input
                    type="number"
                    name="humidity"
                    value={soilData.humidity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="20-90"
                    min="20"
                    max="90"
                    required
                  />
                  <small style={{ color: '#6c757d' }}>Average relative humidity</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Soil Type *</label>
                  <select
                    name="soilType"
                    value={soilData.soilType}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={analyzeSoil}
                  className="btn btn-primary"
                  disabled={isAnalyzing}
                  style={{ width: '100%' }}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="spinner" style={{ width: '20px', height: '20px', margin: '0 0.5rem 0 0' }}></span>
                      Analyzing Soil Data...
                    </>
                  ) : (
                    '🔍 Analyze & Get Recommendations'
                  )}
                </button>
              </div>

              {/* Recommendations Display */}
              <div>
                <h3 style={{ marginBottom: '1.5rem', color: '#28a745' }}>AI Recommendations</h3>
                
                {!recommendations ? (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                    <p>Fill in your soil analysis data and click "Analyze" to get personalized crop recommendations.</p>
                  </div>
                ) : (
                  <div>
                    {/* Soil Health Score */}
                    <div className="card" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>Soil Health Assessment</h4>
                      <p style={{ fontSize: '1.1rem' }}>{recommendations.soilHealth}</p>
                    </div>

                    {/* Best Crops */}
                    <div className="card" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>🌾 Recommended Crops</h4>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {recommendations.bestCrops.map((crop, index) => (
                          <li key={index} style={{ 
                            padding: '0.5rem', 
                            backgroundColor: '#d4edda', 
                            marginBottom: '0.5rem', 
                            borderRadius: '4px',
                            color: '#155724'
                          }}>
                            ✓ {crop}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div className="card" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>💡 Improvement Suggestions</h4>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {recommendations.suggestions.map((suggestion, index) => (
                          <li key={index} style={{ 
                            padding: '0.5rem', 
                            backgroundColor: '#fff3cd', 
                            marginBottom: '0.5rem', 
                            borderRadius: '4px',
                            color: '#856404'
                          }}>
                            💡 {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risk Factors */}
                    {recommendations.riskFactors.length > 0 && (
                      <div className="card">
                        <h4 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>⚠️ Risk Factors</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {recommendations.riskFactors.map((risk, index) => (
                            <li key={index} style={{ 
                              padding: '0.5rem', 
                              backgroundColor: '#f8d7da', 
                              marginBottom: '0.5rem', 
                              borderRadius: '4px',
                              color: '#721c24'
                            }}>
                              ⚠️ {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Information Section */}
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '1rem', color: '#28a745' }}>How It Works:</h4>
              <ol style={{ fontSize: '0.9rem', color: '#6c757d', paddingLeft: '1.5rem' }}>
                <li>Input your soil analysis data (NPK values, pH, temperature, etc.)</li>
                <li>Our AI system analyzes the data against optimal growing conditions</li>
                <li>Get personalized crop recommendations based on your soil profile</li>
                <li>Receive improvement suggestions to enhance soil health</li>
                <li>Understand risk factors that may affect crop yields</li>
              </ol>
              
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                <h5 style={{ color: '#28a745', marginBottom: '0.5rem' }}>💡 Tips for Better Results:</h5>
                <ul style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  <li>Use recent soil test results for accurate recommendations</li>
                  <li>Consider seasonal variations in temperature and rainfall</li>
                  <li>Regular soil testing helps track improvement over time</li>
                  <li>Combine AI recommendations with local farming expertise</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
