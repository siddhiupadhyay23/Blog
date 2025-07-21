import { useState } from 'react';

export default function MiniImageUpload({ onImageSelected }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Compress image to reduce size
  const compressImage = (file, maxWidth = 800) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if width is greater than maxWidth
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed data URL (0.7 quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Compress the image
      const compressedDataUrl = await compressImage(file);
      
      setPreview(compressedDataUrl);
      onImageSelected(compressedDataUrl);
    } catch (error) {
      console.error('Error compressing image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-dashed border-gray-300 p-4 rounded-lg mb-4">
      <p className="mb-2 text-sm">Select an image for your post:</p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
        disabled={loading}
      />
      {loading && <p className="mt-2 text-sm text-blue-500">Processing image...</p>}
      {preview && (
        <div className="mt-3">
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded"
          />
          <p className="mt-1 text-xs text-gray-500">Image compressed for better performance</p>
        </div>
      )}
    </div>
  );
}