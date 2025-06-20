// routes/ai.js
import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
// Uncomment the line below when you want to use real OpenAI
// import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI (uncomment when ready to use real AI)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// AI Blog Generation endpoint
router.post('/generate-blog', verifyToken, async (req, res) => {
  try {
    console.log('AI Generation Request received:', req.body);
    console.log('User:', req.user);

    // Check if user is admin (handle both string and boolean)
    const isAdmin = typeof req.user.isAdmin === 'string' 
      ? req.user.isAdmin.toLowerCase() === 'true' 
      : Boolean(req.user.isAdmin);

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.',
        error: 'Insufficient privileges'
      });
    }

    const { instructions, category, userId } = req.body;

    // Validate input
    if (!instructions || !category) {
      return res.status(400).json({
        success: false,
        message: 'Instructions and category are required',
        error: 'Missing required fields'
      });
    }

    if (category === 'uncategorized') {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid category',
        error: 'Invalid category'
      });
    }

    console.log('Generating blog for category:', category);
    console.log('Instructions:', instructions);

    // For now, use enhanced mock AI (replace with real AI later)
    const blogContent = await generateEnhancedBlogContent(instructions, category);

    console.log('Generated content:', blogContent);

    res.status(200).json({
      success: true,
      title: blogContent.title,
      content: blogContent.content,
      category: category,
      generatedAt: new Date().toISOString(),
      wordCount: blogContent.wordCount
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate blog content',
      error: error.message
    });
  }
});

// Enhanced mock AI content generator
async function generateEnhancedBlogContent(instructions, category) {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Extract key themes from instructions
  const themes = extractThemes(instructions);
  const tone = extractTone(instructions);
  const targetAudience = extractAudience(instructions);

  // Generate content based on category and instructions
  const blogData = generateContentByCategory(category, instructions, themes, tone, targetAudience);
  
  return {
    title: blogData.title,
    content: blogData.content,
    wordCount: calculateWordCount(blogData.content)
  };
}

// Extract themes from user instructions
function extractThemes(instructions) {
  const lowerInstructions = instructions.toLowerCase();
  const themes = [];
  
  // Common themes to look for
  const themeKeywords = {
    'beginner': ['beginner', 'start', 'basic', 'introduction', 'new'],
    'advanced': ['advanced', 'expert', 'professional', 'detailed'],
    'tips': ['tips', 'advice', 'guide', 'how-to', 'steps'],
    'trends': ['trend', 'latest', 'modern', 'current', '2024', '2025'],
    'comparison': ['vs', 'versus', 'compare', 'difference', 'best'],
    'benefits': ['benefit', 'advantage', 'pros', 'good', 'positive'],
    'problems': ['problem', 'issue', 'challenge', 'difficulty', 'solution']
  };

  Object.keys(themeKeywords).forEach(theme => {
    if (themeKeywords[theme].some(keyword => lowerInstructions.includes(keyword))) {
      themes.push(theme);
    }
  });

  return themes.length > 0 ? themes : ['general'];
}

// Extract tone from instructions
function extractTone(instructions) {
  const lowerInstructions = instructions.toLowerCase();
  
  if (lowerInstructions.includes('casual') || lowerInstructions.includes('friendly')) return 'casual';
  if (lowerInstructions.includes('professional') || lowerInstructions.includes('business')) return 'professional';
  if (lowerInstructions.includes('funny') || lowerInstructions.includes('humorous')) return 'humorous';
  if (lowerInstructions.includes('serious') || lowerInstructions.includes('formal')) return 'formal';
  
  return 'conversational';
}

// Extract target audience
function extractAudience(instructions) {
  const lowerInstructions = instructions.toLowerCase();
  
  if (lowerInstructions.includes('beginner')) return 'beginners';
  if (lowerInstructions.includes('professional')) return 'professionals';
  if (lowerInstructions.includes('student')) return 'students';
  if (lowerInstructions.includes('parent')) return 'parents';
  if (lowerInstructions.includes('senior')) return 'seniors';
  
  return 'general audience';
}

