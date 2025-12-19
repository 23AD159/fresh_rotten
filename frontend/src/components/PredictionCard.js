export default function PredictionCard({ prediction, confidence, file }) {
    return (
      <div className="p-6 bg-green-100 rounded shadow-md text-center">
        <img src={file} alt="Result" className="w-40 mx-auto rounded mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Prediction: <span className="text-indigo-600">{prediction}</span></h2>
        <p className="text-gray-700">Confidence: {(confidence * 100).toFixed(2)}%</p>
      </div>
    );
  }
  