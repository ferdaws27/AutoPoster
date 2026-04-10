import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

// Composant réutilisable pour chaque mini chart
const MiniLineChart = ({ data, color }) => {
  const chartData = data.map((value, index) => ({
    name: `Day ${index + 1}`,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={96}>
      <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" hide />
        <YAxis hide domain={[0, Math.max(...data) * 1.1]} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default function TrendRadar() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [cacheExpiresAt, setCacheExpiresAt] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [newsTopics, setNewsTopics] = useState([]);
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [platformInsights, setPlatformInsights] = useState([
    { platform: "Twitter", icon: "fa-twitter", color: "blue", engagement: "+23%", times: "9AM, 1PM, 5PM EST" },
    { platform: "LinkedIn", icon: "fa-linkedin", color: "violet", engagement: "+18%", times: "8AM, 12PM, 6PM EST" },
    { platform: "Medium", icon: "fa-medium", color: "teal", engagement: "+15%", times: "7AM, 2PM, 8PM EST" },
  ]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [filteredTrends, setFilteredTrends] = useState([]);
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  // Fonction pour extraire les hashtags des tendances Twitter
  const extractHashtagsFromTrends = (trendsData) => {
    const hashtags = [];
    
    trendsData.forEach(trend => {
      const trendName = trend.trend ? trend.trend.name : trend.name || '';
      
      // Extraire les hashtags qui commencent par #
      if (trendName.startsWith('#')) {
        hashtags.push(trendName);
      }
      
      // Extraire les hashtags dans les phrases (entre # et espace ou fin)
      const hashtagMatches = trendName.match(/#\w+/g);
      if (hashtagMatches) {
        hashtags.push(...hashtagMatches);
      }
    });
    
    // Déduplicier et limiter à 15 hashtags
    const uniqueHashtags = [...new Set(hashtags)].slice(0, 15);
    
    return uniqueHashtags;
  };

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    
    console.log('Fetching trends from backend cache...');
    
    try {
      const response = await fetch(`${API_BASE}/api/trends/twitter`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Transform Twitter API data to our format
        const transformedTrends = data.data.slice(0, 5).map((trend, index) => ({
          title: trend.trend ? trend.trend.name : `Trend #${index + 1}`,
          desc: `Trending topic ranked #${trend.rank || index + 1} worldwide`,
          twitter: 'Trending',
          linkedin: Math.floor(Math.random() * 20 + 5).toString() + 'K',
          medium: Math.floor(Math.random() * 10 + 2).toString() + 'K',
          score: Math.max(100 - (index * 8), 60),
          popularity: index === 0 ? "Extremely Hot 🔥" : index < 3 ? "Very Hot 🔥" : "Trending ↗️",
          heat: Math.max(95 - (index * 7), 60) + "%",
          promoted: false,
          rank: trend.rank || index + 1
        }));
        
        setTrends(transformedTrends);
        setLastUpdated(new Date());
        setIsCached(data.cached || false);
        setCacheExpiresAt(data.cache_expires_at ? new Date(data.cache_expires_at) : null);
        
        // Extraire et stocker les hashtags depuis les données brutes
        const extractedHashtags = extractHashtagsFromTrends(data.data);
        setHashtags(extractedHashtags);
        
        console.log(`Trends loaded: ${data.cached ? 'from cache' : 'from API'}`);
        console.log(`Extracted ${extractedHashtags.length} hashtags:`, extractedHashtags);
        if (data.cache_expires_at) {
          console.log(`Cache expires at: ${data.cache_expires_at}`);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTweetVolume = (volume) => {
    if (!volume) return 'No volume data';
    
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M tweets`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K tweets`;
    }
    return `${volume} tweets`;
  };

  const formatKCount = (volume) => {
    if (!volume) return 'Trending';
    
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const fetchNewsTopics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/news/topics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setNewsTopics(data.data);
        
        // Extraire tous les mots-clés des topics
        const allKeywords = [];
        data.data.forEach(topic => {
          if (topic.keywords && Array.isArray(topic.keywords)) {
            allKeywords.push(...topic.keywords);
          }
        });
        
        // Dédupliquer et compter les mots-clés
        const keywordCounts = {};
        allKeywords.forEach(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          keywordCounts[lowerKeyword] = (keywordCounts[lowerKeyword] || 0) + 1;
        });
        
        // Transformer en tableau et trier par fréquence
        const sortedKeywords = Object.entries(keywordCounts)
          .map(([keyword, count]) => ({
            keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1), // Première lettre majuscule
            count: count,
            relevance: count * 10 // Score de pertinence
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15); // Top 15 mots-clés
        
        setExtractedKeywords(sortedKeywords);
        console.log(`News topics loaded: ${data.count} topics extracted`);
        console.log(`Keywords extracted: ${sortedKeywords.length} unique keywords`);
      } else {
        throw new Error('Invalid topics response format');
      }
    } catch (error) {
      console.error('Error fetching news topics:', error);
    }
  };

  const handleCreatePost = (trend) => {
    const trendData = {
      name: trend.title,
      tweet_volume: trend.twitter,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('selectedTrend', JSON.stringify(trendData));
    navigate('/dashboard/CreatePostPage');
  };

  // Fonction pour générer des insights dynamiques basés sur l'IA OpenRouter
  const generateDynamicInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.error('OpenAI API key not found');
        // Fallback: générer des insights basiques basés sur les données disponibles
        generateBasicInsights();
        return;
      }

      // Préparer les données contextuelles pour l'IA
      const currentTrends = trends.slice(0, 5).map(t => t.title || t.name).filter(Boolean).join(', ');
      const currentKeywords = extractedKeywords.slice(0, 5).map(k => k.keyword).filter(Boolean).join(', ');
      const currentHashtags = hashtags.slice(0, 5).filter(Boolean).join(', ');
      
      // Construire un prompt intelligent basé sur les données réelles
      const prompt = `Based on the following real-time trending data from social media, generate dynamic platform insights for social media marketing:

CURRENT TRENDS: ${currentTrends || 'No trends available'}
KEYWORDS: ${currentKeywords || 'No keywords available'}
HASHTAGS: ${currentHashtags || 'No hashtags available'}

Generate a JSON array with 3 objects (Twitter, LinkedIn, Medium) with these properties:
- platform: platform name
- engagement: realistic engagement percentage based on the trends (e.g., "+25%", "+18%", "+12%")
- times: optimal posting times based on platform behavior (e.g., "9AM, 1PM, 5PM EST")
- insights: array of 2-3 actionable insights specific to this platform based on the current trends

Make the insights actionable and specific to the current trending topics. Consider:
1. Content type recommendations based on trends
2. Posting timing optimization
3. Engagement strategies
4. Content format suggestions

Return ONLY the JSON array, no additional text.`;

      console.log('Generating AI insights with OpenRouter...');
      console.log('Trends data:', currentTrends);
      console.log('Keywords:', currentKeywords);
      console.log('Hashtags:', currentHashtags);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AutoPoster Trend Insights",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenRouter response:', data);

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const insightsText = data.choices[0].message.content.trim();
        console.log('AI insights text:', insightsText);
        
        // Parser la réponse JSON
        let insightsData;
        try {
          insightsData = JSON.parse(insightsText);
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON:', parseError);
          generateBasicInsights();
          return;
        }

        // Formatter les données pour l'affichage
        const formattedInsights = insightsData.map(insight => ({
          platform: insight.platform,
          icon: insight.platform === "Twitter" ? "fa-twitter" : 
                  insight.platform === "LinkedIn" ? "fa-linkedin" : "fa-medium",
          color: insight.platform === "Twitter" ? "blue" : 
                  insight.platform === "LinkedIn" ? "violet" : "teal",
          engagement: insight.engagement || "+15%",
          times: insight.times || "9AM, 5PM EST",
          insights: Array.isArray(insight.insights) ? insight.insights : []
        }));

        setPlatformInsights(formattedInsights);
        console.log('AI-generated insights successfully applied:', formattedInsights);
        
      } else {
        throw new Error('Invalid API response format');
      }

    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback vers des insights de base
      generateBasicInsights();
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Fallback: générer des insights basiques basés sur les données disponibles
  const generateBasicInsights = () => {
    console.log('Generating basic insights from available data...');
    
    const basicInsights = [
      {
        platform: "Twitter",
        icon: "fa-twitter",
        color: "blue",
        engagement: trends.length > 0 ? "+25%" : "+15%",
        times: "9AM, 1PM, 5PM EST",
        insights: [
          trends.length > 0 ? `Focus on: ${trends[0]?.title || 'trending topics'}` : "Share trending content",
          "Use relevant hashtags from current trends",
          "Post during peak engagement hours"
        ]
      },
      {
        platform: "LinkedIn",
        icon: "fa-linkedin", 
        color: "violet",
        engagement: extractedKeywords.length > 0 ? "+20%" : "+12%",
        times: "8AM, 12PM, 6PM EST",
        insights: [
          extractedKeywords.length > 0 ? `Highlight: ${extractedKeywords[0]?.keyword || 'professional topics'}` : "Share professional insights",
          "Create thought leadership content",
          "Engage with industry connections"
        ]
      },
      {
        platform: "Medium",
        icon: "fa-medium",
        color: "teal", 
        engagement: newsTopics.length > 0 ? "+18%" : "+10%",
        times: "7AM, 2PM, 8PM EST",
        insights: [
          newsTopics.length > 0 ? `Write about: ${newsTopics[0]?.topic || 'current events'}` : "Create long-form content",
          "Use storytelling techniques",
          "Include data and research"
        ]
      }
    ];

    setPlatformInsights(basicInsights);
    console.log('Basic insights generated:', basicInsights);
  };

  // Fonctions de filtrage
  const filterTrends = () => {
    let filtered = [...trends];
    
    // Filtrer par plateforme
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(trend => {
        // Logique de filtrage par plateforme basée sur le contenu
        const trendText = (trend.title || trend.name || '').toLowerCase();
        
        switch(selectedPlatform) {
          case 'twitter':
            return trendText.includes('#') || trendText.includes('twitter') || trendText.includes('x.com');
          case 'linkedin':
            return trendText.includes('linkedin') || trendText.includes('professional') || trendText.includes('business');
          case 'medium':
            return trendText.includes('medium') || trendText.includes('article') || trendText.includes('writing');
          default:
            return true;
        }
      });
    }
    
    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(trend => {
        const trendText = (trend.title || trend.name || '').toLowerCase();
        
        switch(selectedCategory) {
          case 'ai':
            return trendText.includes('ai') || trendText.includes('artificial') || trendText.includes('machine learning');
          case 'business':
            return trendText.includes('business') || trendText.includes('startup') || trendText.includes('company');
          case 'marketing':
            return trendText.includes('marketing') || trendText.includes('social media') || trendText.includes('brand');
          case 'entrepreneurship':
            return trendText.includes('entrepreneur') || trendText.includes('founder') || trendText.includes('startup');
          case 'innovation':
            return trendText.includes('innovation') || trendText.includes('tech') || trendText.includes('future');
          default:
            return true;
        }
      });
    }
    
    // Filtrer par plage de temps (simulation basée sur le score)
    if (selectedTimeRange !== '24h') {
      const now = new Date();
      let minScore = 0;
      
      switch(selectedTimeRange) {
        case '7d':
          minScore = 70; // Tendances de la semaine
          break;
        case '30d':
          minScore = 50; // Tendances du mois
          break;
        default:
          minScore = 85; // Tendances du jour (24h)
      }
      
      filtered = filtered.filter(trend => (trend.score || 0) >= minScore);
    }
    
    setFilteredTrends(filtered);
    console.log(`Filtered ${filtered.length} trends from ${trends.length} total trends`);
    console.log('Filters applied:', { platform: selectedPlatform, category: selectedCategory, timeRange: selectedTimeRange });
  };

  // Gestionnaires d'événements pour les filtres
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    console.log('Platform filter changed to:', platform);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    console.log('Category filter changed to:', category);
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    console.log('Time range filter changed to:', range);
  };

  // Effet pour appliquer les filtres quand les données changent
  useEffect(() => {
    filterTrends();
  }, [trends, selectedPlatform, selectedCategory, selectedTimeRange]);

  useEffect(() => {
    // Charger les tendances et les topics depuis le backend
    fetchTrends();
    fetchNewsTopics();
    
    // Rafraîchir automatiquement toutes les 24 heures (1 jour)
    const interval = setInterval(() => {
      console.log('Auto-refreshing trends and topics (24 heures elapsed)');
      fetchTrends();
      fetchNewsTopics();
    }, 24 * 60 * 60 * 1000); // 24 heures
    
    return () => clearInterval(interval);
  }, []);

  // Données des charts Forecast
  const forecastData = [
    {
      title: "AI Ethics",
      trend: "↗️ Rising",
      color: "green",
      info: "Expected to peak in 3-5 days",
      chartData: [20, 35, 45, 60, 75, 85, 95],
      chartColor: "#00C2FF",
    },
    {
      title: "Climate Tech",
      trend: "📈 Growing",
      color: "yellow",
      info: "Steady growth predicted",
      chartData: [40, 42, 48, 52, 58, 62, 68],
      chartColor: "#FFD700",
    },
    {
      title: "Mental Health",
      trend: "🔥 Hot",
      color: "cyan",
      info: "Consistent high engagement",
      chartData: [80, 82, 78, 85, 88, 84, 90],
      chartColor: "#7B61FF",
    },
    {
      title: "Quantum Computing",
      trend: "🚀 Emerging",
      color: "purple",
      info: "Early adoption phase",
      chartData: [10, 15, 12, 20, 25, 30, 38],
      chartColor: "#B19BFF",
    },
  ];

  // Fallback trends statiques si l'API échoue
  const fallbackTrends = [
    {
      title: "AI & Automation",
      desc: "Latest developments in artificial intelligence and automation tools",
      twitter: "45.2K", linkedin: "32.1K", medium: "8.7K",
      score: 95, popularity: "Extremely Hot 🔥", heat: "95%"
    },
    {
      title: "Remote Work",
      desc: "Productivity tips and strategies for distributed teams",
      twitter: "38.7K", linkedin: "28.4K", medium: "6.2K",
      score: 88, popularity: "Very Hot 🔥", heat: "88%"
    },
    {
      title: "Sustainability",
      desc: "Environmental initiatives and green business practices",
      twitter: "31.5K", linkedin: "24.8K", medium: "5.1K",
      score: 82, popularity: "Hot 🔥", heat: "82%"
    },
    {
      title: "Digital Transformation",
      desc: "How businesses are adapting to digital-first strategies",
      twitter: "28.9K", linkedin: "22.3K", medium: "4.6K",
      score: 76, popularity: "Trending ↗️", heat: "76%"
    },
    {
      title: "Mental Health & Wellness",
      desc: "Focus on wellbeing and work-life balance in modern workplace",
      twitter: "25.1K", linkedin: "19.7K", medium: "3.9K",
      score: 71, popularity: "Rising ↗️", heat: "71%"
    },
  ];

  return (
    <div className="gradient-bg min-h-screen p-8">
      {/* Header Section */}
      <div id="header-section" className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <div className="w-12 h-12 mr-4 rounded-2xl gradient-accent flex items-center justify-center trend-glow">
                <i className="fa-solid fa-radar text-white"></i>
              </div>
              Trend Radar — What's Hot Now
            </h1>
            <p className="text-gray-400">
              Discover trending topics and hashtags to inspire your next viral post
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-white font-medium">Last Updated</div>
              <div className="text-gray-400 text-sm">{lastUpdated ? getTimeAgo(lastUpdated) : 'Never'}</div>
              {isCached && (
                <div className="text-green-400 text-xs mt-1">
                  <i className="fa-solid fa-database mr-1"></i>
                  Backend Cache
                  {cacheExpiresAt && ` (${getTimeAgo(cacheExpiresAt)} left)`}
                </div>
              )}
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <button
              onClick={fetchTrends}
              disabled={loading}
              className="px-4 py-2 bg-black/30 border border-gray-600 rounded-2xl text-gray-300 hover:text-white hover:border-cyan-400 transition-all disabled:opacity-50"
            >
              <i className={`fa-solid fa-refresh ${loading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div id="filters-section" className="glass-effect rounded-3xl p-6 mb-8 slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Platform Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-white font-medium">Platform:</label>
              <div className="relative">
                <select 
                  value={selectedPlatform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="bg-black/30 border border-gray-600 rounded-2xl px-4 py-2 text-white pr-8 focus:border-cyan-400 focus:outline-none cursor-pointer hover:border-cyan-400/50 transition-colors"
                >
                  <option value="all">All Platforms</option>
                  <option value="twitter">Twitter (X)</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="medium">Medium</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-white font-medium">Category:</label>
              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="bg-black/30 border border-gray-600 rounded-2xl px-4 py-2 text-white pr-8 focus:border-cyan-400 focus:outline-none cursor-pointer hover:border-cyan-400/50 transition-colors"
                >
                  <option value="all">All Categories</option>
                  <option value="ai">AI & Technology</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="entrepreneurship">Entrepreneurship</option>
                  <option value="innovation">Innovation</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="flex items-center space-x-3">
            <label className="text-white font-medium">Time Range:</label>
            <div className="flex bg-black/30 rounded-2xl p-1 border border-gray-600">
              <button 
                onClick={() => handleTimeRangeChange('24h')}
                className={`time-filter px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTimeRange === '24h' 
                    ? 'bg-cyan-400 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                24H
              </button>
              <button 
                onClick={() => handleTimeRangeChange('7d')}
                className={`time-filter px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTimeRange === '7d' 
                    ? 'bg-cyan-400 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                7D
              </button>
              <button 
                onClick={() => handleTimeRangeChange('30d')}
                className={`time-filter px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTimeRange === '30d' 
                    ? 'bg-cyan-400 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                30D
              </button>
            </div>
          </div>
        </div>

        {/* Filter Status */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">
                Filtered: <span className="text-cyan-400 font-medium">{filteredTrends.length}</span> / <span className="text-gray-300">{trends.length}</span> trends
              </span>
              {(selectedPlatform !== 'all' || selectedCategory !== 'all' || selectedTimeRange !== '24h') && (
                <button 
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSelectedCategory('all');
                    setSelectedTimeRange('24h');
                  }}
                  className="px-3 py-1 bg-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                >
                  <i className="fa-solid fa-times mr-1"></i>
                  Clear Filters
                </button>
              )}
            </div>
            <div className="text-gray-400">
              {selectedPlatform !== 'all' && <span className="text-cyan-400">Platform: {selectedPlatform}</span>}
              {selectedCategory !== 'all' && <span className="text-purple-400 ml-3">Category: {selectedCategory}</span>}
              {selectedTimeRange !== '24h' && <span className="text-green-400 ml-3">Range: {selectedTimeRange}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Top Trending Topics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-effect rounded-3xl p-6 slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="fa-solid fa-fire text-orange-400 mr-3"></i>
              Top 5 Trending Topics 
              {trends.length === 0 && <span className="text-yellow-400 text-sm ml-2">(Offline Mode)</span>}
              {error && error.includes('Using cached data') && <span className="text-blue-400 text-sm ml-2">(Cached Data)</span>}
            </h2>

            <div className="space-y-4">
              {/* Error State */}
              {error && (
                <div className="glass-effect rounded-2xl p-4 mb-4 border border-red-400/30">
                  <div className="flex items-center space-x-3">
                    <i className="fa-solid fa-exclamation-triangle text-red-400"></i>
                    <div>
                      <h3 className="text-white font-semibold">Failed to Load Trends</h3>
                      <p className="text-gray-400 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center p-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                    <i className="fa-solid fa-refresh text-cyan-400 animate-spin"></i>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Loading Twitter Trends</h3>
                  <p className="text-gray-400 text-sm">Fetching latest trending topics...</p>
                </div>
              )}

              {/* Real Twitter Trends */}
              {!loading && !error && filteredTrends.length === 0 && (
                <div className="text-center p-8">
                  <h3 className="text-white font-semibold mb-2">No Trends Found</h3>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or refreshing the page.</p>
                </div>
              )}
              {!loading && !error && filteredTrends.length > 0 && filteredTrends.map((topic, idx) => (
                <div key={idx} className="trend-card bg-black/20 rounded-2xl p-6 hover:bg-black/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{topic.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{topic.desc}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <i className="fa-brands fa-twitter text-blue-400"></i>
                          <span className="text-gray-300 text-sm">{topic.twitter} posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fa-brands fa-linkedin text-violet-400"></i>
                          <span className="text-gray-300 text-sm">{topic.linkedin} posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fa-brands fa-medium text-teal-400"></i>
                          <span className="text-gray-300 text-sm">{topic.medium} posts</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <div className="trend-score-high text-2xl font-bold mb-1">{topic.score}</div>
                      <div className="text-gray-400 text-sm">Trend Score</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Popularity</span>
                      <span className="trend-score-high text-sm font-medium">{topic.popularity}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="heat-bar h-3 rounded-full" style={{ width: topic.heat }}></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCreatePost(topic)}
                    className="w-full p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <i className="fa-solid fa-lightbulb mr-2"></i>
                    Create Post from Trend
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hashtags + Power Keywords + Platform Insights */}
        <div className="space-y-6">
          {/* Trending Hashtags */}
          <div className="glass-effect rounded-3xl p-6 slide-up border border-cyan-400/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-hashtag text-cyan-400 mr-3"></i>
                Trending Hashtags
              </h2>
              <div className="flex items-center space-x-2">
                {hashtags.length > 0 && (
                  <span className="bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-lg text-xs font-medium">
                    {hashtags.length} LIVE
                  </span>
                )}
                {isCached && (
                  <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded-lg text-xs font-medium">
                    CACHED
                  </span>
                )}
              </div>
            </div>
            
            {/* Hashtags Grid - Better Organization */}
            <div className="space-y-4">
              {/* Popular Hashtags - Top Row */}
              {hashtags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                    <i className="fa-solid fa-fire text-orange-400 mr-2"></i>
                    Most Popular
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.slice(0, 5).map((tag, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-r from-cyan-400/20 to-blue-400/20 border border-cyan-400/40 rounded-xl px-4 py-2 hover:from-cyan-400/30 hover:to-blue-400/30 transition-all cursor-pointer group"
                        onClick={() => {
                          const trendData = {
                            name: tag,
                            tweet_volume: 'Trending',
                            timestamp: new Date().toISOString()
                          };
                          localStorage.setItem('selectedTrend', JSON.stringify(trendData));
                          navigate('/dashboard/CreatePostPage');
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-300 font-medium text-sm group-hover:text-white">
                            {tag}
                          </span>
                          <span className="text-xs text-cyan-400/70">#{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Hashtags - Grid Layout */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <i className="fa-solid fa-hashtag text-cyan-400 mr-2"></i>
                  All Trending Hashtags
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {hashtags.length > 0 ? (
                    hashtags.map((tag, idx) => (
                      <div 
                        key={idx} 
                        className="bg-black/30 border border-gray-600/40 rounded-xl p-3 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all cursor-pointer group"
                        onClick={() => {
                          const trendData = {
                            name: tag,
                            tweet_volume: 'Trending',
                            timestamp: new Date().toISOString()
                          };
                          localStorage.setItem('selectedTrend', JSON.stringify(trendData));
                          navigate('/dashboard/CreatePostPage');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm group-hover:text-cyan-300 truncate">
                            {tag}
                          </span>
                          <i className="fa-solid fa-arrow-right text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Rank #{idx + 1}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback hashtags si aucune donnée disponible
                    [
                      "#AI", "#MachineLearning", "#RemoteWork", "#Productivity", "#Sustainability",
                      "#GreenBusiness", "#PersonalBranding", "#Entrepreneurship", "#Web3", "#Blockchain",
                      "#Innovation", "#TechTrends", "#DigitalTransformation", "#Leadership", "#UX"
                    ].map((tag, idx) => (
                      <div key={idx} className="bg-black/20 border border-gray-600/30 rounded-xl p-3">
                        <span className="text-gray-400 font-medium text-sm">
                          {tag}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer Info */}
            <div className="border-t border-gray-700/50 pt-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {hashtags.length > 0 ? (
                    <>
                      <i className="fa-solid fa-sparkles text-cyan-400 mr-1"></i>
                      Live hashtags from Twitter trends
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-database text-gray-500 mr-1"></i>
                      Using fallback hashtags
                    </>
                  )}
                </div>
                {cacheExpiresAt && (
                  <div className="text-xs text-gray-400">
                    <i className="fa-solid fa-clock mr-1"></i>
                    Updates in {getTimeAgo(cacheExpiresAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Power Keywords */}
          <div className="glass-effect rounded-3xl p-6 slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="fa-solid fa-key text-violet-400 mr-3"></i>
              Power Keywords
              <span className="text-violet-400 text-sm ml-2">
                ({extractedKeywords.length} from API)
              </span>
            </h2>
            <div className="space-y-3">
              {extractedKeywords.length > 0 ? (
                extractedKeywords.slice(0, 5).map((kw, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-black/20 rounded-2xl border border-gray-700/50 hover:bg-violet-400/10 hover:border-violet-400/50 transition-all cursor-pointer group"
                    onClick={() => {
                      const trendData = {
                        name: kw.keyword,
                        tweet_volume: `${kw.count} mentions`,
                        timestamp: new Date().toISOString(),
                        source: 'Power Keywords (API)',
                        type: 'extracted_keyword',
                        relevance: kw.relevance,
                        frequency: kw.count
                      };
                      localStorage.setItem('selectedTrend', JSON.stringify(trendData));
                      navigate('/dashboard/CreatePostPage');
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-medium group-hover:text-violet-300 transition-colors">{kw.keyword}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-violet-400 text-sm font-medium">
                          {kw.count}x
                        </span>
                        <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-gray-400 text-xs">
                        Score: {kw.relevance}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback statique si aucun keyword extrait
                [
                  { word: "breakthrough", color: "green", label: "High Impact" },
                  { word: "game-changing", color: "green", label: "High Impact" },
                  { word: "revolutionary", color: "yellow", label: "Medium Impact" },
                  { word: "innovative", color: "yellow", label: "Medium Impact" },
                  { word: "transformative", color: "cyan", label: "Rising" },
                ].map((kw, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-black/20 rounded-2xl border border-gray-700/50 hover:bg-gray-700/30 transition-all cursor-pointer group"
                    onClick={() => {
                      const trendData = {
                        name: kw.word,
                        tweet_volume: `${kw.label} Keyword`,
                        timestamp: new Date().toISOString(),
                        source: 'Power Keywords',
                        type: 'keyword',
                        impact: kw.label
                      };
                      localStorage.setItem('selectedTrend', JSON.stringify(trendData));
                      navigate('/dashboard/CreatePostPage');
                    }}
                  >
                    <span className="text-white font-medium group-hover:text-violet-300 transition-colors">{kw.word}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        kw.color === 'green' ? 'bg-green-400' : 
                        kw.color === 'yellow' ? 'bg-yellow-400' : 
                        kw.color === 'cyan' ? 'bg-cyan-400' : 'bg-gray-400'
                      }`}></div>
                      <span className={`${
                        kw.color === 'green' ? 'text-green-400' : 
                        kw.color === 'yellow' ? 'text-yellow-400' : 
                        kw.color === 'cyan' ? 'text-cyan-400' : 'text-gray-400'
                      } text-sm`}>{kw.label}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* News Topics */}
          <div className="glass-effect rounded-3xl p-6 slide-up border border-green-400/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="fa-solid fa-newspaper text-green-400 mr-3"></i>
              Topics from News
              <span className="text-green-400 text-sm ml-2">
                ({newsTopics.length} extracted)
              </span>
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {newsTopics.length > 0 ? (
                newsTopics.map((topic, idx) => (
                  <div key={idx} className="bg-black/20 rounded-xl p-4 border border-gray-700/50 hover:bg-green-400/10 hover:border-green-400/50 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-green-300 transition-colors">
                          {topic.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                          <span className="flex items-center">
                            <i className="fa-solid fa-globe mr-1"></i>
                            {topic.source}
                          </span>
                          <span className="flex items-center">
                            <i className="fa-solid fa-bolt mr-1"></i>
                            Score: {topic.relevance_score}
                          </span>
                        </div>
                        
                        {/* Keywords */}
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.map((keyword, kidx) => (
                            <span key={kidx} className="bg-green-400/20 text-green-300 px-2 py-1 rounded-lg text-xs font-medium border border-green-400/30">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const trendData = {
                          name: topic.title,
                          tweet_volume: 'News Topic',
                          timestamp: new Date().toISOString(),
                          source: 'SERPApi News Topics',
                          keywords: topic.keywords
                        };
                        localStorage.setItem('selectedTrend', JSON.stringify(trendData));
                        navigate('/dashboard/CreatePostPage');
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-xl font-medium transition-all mt-3"
                    >
                      <i className="fa-solid fa-lightbulb mr-2"></i>
                      Create Post from Topic
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                    <i className="fa-solid fa-newspaper text-green-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Loading News Topics
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Extracting topics from trending news...
                  </p>
                </div>
              )}
            </div>
            
            {newsTopics.length > 0 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={fetchNewsTopics}
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  <i className="fa-solid fa-refresh mr-1"></i>
                  Refresh Topics
                </button>
              </div>
            )}
          </div>

          {/* Platform Insights */}
          <div className="glass-effect rounded-3xl p-6 slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-chart-simple text-teal-400 mr-3"></i>
                Platform Insights
                {platformInsights.some(p => p.insights && p.insights.length > 0) && (
                  <span className="ml-3 px-2 py-1 bg-teal-400/20 text-teal-400 rounded-lg text-xs font-medium">
                    AI Generated
                  </span>
                )}
              </h2>
            </div>
            
            {/* Bouton pour générer les insights IA */}
            <button 
              onClick={generateDynamicInsights}
              disabled={isGeneratingInsights}
              className="w-full mb-6 p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 rounded-2xl hover:from-teal-500/30 hover:to-cyan-500/30 transition-all text-sm font-medium border border-teal-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingInsights ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Generating AI Insights...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-magic mr-2"></i>
                  Generate AI Insights
                </>
              )}
            </button>

            {/* Affichage des insights dynamiques */}
            <div className="space-y-3">
              {platformInsights.map((p, idx) => (
                <div key={idx} className="p-4 bg-black/20 rounded-2xl border border-gray-700/50 hover:bg-black/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl bg-${p.color}-400/20 flex items-center justify-center`}>
                        <i className={`fa-brands ${p.icon} text-${p.color}-400`}></i>
                      </div>
                      <div>
                        <span className="text-white font-semibold text-lg">{p.platform}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-${p.color}-400 text-sm font-medium`}>{p.engagement} engagement</span>
                          {p.insights && p.insights.length > 0 && (
                            <span className="text-green-400 text-xs">
                              <i className="fa-solid fa-sparkles mr-1"></i>
                              AI Optimized
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <i className="fa-solid fa-clock mr-2"></i>
                      Best times: <span className="text-white ml-1">{p.times}</span>
                    </div>
                  </div>

                  {/* Insights spécifiques générés par l'IA */}
                  {p.insights && p.insights.length > 0 && (
                    <div className="border-t border-gray-700/50 pt-3">
                      <div className="flex items-center text-teal-400 text-xs font-medium mb-2">
                        <i className="fa-solid fa-lightbulb mr-2"></i>
                        AI Recommendations
                      </div>
                      <div className="space-y-2">
                        {p.insights.map((insight, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <i className="fa-solid fa-chevron-right text-teal-400/60 text-xs mt-1"></i>
                            <span className="text-gray-300 text-sm leading-relaxed">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <i className="fa-solid fa-robot mr-2"></i>
                  {platformInsights.some(p => p.insights && p.insights.length > 0) 
                    ? "Insights generated by AI based on current trends"
                    : "Click 'Generate AI Insights' for personalized recommendations"
                  }
                </div>
                {trends.length > 0 && (
                  <div className="flex items-center">
                    <i className="fa-solid fa-database mr-1"></i>
                    Based on {trends.length} trends
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <i className="fa-solid fa-crystal-ball text-purple-400 mr-3"></i>
          Upcoming Trend Forecast
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {forecastData.map((f, idx) => (
            <div key={idx} className="forecast-chart rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{f.title}</h3>
                <span className={`text-${f.color}-400 text-sm`}>{f.trend}</span>
              </div>

              {/* Chart Recharts intégré */}
              <MiniLineChart data={f.chartData} color={f.chartColor} />

              <p className="text-gray-400 text-sm mt-2">{f.info}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity">
            <i className="fa-solid fa-download mr-2"></i>
            Export Trend Report
          </button>
        </div>
      </div>
    </div>
  );
}
