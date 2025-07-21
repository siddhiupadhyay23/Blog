import { useEffect } from 'react';

// This component adds an example message to localStorage when mounted
export default function ExampleMessage() {
  useEffect(() => {
    // Check if we already have example messages
    const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    
    if (messages.length === 0) {
      // Add an example message
      const exampleMessage = {
        id: Date.now(),
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hello from a visitor',
        message: 'Hi there! This is an example message to demonstrate how the message system works. You can view this message in your admin dashboard under the Messages tab.',
        createdAt: new Date().toISOString(),
        read: false
      };
      
      localStorage.setItem('contact_messages', JSON.stringify([exampleMessage]));
      console.log('Added example message to localStorage');
    }
  }, []);
  
  return null; // This component doesn't render anything
}