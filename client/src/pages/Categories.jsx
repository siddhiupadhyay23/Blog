import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryColors = {
    lifestyle: 'bg-pink-100 text-pink-800',
    technology: 'bg-blue-100 text-blue-800',
    health: 'bg-green-100 text-green-800',
    travel: 'bg-yellow-100 text-yellow-800',
    fashion: 'bg-purple-100 text-purple-800',
    diy: 'bg-orange-100 text-orange-800',
    uncategorized: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/post/getposts?limit=100');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch posts');
        }
        
        // Extract unique categories from posts
        const uniqueCategories = [...new Set(data.posts.map(post => post.category))];
        
        // Count posts in each category
        const categoriesWithCount = uniqueCategories.map(category => {
          return {
            name: category,
            count: data.posts.filter(post => post.category === category).length
          };
        });
        
        setCategories(categoriesWithCount);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 min-h-screen">
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          <p>Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Blog Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.name} 
            to={`/search?category=${category.name}`}
            className="block"
          >
            <div className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${categoryColors[category.name] || 'bg-gray-100'}`}>
              <h2 className="text-xl font-semibold capitalize mb-2">{category.name}</h2>
              <p className="text-sm opacity-75">{category.count} {category.count === 1 ? 'post' : 'posts'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}