import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useState } from 'react';

export default function ImageUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  });

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post("http://localhost:5000/predict", formData);
    onResult({ ...res.data, file: preview });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg text-center">
      <div {...getRootProps()} className="cursor-pointer border-2 border-dashed p-6 rounded-md">
        <input {...getInputProps()} />
        <p>📷 Drag & drop an image or click to select</p>
      </div>
      {preview && (
        <>
          <img src={preview} alt="Preview" className="mx-auto mt-4 max-h-60 rounded-lg" />
          <button onClick={handleSubmit} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Predict
          </button>
        </>
      )}
    </div>
  );
}
