import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faWandMagicSparkles,
  faRotateRight,
  faEdit,
  faImage,
  faPalette,
  faComments,
  faSave,
  faClock,
  faRobot,
  faFileText,
  faCalendar,
  faCheckCircle,
  faHeart,
  faThumbsUp,
  faEye,
  faSpinner,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faLinkedin,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";

export default function CreatePostPage() {
  const { createPost, posts, stats: hookStats } = usePosts();
  const navigate = useNavigate();
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
  const [draftName, setDraftName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      type: "suggestion",
      icon: "",
      title: "Suggestion",
      content:
        "Your content performs 35% better when posted between 2-4 PM on weekdays.",
    },
    {
      type: "optimization",
      icon: "",
      title: "Optimization",
      content: "Adding relevant hashtags could increase reach by ~20%.",
    },
    {
      type: "insight",
      icon: "",
      title: "Insight",
      content: "Similar content generated 2.3x more engagement with images.",
    },
  ]);
  const [generationCount, setGenerationCount] = useState(0);

  const calculateStats = () => {
    const drafts = posts.filter((p) => p.status === "draft").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const published = posts.filter((p) => p.status === "posted").length;

    // Calculate engagement
    let totalEngagement = 0;
    posts.forEach((post) => {
      if (post.engagement) {
        totalEngagement +=
          (post.engagement.likes || 0) +
          (post.engagement.shares || 0) +
          (post.engagement.comments || 0);
      }
    });

    let engagementDisplay = "0";
    if (totalEngagement >= 1000) {
      engagementDisplay = (totalEngagement / 1000).toFixed(1) + "k";
    } else if (totalEngagement > 0) {
      engagementDisplay = totalEngagement.toString();
    }

    // Calculate published this month
    const publishedThisMonthCount = posts.filter((post) => {
      if (post.status !== "posted") return false;
      const postDate = new Date(post.createdAt);
      const now = new Date();
      return (
        postDate.getMonth() === now.getMonth() &&
        postDate.getFullYear() === now.getFullYear()
      );
    }).length;

    // Get next scheduled post
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");
    const nextScheduledPost = scheduledPosts.length > 0
      ? scheduledPosts.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate))[0]
      : null;

    // Get next scheduled date
    const nextScheduledDate = nextScheduledPost && nextScheduledPost.scheduleDate
      ? new Date(nextScheduledPost.scheduleDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;

    return {
      drafts,
      scheduled,
      published,
      engagement: engagementDisplay,
      draftsTrend: drafts > 0 ? `${drafts} recent` : "No recent drafts",
      scheduledNext: nextScheduledDate || "No scheduled",
      publishedThisMonth: publishedThisMonthCount > 0
        ? `${publishedThisMonthCount} this month`
        : "None yet",
      engagementTrend: totalEngagement > 0 ? "Tracking active" : "No data yet",
    };
  };

  const [stats, setStats] = useState(calculateStats());

  // Update stats when posts change
  useEffect(() => {
    setStats(calculateStats());
  }, [posts]);

  const API_BASE_URL = "http://localhost:5000/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const savePostToMongo = async ({
    content,
    status = "draft",
    platforms = {},
    schedule_date = null,
    schedule_time = null,
    engagement = {},
  }) => {
    const res = await fetch(`${API_BASE_URL}/posts/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content,
        status,
        platforms,
        schedule_date,
        schedule_time,
        engagement,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Erreur lors de l'enregistrement du post");
    }

    return data.data;
  };

  const fetchStatsFromMongo = async () => {
    const res = await fetch(`${API_BASE_URL}/posts/stats/summary`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Erreur lors du chargement des stats");
    }

    const statsData = data.data?.stats || {};
    const recentPosts = data.data?.recent_posts || [];

    const publishedThisMonthCount = recentPosts.filter((post) => {
      if (post.status !== "published") return false;
      const postDate = new Date(post.created_at);
      const now = new Date();
      return (
        postDate.getMonth() === now.getMonth() &&
        postDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const nextScheduledPost = recentPosts
      .filter((post) => post.status === "scheduled")
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

    return {
      drafts: statsData.draft || 0,
      scheduled: statsData.scheduled || 0,
      published: statsData.published || 0,
      engagement: "0",
      draftsTrend: statsData.draft > 0 ? `${statsData.draft} draft(s)` : "No recent drafts",
      scheduledNext: nextScheduledPost ? "Scheduled post available" : "No scheduled posts",
      publishedThisMonth:
        publishedThisMonthCount > 0
          ? `This month (${publishedThisMonthCount})`
          : "None yet",
      engagementTrend: "No data yet",
    };
  };

  const refreshStats = async () => {
    try {
      const mongoStats = await fetchStatsFromMongo();
      setStats(mongoStats);
    } catch (err) {
      console.error("Error loading stats:", err);
      setStats({
        drafts: 0,
        scheduled: 0,
        published: 0,
        engagement: "0",
        draftsTrend: "No recent drafts",
        scheduledNext: "No scheduled posts",
        publishedThisMonth: "None yet",
        engagementTrend: "No data yet",
      });
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // Récupérer le hook depuis localStorage
  useEffect(() => {
    const storedHook = localStorage.getItem("selectedHook");
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
    console.log("=== API KEY TEST ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length);
  }, []);

  useEffect(() => {
    const textarea = ideaRef.current;
    if (!textarea) return;

    const handler = () => setCharCount(textarea.value.length);
    textarea.addEventListener("input", handler);

    return () => textarea.removeEventListener("input", handler);
  }, []);

  const togglePublish = (platform) => {
    setPublishTo((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const generateText = async () => {
    let idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter((p) => publishTo[p]);

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
    if (!apiKey) {
      setLoading(false);
      return alert("OpenAI API key not found. Please set VITE_OPENAI_API_KEY.");
    }

    const newVariations = {};
    const currentCount = generationCount + 1;

    try {
      for (const platform of platforms) {
        let prompt = "";

        if (platform === "Twitter") {
          prompt = `Create a compelling Twitter post (max 280 characters) about: ${idea}. Requirements:
- Start with an engaging hook
- Include 2-3 key points with bullet points or numbers
- Add relevant hashtags (2-3 max)
- End with a question or call to action
- Keep it conversational and impactful
- This is generation attempt ${currentCount}, so make it unique and different from previous versions`;
        } else if (platform === "LinkedIn") {
          prompt = `Write a professional LinkedIn post about: ${idea}. Requirements:
- Start with a strong, attention-grabbing headline
- Include 3-4 key insights with bullet points
- Add professional context and business implications
- Include relevant hashtags (3-4 max)
- End with an engaging question to encourage discussion
- Keep tone professional but conversational
- This is generation attempt ${currentCount}, provide a fresh perspective`;
        } else if (platform === "Medium") {
          prompt = `Create a Medium article preview about: ${idea}. Requirements:
- Start with an intriguing, SEO-friendly title
- Write a compelling introduction (2-3 paragraphs)
- Include 2-3 section headings with key insights
- Add bullet points for key takeaways
- End with a teaser to encourage reading the full article
- Make it thoughtful and in-depth
- This is generation attempt ${currentCount}, offer a unique angle`;
        }

        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "AutoPoster App",
            },
            body: JSON.stringify({
              model: "openai/gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
              max_tokens: platform === "Twitter" ? 100 : 300,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`OpenRouter error: ${res.status} - ${errorText}`);
          }

          const data = await res.json();
          newVariations[platform] = data.choices[0].message.content.trim();
        } catch (fetchError) {
          console.warn(`API failed for ${platform}, using fallback`, fetchError);
          newVariations[platform] = await generateMockContent(
            platform,
            idea,
            currentCount
          );
        }
      }

      setVariations(newVariations);
      setGenerationCount(currentCount);
    } catch (err) {
      console.error(err);
      alert("Some API calls failed while generating text.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIidea = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
      const prompt =
        "Generate an interesting and engaging social media content idea. Return just the idea as a short phrase (1-6 words).";

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error("Error generating AI idea:", err);
      return null;
    }
  };

  const generateMockContent = async (platform, idea, count) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return `AI content generation unavailable for ${platform}.`;
    }

    let prompt = "";
    if (platform === "Twitter") {
      prompt = `Create a compelling Twitter post (max 280 characters) about: ${idea}. Generation ${count}.`;
    } else if (platform === "LinkedIn") {
      prompt = `Write a professional LinkedIn post about: ${idea}. Generation ${count}.`;
    } else {
      prompt = `Create a Medium article preview about: ${idea}. Generation ${count}.`;
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: platform === "Twitter" ? 100 : 300,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error(`Error generating ${platform} content:`, err);
      return `Unable to generate ${platform} content.`;
    }
  };

  const planImages = async () => {
    const idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter((p) => publishTo[p]);

    if (!idea) return alert("Enter your idea first");
    if (platforms.length === 0) return alert("Select at least one platform");

    setLoading(true);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      alert("OpenAI API key not found.");
      setLoading(false);
      return;
    }

    try {
      const promptGenerationResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AutoPoster App",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Based on this post idea: "${idea}"
Generate 3 search keywords for relevant stock images.
Return valid JSON array only like:
["keyword1", "keyword2", "keyword3"]`,
              },
            ],
            max_tokens: 150,
          }),
        }
      );

      if (!promptGenerationResponse.ok) {
        throw new Error("Failed to generate image keywords");
      }

      const promptData = await promptGenerationResponse.json();
      const keywordsText = promptData.choices[0].message.content.trim();
      const keywords = JSON.parse(keywordsText);
      const mainKeyword = keywords[0] || idea.split(" ")[0];

      const imagePromises = platforms.map(async (platform) => {
        try {
          let searchQuery = mainKeyword;
          let imageDimensions = "400x300";

          if (platform === "Twitter") {
            searchQuery = `${mainKeyword}`;
            imageDimensions = "400x200";
          } else if (platform === "LinkedIn") {
            searchQuery = `${mainKeyword} professional`;
            imageDimensions = "400x300";
          } else if (platform === "Medium") {
            searchQuery = `${mainKeyword} article`;
            imageDimensions = "400x400";
          }

          const pexelsResponse = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(
              searchQuery
            )}&per_page=3`,
            {
              headers: {
                Authorization: "YOUR_PEXELS_API_KEY",
              },
            }
          );

          let images = [];

          if (pexelsResponse.ok) {
            const pexelsData = await pexelsResponse.json();
            images = pexelsData.photos.slice(0, 3).map((photo, idx) => ({
              url: photo.src.medium,
              description: `"${photo.alt}" - ${searchQuery}`,
              selected: idx === 0,
              keyword: searchQuery,
              photographer: photo.photographer,
            }));
          } else {
            const [width, height] = imageDimensions.split("x");
            images = keywords.map((keyword, idx) => ({
              url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(
                keyword
              )}`,
              description: `${keyword} - optimized for ${platform}`,
              selected: idx === 0,
              keyword,
            }));
          }

          return { platform, images };
        } catch (err) {
          console.error(`Error generating images for ${platform}:`, err);
          return { platform, images: [] };
        }
      });

      const results = await Promise.all(imagePromises);
      const newImages = {};
      results.forEach(({ platform, images }) => {
        newImages[platform] = images;
      });

      setSelectedImages(newImages);
      alert(`Generated ${platforms.length} image sets based on "${mainKeyword}".`);
    } catch (err) {
      console.error(err);
      alert("Error planning images: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerateContent = async (platform) => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setLoading(false);
      return alert("Missing API key");
    }

    try {
      let prompt = "";

      if (platform === "Twitter") {
        prompt = `Create a completely different Twitter post about: ${idea}.`;
      } else if (platform === "LinkedIn") {
        prompt = `Write a fresh LinkedIn post about: ${idea}.`;
      } else {
        prompt = `Create a unique Medium article preview about: ${idea}.`;
      }

      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AutoPoster App",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: platform === "Twitter" ? 100 : 300,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }

        const data = await res.json();
        const newContent = data.choices[0].message.content.trim();

        setVariations((prev) => ({
          ...prev,
          [platform]: newContent,
        }));

        setGenerationCount((prev) => prev + 1);
      } catch (fetchError) {
        console.warn("Fallback regenerate used:", fetchError);
        const fallbackContent = generateAlternativeMockContent(platform, idea);
        setVariations((prev) => ({
          ...prev,
          [platform]: fallbackContent,
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Error regenerating content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAlternativeMockContent = (platform, idea) => {
    const alternativeContent = {
      Twitter: `🔥 ${idea} is changing everything!\n\n#Innovation #Future`,
      LinkedIn: `Why ${idea} Matters Now More Than Ever.\n\n#Leadership #Strategy`,
      Medium: `# Beyond the Hype: Real ${idea} Applications`,
    };

    return (
      alternativeContent[platform] ||
      `Alternative perspective on ${idea} for ${platform}.`
    );
  };

  const enhanceContent = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return alert("Enter your idea first");

    setLoading(true);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      alert("OpenAI API key not found.");
      setLoading(false);
      return;
    }

    try {
      const prompt = `Enhance and improve this idea: "${idea}".`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
        }),
      });

      if (!res.ok) throw new Error("OpenAI API error");

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

const saveDraft = async () => {
  const idea = ideaRef.current.value.trim();

  if (!idea) return alert("Please enter an idea before saving");
  if (!draftName.trim()) return alert("Please enter a draft name");

  try {
    await createPost({
      idea,
      content: idea,
      platforms: publishTo,
      status: "draft",
      engagement: {}
    });

    alert("Draft saved successfully!");
    setShowSaveDraftModal(false);
    setDraftName("");

    await refreshStats(); // update stats
  } catch (err) {
    console.error("SAVE DRAFT ERROR:", err);
    alert(err.message);
  }
};

const schedulePosts = async () => {
  const idea = ideaRef.current.value.trim();

  if (!idea) return alert("Please enter an idea first");
  if (!scheduleDate || !scheduleTime)
    return alert("Please select both date and time");

  const scheduledPlatforms = Object.keys(publishTo).filter(
    (p) => publishTo[p]
  );

  if (scheduledPlatforms.length === 0) {
    return alert("Please select at least one platform to schedule");
  }

  try {
    await createPost({
      idea,
      content: idea,
      platforms: publishTo,
      status: "scheduled",
      scheduleDate: scheduleDate,
      scheduleTime: scheduleTime,
      engagement: {},
    });

    alert("Post scheduled successfully!");
    setShowScheduleModal(false);
    setScheduleDate("");
    setScheduleTime("");

    await refreshStats();
  } catch (err) {
    console.error("SCHEDULE ERROR:", err);
    alert(err.message);
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
      const prompt = `Based on this content idea: "${idea}", provide 3 actionable suggestions as JSON.`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AutoPoster App",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 250,
        }),
      });

      if (!res.ok) {
        throw new Error("OpenAI API error");
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content.trim());
      setAiSuggestions(parsed);
    } catch (err) {
      console.error(err);
      setAiSuggestions([
        {
          type: "suggestion",
          icon: "⏰",
          title: "Timing",
          content: "Post during peak engagement hours for your audience",
        },
        {
          type: "optimization",
          icon: "📱",
          title: "Mobile",
          content: "Ensure content looks great on mobile devices",
        },
        {
          type: "insight",
          icon: "🎯",
          title: "Targeting",
          content: "Use relevant hashtags and mentions to increase reach",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white">
        <div className="p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Compose & Generate Post
              </h1>
              <p className="text-gray-400">
                Write once, publish everywhere with AI optimization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all">
                <FontAwesomeIcon icon={faHistory} className="mr-2" />
                History
              </button>
              <button
                onClick={() => setShowAiAssistant(true)}
                className="px-4 py-2 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                AI Assist
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 pb-0">
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 font-medium">Publish to:</span>
            {["Twitter", "LinkedIn", "Medium"].map((platform) => (
              <label key={platform} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishTo[platform]}
                  onChange={() => togglePublish(platform)}
                  className="sr-only"
                />
                <div className="relative">
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      publishTo[platform] ? "bg-cyan-400" : "bg-gray-700"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                      publishTo[platform] ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>
                <div className="ml-3 flex items-center">
                  <FontAwesomeIcon
                    icon={
                      platform === "Twitter"
                        ? faTwitter
                        : platform === "LinkedIn"
                        ? faLinkedin
                        : faMedium
                    }
                    className={`mr-2 ${
                      platform === "Twitter"
                        ? "text-white"
                        : platform === "LinkedIn"
                        ? "text-blue-400"
                        : "text-green-400"
                    }`}
                  />
                  <span className="text-white font-medium">{platform}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

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
                <span className="text-gray-400 text-sm">
                  AI will optimize for each platform
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={ideaRef}
                className="w-full h-48 bg-gray-800/50 border border-gray-600 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder={`Write your idea or topic here...

Examples:
• Share insights about AI in content marketing
• Discuss productivity tips for remote work
• Review the latest industry trends
• Tell a story about overcoming challenges

The AI will adapt your content for each platform's unique style and audience.`}
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

        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {["Twitter", "LinkedIn", "Medium"].map((platform) => (
              <div
                key={platform}
                className={`platform-column ${
                  publishTo[platform] ? "active" : "opacity-50"
                }`}
              >
                <div className="card-bg rounded-3xl p-6 border border-gray-700 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={
                          platform === "Twitter"
                            ? faTwitter
                            : platform === "LinkedIn"
                            ? faLinkedin
                            : faMedium
                        }
                        className={`mr-3 ${
                          platform === "Twitter"
                            ? "text-white"
                            : platform === "LinkedIn"
                            ? "text-blue-400"
                            : "text-green-400"
                        }`}
                      />
                      <h3 className="text-lg font-semibold text-white">
                        {platform}
                      </h3>
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
                          const textarea = document.querySelector(
                            `#${platform.toLowerCase()}-textarea`
                          );
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
                        value={variations[platform] || ""}
                        onChange={(e) =>
                          setVariations((prev) => ({
                            ...prev,
                            [platform]: e.target.value,
                          }))
                        }
                        placeholder={`Your ${platform} content will appear here...`}
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            platform === "Twitter"
                              ? "text-cyan-400"
                              : platform === "LinkedIn"
                              ? "text-blue-400"
                              : "text-green-400"
                          }`}
                        >
                          {variations[platform]
                            ? platform === "Twitter"
                              ? `${variations[platform].length}/280`
                              : platform === "LinkedIn"
                              ? `${variations[platform].length} characters`
                              : `${variations[platform].split(" ").length} words`
                            : platform === "Twitter"
                            ? "0/280"
                            : platform === "LinkedIn"
                            ? "0 characters"
                            : "0 words"}
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500 text-xs">
                          <FontAwesomeIcon
                            icon={
                              platform === "Twitter"
                                ? faHeart
                                : platform === "LinkedIn"
                                ? faThumbsUp
                                : faEye
                            }
                          />
                          <span>
                            Est.{" "}
                            {platform === "Twitter"
                              ? "45 likes"
                              : platform === "LinkedIn"
                              ? "120 reactions"
                              : "8 min read"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm flex items-center">
                        <FontAwesomeIcon
                          icon={faImage}
                          className={`mr-2 ${
                            platform === "Twitter"
                              ? "text-cyan-400"
                              : platform === "LinkedIn"
                              ? "text-blue-400"
                              : "text-green-400"
                          }`}
                        />
                        Suggested Images
                      </h4>
                      <div
                        className={
                          platform === "Twitter" ? "grid grid-cols-2 gap-3" : "space-y-2"
                        }
                      >
                        {(selectedImages[platform] || []).map((image, index) => (
                          <div
                            key={index}
                            className={`relative group cursor-pointer ${
                              image.selected ? "ring-2 ring-cyan-400" : ""
                            }`}
                            onClick={() => {
                              const newImages = { ...selectedImages };
                              newImages[platform] = newImages[platform].map(
                                (img, i) => ({
                                  ...img,
                                  selected: i === index,
                                })
                              );
                              setSelectedImages(newImages);
                            }}
                          >
                            <div className="relative">
                              <img
                                className={`${
                                  platform === "Twitter"
                                    ? "w-full h-24"
                                    : "w-full h-32"
                                } rounded-xl object-cover`}
                                src={image.url}
                                alt={image.description}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="text-white text-lg"
                                />
                              </div>
                              {image.selected && (
                                <div className="absolute top-1 right-1 bg-cyan-400 text-black rounded-full p-1">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-xs"
                                  />
                                </div>
                              )}
                            </div>
                            <div
                              className="mt-2 text-xs text-gray-400 line-clamp-2"
                              title={image.description}
                            >
                              {image.keyword || image.description}
                            </div>
                          </div>
                        ))}
                        {(!selectedImages[platform] ||
                          selectedImages[platform].length === 0) && (
                          <div
                            className={`text-gray-500 text-sm ${
                              platform === "Twitter" ? "col-span-2" : ""
                            }`}
                          >
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

        {showAiAssistant && (
          <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-80 z-30 hidden xl:block">
            <div className="card-bg rounded-3xl p-6 border border-gray-700 glow-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faRobot} className="text-white" />
                  </div>
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {loading && (
                    <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 animate-spin" />
                  )}
                  <button
                    onClick={() => setShowAiAssistant(false)}
                    className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="p-4 bg-gray-800/50 rounded-2xl text-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-cyan-400 animate-spin text-xl mb-2"
                    />
                    <p className="text-gray-400 text-sm">
                      Generating AI suggestions...
                    </p>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-2xl">
                      <div
                        className={`text-sm font-medium mb-2 ${
                          suggestion.type === "suggestion"
                            ? "text-cyan-400"
                            : suggestion.type === "optimization"
                            ? "text-violet-400"
                            : "text-green-400"
                        }`}
                      >
                        {suggestion.icon} {suggestion.title}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {suggestion.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-800/50 rounded-2xl text-center">
                    <p className="text-gray-400 text-sm">
                      Enter an idea and click "Get More Tips" for personalized suggestions
                    </p>
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
        )}

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
              <div className="text-violet-400 text-xs">
                {stats.publishedThisMonth}
              </div>
            </div>

            <div className="card-bg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Engagement</span>
                <FontAwesomeIcon icon={faHeart} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.engagement}
              </div>
              <div className="text-green-400 text-xs">
                {stats.engagementTrend}
              </div>
            </div>
          </div>
        </div>

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
                    className="w-full p-3 rounded-2xl bg-gray-800 border border-gray-600 text-white focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-gray-800 border border-gray-600 text-white focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Platforms
                </label>
                <div className="flex space-x-4">
                  {["Twitter", "LinkedIn", "Medium"].map((platform) => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={publishTo[platform]}
                        onChange={() => togglePublish(platform)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          publishTo[platform]
                            ? platform === "Twitter"
                              ? "bg-cyan-400 border-cyan-400"
                              : platform === "LinkedIn"
                              ? "bg-blue-400 border-blue-400"
                              : "bg-green-400 border-green-400"
                            : "bg-gray-600 border-gray-600"
                        }`}
                      >
                        {publishTo[platform] && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className={`text-xs ${
                              platform === "Twitter" || platform === "Medium"
                                ? "text-black"
                                : "text-white"
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

        {showSaveDraftModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-lg w-full border border-gray-700 relative">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faSave} className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Save Draft</h2>
                <p className="text-gray-400">
                  Give your draft a name to find it easily later
                </p>
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