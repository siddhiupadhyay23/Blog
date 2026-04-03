// Backend API endpoint for photo selection
// File: /api/ai/select-photo.js (or similar route)
import express from 'express';
const router = express.Router();
// You'll need to install and configure these:
// npm install axios
import axios from 'axios';

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // Add to your .env file
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Photo selection endpoint
router.post('/', async (req, res) => {
  try {
    const { query, category, title, orientation = 'landscape', size = 'regular' } = req.body;
    
    if (!query || !category) {
      return res.status(400).json({
        success: false,
        error: 'Query and category are required'
      });
    }

    console.log('Selecting photo for:', { query, category, title });

    // Method 1: Try Unsplash API if API key is available
    if (UNSPLASH_ACCESS_KEY) {
      try {
        const unsplashResponse = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
          params: {
            query: query,
            orientation: orientation,
            per_page: 10,
            order_by: 'relevant'
          },
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        });

        if (unsplashResponse.data.results && unsplashResponse.data.results.length > 0) {
          // Select a random photo from the results for variety
          const randomIndex = Math.floor(Math.random() * Math.min(5, unsplashResponse.data.results.length));
          const selectedPhoto = unsplashResponse.data.results[randomIndex];
          
          // Get the appropriate size URL
          const imageUrl = selectedPhoto.urls[size] || selectedPhoto.urls.regular;
          
          return res.json({
            success: true,
            imageUrl: imageUrl,
            attribution: `Photo by ${selectedPhoto.user.name} on Unsplash`,
            description: selectedPhoto.description || selectedPhoto.alt_description || query,
            source: 'unsplash',
            photoId: selectedPhoto.id,
            photographer: selectedPhoto.user.name,
            photographerUrl: selectedPhoto.user.links.html
          });
        }
      } catch (unsplashError) {
        console.error('Unsplash API error:', unsplashError.message);
        // Continue to fallback method
      }
    }

    // Method 2: Fallback to Pexels API (free alternative)
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY; // Add to your .env file
    
    if (PEXELS_API_KEY) {
      try {
        const pexelsResponse = await axios.get('https://api.pexels.com/v1/search', {
          params: {
            query: query,
            per_page: 10,
            orientation: orientation
          },
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        });

        if (pexelsResponse.data.photos && pexelsResponse.data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, pexelsResponse.data.photos.length));
          const selectedPhoto = pexelsResponse.data.photos[randomIndex];
          
          return res.json({
            success: true,
            imageUrl: selectedPhoto.src.large || selectedPhoto.src.original,
            attribution: `Photo by ${selectedPhoto.photographer} on Pexels`,
            description: selectedPhoto.alt || query,
            source: 'pexels',
            photoId: selectedPhoto.id,
            photographer: selectedPhoto.photographer,
            photographerUrl: selectedPhoto.photographer_url
          });
        }
      } catch (pexelsError) {
        console.error('Pexels API error:', pexelsError.message);
        // Continue to fallback method
      }
    }

    // Method 3: Fallback to Pixabay API (another free alternative)
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY; // Add to your .env file
    
    if (PIXABAY_API_KEY) {
      try {
        const pixabayResponse = await axios.get('https://pixabay.com/api/', {
          params: {
            key: PIXABAY_API_KEY,
            q: query,
            image_type: 'photo',
            orientation: orientation === 'landscape' ? 'horizontal' : orientation === 'portrait' ? 'vertical' : 'all',
            category: mapCategoryToPixabay(category),
            min_width: 1920,
            min_height: 1080,
            per_page: 10,
            safesearch: 'true'
          }
        });

        if (pixabayResponse.data.hits && pixabayResponse.data.hits.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, pixabayResponse.data.hits.length));
          const selectedPhoto = pixabayResponse.data.hits[randomIndex];
          
          return res.json({
            success: true,
            imageUrl: selectedPhoto.largeImageURL || selectedPhoto.webformatURL,
            attribution: `Image by ${selectedPhoto.user} from Pixabay`,
            description: selectedPhoto.tags || query,
            source: 'pixabay',
            photoId: selectedPhoto.id,
            photographer: selectedPhoto.user,
            photographerUrl: `https://pixabay.com/users/${selectedPhoto.user}-${selectedPhoto.user_id}/`
          });
        }
      } catch (pixabayError) {
        console.error('Pixabay API error:', pixabayError.message);
        // Continue to final fallback
      }
    }

    // Method 4: Final fallback to Lorem Picsum (placeholder images)
    const getLoremPicsumUrl = () => {
      const width = orientation === 'portrait' ? 800 : 1200;
      const height = orientation === 'portrait' ? 1200 : 800;
      const seed = Math.floor(Math.random() * 1000);
      return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    };

    return res.json({
      success: true,
      imageUrl: getLoremPicsumUrl(),
      attribution: 'Placeholder image from Lorem Picsum',
      description: `Placeholder image for ${query}`,
      source: 'lorem-picsum',
      photoId: `placeholder-${Date.now()}`,
      photographer: 'Lorem Picsum',
      photographerUrl: 'https://picsum.photos'
    });

  } catch (error) {
    console.error('Photo selection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to select photo',
      details: error.message
    });
  }
});

// Helper function to map general categories to Pixabay categories
function mapCategoryToPixabay(category) {
  const categoryMap = {
    'food': 'food',
    'travel': 'places',
    'technology': 'computer',
    'business': 'business',
    'health': 'health',
    'education': 'education',
    'sports': 'sports',
    'nature': 'nature',
    'animals': 'animals',
    'fashion': 'fashion',
    'science': 'science',
    'music': 'music',
    'art': 'backgrounds',
    'transportation': 'transportation',
    'people': 'people'
  };
  
  return categoryMap[category.toLowerCase()] || '';
}

// Additional endpoint to get photo by ID (useful for consistent selection)
router.get('/photo/:source/:id', async (req, res) => {
  try {
    const { source, id } = req.params;
    
    switch (source) {
      case 'unsplash':
        if (UNSPLASH_ACCESS_KEY) {
          const response = await axios.get(`${UNSPLASH_API_URL}/photos/${id}`, {
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
          });
          
          return res.json({
            success: true,
            imageUrl: response.data.urls.regular,
            attribution: `Photo by ${response.data.user.name} on Unsplash`,
            description: response.data.description || response.data.alt_description,
            source: 'unsplash',
            photoId: response.data.id,
            photographer: response.data.user.name,
            photographerUrl: response.data.user.links.html
          });
        }
        break;
        
      case 'pexels':
        if (PEXELS_API_KEY) {
          const response = await axios.get(`https://api.pexels.com/v1/photos/${id}`, {
            headers: {
              'Authorization': PEXELS_API_KEY
            }
          });
          
          return res.json({
            success: true,
            imageUrl: response.data.src.large,
            attribution: `Photo by ${response.data.photographer} on Pexels`,
            description: response.data.alt,
            source: 'pexels',
            photoId: response.data.id,
            photographer: response.data.photographer,
            photographerUrl: response.data.photographer_url
          });
        }
        break;
    }
    
    res.status(404).json({
      success: false,
      error: 'Photo not found or API not configured'
    });
    
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get photo',
      details: error.message
    });
  }
});

// Endpoint to validate photo URLs
router.post('/validate-photo', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }
    
    // Check if the image URL is accessible
    const response = await axios.head(imageUrl, { timeout: 5000 });
    
    if (response.status === 200) {
      return res.json({
        success: true,
        valid: true,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
      });
    }
    
    res.json({
      success: true,
      valid: false,
      error: 'Image not accessible'
    });
    
  } catch (error) {
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

export default router;