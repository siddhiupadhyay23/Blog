import { Alert, Button, Select, TextInput, Textarea, Card } from 'flowbite-react';
import MiniImageUpload from '../components/MiniImageUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useRef, useEffect } from 'react';
// CircularProgressbar removed as we're using a simpler approach
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function CreatePost() {
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  // AI Generation states
  const [aiInstructions, setAiInstructions] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuccess, setAiSuccess] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  // Photo selection states
  const [isSelectingPhoto, setIsSelectingPhoto] = useState(false);
  const [photoSelectionError, setPhotoSelectionError] = useState(null);

  // Regenerate feature states
  const [lastUsedInstructions, setLastUsedInstructions] = useState('');
  const [lastUsedCategory, setLastUsedCategory] = useState('');
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const quillRef = useRef(null);

  // Helper function to check if user is admin
  const isUserAdmin = () => {
    if (!currentUser) return false;
    if (typeof currentUser.isAdmin === 'string') {
      return currentUser.isAdmin.toLowerCase() === 'true';
    }
    return Boolean(currentUser.isAdmin);
  };

  // Check admin status on component mount
  useEffect(() => {
    if (!currentUser) {
      setPublishError('Please sign in to create a post');
      return;
    }
    
    if (!isUserAdmin()) {
      setPublishError('Access denied. Admin privileges required to create posts.');
      return;
    }
    
    setPublishError(null);
  }, [currentUser]);

  // Get JWT token from cookies
  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return value;
      }
    }
    return null;
  };

  // Enhanced Photo Selection with Real Variety
  const selectUniquePhoto = async (title, category, content, generationCount, aiKeywords = []) => {
    setIsSelectingPhoto(true);
    setPhotoSelectionError(null);

    try {
      console.log('Selecting unique photo with variety for:', { title, category, generationCount });

      // Extract more specific keywords for better photo diversity
      const extractUniqueKeywords = (title, category, content, generationCount, aiKeywords) => {
        const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
        
        // Remove HTML tags and extract meaningful content words
        const contentText = content.replace(/<[^>]*>/g, ' ').toLowerCase();
        const contentWords = contentText.split(' ')
          .filter(word => word.length > 4)
          .filter(word => !['this', 'that', 'with', 'from', 'they', 'were', 'been', 'have', 'your', 'what', 'when', 'where', 'will', 'there', 'their', 'about', 'would', 'could', 'should'].includes(word))
          .slice(0, 15);
        
        // Category-specific keyword variations to ensure different images
        const categoryVariations = {
          lifestyle: ['wellness', 'balance', 'routine', 'habits', 'mindful', 'peaceful', 'modern', 'cozy'],
          technology: ['innovation', 'digital', 'future', 'connected', 'smart', 'cyber', 'data', 'network'],
          health: ['fitness', 'nutrition', 'medical', 'exercise', 'therapy', 'wellness', 'recovery', 'vitality'],
          travel: ['adventure', 'journey', 'destination', 'culture', 'explore', 'wanderlust', 'scenic', 'passport'],
          fashion: ['style', 'trendy', 'elegant', 'chic', 'designer', 'wardrobe', 'fabric', 'runway'],
          diy: ['creative', 'handmade', 'craft', 'project', 'tools', 'materials', 'workshop', 'artistic']
        };

        // Add generation-specific variations to avoid same photos
        const generationVariations = [
          'bright', 'dark', 'vintage', 'modern', 'minimalist', 'colorful', 
          'professional', 'casual', 'indoor', 'outdoor', 'close-up', 'wide'
        ];

        const categoryKeywords = categoryVariations[category] || categoryVariations.lifestyle;
        const generationKeyword = generationVariations[generationCount % generationVariations.length];
        
        // Combine keywords with priority
        const allKeywords = [
          ...aiKeywords,
          generationKeyword,
          ...titleWords,
          ...categoryKeywords.slice(0, 3),
          ...contentWords.slice(0, 5)
        ];
        
        // Remove duplicates and return unique set
        return [...new Set(allKeywords)].slice(0, 5);
      };

      const keywords = extractUniqueKeywords(title, category, content, generationCount, aiKeywords);
      const searchQuery = keywords.join(' ');

      console.log('Unique photo search query:', searchQuery);

      // Try multiple photo sources for better variety
      const photoSources = [
        {
          name: 'primary',
          endpoint: '/api/ai/select-photo',
          params: {
            query: searchQuery,
            category: category,
            title: title,
            orientation: 'landscape',
            size: 'regular',
            generationCount: generationCount,
            uniqueKeywords: keywords
          }
        },
        {
          name: 'alternative',
          endpoint: '/api/ai/select-photo',
          params: {
            query: keywords.slice(0, 2).join(' '),
            category: category,
            orientation: 'landscape',
            size: 'small',
            generationCount: generationCount + 1,
            fallback: true
          }
        }
      ];

      // Try each photo source
      for (const source of photoSources) {
        try {
          const response = await fetch(source.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` })
            },
            credentials: 'include',
            body: JSON.stringify(source.params),
          });

          if (response.ok) {
            const photoData = await response.json();
            
            if (photoData.success && photoData.imageUrl) {
              console.log(`Selected unique photo from ${source.name}:`, photoData.imageUrl);
              return {
                url: photoData.imageUrl,
                source: source.name,
                attribution: photoData.attribution || null,
                description: photoData.description || searchQuery,
                keywords: keywords
              };
            }
          }
        } catch (sourceError) {
          console.log(`Photo source ${source.name} failed, trying next...`);
          continue;
        }
      }

      // Enhanced fallback with more variety
      const getVariedCuratedPhoto = (category, keywords, generationCount) => {
        const curatedPhotoSets = {
          lifestyle: [
            // Set 1: Wellness & Balance
            [
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 2: Modern Living
            [
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 3: Mindfulness
            [
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&auto=format'
            ]
          ],
          health: [
            // Set 1: Fitness & Exercise
            [
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 2: Nutrition & Food
            [
              'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 3: Mental Health & Wellness
            [
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format'
            ]
          ],
          technology: [
            // Set 1: AI & Future Tech
            [
              'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 2: Digital & Connectivity
            [
              'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 3: Innovation & Development
            [
              'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop&auto=format'
            ]
          ],
          travel: [
            // Set 1: Adventure & Nature
            [
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 2: Cities & Culture
            [
              'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 3: Transportation & Journey
            [
              'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=400&fit=crop&auto=format'
            ]
          ],
          fashion: [
            // Set 1: Style & Trends
            [
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 2: Accessories & Details
            [
              'https://images.unsplash.com/photo-1524275539700-cf51138f679b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 3: Wardrobe & Shopping
            [
              'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop&auto=format'
            ]
          ],
          diy: [
            // Set 1: Tools & Workshop
            [
              'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1609548115575-c9d30b7cf1ea?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 2: Crafts & Materials
            [
              'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&auto=format'
            ],
            // Set 3: Projects & Creation
            [
              'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1506794778225-6ecddf92e546?w=800&h=400&fit=crop&auto=format'
            ]
          ]
        };

        const categorySets = curatedPhotoSets[category] || curatedPhotoSets.lifestyle;
        const setIndex = generationCount % categorySets.length;
        const photoSet = categorySets[setIndex];
        const photoIndex = Math.floor(Math.random() * photoSet.length);
        const selectedPhoto = photoSet[photoIndex];

        return {
          url: selectedPhoto,
          source: 'curated_varied',
          attribution: 'Photo from Unsplash',
          description: `${category} related image (set ${setIndex + 1})`,
          keywords: keywords
        };
      };

      console.log('Using varied curated photo selection...');
      return getVariedCuratedPhoto(category, keywords, generationCount);

    } catch (error) {
      console.error('Unique photo selection error:', error);
      setPhotoSelectionError('Failed to select unique photo: ' + error.message);
      return null;
    } finally {
      setIsSelectingPhoto(false);
    }
  };

  // Enhanced AI Blog Generation System
  const generateBlogWithAI = async (useLastSettings = false, includePhoto = true) => {
    const instructionsToUse = useLastSettings ? lastUsedInstructions : aiInstructions;
    const categoryToUse = useLastSettings ? lastUsedCategory : selectedCategory;

    if (!instructionsToUse.trim()) {
      setAiError('Please provide instructions for AI generation');
      return;
    }

    if (!categoryToUse || categoryToUse === 'uncategorized') {
      setAiError('Please select a category for AI generation');
      return;
    }

    setIsGenerating(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      console.log('Starting REAL AI generation with unique content...');
      
      const token = getAuthToken();

      // Create unique prompts with timestamp and random elements for true uniqueness
      const uniquePrompts = {
        lifestyle: [
          "Write about productivity hacks for remote workers in 2024",
          "Create a guide about sustainable living on a budget",
          "Discuss the psychology of habit formation and breaking bad habits",
          "Explore mindfulness practices for busy professionals",
          "Write about creating work-life balance in the digital age",
          "Discuss the minimalist approach to personal finance",
          "Create content about building meaningful relationships",
          "Write about the art of slow living and intentional choices"
        ],
        technology: [
          "Explain the impact of AI on everyday life and jobs",
          "Write about cybersecurity best practices for individuals",
          "Discuss the future of renewable energy technology",
          "Explore blockchain applications beyond cryptocurrency",
          "Write about the ethics of artificial intelligence",
          "Discuss emerging trends in mobile app development",
          "Create content about smart home technology benefits",
          "Write about the digital divide and tech accessibility"
        ],
        health: [
          "Write about the connection between gut health and mental wellness",
          "Discuss the importance of sleep hygiene and quality rest",
          "Explore the benefits of strength training for all ages",
          "Write about nutrition myths and evidence-based eating",
          "Discuss the impact of stress on physical health",
          "Create content about preventive healthcare approaches",
          "Write about the mind-body connection in healing",
          "Explore the role of hydration in optimal health performance"
        ],
        travel: [
          "Write about sustainable tourism and responsible travel",
          "Discuss solo travel safety tips and confidence building",
          "Create a guide for budget backpacking in Southeast Asia",
          "Write about cultural etiquette when traveling abroad",
          "Discuss the benefits of slow travel vs. rushed tourism",
          "Create content about digital nomad lifestyle and challenges",
          "Write about food tourism and culinary adventures",
          "Explore off-the-beaten-path destinations worth visiting"
        ],
        fashion: [
          "Write about building a sustainable capsule wardrobe",
          "Discuss the psychology of color in fashion choices",
          "Create content about thrift shopping and vintage finds",
          "Write about fashion trends vs. personal style development",
          "Discuss ethical fashion brands and conscious consumption",
          "Create a guide for dressing professionally on a budget",
          "Write about fashion history and its modern influence",
          "Explore the intersection of comfort and style"
        ],
        diy: [
          "Create a guide for beginner woodworking projects",
          "Write about upcycling furniture on a budget",
          "Discuss organic gardening for small spaces",
          "Create content about home organization and storage solutions",
          "Write about basic home repair skills everyone should know",
          "Discuss creative gift-making ideas for holidays",
          "Create a guide for starting a successful blog",
          "Write about meal prep strategies for busy schedules"
        ]
      };

      // Generate truly unique content based on specific prompts
      let enhancedInstructions = instructionsToUse;
      
      if (useLastSettings && generationCount > 0) {
        // Use different prompts for regeneration to ensure uniqueness
        const categoryPrompts = uniquePrompts[categoryToUse] || uniquePrompts.lifestyle;
        const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
        enhancedInstructions = `${randomPrompt}. Make it comprehensive, engaging, and unique. Include specific examples, actionable advice, and current insights. Word count: 800-1200 words.`;
      } else {
        
      }

      // Add uniqueness factors
      const uniquenessFactor = {
        timestamp: Date.now(),
        randomSeed: Math.random().toString(36).substring(7),
        generationCount: generationCount,
        categorySpecific: categoryToUse,
        userSpecific: currentUser?._id?.slice(-6) || 'anon'
      };

      const requestBody = {
        instructions: enhancedInstructions,
        category: categoryToUse,
        userId: currentUser?._id,
        regenerationCount: generationCount,
        uniquenessFactor: uniquenessFactor,
        timestamp: Date.now(),
        includePhotoSuggestions: includePhoto,
        requireUniqueContent: true,
        contentVariation: useLastSettings ? 'regeneration' : 'new',
        specificPrompt: useLastSettings ? uniquePrompts[categoryToUse]?.[generationCount % (uniquePrompts[categoryToUse]?.length || 1)] : null
      };

      console.log('Sending unique AI request:', requestBody);

      // Make API call to your REAL AI service
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || data.error || 'AI generation failed');
      }

      // Validate that content is actually different
      if (data.content && data.content.length < 500) {
        throw new Error('Generated content is too short. Please try again with more specific instructions.');
      }

      // Set the generated content
      setFormData(prev => ({
        ...prev,
        title: data.title || '',
        content: data.content || '',
        category: categoryToUse
      }));

      // Select and add photo if requested with better variety
      if (includePhoto && data.title) {
        console.log('Selecting unique photo for generated content...');
        const photoResult = await selectUniquePhoto(
          data.title, 
          categoryToUse, 
          data.content || '', 
          generationCount,
          data.photoKeywords || []
        );
        
        if (photoResult && photoResult.url) {
          setFormData(prev => ({
            ...prev,
            image: photoResult.url,
            imageAttribution: photoResult.attribution,
            imageDescription: photoResult.description
          }));
          
          console.log('Unique photo selected and added:', photoResult.url);
        }
      }

      // Store last used settings
      if (!useLastSettings) {
        setLastUsedInstructions(instructionsToUse);
        setLastUsedCategory(categoryToUse);
        setAiInstructions('');
      }
      
      setHasGeneratedContent(true);
      setGenerationCount(prev => prev + 1);
      
      const actionText = useLastSettings ? 'regenerated' : 'generated';
      const photoText = includePhoto ? ' with unique image' : '';
      setAiSuccess(`✅ AI ${actionText} unique ${data.wordCount || 0} word blog post${photoText}! (Generation #${generationCount + 1})`);
      
      setTimeout(() => setAiSuccess(null), 6000);
      
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError('Failed to generate unique blog content: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate function using last settings
  const regenerateContent = (includePhoto = true) => {
    if (lastUsedInstructions.includes('Generate sample')) {
      generateSampleContent(includePhoto);
    } else {
      generateBlogWithAI(true, includePhoto);
    }
  };

  // Enhanced Sample Content Generation with more variety
  const generateSampleContent = (includePhoto = true) => {
    if (!selectedCategory) {
      setAiError('Please select a category first');
      return;
    }

    // Dynamic sample content variations
    const sampleContentVariations = {
      lifestyle: [
        {
          title: "10 Morning Habits That Will Transform Your Day",
          content: `<h2>Start Your Day Right with These Life-Changing Habits</h2>
          <p>How you start your morning sets the tone for your entire day. These scientifically-backed habits can boost your productivity, mood, and overall well-being.</p>
          
          <h3>1. Wake Up Without Snoozing</h3>
          <p>Hit the ground running by avoiding the snooze button. This helps regulate your circadian rhythm and gives you a sense of accomplishment right from the start.</p>
          
          <h3>2. Hydrate Immediately</h3>
          <p>Drink a full glass of water as soon as you wake up. After 6-8 hours without hydration, your body needs to replenish fluids for optimal brain function.</p>
          
          <h3>3. Practice Gratitude</h3>
          <p>Spend 2 minutes listing three things you're grateful for. This simple practice rewires your brain for positivity and resilience.</p>
          
          <p>Small changes in your morning routine can create ripple effects throughout your entire day. Start with one habit and gradually build your perfect morning ritual.</p>`
        },
        {
          title: "The Art of Minimalist Living: Less is More",
          content: `<h2>Discover Freedom Through Intentional Living</h2>
          <p>Minimalism isn't about having less for the sake of it—it's about making room for what truly matters in your life.</p>
          
          <h3>Benefits of Minimalist Living</h3>
          <p>Reduced stress, increased focus, better financial health, and more meaningful relationships are just some of the benefits you'll experience.</p>
          
          <h3>Getting Started</h3>
          <p>Begin with one area of your life—perhaps your wardrobe or digital files. Ask yourself: "Does this add value to my life?" Keep only what serves a purpose or brings joy.</p>
          
          <p>Remember, minimalism looks different for everyone. Find your own version of enough.</p>`
        },
        {
          title: "Building Meaningful Connections in a Digital World",
          content: `<h2>Authentic Relationships in the Age of Social Media</h2>
          <p>While technology connects us globally, many people feel lonelier than ever. Here's how to build genuine relationships that enrich your life.</p>
          
          <h3>Quality Over Quantity</h3>
          <p>Focus on deepening existing relationships rather than constantly seeking new connections. Invest time in people who truly matter to you.</p>
          
          <h3>Practice Active Listening</h3>
          <p>Put away devices during conversations. Show genuine interest in others' thoughts and feelings. Ask follow-up questions and remember important details.</p>
          
          <h3>Be Vulnerable and Authentic</h3>
          <p>Share your real thoughts and experiences, not just highlight reels. Vulnerability creates deeper bonds and encourages others to be genuine too.</p>
          
          <p>Strong relationships are the foundation of a fulfilling life. Invest in them consistently and watch your happiness grow.</p>`
        }
      ],
      technology: [
        {
          title: "AI in Everyday Life: How Machine Learning is Changing Everything",
          content: `<h2>The Invisible Revolution in Your Pocket</h2>
          <p>Artificial Intelligence isn't just science fiction anymore—it's woven into nearly every aspect of our daily lives, often without us realizing it.</p>
          
          <h3>Smart Recommendations</h3>
          <p>From Netflix suggesting your next binge-watch to Spotify creating the perfect playlist, AI algorithms learn your preferences to enhance your experience.</p>
          
          <h3>Voice Assistants and Smart Homes</h3>
          <p>Alexa, Siri, and Google Assistant use natural language processing to understand and respond to your commands, making technology more intuitive than ever.</p>
          
          <h3>Healthcare Revolution</h3>
          <p>AI helps doctors diagnose diseases earlier, drug companies discover new treatments faster, and wearable devices monitor your health in real-time.</p>
          
          <p>As AI continues to evolve, staying informed about its capabilities and limitations helps us make better decisions about the technology we invite into our lives.</p>`
        },
        {
          title: "Cybersecurity Essentials: Protecting Your Digital Life",
          content: `<h2>Your Personal Guide to Online Safety</h2>
          <p>In our interconnected world, cybersecurity isn't just for IT professionals—it's essential knowledge for everyone who uses the internet.</p>
          
          <h3>Password Power</h3>
          <p>Use unique, complex passwords for every account. Consider a password manager like 1Password or Bitwarden to generate and store secure passwords safely.</p>
          
          <h3>Two-Factor Authentication</h3>
          <p>Enable 2FA wherever possible. This extra layer of security makes it exponentially harder for hackers to access your accounts, even if they have your password.</p>
          
          <h3>Recognize Phishing Attempts</h3>
          <p>Be skeptical of urgent emails asking for personal information. Legitimate companies rarely request sensitive data via email. When in doubt, contact them directly.</p>
          
          <p>Good cybersecurity habits protect not just your data, but your identity, finances, and peace of mind.</p>`
        }
      ],
      health: [
        {
          title: "The Science of Sleep: Why Quality Rest is Your Superpower",
          content: `<h2>Unlock Your Potential Through Better Sleep</h2>
          <p>Sleep isn't just downtime—it's when your body and brain perform critical maintenance that affects every aspect of your health and performance.</p>
          
          <h3>The Sleep Cycle Explained</h3>
          <p>Your brain cycles through different stages of sleep, each serving specific functions like memory consolidation, tissue repair, and toxin removal.</p>
          
          <h3>Optimizing Your Sleep Environment</h3>
          <p>Keep your bedroom cool (60-67°F), dark, and quiet. Invest in blackout curtains, consider a white noise machine, and keep electronics out of the bedroom.</p>
          
          <h3>Building a Sleep Routine</h3>
          <p>Go to bed and wake up at the same time every day, even weekends. Create a relaxing pre-sleep ritual like reading or gentle stretching.</p>
          
          <p>Prioritizing sleep isn't lazy—it's one of the most productive things you can do for your health, mood, and cognitive function.</p>`
        },
        {
          title: "Nutrition Myths Debunked: What Science Really Says",
          content: `<h2>Separating Fact from Fiction in Nutrition</h2>
          <p>The nutrition world is full of conflicting advice. Let's cut through the noise and focus on what research actually shows about healthy eating.</p>
          
          <h3>Myth: Carbs Are the Enemy</h3>
          <p>Complex carbohydrates are essential for brain function and energy. The key is choosing whole grains, fruits, and vegetables over processed sugars.</p>
          
          <h3>Myth: Fat Makes You Fat</h3>
          <p>Healthy fats from nuts, avocados, and olive oil are crucial for hormone production and nutrient absorption. It's about quality, not avoidance.</p>
          
          <h3>The Real Truth</h3>
          <p>Focus on whole foods, eat plenty of vegetables, stay hydrated, and listen to your body's hunger cues. Sustainable nutrition isn't about perfection—it's about consistency.</p>
          
          <p>Remember, the best diet is one you can maintain long-term while feeling energized and satisfied.</p>`
        }
      ],
      travel: [
        {
          title: "Solo Travel: Building Confidence One Adventure at a Time",
          content: `<h2>Discover the World and Yourself</h2>
          <p>Solo travel might seem intimidating, but it's one of the most rewarding ways to explore the world while building independence and self-confidence.</p>
          
          <h3>Start Small</h3>
          <p>Begin with a day trip to a nearby city or a weekend getaway. This helps you build confidence without the pressure of extended solo travel.</p>
          
          <h3>Safety First</h3>
          <p>Research your destination thoroughly, share your itinerary with someone at home, and trust your instincts. Stay in well-reviewed accommodations and keep emergency contacts handy.</p>
          
          <h3>Embrace the Freedom</h3>
          <p>Solo travel means complete freedom to follow your interests, change plans spontaneously, and meet new people without compromise.</p>
          
          <p>Every solo trip teaches you something new about yourself and the world. Start planning your adventure today!</p>`
        },
        {
          title: "Sustainable Tourism: How to Travel Responsibly",
          content: `<h2>See the World Without Harming It</h2>
          <p>Travel enriches our lives, but it can also impact local communities and environments. Here's how to explore responsibly.</p>
          
          <h3>Choose Local</h3>
          <p>Stay in locally-owned accommodations, eat at family restaurants, and buy souvenirs from local artisans. Your money directly supports the community.</p>
          
          <h3>Respect Local Culture</h3>
          <p>Learn basic phrases in the local language, dress appropriately for cultural sites, and observe local customs and traditions.</p>
          
          <h3>Minimize Environmental Impact</h3>
          <p>Use public transportation, carry a reusable water bottle, and choose activities that don't harm wildlife or natural habitats.</p>
          
          <p>Responsible travel creates positive impacts that last long after you return home.</p>`
        }
      ],
      fashion: [
        {
          title: "Building a Capsule Wardrobe: Style with Purpose",
          content: `<h2>More Style, Less Stress</h2>
          <p>A capsule wardrobe simplifies your life while ensuring you always look put-together. It's about quality over quantity and intentional choices.</p>
          
          <h3>The Foundation</h3>
          <p>Start with neutral basics: well-fitted jeans, white button-down shirt, black blazer, and comfortable flats. These pieces work in multiple combinations.</p>
          
          <h3>Add Strategic Color</h3>
          <p>Choose 2-3 colors that work well together and complement your skin tone. This ensures everything in your wardrobe coordinates effortlessly.</p>
          
          <h3>Quality Investment</h3>
          <p>Buy fewer, better pieces that will last. A well-made coat or pair of shoes is worth more than multiple cheap alternatives.</p>
          
          <p>A thoughtful wardrobe saves time, money, and decision fatigue while keeping you stylish and confident.</p>`
        },
        {
          title: "Sustainable Fashion: Looking Good While Doing Good",
          content: `<h2>Style That Doesn't Cost the Earth</h2>
          <p>Fashion can be both beautiful and responsible. Here's how to build a wardrobe that reflects your values without sacrificing style.</p>
          
          <h3>Buy Less, Choose Better</h3>
          <p>Invest in quality pieces that will last for years. Consider cost-per-wear when making purchases—a $200 coat worn 100 times costs $2 per wear.</p>
          
          <h3>Embrace Secondhand</h3>
          <p>Thrift stores, consignment shops, and online resale platforms offer unique pieces at fraction of retail prices while extending clothing lifecycles.</p>
          
          <h3>Care for What You Own</h3>
          <p>Proper washing, storage, and maintenance extend clothing life significantly. Learn basic repair skills like sewing on buttons or hemming pants.</p>
          
          <p>Sustainable fashion is about making conscious choices that align with your values while expressing your personal style.</p>`
        }
      ],
      diy: [
        {
          title: "Home Organization Hacks That Actually Work",
          content: `<h2>Transform Your Space, Transform Your Life</h2>
          <p>A well-organized home reduces stress, saves time, and creates a peaceful environment. These practical tips work for any space or budget.</p>
          
          <h3>The One-Minute Rule</h3>
          <p>If something takes less than a minute to put away, do it immediately. This prevents small messes from becoming overwhelming clutter.</p>
          
          <h3>Vertical Storage Solutions</h3>
          <p>Use wall space with floating shelves, pegboards, and over-door organizers. Going vertical maximizes storage in small spaces.</p>
          
          <h3>Label Everything</h3>
          <p>Clear labels help everyone in the house know where things belong, making it easier to maintain organization systems long-term.</p>
          
          <p>Start with one small area and gradually expand your organization systems. Consistency beats perfection every time.</p>`
        },
        {
          title: "Beginner's Guide to Urban Gardening",
          content: `<h2>Grow Your Own Food Anywhere</h2>
          <p>You don't need a backyard to grow fresh herbs and vegetables. Urban gardening brings nature into your home while providing fresh, healthy food.</p>
          
          <h3>Start with Herbs</h3>
          <p>Basil, mint, and parsley are perfect for beginners. They grow quickly, don't need much space, and you'll use them regularly in cooking.</p>
          
          <h3>Container Gardening</h3>
          <p>Use pots, window boxes, or repurposed containers with drainage holes. Most vegetables can thrive in containers with proper care.</p>
          
          <h3>Light and Water Basics</h3>
          <p>Most edible plants need 6+ hours of sunlight daily. Water when the top inch of soil feels dry, but don't overwater.</p>
          
          <p>Gardening connects you with your food while providing a relaxing, rewarding hobby that literally bears fruit.</p>`
        }
      ]
    };

    const variations = sampleContentVariations[selectedCategory] || sampleContentVariations.lifestyle;
    const selectedVariation = variations[generationCount % variations.length];
    
    setFormData(prev => ({
      ...prev,
      title: selectedVariation.title,
      content: selectedVariation.content,
      category: selectedCategory
    }));

    // Select photo for sample content too
    if (includePhoto) {
      selectUniquePhoto(
        selectedVariation.title, 
        selectedCategory, 
        selectedVariation.content, 
        generationCount
      ).then(photoResult => {
        if (photoResult && photoResult.url) {
          setFormData(prev => ({
            ...prev,
            image: photoResult.url,
            imageAttribution: photoResult.attribution
          }));
        }
      });
    }
    setHasGeneratedContent(true);
    setGenerationCount(prev => prev + 1);
    setAiSuccess(`✅ Sample ${selectedCategory} content generated! (Variation ${(generationCount % variations.length) + 1})`);
  };

  // Image is now handled directly by SimpleImageUpload component
  // which converts the image to a data URL and passes it to the parent component

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !isUserAdmin()) {
      setPublishError('Access denied. Admin privileges required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setPublishError(null);
      
      // Check if we have a data URL image that's too large
      let postData = {...formData, userId: currentUser._id};
      
      // If image is a data URL and very large, use a fallback image
      if (postData.image && postData.image.startsWith('data:image') && postData.image.length > 200000) {
        console.log('Image data URL is too large, using fallback image');
        // Use a default image URL instead
        postData.image = 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png';
      }

      const token = getAuthToken();

      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setPublishError('Authentication failed. Please sign in again.');
        } else if (res.status === 403) {
          setPublishError('Access denied. Admin privileges required.');
        } else if (res.status === 413) {
          setPublishError('Image is too large. Please use a smaller image or try again.');
        } else {
          setPublishError(data.message || 'Failed to create post');
        }
        return;
      }

      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only render if user is admin
  if (!currentUser || !isUserAdmin()) {
    return (
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <Alert color='failure'>
          <span className="font-medium">Access Denied!</span> Admin privileges required to create posts.
        </Alert>
      </div>
    );
  }

  return (
    <div className='p-3 max-w-4xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Create a Post</h1>
      
      {/* AI Content Generation Panel */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            🤖 AI Content Generator
          </h2>
          <Button
            color="gray"
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
          >
            {showAiPanel ? 'Hide' : 'Show'} AI Panel
          </Button>
        </div>
        
        {showAiPanel && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category (Required for AI)
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="technology">Technology</option>
                <option value="health">Health & Wellness</option>
                <option value="travel">Travel</option>
                <option value="fashion">Fashion</option>
                <option value="diy">DIY & Crafts</option>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Instructions
              </label>
              <Textarea
                placeholder="Describe what you want the AI to write about... (e.g., 'Write about the benefits of morning routines for productivity')"
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                color="purple"
                onClick={() => generateBlogWithAI(false, true)}
                disabled={isGenerating || isSelectingPhoto}
              >
                {isGenerating ? '🔄 Generating...' : '✨ Generate with AI + Photo'}
              </Button>
              
              <Button
                color="blue"
                onClick={() => generateSampleContent(true)}
                disabled={!selectedCategory || isGenerating || isSelectingPhoto}
              >
                📝 Generate Sample Content
              </Button>

              {hasGeneratedContent && (
                <>
                  <Button
                    color="green"
                    onClick={() => regenerateContent(true)}
                    disabled={isGenerating || isSelectingPhoto}
                  >
                    🔄 Regenerate + Photo
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => regenerateContent(false)}
                    disabled={isGenerating || isSelectingPhoto}
                  >
                    🔄 Regenerate (No Photo)
                  </Button>
                </>
              )}
            </div>

            {aiError && <Alert color="failure">{aiError}</Alert>}
            {aiSuccess && <Alert color="success">{aiSuccess}</Alert>}
            {isSelectingPhoto && (
              <Alert color="info">
                🖼️ Selecting unique photo... This may take a moment.
              </Alert>
            )}
            {photoSelectionError && (
              <Alert color="warning">⚠️ {photoSelectionError}</Alert>
            )}
          </div>
        )}
      </Card>

      {/* Main Form */}
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category || 'uncategorized'}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value='uncategorized'>Select a category</option>
            <option value='lifestyle'>Lifestyle</option>
            <option value='technology'>Technology</option>
            <option value='health'>Health & Wellness</option>
            <option value='travel'>Travel</option>
            <option value='fashion'>Fashion</option>
            <option value='diy'>DIY & Crafts</option>
          </Select>
        </div>
        
        <MiniImageUpload 
          onImageSelected={(imageUrl) => {
            setFormData({ ...formData, image: imageUrl });
            setImageUploadError(null);
          }} 
        />
        
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        
        {formData.image && (
          <img
            src={formData.image}
            alt='upload'
            className='w-full h-72 object-cover'
          />
        )}
        
        <ReactQuill
          ref={quillRef}
          theme='snow'
          value={formData.content || ''}
          placeholder='Write something amazing...'
          className='h-72 mb-12'
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        
        <Button 
          type='submit' 
          gradientDuoTone='purpleToPink'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
        
        {publishError && (
          <Alert color='failure'>{publishError}</Alert>
        )}
      </form>
    </div>
  );
}