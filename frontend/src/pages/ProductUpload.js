import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

const ProductUpload = () => {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    harvestDate: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Herbs', 'Spices', 'Dairy', 'Other'
  ];

  const units = ['kg', 'g', 'pieces', 'dozen', 'quintal'];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setUploadedImage(acceptedFiles[0]);
        setAiResult(null);
        setError('');
      }
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async () => {
    if (!uploadedImage) {
      setError('Please select an image first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', uploadedImage);

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        setAiResult(result);
        
        if (result.prediction === 'fresh') {
          setSuccess('✅ AI Quality Check Passed! Your product meets our quality standards.');
        } else {
          setError('❌ AI Quality Check Failed! Please upload a better quality image or different product.');
        }
      } else {
        throw new Error('Failed to analyze image');
      }
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedImage) {
      setError('Please upload a product image');
      return;
    }

    if (!aiResult || aiResult.prediction !== 'fresh') {
      setError('Please pass the AI quality check before submitting');
      return;
    }

    // Simulate product upload
    setSuccess('Product uploaded successfully! Redirecting to dashboard...');
    setTimeout(() => {
      navigate('/farmer-dashboard');
    }, 2000);
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upload New Product</h2>
              <p>Add your farm products with AI-powered quality verification</p>
            </div>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            {success && (
              <div className="alert alert-success">{success}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Product Image *</label>
                <div
                  {...getRootProps()}
                  style={{
                    border: '2px dashed #28a745',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? '#f8f9fa' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <input {...getInputProps()} />
                  {uploadedImage ? (
                    <div>
                      <img
                        src={URL.createObjectURL(uploadedImage)}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <p style={{ marginTop: '1rem', color: '#28a745' }}>
                        ✓ {uploadedImage.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                      {isDragActive ? (
                        <p>Drop the image here...</p>
                      ) : (
                        <p>Drag & drop an image here, or click to select</p>
                      )}
                      <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem' }}>
                        Supports: JPG, PNG, JPEG
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Quality Check Button */}
              {uploadedImage && !aiResult && (
                <div className="form-group">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="btn btn-primary"
                    disabled={isUploading}
                    style={{ width: '100%' }}
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner" style={{ width: '20px', height: '20px', margin: '0 0.5rem 0 0' }}></span>
                        Analyzing Image...
                      </>
                    ) : (
                      '🔍 Run AI Quality Check'
                    )}
                  </button>
                </div>
              )}

              {/* AI Result Display */}
              {aiResult && (
                <div className="form-group">
                  <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: aiResult.prediction === 'fresh' ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${aiResult.prediction === 'fresh' ? '#c3e6cb' : '#f5c6cb'}`,
                    color: aiResult.prediction === 'fresh' ? '#155724' : '#721c24'
                  }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>
                      {aiResult.prediction === 'fresh' ? '✅ Quality Check Passed' : '❌ Quality Check Failed'}
                    </h4>
                    <p><strong>Prediction:</strong> {aiResult.prediction}</p>
                    <p><strong>Confidence:</strong> {(aiResult.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {/* Product Details Form */}
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Fresh Tomatoes"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Harvest Date *</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="Describe your product, farming methods, special features..."
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={!aiResult || aiResult.prediction !== 'fresh'}
              >
                Upload Product
              </button>
            </form>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '1rem', color: '#28a745' }}>AI Quality Check Process:</h4>
              <ol style={{ fontSize: '0.9rem', color: '#6c757d', paddingLeft: '1.5rem' }}>
                <li>Upload a clear image of your product</li>
                <li>Click "Run AI Quality Check" to analyze the image</li>
                <li>Our AI model will assess freshness and quality</li>
                <li>Only quality-approved products can be listed</li>
                <li>Fill in product details and submit</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUpload;
