import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faSync, faWandMagicSparkles, faPlus, faTimes, 
  faSpinner, faCheck, faExclamationTriangle, faHistory, faRotateRight, 
  faEdit, faImage, faPalette, faComments, faHeart, faThumbsUp, faEye
} from '@fortawesome/free-solid-svg-icons';
import { faXTwitter, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import { usePosts } from '../context/PostsProvider';

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
  const [selectedImages, setSelectedImages] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([
    { type: 'suggestion', icon: '⏰', title: 'Timing', content: 'Your content performs 35% better when posted between 2-4 PM on weekdays.' },
    { type: 'optimization', icon: '📱', title: 'Mobile', content: 'Ensure content looks great on mobile devices' },
    { type: 'insight', icon: '🎯', title: 'Targeting', content: 'Use relevant hashtags and mentions to increase reach' }
  ]);
  const [generationCount, setGenerationCount] = useState(0);

  // Use the global posts store
  const { createPost, stats } = usePosts();
  const navigate = useNavigate();

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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
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
        - Keep it conversational and impactful
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
          max_tokens: platform === 'Twitter' ? 100 : 300
        })
      });

      if (!res.ok) {
        throw new Error(`API error for ${platform}: ${res.statusText}`);
      }

      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error(`Error generating ${platform} content:`, err);
      return `Unable to generate ${platform} content. Please try again.`;
    }
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

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('API Key available:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    
    if (!apiKey) {
      setLoading(false);
      return alert("OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.");
    }

    const newVariations = {};
    const currentCount = generationCount + 1;
    
    try {
      for (const platform of platforms) {
        console.log(`Generating content for ${platform} (attempt ${currentCount})...`);
        
        let content = await generateMockContent(platform, idea, currentCount);
        newVariations[platform] = content;
      }
      
      setVariations(newVariations);
      setGenerationCount(currentCount);
      console.log('All variations generated:', newVariations);
    } catch (err) {
      console.error('Full error details:', err);
      // Generate AI fallback content for all platforms
      for (const platform of platforms) {
        try {
          newVariations[platform] = await generateMockContent(platform, idea, currentCount);
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${platform}:`, fallbackError);
          newVariations[platform] = `Unable to generate ${platform} content. Please check your API configuration and try again.`;
        }
      }
      setVariations(newVariations);
      setGenerationCount(currentCount);
      alert("Some API calls failed. Using AI-generated fallback content. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Please enter an idea before saving");
    if (!draftName.trim()) return alert("Please enter a draft name");

    try {
      const draftData = {
        idea: idea,
        content: idea,
        platforms: publishTo,
        selectedImages: selectedImages,
        status: 'draft',
        draftName: draftName
      };

      await createPost(draftData);
      
      setShowSaveDraftModal(false);
      setDraftName('');
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    }
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
      idea: ideaRef.current.value.trim(),
      variations: variations,
      selectedImages: selectedImages,
      platforms: scheduledPlatforms,
      scheduleDate: scheduleDate,
      scheduleTime: scheduleTime,
      status: 'scheduled'
    };

    // For now, save to localStorage (will be replaced with store integration)
    const existingScheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
    existingScheduled.push(scheduledPost);
    localStorage.setItem('autoposter_scheduled', JSON.stringify(existingScheduled));
    
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
    alert('Posts scheduled successfully!');
  };

  const regenerateContent = async (platform) => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    console.log(`=== REGENERATE DEBUG for ${platform} ===`);
    console.log('API Key available:', !!apiKey);
    console.log('Idea:', idea);

    try {
      const content = await generateMockContent(platform, idea, generationCount + 1);
      
      setVariations(prev => ({
        ...prev,
        [platform]: content
      }));
      
      setGenerationCount(prev => prev + 1);
    } catch (err) {
      console.error('Regenerate full error:', err);
      alert("Error regenerating content: " + err.message);
    } finally {
      setLoading(false);
    }
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

  const planImages = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    try {
      const prompt = `Generate 3 detailed image descriptions for a social media post about: "${idea}". Return as a JSON array with format: [{"url": "placeholder", "description": "detailed description"}]`;
      
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
          max_tokens: 300
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }

      const data = await res.json();
      const imageDescriptions = JSON.parse(data.choices[0].message.content.trim());
      
      const platforms = Object.keys(publishTo).filter(p => publishTo[p]);
      const newImages = {};
      
      platforms.forEach(platform => {
        newImages[platform] = imageDescriptions.map((desc, index) => ({
          url: `https://picsum.photos/400/${platform === 'Twitter' ? '200' : '300'}?random=${Date.now() + index}`,
          description: desc,
          selected: false
        }));
      });
      
      setSelectedImages(newImages);
    } catch (err) {
      console.error(err);
      alert("Error planning images: " + err.message);
    } finally {
      setLoading(false);
    }
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

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Twitter': return faXTwitter;
      case 'LinkedIn': return faLinkedin;
      case 'Medium': return faMedium;
      default: return faXTwitter;
    }
  };

  // Get platform color
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Twitter': return 'text-blue-400';
      case 'LinkedIn': return 'text-violet-400';
      case 'Medium': return 'text-teal-400';
      default: return 'text-gray-400';
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
              <button className="px-4 py-2 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity">
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
                    icon={getPlatformIcon(platform)}
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
                  <span>{charCount}</span> characters
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
                        icon={getPlatformIcon(platform)}
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
                        rows={platform === 'Twitter' ? 3 : 6}
                      />
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {variations[platform] ? 
                            (platform === 'Twitter' ? `${variations[platform].length}/280` : 
                             platform === 'LinkedIn' ? `${variations[platform].split(' ').length} words` : 
                             `${variations[platform].split(' ').length} words`) :
                            '0/280'
                          }
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <FontAwesomeIcon icon={platform === 'Twitter' ? faHeart : platform === 'LinkedIn' ? faThumbsUp : faEye} />
                          <span>Est. {platform === 'Twitter' ? '45 likes' : platform === 'LinkedIn' ? '120 reactions' : '8 min read'}</span>
                        </div>
                      </div>
                    </div>

                    {/* IMAGE SUGGESTIONS */}
                    <div className="mt-4">
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
                            <img 
                              className={`${platform === 'Twitter' ? 'w-full h-24' : 'w-full h-32'} rounded-xl object-cover`} 
                              src={image.url} 
                              alt={image.description} 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <FontAwesomeIcon icon={faCheck} className="text-white text-lg" />
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
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Save Draft
            </button>
            
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center px-6 py-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/30 transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Schedule
            </button>
          </div>
        </div>

        {/* AI SUGGESTIONS */}
        <div className="px-8 pb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">AI Suggestions</h3>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="card-bg rounded-2xl p-6 border border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-2">{suggestion.title}</h4>
                    <p className="text-gray-400 text-sm">{suggestion.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={getMoreTips}
              className="w-full px-6 py-3 rounded-2xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              Get More Tips
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="text-center text-white">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl mb-4" />
              <div className="text-xl">Generating content...</div>
            </div>
          </div>
        )}

        {/* MODALS */}
        {showSaveDraftModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-lg w-full border border-gray-700 relative">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheck} className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Save Draft</h2>
                <p className="text-gray-400">Give your draft a name to find it easily later</p>
              </div>
              
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Enter draft name..."
                className="w-full bg-gray-800/50 rounded-2xl p-4 text-white placeholder-gray-400 border border-gray-600 focus:border-cyan-400 focus:outline-none mb-6"
              />
              
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

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-lg w-full border border-gray-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheck} className="text-cyan-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Schedule Post</h2>
                <p className="text-gray-400">Set when your content should be published</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800/50 rounded-2xl p-4 text-white placeholder-gray-400 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-gray-800/50 rounded-2xl p-4 text-white placeholder-gray-400 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                  />
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
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
