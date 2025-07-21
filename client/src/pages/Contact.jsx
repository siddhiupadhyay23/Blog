import { useState } from 'react';
import { Button, Label, TextInput, Textarea, Alert } from 'flowbite-react';
import { HiMail, HiUser, HiDocumentText } from 'react-icons/hi';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // For now, let's use a simpler approach without API calls
      // This ensures the form works even if the backend isn't ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the message in localStorage for demonstration
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
      messages.push({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('contact_messages', JSON.stringify(messages));
      
      console.log('Message saved:', formData);
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      
      <div className="mb-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Have a question or feedback? We'd love to hear from you!
        </p>
      </div>
      
      {success && (
        <Alert color="success" className="mb-6">
          <p className="font-medium">Message sent successfully!</p>
          <p>We'll get back to you as soon as possible.</p>
        </Alert>
      )}
      
      {error && (
        <Alert color="failure" className="mb-6">
          <p>{error}</p>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name" value="Your Name" />
          <TextInput
            id="name"
            type="text"
            icon={HiUser}
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="email" value="Your Email" />
          <TextInput
            id="email"
            type="email"
            icon={HiMail}
            placeholder="name@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="subject" value="Subject" />
          <TextInput
            id="subject"
            type="text"
            icon={HiDocumentText}
            placeholder="How can we help you?"
            required
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="message" value="Your Message" />
          <Textarea
            id="message"
            placeholder="Leave a comment..."
            required
            rows={6}
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        
        <Button 
          type="submit" 
          gradientDuoTone="purpleToPink"
          disabled={loading}
          className="mt-2"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}