import { useState } from 'react';
import { Button, Alert } from 'flowbite-react';

export default function SimpleImageUpload({ onImageSelected }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
      if (onImageSelected) {
        onImageSelected(event.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-dashed border-gray-300 p-4 rounded-lg mb-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {error && (
        <Alert color="failure" className="mt-2 mb-2">
          {error}
        </Alert>
      )}

      {preview && (
        <div className="mt-3">
          <p className="text-sm font-medium mb-1">Preview:</p>
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded border border-gray-300"
          />
        </div>
      )}
    </div>
  );
}