// Generate content based on category and user requirements
function generateContentByCategory(category, instructions, themes, tone, audience) {
  const contentGenerators = {
    lifestyle: () => generateLifestyleContent(instructions, themes, tone, audience),
    technology: () => generateTechnologyContent(instructions, themes, tone, audience),
    health: () => generateHealthContent(instructions, themes, tone, audience),
    travel: () => generateTravelContent(instructions, themes, tone, audience),
    fashion: () => generateFashionContent(instructions, themes, tone, audience),
    diy: () => generateDIYContent(instructions, themes, tone, audience)
  };

  return contentGenerators[category] ? contentGenerators[category]() : contentGenerators.lifestyle();
}

// Lifestyle content generator
function generateLifestyleContent(instructions, themes, tone, audience) {
  const titles = [
    "Transform Your Daily Routine: Simple Changes for a Better Life",
    "The Art of Mindful Living in a Busy World",
    "10 Life-Changing Habits You Can Start Today",
    "Finding Balance: Work, Life, and Everything in Between",
    "The Psychology of Happiness: What Science Tells Us"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  
  let content = `<h2>Introduction</h2>
  <p>In today's fast-paced world, finding meaning and balance in our daily lives has become more crucial than ever. Whether you're looking to improve your morning routine, develop better habits, or simply find more joy in everyday moments, small changes can lead to significant transformations.</p>
  
  <p>Based on your specific request: "${instructions}", this guide will provide you with actionable insights tailored for ${audience}.</p>`;

  if (themes.includes('tips') || themes.includes('beginner')) {
    content += `
    <h3>Getting Started: The Foundation</h3>
    <p>Every journey toward a better lifestyle begins with understanding where you are now and where you want to be. The key is to start small and build momentum gradually.</p>
    
    <h4>1. Assess Your Current Situation</h4>
    <p>Take an honest look at your daily routines, habits, and overall satisfaction with different areas of your life. This baseline will help you identify what needs attention most.</p>
    
    <h4>2. Set Realistic Goals</h4>
    <p>Instead of trying to change everything at once, focus on 1-2 areas that will have the biggest impact on your life. This approach increases your chances of success.</p>`;
  }

  if (themes.includes('advanced') || themes.includes('professional')) {
    content += `
    <h3>Advanced Strategies for Lifestyle Optimization</h3>
    <p>For those ready to take their lifestyle improvements to the next level, these advanced strategies focus on long-term sustainability and deeper transformation.</p>
    
    <h4>The Science of Habit Formation</h4>
    <p>Understanding the neurological basis of habits can help you make lasting changes more effectively. The habit loop consists of a cue, routine, and reward - mastering this cycle is key to success.</p>`;
  }

  content += `
  <h3>Practical Implementation</h3>
  <p>Knowledge without action is useless. Here are specific ways to implement these concepts in your daily life:</p>
  
  <h4>Morning Rituals</h4>
  <p>Start your day with intention. Whether it's meditation, journaling, exercise, or simply enjoying your coffee mindfully, a consistent morning routine sets the tone for your entire day.</p>
  
  <h4>Evening Reflection</h4>
  <p>End each day by reflecting on what went well and what could be improved. This practice helps you learn from each day and make adjustments for tomorrow.</p>
  
  <h3>Overcoming Common Challenges</h3>
  <p>Everyone faces obstacles when trying to improve their lifestyle. Here's how to navigate the most common ones:</p>
  
  <p><strong>Lack of Time:</strong> Focus on micro-habits that take less than 2 minutes. Small actions compound over time.</p>
  
  <p><strong>Lack of Motivation:</strong> Connect your goals to your deeper values and purpose. When you understand your 'why,' the 'how' becomes easier.</p>
  
  <h2>Conclusion</h2>
  <p>Remember, lifestyle improvement is a journey, not a destination. Be patient with yourself, celebrate small wins, and stay consistent. The compound effect of small, positive changes will surprise you with its power over time.</p>`;

  return { title, content };
}

// Technology content generator
function generateTechnologyContent(instructions, themes, tone, audience) {
  const titles = [
    "The Future of AI: What It Means for Everyday Users",
    "Tech Trends Shaping Our Digital Future",
    "Understanding Emerging Technologies in Simple Terms",
    "Digital Transformation: A Complete Guide",
    "How Technology is Changing the Way We Work and Live"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  
  let content = `<h2>Introduction</h2>
  <p>Technology continues to evolve at an unprecedented pace, fundamentally changing how we work, communicate, and navigate our daily lives. From artificial intelligence to blockchain, these innovations are not just futuristic concepts—they're actively shaping our present reality.</p>
  
  <p>In response to your request: "${instructions}", this comprehensive guide is designed specifically for ${audience}.</p>`;

  if (themes.includes('beginner') || themes.includes('tips')) {
    content += `
    <h3>Understanding the Basics</h3>
    <p>Before diving into complex technological concepts, it's important to establish a solid foundation of understanding.</p>
    
    <h4>What Makes Technology 'Emerging'?</h4>
    <p>Emerging technologies are innovations that are currently being developed or will be available within the next 5-10 years. They have the potential to significantly alter business and social landscapes.</p>`;
  }

  content += `
  <h3>Key Technologies to Watch</h3>
  
  <h4>Artificial Intelligence and Machine Learning</h4>
  <p>AI is no longer science fiction—it's integrated into many applications we use daily, from recommendation algorithms to voice assistants. Understanding its capabilities and limitations helps us make better decisions about its role in our lives.</p>
  
  <h4>Internet of Things (IoT)</h4>
  <p>The IoT represents a network of interconnected devices that can communicate and share data. From smart homes to wearable technology, IoT is making our environment more responsive and efficient.</p>
  
  <h4>Blockchain and Distributed Systems</h4>
  <p>Beyond cryptocurrency, blockchain technology offers solutions for secure, transparent transactions and data management across various industries.</p>
  
  <h3>Practical Implications</h3>
  <p>Understanding how these technologies impact your daily life and career is crucial for staying relevant in an increasingly digital world.</p>
  
  <h4>In the Workplace</h4>
  <p>Automation and AI are changing job requirements across industries. The key is to focus on skills that complement technology rather than compete with it.</p>
  
  <h4>In Personal Life</h4>
  <p>Smart devices and applications can enhance productivity and convenience, but it's important to maintain a healthy balance and protect your privacy.</p>
  
  <h2>Looking Ahead</h2>
  <p>The technological landscape will continue to evolve rapidly. Staying informed and adaptable is the best strategy for thriving in this digital age. Focus on understanding the principles behind these technologies rather than just their current applications.</p>`;

  return { title, content };
}

// Health content generator
function generateHealthContent(instructions, themes, tone, audience) {
  const titles = [
    "Science-Based Wellness: What Really Works",
    "Building Sustainable Health Habits",
    "The Complete Guide to Mental and Physical Wellness",
    "Debunking Health Myths: Evidence-Based Insights",
    "Holistic Health: Mind, Body, and Spirit"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  
  let content = `<h2>Introduction</h2>
  <p>Health and wellness are not just about following the latest trends—they're about understanding what truly works for your unique body and lifestyle. With so much conflicting information available, it's crucial to focus on evidence-based approaches that promote long-term well-being.</p>
  
  <p>Addressing your specific needs: "${instructions}", this guide provides reliable information for ${audience}.</p>`;

  content += `
  <h3>The Foundations of Good Health</h3>
  
  <h4>Physical Health Pillars</h4>
  <p><strong>Nutrition:</strong> Focus on whole foods, balanced macronutrients, and adequate hydration. The best diet is one you can maintain long-term while meeting your nutritional needs.</p>
  
  <p><strong>Exercise:</strong> Regular physical activity doesn't require a gym membership. Find activities you enjoy and can do consistently—whether it's walking, dancing, swimming, or playing sports.</p>
  
  <p><strong>Sleep:</strong> Quality sleep is when your body repairs and regenerates. Aim for 7-9 hours of consistent, restful sleep each night.</p>
  
  <h4>Mental Health Awareness</h4>
  <p>Mental health is just as important as physical health. Managing stress, building resilience, and maintaining social connections are crucial components of overall wellness.</p>
  
  <h3>Creating Sustainable Health Habits</h3>
  
  <h4>Start Small</h4>
  <p>Dramatic lifestyle changes rarely stick. Instead, focus on small, manageable changes that you can build upon over time. For example, start with a 10-minute walk daily before progressing to longer exercise routines.</p>
  
  <h4>Focus on Systems, Not Goals</h4>
  <p>Rather than setting weight loss goals, create systems that support healthy eating and regular exercise. Systems create lasting change while goals are just temporary targets.</p>
  
  <h3>Common Health Misconceptions</h3>
  <p>Let's address some prevalent myths that can derail your health journey:</p>
  
  <p><strong>Myth:</strong> You need expensive supplements for good health.<br>
  <strong>Reality:</strong> A balanced diet typically provides most nutrients you need. Focus on food first, supplements second.</p>
  
  <p><strong>Myth:</strong> Extreme diets deliver the best results.<br>
  <strong>Reality:</strong> Moderate, sustainable changes are more effective long-term than dramatic restrictions.</p>
  
  <h3>Personalized Approach</h3>
  <p>Remember that health is highly individual. What works for others might not work for you, and that's okay. Listen to your body, consult with healthcare professionals when needed, and be patient with your progress.</p>
  
  <h2>Moving Forward</h2>
  <p>Building better health habits is a lifelong journey, not a destination. Focus on progress over perfection, and celebrate small wins along the way. Your future self will thank you for the investments you make in your health today.</p>`;

  return { title, content };
}

// Travel content generator
function generateTravelContent(instructions, themes, tone, audience) {
  const titles = [
    "Sustainable Travel: Exploring the World Responsibly",
    "Hidden Gems: Off-the-Beaten-Path Destinations",
    "Travel Planning Mastery: From Dream to Reality",
    "Cultural Immersion: How to Travel Like a Local",
    "Budget Travel: Maximize Experiences, Minimize Costs"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  
  let content = `<h2>Introduction</h2>
  <p>Travel has the unique power to broaden our perspectives, create lasting memories, and connect us with diverse cultures and landscapes. Whether you're a seasoned globetrotter or planning your first adventure, thoughtful travel planning can transform a good trip into an extraordinary experience.</p>
  
  <p>Based on your request: "${instructions}", this guide is crafted specifically for ${audience}.</p>
  
  <h3>The Art of Travel Planning</h3>
  
  <h4>Research and Preparation</h4>
  <p>Great travel experiences begin long before you pack your bags. Research your destination's culture, customs, weather patterns, and current events. This preparation helps you travel respectfully and safely.</p>
  
  <h4>Budgeting Wisely</h4>
  <p>Set a realistic budget that includes transportation, accommodation, food, activities, and emergency funds. Remember to account for currency exchange rates and local tipping customs.</p>
  
  <h3>Sustainable and Responsible Travel</h3>
  
  <h4>Environmental Considerations</h4>
  <p>Choose eco-friendly accommodations, use public transportation when possible, and minimize your carbon footprint. Small actions collectively make a significant impact on the destinations we love to visit.</p>
  
  <h4>Cultural Sensitivity</h4>
  <p>Respect local customs, dress codes, and traditions. Learn basic phrases in the local language—even simple greetings show respect and often lead to warmer interactions with locals.</p>
  
  <h3>Maximizing Your Experience</h3>
  
  <h4>Balance Planning and Spontaneity</h4>
  <p>While it's important to book accommodations and research key attractions, leave room for spontaneous discoveries. Some of the best travel memories come from unexpected encounters and detours.</p>
  
  <h4>Connect with Locals</h4>
  <p>Engage with local communities through authentic experiences—visit local markets, eat at family-run restaurants, and participate in cultural activities. These connections provide insights no guidebook can offer.</p>
  
  <h3>Safety and Practical Tips</h3>
  <p>Stay connected with family and friends about your itinerary. Keep copies of important documents in separate locations, and research local emergency contacts and healthcare options.</p>
  
  <h2>The Journey Continues</h2>
  <p>Remember that travel is about more than checking destinations off a list—it's about personal growth, cultural understanding, and creating meaningful connections. Each journey teaches us something new about the world and ourselves.</p>`;

  return { title, content };
}

// Fashion content generator
function generateFashionContent(instructions, themes, tone, audience) {
  const titles = [
    "Timeless Fashion: Building a Versatile Wardrobe",
    "Fashion Trends vs. Personal Style: Finding Your Balance",
    "Sustainable Fashion: Style with Conscience",
    "Seasonal Style Guide: Year-Round Fashion Tips",
    "Fashion on a Budget: Looking Great Without Breaking the Bank"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  
  let content = `<h2>Introduction</h2>
  <p>Fashion is a powerful form of self-expression that goes beyond following trends—it's about understanding what makes you feel confident and comfortable in your own skin. Whether you're building a wardrobe from scratch or refining your existing style, the key is to find the balance between personal preference and practical functionality.</p>
  
  <p>In response to your query: "${instructions}", this style guide is tailored for ${audience}.</p>
  
  <h3>Building Your Personal Style</h3>
  
  <h4>Understanding Your Body and Lifestyle</h4>
  <p>Great style starts with understanding your body type, lifestyle needs, and personal preferences. The most fashionable outfit is one that makes you feel confident and is appropriate for your daily activities.</p>
  
  <h4>Quality Over Quantity</h4>
  <p>Invest in well-made basics that can be mixed and matched to create multiple outfits. A smaller wardrobe of quality pieces often provides more styling options than a closet full of trendy items.</p>
  
  <h3>Wardrobe Essentials</h3>
  
  <h4>The Foundation Pieces</h4>
  <p>Every great wardrobe needs certain foundational items: a well-fitted pair of jeans, a crisp white shirt, a versatile blazer, comfortable flats, and a little black dress or a classic suit.</p>
  
  <h4>Color Coordination</h4>
  <p>Choose a color palette that works well together and complements your skin tone. This makes mixing and matching pieces much easier and ensures everything in your wardrobe works harmoniously.</p>
  
  <h3>Staying Fashion-Forward</h3>
  
  <h4>Incorporating Trends Wisely</h4>
  <p>Instead of following every trend, choose elements that align with your personal style and lifestyle. Add trendy pieces through accessories, which are less expensive and easier to update.</p>
  
  <h4>Sustainable Fashion Choices</h4>
  <p>Consider the environmental and social impact of your fashion choices. Support brands that prioritize ethical manufacturing, and take care of your clothes to extend their lifespan.</p>
  
  <h3>Practical Style Tips</h3>
  
  <h4>Dressing for Different Occasions</h4>
  <p>Learn the dress codes for various settings—business casual, cocktail attire, casual weekend wear. Having appropriate outfits ready for different occasions reduces stress and ensures you always look put-together.</p>
  
  <h4>Accessorizing Effectively</h4>
  <p>Accessories can transform basic outfits into stylish ensembles. Invest in quality accessories like a good watch, versatile jewelry, and classic handbags that can elevate multiple outfits.</p>
  
  <h2>Your Style Journey</h2>
  <p>Remember that style is personal and evolving. What matters most is that you feel authentic and confident in your choices. Use fashion as a tool for self-expression, but don't let it become a source of stress or financial strain.</p>`;

  return { title, content };
}

// DIY content generator
function generateDIYContent(instructions, themes, tone, audience) {
  const titles = [
    "DIY Home Improvement: Projects Anyone Can Master",
    "Upcycling and Repurposing: Give New Life to Old Items",
    "Budget-Friendly Home Makeovers That Make a Big Impact",
    "Essential DIY Skills Every Homeowner Should Know",
    "Creative DIY Projects for Every Season"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  
  let content = `<h2>Introduction</h2>
  <p>There's something deeply satisfying about creating something beautiful and functional with your own hands. DIY projects not only save money but also provide a sense of accomplishment and allow you to customize your living space to perfectly match your style and needs.</p>
  
  <p>Based on your request: "${instructions}", this comprehensive DIY guide is designed for ${audience}.</p>
  
  <h3>Getting Started with DIY</h3>
  
  <h4>Essential Tools and Materials</h4>
  <p>Before diving into projects, invest in quality basic tools: a good drill, measuring tape, level, hammer, screwdrivers, and safety equipment. Quality tools make projects easier and safer, and they'll last for years.</p>
  
  <h4>Safety First</h4>
  <p>Always prioritize safety over speed. Wear appropriate protective equipment, read instructions thoroughly, and don't hesitate to consult professionals for electrical or plumbing work.</p>
  
  <h3>Beginner-Friendly Projects</h3>
  
  <h4>Painting and Color</h4>
  <p>A fresh coat of paint is one of the most impactful and beginner-friendly improvements you can make. Learn proper preparation techniques—they make the difference between a professional-looking result and an amateur job.</p>
  
  <h4>Organization Solutions</h4>
  <p>Build simple shelving, create custom storage solutions, or organize existing spaces. These projects improve functionality while helping you practice basic construction skills.</p>
  
  <h3>Intermediate Projects</h3>
  
  <h4>Furniture Makeovers</h4>
  <p>Transform old furniture with paint, new hardware, or reupholstering. This is often more affordable than buying new pieces and allows you to create exactly what you want.</p>
  
  <h4>Garden and Outdoor Projects</h4>
  <p>Build raised garden beds, create outdoor seating, or construct simple structures like pergolas. Outdoor projects are forgiving and provide immediate visual impact.</p>
  
  <h3>Planning and Execution</h3>
  
  <h4>Project Planning</h4>
  <p>Measure twice, cut once. Plan your projects thoroughly, create material lists, and budget for 20% more time and money than you initially estimate—projects often have unexpected challenges.</p>
  
  <h4>Learning Resources</h4>
  <p>Take advantage of online tutorials, local workshops, and hardware store classes. Don't be afraid to ask for help or advice from experienced DIYers or store employees.</p>
  
  <h3>Troubleshooting Common Issues</h3>
  <p>Every DIY project comes with learning opportunities (also known as mistakes). Keep a positive attitude, learn from errors, and remember that most mistakes can be fixed or incorporated into the design.</p>
  
  <h2>Building Your Skills</h2>
  <p>Start with simple projects and gradually work your way up to more complex ones. Each project teaches you new skills and builds confidence for the next challenge. The goal is to enjoy the process as much as the finished result.</p>`;

  return { title, content };
}

// Calculate word count from HTML content
function calculateWordCount(htmlContent) {
  // Remove HTML tags and count words
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return textContent.split(' ').length;
}

// Function to use real OpenAI API (uncomment when ready)
/*
async function generateWithOpenAI(instructions, category) {
  try {
    const prompt = `Create a comprehensive blog post about ${category} based on these instructions: ${instructions}. 
    
    Please provide:
    1. An engaging title
    2. Well-structured HTML content with proper headings, paragraphs, and formatting
    3. Make it informative, engaging, and around 800-1200 words
    4. Include practical tips and actionable advice
    5. Use proper HTML tags like <h2>, <h3>, <p>, <strong>, etc.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are a professional blog content creator. Create engaging, informative blog posts with proper HTML formatting."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    // Parse the response to extract title and content
    const lines = response.split('\n');
    const title = lines[0].replace(/^(Title:|#\s*)/, '').trim();
    const content = lines.slice(1).join('\n').trim();

    return {
      title,
      content,
      wordCount: calculateWordCount(content)
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate content with OpenAI');
  }
}
*/

export default router;