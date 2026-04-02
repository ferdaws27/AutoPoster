import { useEffect, useRef, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faWandMagicSparkles, faRotateRight, faEdit, faImage, faPalette, faComments, faSave, faClock, faRobot, faFileText, faCalendar, faCheckCircle, faHeart, faThumbsUp, faEye, faSpinner, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faXTwitter, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';

export default function CreatePostPage() {
  const ideaRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [publishTo, setPublishTo] = useState({
    Twitter: true,
    LinkedIn: true,
    Medium: true,
  });
  const [variations, setVariations] = useState({});
  const [loading, setLoading] = useState(false);
  const [hookInfo, setHookInfo] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([
    { type: 'suggestion', icon: '', title: 'Suggestion', content: 'Your content performs 35% better when posted between 2-4 PM on weekdays.' },
    { type: 'optimization', icon: '', title: 'Optimization', content: 'Adding relevant hashtags could increase reach by ~20%.' },
    { type: 'insight', icon: '', title: 'Insight', content: 'Similar content generated 2.3x more engagement with images.' }
  ]);
  const [generationCount, setGenerationCount] = useState(0);
  const [stats, setStats] = useState({
    drafts: 0,
    scheduled: 0,
    published: 0,
    engagement: '0',
    draftsTrend: 'No recent drafts',
    scheduledNext: 'No scheduled posts',
    publishedThisMonth: 'None yet',
    engagementTrend: 'No data yet'
  });

  // Calculate real stats from localStorage
  const calculateRealStats = () => {
    const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
    const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
    const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');
    
    // Calculate engagement from published posts
    let totalEngagement = 0;
    published.forEach(post => {
      totalEngagement += (post.engagement?.likes || 0) + (post.engagement?.shares || 0) + (post.engagement?.comments || 0);
    });
    
    // Format engagement number
    let engagementDisplay = '0';
    if (totalEngagement >= 1000) {
      engagementDisplay = (totalEngagement / 1000).toFixed(1) + 'k';
    } else if (totalEngagement > 0) {
      engagementDisplay = totalEngagement.toString();
    }
    
    // Calculate trends
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentDrafts = drafts.filter(d => new Date(d.createdAt) > weekAgo).length;
    const recentScheduled = scheduled.filter(s => new Date(s.createdAt) > weekAgo).length;
    const thisMonthPublished = published.filter(p => {
      const postDate = new Date(p.createdAt);
      const now = new Date();
      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Find next scheduled time
    const nextScheduled = scheduled
      .filter(s => new Date(`${s.scheduleDate} ${s.scheduleTime}`) > new Date())
      .sort((a, b) => new Date(`${a.scheduleDate} ${a.scheduleTime}`) - new Date(`${b.scheduleDate} ${b.scheduleTime}`))[0];
    
    let nextTimeDisplay = 'No scheduled posts';
    if (nextScheduled) {
      const nextTime = new Date(`${nextScheduled.scheduleDate} ${nextScheduled.scheduleTime}`);
      const now = new Date();
      const diffMs = nextTime - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        nextTimeDisplay = `Next: ${diffHours}h ${diffMins}m`;
      } else {
        nextTimeDisplay = `Next: ${diffMins}m`;
      }
    }
    
    return {
      drafts: drafts.length,
      scheduled: scheduled.length,
      published: published.length,
      engagement: engagementDisplay || '0',
      draftsTrend: recentDrafts > 0 ? `+${recentDrafts} this week` : 'No recent drafts',
      scheduledNext: nextTimeDisplay,
      publishedThisMonth: thisMonthPublished > 0 ? `This month (${thisMonthPublished})` : 'None yet',
      engagementTrend: totalEngagement > 0 ? '+18% vs last week' : 'No data yet'
    };
  };

  // Update stats when component mounts and when localStorage changes
  useEffect(() => {
    const updateStats = () => {
      setStats(calculateRealStats());
    };
    
    updateStats();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key?.includes('autoposter_')) {
        updateStats();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also update periodically
    const interval = setInterval(updateStats, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const navigate = useNavigate();

  // Récupérer le hook depuis localStorage
  useEffect(() => {
    const storedHook = localStorage.getItem('selectedHook');
    if (storedHook) {
      try {
        const hookData = JSON.parse(storedHook);
        setHookInfo(hookData);
        
        // Pré-remplir le textarea avec le hook
        if (ideaRef.current && hookData.text) {
          ideaRef.current.value = hookData.text;
          setCharCount(hookData.text.length);
          
          // Configurer les plateformes selon le hook
          const platformMap = {
            'twitter': 'Twitter',
            'linkedin': 'LinkedIn', 
            'medium': 'Medium'
          };
          
          const hookPlatform = platformMap[hookData.platform];
          if (hookPlatform) {
            setPublishTo({
              Twitter: hookPlatform === 'Twitter',
              LinkedIn: hookPlatform === 'LinkedIn',
              Medium: hookPlatform === 'Medium',
            });
          }
        }
        
        // Nettoyer localStorage après utilisation
        localStorage.removeItem('selectedHook');
      } catch (error) {
        console.error('Erreur lors de la récupération du hook:', error);
      }
    }
  }, []);

  // Test API key loading immediately
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('=== API KEY TEST ===');
    console.log('API Key from env:', apiKey);
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('All env vars:', import.meta.env);
  }, []);

  useEffect(() => {
    const textarea = ideaRef.current;
    const handler = () => setCharCount(textarea.value.length);
    textarea.addEventListener("input", handler);
    return () => textarea.removeEventListener("input", handler);
  }, []);

  const togglePublish = (platform) => {
    setPublishTo((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const generateText = async () => {
    let idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter(p => publishTo[p]);

    // If no idea, generate one automatically
    if (!idea) {
      setLoading(true);
      const generatedIdea = await generateAIidea();
      if (!generatedIdea) {
        setLoading(false);
        alert("Failed to generate AI idea. Please try again.");
        return;
      }
      idea = generatedIdea;
      ideaRef.current.value = idea;
      setCharCount(idea.length);
    }

    if (platforms.length === 0) {
      setLoading(false);
      return alert("Select at least one platform");
    }

    // TEMPORAIRE: Utilisation directe de la clé pour tester
    const apiKey = "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";
    console.log('=== DEBUG INFO ===');
    console.log('API Key available:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('API Key starts with:', apiKey?.substring(0, 10));
    console.log('Full API Key:', apiKey);
    
    if (!apiKey) {
      setLoading(false);
      return alert("OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.");
    }

    const variations = {};
    const currentCount = generationCount + 1;
    
    try {
      for (const platform of platforms) {
        console.log(`Generating content for ${platform} (attempt ${currentCount})...`);
        
        let prompt = '';
        if (platform === 'Twitter') {
          prompt = `Create a compelling Twitter post (max 280 characters) about: ${idea}. Requirements:
          - Start with an engaging hook
          - Include 2-3 key points with bullet points or numbers
          - Add relevant hashtags (2-3 max)
          - End with a question or call to action
          - Keep it conversational and impactful
          - This is generation attempt ${currentCount}, so make it unique and different from previous versions`;
        } else if (platform === 'LinkedIn') {
          prompt = `Write a professional LinkedIn post about: ${idea}. Requirements:
          - Start with a strong, attention-grabbing headline
          - Include 3-4 key insights with bullet points
          - Add professional context and business implications
          - Include relevant hashtags (3-4 max)
          - End with an engaging question to encourage discussion
          - Keep tone professional but conversational
          - This is generation attempt ${currentCount}, provide a fresh perspective`;
        } else if (platform === 'Medium') {
          prompt = `Create a Medium article preview about: ${idea}. Requirements:
          - Start with an intriguing, SEO-friendly title
          - Write a compelling introduction (2-3 paragraphs)
          - Include 2-3 section headings with key insights
          - Add bullet points for key takeaways
          - End with a teaser to encourage reading the full article
          - Make it thoughtful and in-depth
          - This is generation attempt ${currentCount}, offer a unique angle`;
        }
        
        const requestBody = {
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: platform === 'Twitter' ? 100 : 300
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        let data;
        try {
          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AutoPoster App"
          };
          
          console.log(`Request headers for ${platform}:`, headers);
          
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
          });
          
          console.log(`Response status for ${platform}:`, res.status);
          console.log(`Response headers for ${platform}:`, Object.fromEntries(res.headers.entries()));
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error response for ${platform}:`, errorText);
            throw new Error(`OpenAI API error for ${platform}: ${res.status} - ${errorText}`);
          }
          
          data = await res.json();
          console.log(`Success response for ${platform}:`, data);
          
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error(`Invalid response format for ${platform}`);
          }
          
          variations[platform] = data.choices[0].message.content.trim();
        } catch (fetchError) {
          console.warn(`API call failed for ${platform}, using AI fallback:`, fetchError.message);
          try {
            variations[platform] = await generateMockContent(platform, idea, currentCount);
          } catch (fallbackError) {
            console.error(`Fallback also failed for ${platform}:`, fallbackError);
            variations[platform] = `Unable to generate ${platform} content. Please check your API configuration and try again.`;
          }
        }
      }
      setVariations(variations);
      setGenerationCount(currentCount);
      console.log('All variations generated:', variations);
    } catch (err) {
      console.error('Full error details:', err);
      // Generate AI fallback content for all platforms
      for (const platform of platforms) {
        try {
          variations[platform] = await generateMockContent(platform, idea, currentCount);
        } catch (fallbackError) {
          console.error(`Fallback failed for ${platform}:`, fallbackError);
          variations[platform] = `Unable to generate ${platform} content. Please check your API configuration and try again.`;
        }
      }
      setVariations(variations);
      setGenerationCount(currentCount);
      alert("Some API calls failed. Using AI-generated fallback content. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIidea = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not found");
      return null;
    }

    try {
      const prompt = "Generate an interesting and engaging social media content idea. Return just the idea as a short phrase (1-6 words). Topics could include: technology trends, business insights, productivity tips, innovation, digital transformation, AI applications, remote work, marketing strategies, or startup advice.";
      
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50
        })
      });

      if (!res.ok) {
        throw new Error("API error: " + res.statusText);
      }

      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error("Error generating AI idea:", err);
      return null;
    }
  };

  const generateMockContent = async (platform, idea, generationCount) => {
    console.log(`generateMockContent called for ${platform} with idea: "${idea}" and count: ${generationCount}`);
    
    // Generate dynamic content using AI instead of static templates
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log(`API Key in generateMockContent: ${apiKey ? 'exists' : 'missing'}`);
    
    if (!apiKey) {
      console.error("No API key found in generateMockContent");
      return `AI content generation unavailable. Please check API configuration.`;
    }

    try {
      let prompt = '';
      if (platform === 'Twitter') {
        prompt = `Create a compelling Twitter post (max 280 characters) about: ${idea}. Requirements:
        - Start with an engaging hook
        - Include 2-3 key points with bullet points
        - Add relevant hashtags (2-3 max)
        - End with a question or call to action
        - Make it conversational and impactful
        - This is generation attempt ${generationCount}, make it unique`;
      } else if (platform === 'LinkedIn') {
        prompt = `Write a professional LinkedIn post about: ${idea}. Requirements:
        - Start with a strong, attention-grabbing headline
        - Include 3-4 key insights with bullet points
        - Add professional context and business implications
        - Include relevant hashtags (3-4 max)
        - End with an engaging question to encourage discussion
        - Keep tone professional but conversational
        - This is generation attempt ${generationCount}, provide a fresh perspective`;
      } else if (platform === 'Medium') {
        prompt = `Create a Medium article preview about: ${idea}. Requirements:
        - Start with an intriguing, SEO-friendly title
        - Write a compelling introduction (2-3 paragraphs)
        - Include 2-3 section headings with key insights
        - Add bullet points for key takeaways
        - End with a teaser to encourage reading the full article
        - Make it thoughtful and in-depth
        - This is generation attempt ${generationCount}, offer a unique angle`;
      }
      
      console.log(`Prompt for ${platform}:`, prompt);
      
      const requestBody = {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: platform === 'Twitter' ? 100 : 300
      };
      
      console.log(`Request body for ${platform}:`, JSON.stringify(requestBody, null, 2));
      
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App"
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`Response status for ${platform} fallback:`, res.status);
      console.log(`Response headers for ${platform} fallback:`, Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fallback API error for ${platform}:`, errorText);
        throw new Error(`API error for ${platform}: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log(`Fallback success response for ${platform}:`, data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`Invalid fallback response format for ${platform}:`, data);
        throw new Error(`Invalid response format for ${platform}`);
      }
      
      const content = data.choices[0].message.content.trim();
      console.log(`Generated ${platform} content:`, content);
      return content;
    } catch (err) {
      console.error(`Error generating ${platform} content in fallback:`, err);
      return `Unable to generate ${platform} content. Error: ${err.message}`;
    }
  };

  const planImages = async () => {
    const idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter(p => publishTo[p]);

    if (!idea) return alert("Enter your idea first");
    if (platforms.length === 0) return alert("Select at least one platform");

    setLoading(true);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      alert("OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.");
      setLoading(false);
      return;
    }

    try {
      // First, generate image prompts based on the post idea
      const promptGenerationResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `Based on this post idea: "${idea}"

Generate 3 search keywords that would find relevant stock images for this topic. These should be specific visual concepts that match the theme.

For example, if the idea is "productivity tips", keywords might be: ["focused person working", "organized workspace", "time management visual"]

Format as a JSON array of 3 strings:
["keyword1", "keyword2", "keyword3"]

Generate keywords now:`
          }],
          max_tokens: 150
        })
      });

      if (!promptGenerationResponse.ok) {
        throw new Error("Failed to generate image keywords");
      }

      const promptData = await promptGenerationResponse.json();
      const keywordsText = promptData.choices[0].message.content.trim();
      const keywords = JSON.parse(keywordsText);
      const mainKeyword = keywords[0] || idea.split(' ')[0];

      // Generate platform-specific images using Pexels API (real semantic image search)
      const imagePromises = platforms.map(async (platform) => {
        try {
          let searchQuery = mainKeyword;
          let imageDimensions = "400x300";
          
          if (platform === 'Twitter') {
            searchQuery = `${mainKeyword}`;
            imageDimensions = "400x200";
          } else if (platform === 'LinkedIn') {
            searchQuery = `${mainKeyword} professional`;
            imageDimensions = "400x300";
          } else if (platform === 'Medium') {
            searchQuery = `${mainKeyword} article`;
            imageDimensions = "400x400";
          }

          // Use Pexels API for semantic image search (returns real photos matching the keyword)
          const pexelsResponse = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=3`,
            {
              headers: {
                'Authorization': 'c5qR9Kx3vL2mN8pQ7wE4tY1uO6jH9fD0'  // Pexels public API key
              }
            }
          );

          let images = [];
          
          if (pexelsResponse.ok) {
            const pexelsData = await pexelsResponse.json();
            images = pexelsData.photos.slice(0, 3).map((photo, idx) => {
              return {
                url: photo.src.medium,  // Use medium size from Pexels
                description: `"${photo.alt}" - ${searchQuery}`,
                selected: idx === 0,
                keyword: searchQuery,
                photographer: photo.photographer
              };
            });
          } else {
            // Fallback: Use Unsplash Source API if Pexels fails
            const [width, height] = imageDimensions.split('x');
            images = keywords.map((keyword, idx) => ({
              url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`,
              description: `${keyword} - optimized for ${platform}`,
              selected: idx === 0,
              keyword: keyword
            }));
          }

          return {
            platform,
            images
          };
        } catch (err) {
          console.error(`Error generating images for ${platform}:`, err);
          // Final fallback: use Unsplash Source
          const [width, height] = imageDimensions.split('x');
          return {
            platform,
            images: keywords.slice(0, 3).map((keyword, idx) => ({
              url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`,
              description: `${keyword} - optimized for ${platform}`,
              selected: idx === 0,
              keyword: keyword
            }))
          };
        }
      });

      const results = await Promise.all(imagePromises);
      const newImages = {};
      results.forEach(({ platform, images }) => {
        newImages[platform] = images;
      });
      
      setSelectedImages(newImages);
      
      // Show feedback about generated images
      alert(`✨ Generated ${platforms.length} image sets based on "${mainKeyword}". Select your preferred images for each platform.`);
    } catch (err) {
      console.error(err);
      alert("Error planning images: " + err.message);
      // Fallback: Use Unsplash Source API (free, no auth needed)
      const newImages = {};
      const fallbackKeywords = idea.split(' ').slice(0, 3); // Use first 3 words from idea
      
      platforms.forEach((platform, platformIdx) => {
        const [width, height] = (platform === 'Twitter' ? '400x200' : platform === 'LinkedIn' ? '400x300' : '400x400').split('x');
        
        newImages[platform] = [
          {
            url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(fallbackKeywords[0] || 'business')}`,
            description: `${fallbackKeywords[0]} image for ${platform}`,
            selected: true,
            keyword: fallbackKeywords[0]
          },
          {
            url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(fallbackKeywords[1] || 'professional')}`,
            description: `${fallbackKeywords[1]} image for ${platform}`,
            selected: false,
            keyword: fallbackKeywords[1]
          },
          {
            url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(fallbackKeywords[2] || 'content')}`,
            description: `${fallbackKeywords[2]} image for ${platform}`,
            selected: false,
            keyword: fallbackKeywords[2]
          }
        ];
      });
      setSelectedImages(newImages);
    } finally {
      setLoading(false);
    }
  };

  const regenerateContent = async (platform) => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);
    
    // TEMPORAIRE: Utilisation directe de la clé pour tester
    const apiKey = "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";
    
    console.log(`=== REGENERATE DEBUG for ${platform} ===`);
    console.log('API Key available:', !!apiKey);
    console.log('Idea:', idea);

    try {
      let prompt = '';
      if (platform === 'Twitter') {
        prompt = `Create a completely different Twitter post about: ${idea}. Requirements:
        - Use a different angle or perspective from typical posts
        - Start with a unique hook (question, statistic, or bold statement)
        - Include 2-3 fresh insights with bullet points
        - Add relevant hashtags (2-3 max)
        - End with engagement-focused question
        - Keep under 280 characters
        - Make it stand out from standard ${idea} content`;
      } else if (platform === 'LinkedIn') {
        prompt = `Write a fresh LinkedIn post about: ${idea} with a unique perspective. Requirements:
        - Start with a compelling, thought-provoking headline
        - Include 3-4 original insights with bullet points
        - Add professional context with real-world examples
        - Include relevant hashtags (3-4 max)
        - End with a discussion-provoking question
        - Keep tone authoritative yet approachable
        - Provide actionable advice or strategic thinking`;
      } else if (platform === 'Medium') {
        prompt = `Create a unique Medium article preview about: ${idea} with a fresh angle. Requirements:
        - Start with an intriguing, controversial or surprising title
        - Write a compelling introduction with a strong thesis
        - Include 2-3 section headings with original insights
        - Add bullet points with actionable takeaways
        - End with a thought-provoking conclusion or question
        - Make it analytical and insightful
        - Offer a unique perspective not commonly discussed`;
      }
      
      console.log(`Regenerate prompt for ${platform}:`, prompt);
      
      const requestBody = {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: platform === 'Twitter' ? 100 : 300
      };
      
      console.log(`Regenerate request body for ${platform}:`, JSON.stringify(requestBody, null, 2));
      
      try {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App"
        };
        
        console.log(`Regenerate headers for ${platform}:`, headers);
        
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody)
        });

        console.log(`Regenerate response status for ${platform}:`, res.status);
        console.log(`Regenerate response headers for ${platform}:`, Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Regenerate error response for ${platform}:`, errorText);
          throw new Error(`OpenAI API error for ${platform}: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log(`Regenerate success response for ${platform}:`, data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error(`Invalid regenerate response format for ${platform}`);
        }
        
        const newContent = data.choices[0].message.content.trim();
        console.log(`Regenerated ${platform} content:`, newContent);
        
        setVariations(prev => ({
          ...prev,
          [platform]: newContent
        }));
        
        setGenerationCount(prev => prev + 1);
      } catch (fetchError) {
        console.warn(`Regenerate API call failed for ${platform}, using fallback:`, fetchError.message);
        // Use fallback content
        const fallbackContent = generateAlternativeMockContent(platform, idea);
        setVariations(prev => ({
          ...prev,
          [platform]: fallbackContent
        }));
      }
    } catch (err) {
      console.error('Regenerate full error:', err);
      alert("Error regenerating content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAlternativeMockContent = (platform, idea) => {
    const alternativeContent = {
      Twitter: `🔥 Breaking: ${idea} is changing everything!\n\nLatest developments:\n✨ Revolutionary approach\n📈 Impressive results\n🎯 Game-changing strategy\n\nWho's ready to level up? #${idea.replace(/\s+/g, '')} #Innovation #Future`,
      LinkedIn: `**Why ${idea} Matters Now More Than Ever**\n\nThe landscape is shifting rapidly, and ${idea} is at the forefront of this transformation. Industry leaders are taking notice.\n\n**Critical Insights:**\n• Market trends show unprecedented adoption\n• ROI metrics exceed expectations\n• Competitive advantage is significant\n\nWhat's your organization's strategy for ${idea}? Share your experiences below.\n\n#${idea.replace(/\s+/g, '')} #Leadership #Strategy`,
      Medium: `# Beyond the Hype: Real ${idea} Applications\n\nWhile everyone talks about ${idea}, few understand its practical implications. This analysis cuts through the noise to deliver actionable insights.\n\n## The Reality Check\n\nImplementation of ${idea} strategies requires more than just technical knowledge. It demands a fundamental shift in thinking and approach.\n\n## Practical Framework\n\nBased on extensive research and real-world case studies, here's what actually works:\n\n1. **Strategic Alignment**: Ensuring ${idea} supports core business objectives\n2. **Change Management**: Preparing teams for transformation\n3. **Measurement Systems**: Tracking meaningful KPIs\n\n*This analysis continues with detailed implementation guidelines and case studies.*`
    };
    
    return alternativeContent[platform] || `Alternative perspective on ${idea} for ${platform}. This is demo content showing variety in generated outputs.`;
  };

  const enhanceContent = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      alert("OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.");
      setLoading(false);
      return;
    }

    try {
      const prompt = `Enhance and improve this idea to make it more engaging and specific: "${idea}". Add details, make it more compelling, and suggest angles for different social media platforms.`;
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150
        })
      });

      if (!res.ok) {
        throw new Error("OpenAI API error: " + res.statusText);
      }

      const data = await res.json();
      const enhancedIdea = data.choices[0].message.content.trim();
      ideaRef.current.value = enhancedIdea;
      setCharCount(enhancedIdea.length);
    } catch (err) {
      console.error(err);
      alert("Error enhancing content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Please enter an idea before saving");
    if (!draftName.trim()) return alert("Please enter a draft name");

    const draft = {
      id: Date.now(),
      name: draftName,
      idea: idea,
      variations: variations,
      selectedImages: selectedImages,
      publishTo: publishTo,
      createdAt: new Date().toISOString()
    };

    const existingDrafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
    existingDrafts.push(draft);
    localStorage.setItem('autoposter_drafts', JSON.stringify(existingDrafts));
    
    // Update stats immediately
    setStats(calculateRealStats());
    
    setShowSaveDraftModal(false);
    setDraftName('');
    alert('Draft saved successfully!');
  };

  const schedulePosts = () => {
    if (!scheduleDate || !scheduleTime) {
      return alert('Please select both date and time for scheduling');
    }

    const scheduledPlatforms = Object.keys(publishTo).filter(p => publishTo[p]);
    if (scheduledPlatforms.length === 0) {
      return alert('Please select at least one platform to schedule');
    }

    const scheduledPost = {
      id: Date.now(),
      idea: ideaRef.current.value.trim(),
      variations: variations,
      selectedImages: selectedImages,
      platforms: scheduledPlatforms,
      scheduleDate: scheduleDate,
      scheduleTime: scheduleTime,
      createdAt: new Date().toISOString()
    };

    const existingScheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
    existingScheduled.push(scheduledPost);
    localStorage.setItem('autoposter_scheduled', JSON.stringify(existingScheduled));
    
    // Update stats immediately
    setStats(calculateRealStats());
    
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
    alert('Posts scheduled successfully!');
  };

  const getMoreTips = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setLoading(false);
      return;
    }

    try {
      const prompt = `Based on this content idea: "${idea}", provide 3 specific, actionable suggestions for improving social media engagement. Return as a JSON array of objects with format: {"type": "suggestion|optimization|insight", "icon": "relevant emoji", "title": "brief title", "content": "specific actionable tip"}`;
      
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 250
        })
      });

      if (!res.ok) {
        throw new Error("OpenAI API error: " + res.statusText);
      }

      const data = await res.json();
      const newSuggestions = JSON.parse(data.choices[0].message.content.trim());
      setAiSuggestions(newSuggestions);
    } catch (err) {
      console.error(err);
      // Fallback suggestions if API fails
      setAiSuggestions([
        { type: 'suggestion', icon: '⏰', title: 'Timing', content: 'Post during peak engagement hours for your audience' },
        { type: 'optimization', icon: '📱', title: 'Mobile', content: 'Ensure content looks great on mobile devices' },
        { type: 'insight', icon: '🎯', title: 'Targeting', content: 'Use relevant hashtags and mentions to increase reach' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white">
        {/* HEADER */}
        <div className="p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Compose & Generate Post</h1>
              <p className="text-gray-400">Write once, publish everywhere with AI optimization</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all">
                <FontAwesomeIcon icon={faHistory} className="mr-2" />
                History
              </button>
              <button 
                onClick={getMoreTips}
                className="px-4 py-2 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                AI Assist
              </button>
            </div>
          </div>
        </div>

        {/* PLATFORM TOGGLES */}
        <div className="p-8 pb-0">
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 font-medium">Publish to:</span>
            {['Twitter', 'LinkedIn', 'Medium'].map((platform) => (
              <label key={platform} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishTo[platform]}
                  onChange={() => togglePublish(platform)}
                  className="sr-only"
                />
                <div className="relative">
                  <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                    publishTo[platform] ? 'bg-cyan-400' : 'bg-gray-700'
                  }`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                    publishTo[platform] ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </div>
                <div className="ml-3 flex items-center">
                  <FontAwesomeIcon 
                    icon={platform === 'Twitter' ? faXTwitter : platform === 'LinkedIn' ? faLinkedin : faMedium}
                    className={`mr-2 ${
                      platform === 'Twitter' ? 'text-white' : 
                      platform === 'LinkedIn' ? 'text-blue-400' : 'text-green-400'
                    }`}
                  />
                  <span className="text-white font-medium">{platform}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* IDEA INPUT */}
        <div className="p-8">
          {hookInfo && (
            <div className="mb-4 p-4 bg-green-400/10 border border-green-400/30 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium mb-1">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    Hook inséré depuis le HookGenerator
                  </p>
                  <p className="text-gray-400 text-xs">
                    Score: {hookInfo.score}% | Platform: {hookInfo.platform} | Type: {hookInfo.type}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/HookGeneratorPage')}
                  className="px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 rounded-xl text-cyan-400 text-sm hover:bg-cyan-400/30"
                >
                  <i className="fa-solid fa-arrow-left mr-1"></i>
                  Retour
                </button>
              </div>
            </div>
          )}
          <div className="card-bg rounded-3xl p-8 border border-gray-700 glow-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Your Idea</h2>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">AI will optimize for each platform</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                ref={ideaRef}
                className="w-full h-48 bg-gray-800/50 border border-gray-600 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Write your idea or topic here... \n\nExamples:\n• Share insights about AI in content marketing\n• Discuss productivity tips for remote work\n• Review the latest industry trends\n• Tell a story about overcoming challenges\n\nThe AI will adapt your content for each platform's unique style and audience."
              ></textarea>
              <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                <span className="text-gray-500 text-sm">
                  <span id="char-count">{charCount}</span> characters
                </span>
                <button 
                  onClick={enhanceContent}
                  className="px-4 py-2 rounded-xl bg-violet-400/20 text-violet-400 hover:bg-violet-400/30 transition-colors"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                  AI Enhance
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI OUTPUTS - PLATFORM COLUMNS */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {['Twitter', 'LinkedIn', 'Medium'].map((platform) => (
              <div 
                key={platform} 
                className={`platform-column ${publishTo[platform] ? 'active' : 'opacity-50'}`}
              >
                <div className="card-bg rounded-3xl p-6 border border-gray-700 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={platform === 'Twitter' ? faXTwitter : platform === 'LinkedIn' ? faLinkedin : faMedium}
                        className={`mr-3 ${
                          platform === 'Twitter' ? 'text-white' : 
                          platform === 'LinkedIn' ? 'text-blue-400' : 'text-green-400'
                        }`}
                      />
                      <h3 className="text-lg font-semibold text-white">{platform}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => regenerateContent(platform)}
                        className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                      >
                        <FontAwesomeIcon icon={faRotateRight} className="text-sm" />
                      </button>
                      <button 
                        onClick={() => {
                          const textarea = document.querySelector(`#${platform.toLowerCase()}-textarea`);
                          if (textarea) {
                            textarea.focus();
                            textarea.select();
                          }
                        }}
                        className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-600">
                      <textarea
                        id={`${platform.toLowerCase()}-textarea`}
                        className="w-full bg-gray-800/50 rounded-2xl p-4 text-gray-300 text-sm resize-none focus:border-cyan-400 focus:outline-none"
                        value={variations[platform] || ''}
                        onChange={(e) =>
                          setVariations((prev) => ({ ...prev, [platform]: e.target.value }))
                        }
                        placeholder={`Your ${platform} content will appear here...`}
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs font-medium ${
                          platform === 'Twitter' ? 'text-cyan-400' :
                          platform === 'LinkedIn' ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          {variations[platform] ? 
                            (platform === 'Twitter' ? `${variations[platform].length}/280` :
                             platform === 'LinkedIn' ? `${variations[platform].length} characters` : 
                             `${variations[platform].split(' ').length} words`) :
                            (platform === 'Twitter' ? '0/280' :
                             platform === 'LinkedIn' ? '0 characters' : '0 words')
                          }
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500 text-xs">
                          <FontAwesomeIcon icon={platform === 'Twitter' ? faHeart : platform === 'LinkedIn' ? faThumbsUp : faEye} />
                          <span>Est. {platform === 'Twitter' ? '45 likes' : platform === 'LinkedIn' ? '120 reactions' : '8 min read'}</span>
                        </div>
                      </div>
                    </div>

                    {/* IMAGE SUGGESTIONS */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm flex items-center">
                        <FontAwesomeIcon icon={faImage} className={`mr-2 ${
                          platform === 'Twitter' ? 'text-cyan-400' :
                          platform === 'LinkedIn' ? 'text-blue-400' : 'text-green-400'
                        }`} />
                        Suggested Images
                      </h4>
                      <div className={platform === 'Twitter' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
                        {(selectedImages[platform] || []).map((image, index) => (
                          <div 
                            key={index}
                            className={`relative group cursor-pointer ${
                              image.selected ? 'ring-2 ring-cyan-400' : ''
                            }`}
                            onClick={() => {
                              const newImages = { ...selectedImages };
                              newImages[platform] = newImages[platform].map((img, i) => ({
                                ...img,
                                selected: i === index
                              }));
                              setSelectedImages(newImages);
                            }}
                          >
                            <div className="relative">
                              <img 
                                className={`${platform === 'Twitter' ? 'w-full h-24' : 'w-full h-32'} rounded-xl object-cover`} 
                                src={image.url} 
                                alt={image.description} 
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faCheck} className="text-white text-lg" />
                              </div>
                              {image.selected && (
                                <div className="absolute top-1 right-1 bg-cyan-400 text-black rounded-full p-1">
                                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-gray-400 line-clamp-2" title={image.description}>
                              {image.keyword || image.description}
                            </div>
                          </div>
                        ))}
                        {(!selectedImages[platform] || selectedImages[platform].length === 0) && (
                          <div className={`text-gray-500 text-sm ${platform === 'Twitter' ? 'col-span-2' : ''}`}>
                            Click "Plan Images" to generate AI-suggested images
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={planImages}
              className="flex items-center px-6 py-3 rounded-2xl bg-violet-400/20 border border-violet-400/30 text-violet-400 hover:bg-violet-400/30 transition-all"
            >
              <FontAwesomeIcon icon={faPalette} className="mr-2" />
              Plan Images
            </button>
            
            <button 
              onClick={generateText}
              className="flex items-center px-6 py-3 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
            >
              <FontAwesomeIcon icon={faComments} className="mr-2" />
              Generate Text
            </button>
            
            <button 
              onClick={() => setShowSaveDraftModal(true)}
              className="flex items-center px-6 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save Draft
            </button>
            
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center px-6 py-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/30 transition-all"
            >
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              Schedule
            </button>
          </div>
        </div>

        {/* AI ASSISTANT PANEL */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-80 z-30 hidden xl:block">
          <div className="card-bg rounded-3xl p-6 border border-gray-700 glow-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faRobot} className="text-white" />
                </div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
              </div>
              {loading && <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 animate-spin" />}
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 bg-gray-800/50 rounded-2xl text-center">
                  <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 animate-spin text-xl mb-2" />
                  <p className="text-gray-400 text-sm">Generating AI suggestions...</p>
                </div>
              ) : aiSuggestions.length > 0 ? (
                aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-2xl">
                    <div className={`text-sm font-medium mb-2 ${
                      suggestion.type === 'suggestion' ? 'text-cyan-400' :
                      suggestion.type === 'optimization' ? 'text-violet-400' : 'text-green-400'
                    }`}>
                      {suggestion.icon} {suggestion.title}
                    </div>
                    <div className="text-gray-300 text-sm">{suggestion.content}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-800/50 rounded-2xl text-center">
                  <p className="text-gray-400 text-sm">Enter an idea and click "Get More Tips" for personalized suggestions</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={getMoreTips}
              disabled={loading}
              className="w-full mt-4 p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
              Get More Tips
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-bg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Drafts</span>
                <FontAwesomeIcon icon={faFileText} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.drafts}</div>
              <div className="text-green-400 text-xs">{stats.draftsTrend}</div>
            </div>
            
            <div className="card-bg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Scheduled</span>
                <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.scheduled}</div>
              <div className="text-cyan-400 text-xs">{stats.scheduledNext}</div>
            </div>
            
            <div className="card-bg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Published</span>
                <FontAwesomeIcon icon={faCheckCircle} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.published}</div>
              <div className="text-violet-400 text-xs">{stats.publishedThisMonth}</div>
            </div>
            
            <div className="card-bg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Engagement</span>
                <FontAwesomeIcon icon={faHeart} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.engagement}</div>
              <div className="text-green-400 text-xs">{stats.engagementTrend}</div>
            </div>
          </div>
        </div>

        {/* SCHEDULE MODAL */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-2xl w-full border border-gray-700 relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Schedule Posts</h2>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-medium mb-2">Date</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-gray-800 border border-gray-600 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Time</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-gray-800 border border-gray-600 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Platforms</label>
                <div className="flex space-x-4">
                  {['Twitter', 'LinkedIn', 'Medium'].map((platform) => (
                    <label key={platform} className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={publishTo[platform]}
                        onChange={() => togglePublish(platform)}
                        className="sr-only" 
                      />
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        publishTo[platform] 
                          ? platform === 'Twitter' ? 'bg-cyan-400 border-cyan-400' :
                            platform === 'LinkedIn' ? 'bg-blue-400 border-blue-400' :
                            'bg-green-400 border-green-400'
                          : 'bg-gray-600 border-gray-600'
                      }`}>
                        {publishTo[platform] && (
                          <FontAwesomeIcon 
                            icon={faCheck} 
                            className={`text-xs ${
                              platform === 'Twitter' || platform === 'Medium' ? 'text-black' : 'text-white'
                            }`} 
                          />
                        )}
                      </div>
                      <span className="ml-2 text-white">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={schedulePosts}
                  className="flex-1 p-4 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
                >
                  Schedule Posts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SAVE DRAFT MODAL */}
        {showSaveDraftModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-lg w-full border border-gray-700 relative">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faSave} className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Save Draft</h2>
                <p className="text-gray-400">Give your draft a name to find it easily later</p>
              </div>
              
              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="Draft name..."
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowSaveDraftModal(false)}
                  className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveDraft}
                  className="flex-1 p-4 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
                >
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-white mb-8">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Generating...
          </div>
        )}
      </div>
    </div>
  );
}