import { Alert } from 'flowbite-react';

export default function ImageUploadHelp() {
  return (
    <Alert color="info" className="mb-4">
      <div className="font-medium mb-1">Image Upload Tips:</div>
      <ul className="list-disc pl-5 text-sm">
        <li>Select an image from your device to add to your post</li>
        <li>Images are converted to data URLs and embedded directly in your post</li>
        <li>For best performance, use images under 2MB in size</li>
        <li>Supported formats: JPEG, PNG, GIF, WebP</li>
      </ul>
    </Alert>
  );
}