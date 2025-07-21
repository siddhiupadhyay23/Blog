import { useState } from 'react';
import { Button, Alert } from 'flowbite-react';

export default function ImageUploader({ onImageUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle direct data URL usage
  const useDataUrl = () => {
    if (preview) {
      onImageUploaded(preview);
    }
  };

  // Handle upload to server
  const uploadToServer = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Get auth token from cookies
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };
      const token = getCookie('access_token');

      // Upload the image
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onImageUploaded(data.url);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
      
      // If server upload fails, offer to use data URL instead
      setPreview(preview);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Image Upload</h3>
      
      <div className="mb-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {preview && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Preview:</p>
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-40 rounded border border-gray-300" 
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          gradientDuoTone="purpleToBlue"
          onClick={uploadToServer}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload to Server'}
        </Button>
        
        {preview && (
          <Button
            size="sm"
            color="light"
            onClick={useDataUrl}
          >
            Use as Data URL
          </Button>
        )}
      </div>

      {error && (
        <Alert color="failure" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  );
}