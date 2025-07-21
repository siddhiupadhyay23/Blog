import { useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { HiMail } from 'react-icons/hi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    try {
      // You can create a newsletter API endpoint later
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store email in localStorage for now
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }
      
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <h3 className="text-lg font-medium mb-2">Subscribe to our Newsletter</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Get the latest posts delivered right to your inbox
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <TextInput
          id="email"
          type="email"
          placeholder="name@example.com"
          required
          icon={HiMail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Button 
          type="submit" 
          disabled={loading}
          gradientDuoTone="purpleToPink"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      
      {status === 'success' && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          Thanks for subscribing!
        </p>
      )}
      
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}