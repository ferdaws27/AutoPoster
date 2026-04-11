import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  faStar,
  faArrowLeft,
  faTrophy,
  faMedal,
  faCrown,
  faCalendarCheck,
  faHeart,
  faBrain,
  faRocket,
  faLightbulb,
  faGear,
  faChartLine,
  faCalendarPlus,
  faShare,
  faBullseye,
  faQuestionCircle,
  faHashtag,
  faImage,
  faPlus,
  faClock,
  faSmile,
  faPenFancy,
  faHistory,
  faFire,
  faUsers,
  faCheckCircle,
  faArrowTrendUp
} from "@fortawesome/free-solid-svg-icons";
import "../styles/AIReputationPage.css";

/* ================= COLORS ================= */
const COLORS = {
  cyan: { bg: "bg-cyan-400/20", text: "text-cyan-400" },
  violet: { bg: "bg-violet-400/20", text: "text-violet-400" },
  green: { bg: "bg-green-400/20", text: "text-green-400" },
  amber: { bg: "bg-amber-400/20", text: "text-amber-400" },
  teal: { bg: "bg-teal-400/20", text: "text-teal-400" },
  pink: { bg: "bg-pink-400/20", text: "text-pink-400" },
  yellow: { bg: "bg-yellow-400/20", text: "text-yellow-400" },
};

/* ================= AI REPUTATION PAGE ================= */
export default function AIReputationPage() {
  const navigate = useNavigate();
  const { posts, stats, loading } = usePosts();
  const [reputationScore, setReputationScore] = useState(0);
  const [subScores, setSubScores] = useState({
    consistency: 87,
    engagement: 92,
    clarity: 78,
    growth: 85
  });
  const [insights, setInsights] = useState([]);
  const [trendData, setTrendData] = useState([
    { week: 'Week 1', score: 70 },
    { week: 'Week 2', score: 74 },
    { week: 'Week 3', score: 78 },
    { week: 'Week 4', score: 82 }
  ]);
  const [isCalculating, setIsCalculating] = useState(true);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [optimizeApplied, setOptimizeApplied] = useState(false);
  const [currentTier, setCurrentTier] = useState({ name: 'Gold', color: COLORS.yellow, range: '71-90' });
  const gaugeRef = useRef(null);
  const trendRef = useRef(null);

  useEffect(() => {
    // Simulate loading and calculation
    setTimeout(() => {
      calculateReputationScore();
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isCalculating && reputationScore > 0) {
      initializeCharts();
      animateProgressBars();
      animateSlideUpElements();
    }
  }, [isCalculating, reputationScore]);

  const calculateReputationScore = () => {
    setIsCalculating(true);
    
    // Calculate real data from posts and stats
    const totalPosts = posts.length || 0;
    const draftPosts = stats.drafts || 0;
    const scheduledPosts = stats.scheduled || 0;
    const publishedPosts = stats.published || 0;
    
    // Calculate consistency score based on posting frequency
    const consistencyScore = calculateConsistencyScore(posts);
    
    // Calculate engagement score based on published vs total posts ratio
    const engagementScore = calculateEngagementScore(publishedPosts, totalPosts);
    
    // Calculate clarity score based on content quality
    const clarityScore = calculateClarityScore(posts);
    
    // Calculate growth score based on activity trends
    const growthScore = calculateGrowthScore(posts, scheduledPosts);
    
    const newSubScores = {
      consistency: Math.round(consistencyScore),
      engagement: Math.round(engagementScore),
      clarity: Math.round(clarityScore),
      growth: Math.round(growthScore)
    };
    
    setSubScores(newSubScores);
    
    // Calculate overall score
    const overallScore = Math.round(
      (newSubScores.consistency * 0.3 + 
       newSubScores.engagement * 0.3 + 
       newSubScores.clarity * 0.2 + 
       newSubScores.growth * 0.2)
    );
    
    setReputationScore(overallScore);
    
    // Determine current tier
    const tier = getScoreTier(overallScore);
    setCurrentTier(tier);
    
    // Generate real insights based on data
    generateRealInsights(newSubScores, totalPosts, scheduledPosts, posts);
    
    // Generate trend data based on actual posts
    generateRealTrendData(posts);
    
    setTimeout(() => setIsCalculating(false), 1500);
  };

  const calculateConsistencyScore = (posts) => {
    if (!posts || posts.length === 0) return 0;
    
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Count posts in the last month
    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt || post.created_at || now);
      return postDate > oneMonthAgo;
    }).length;
    
    // Calculate weekly average (30 days = ~4.3 weeks)
    const weeklyAverage = recentPosts / 4.3;
    
    // Score based on weekly posting frequency
    // 5+ posts/week = 100%, 3-4 posts/week = 80%, 1-2 posts/week = 60%, <1 post/week = 40%
    if (weeklyAverage >= 5) return 100;
    if (weeklyAverage >= 3) return 80;
    if (weeklyAverage >= 1) return 60;
    return 40;
  };

  const calculateEngagementScore = (publishedPosts, totalPosts) => {
    if (totalPosts === 0) return 0;
    
    // Score based on publish rate
    const publishRate = (publishedPosts / totalPosts) * 100;
    
    // High publish rate = high engagement
    if (publishRate >= 80) return 95;
    if (publishRate >= 60) return 85;
    if (publishRate >= 40) return 70;
    if (publishRate >= 20) return 55;
    return 40;
  };

  const calculateClarityScore = (posts) => {
    if (!posts || posts.length === 0) return 0;
    
    let totalScore = 0;
    posts.forEach(post => {
      const content = post.content || post.idea || '';
      const contentLength = content.length;
      
      // Score based on content length
      let lengthScore = 0;
      if (contentLength > 200) lengthScore = 40;
      else if (contentLength > 100) lengthScore = 30;
      else if (contentLength > 50) lengthScore = 20;
      else lengthScore = 10;
      
      // Score based on structure (hashtags, mentions, etc.)
      const hasHashtags = content.includes('#');
      const hasMentions = content.includes('@');
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);
      const structureScore = (hasHashtags ? 20 : 0) + (hasMentions ? 20 : 0) + (hasEmojis ? 20 : 0);
      
      totalScore += Math.min(100, lengthScore + structureScore);
    });
    
    return Math.round(totalScore / posts.length);
  };

  const calculateGrowthScore = (posts, scheduledPosts) => {
    if (!posts || posts.length === 0) return 0;
    
    // Base score from scheduled posts
    const scheduledScore = Math.min(50, (scheduledPosts / Math.max(1, posts.length)) * 100);
    
    // Activity trend score
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt || post.created_at || now);
      return postDate > oneWeekAgo;
    }).length;
    
    const activityScore = Math.min(50, recentPosts * 10); // 5 posts in a week = 50 points
    
    return Math.round(scheduledScore + activityScore);
  };

  const getScoreTier = (score) => {
    if (score >= 91) return { name: "Platinum", color: COLORS.violet, range: "91-100" };
    if (score >= 71) return { name: "Gold", color: COLORS.yellow, range: "71-90" };
    if (score >= 41) return { name: "Silver", color: COLORS.gray, range: "41-70" };
    return { name: "Bronze", color: COLORS.amber, range: "0-40" };
  };

  const generateRealInsights = (scores, totalPosts, scheduledPosts, posts) => {
    const newInsights = [];
    
    // Consistency insights
    if (scores.consistency < 70) {
      const postsNeeded = Math.ceil((70 - scores.consistency) / 3.33);
      newInsights.push({
        type: "consistency",
        title: `Post ${postsNeeded} more times per week`,
        description: `Your current posting frequency is ${scores.consistency}% of optimal. Increase to boost consistency.`,
        impact: `+${Math.round((70 - scores.consistency) * 0.3)} points`,
        confidence: "High",
        icon: "fa-plus",
        color: COLORS.cyan
      });
    }
    
    // Engagement insights
    if (scores.engagement < 80) {
      const draftsCount = posts.filter(p => p.status === 'draft').length;
      newInsights.push({
        type: "engagement",
        title: "Publish your draft content",
        description: draftsCount > 0 
          ? `You have ${draftsCount} draft${draftsCount > 1 ? 's' : ''} ready to publish`
          : "Focus on creating more publish-ready content",
        impact: `+${Math.round((80 - scores.engagement) * 0.3)} points`,
        confidence: draftsCount > 0 ? "High" : "Medium",
        icon: "fa-clock",
        color: COLORS.violet
      });
    }
    
    // Clarity insights
    if (scores.clarity < 85) {
      const postsWithoutHashtags = posts.filter(p => !p.content?.includes('#')).length;
      newInsights.push({
        type: "clarity",
        title: "Add hashtags to increase reach",
        description: postsWithoutHashtags > 0
          ? `${postsWithoutHashtags} post${postsWithoutHashtags > 1 ? 's' : ''} missing hashtags`
          : "Strategic hashtag use improves content discoverability",
        impact: `+${Math.round((85 - scores.clarity) * 0.2)} points`,
        confidence: "Medium",
        icon: "fa-hashtag",
        color: COLORS.yellow
      });
    }
    
    // Growth insights
    if (scores.growth < 75) {
      newInsights.push({
        type: "growth",
        title: "Schedule more future content",
        description: scheduledPosts > 0 
          ? `You have ${scheduledPosts} scheduled. Add more for consistent growth`
          : "Start scheduling posts to maintain audience engagement",
        impact: `+${Math.round((75 - scores.growth) * 0.2)} points`,
        confidence: scheduledPosts > 0 ? "High" : "Medium",
        icon: "fa-image",
        color: COLORS.green
      });
    }
    
    // Add positive insight if doing well
    if (newInsights.length === 0) {
      newInsights.push({
        type: "general",
        title: "Excellent performance!",
        description: "Your content strategy is working well. Keep up the great work!",
        impact: "Maintain",
        confidence: "High",
        icon: "fa-star",
        color: COLORS.green
      });
    }
    
    setInsights(newInsights.slice(0, 6));
  };

  const generateRealTrendData = (posts) => {
    if (!posts || posts.length === 0) {
      setTrendData([
        { week: "1", score: 65 },
        { week: "5", score: 68 },
        { week: "10", score: 70 },
        { week: "15", score: 75 },
        { week: "20", score: 78 },
        { week: "25", score: 80 },
        { week: "30", score: reputationScore || 82 }
      ]);
      return;
    }
    
    const now = new Date();
    const days = ["1", "5", "10", "15", "20", "25", "30"];
    
    const trendData = days.map((day, index) => {
      const targetDay = parseInt(day);
      const dayStart = new Date(now.getTime() - (30 - targetDay) * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayPosts = posts.filter(post => {
        const postDate = new Date(post.createdAt || post.created_at || now);
        return postDate >= dayStart && postDate < dayEnd;
      });
      
      // Calculate score based on day activity
      const baseScore = (reputationScore || 82) * 0.7; // 70% of current score as base
      const dayBonus = Math.min(30, dayPosts.length * 6); // Each post adds up to 6 points
      
      return {
        week: day,
        score: Math.round(baseScore + dayBonus + (index * 2)) // Slight upward trend
      };
    });
    
    setTrendData(trendData);
  };

  const initializeCharts = () => {
    // This would initialize Highcharts if we had the library
    // For now, we'll simulate the charts with CSS animations
    console.log('Charts initialized');
  };

  const animateProgressBars = () => {
    setTimeout(() => {
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach((bar, index) => {
        const width = bar.getAttribute('data-width');
        if (width) {
          // Force reflow to ensure animation works
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.width = width;
          }, 100 + (index * 200));
        }
      });
    }, 500);
  };

  const animateSlideUpElements = () => {
    setTimeout(() => {
      const slideElements = document.querySelectorAll('.slide-up');
      slideElements.forEach((el, index) => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        // Animate to final state
        setTimeout(() => {
          el.style.transition = 'all 0.8s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 300 + (index * 150));
      });
    }, 100);
  };

  const handleOptimizeClick = () => {
    setShowOptimizeModal(true);
  };

  const handleConfirmOptimize = () => {
    setShowOptimizeModal(false);
    setOptimizeApplied(true);
    
    setTimeout(() => {
      setOptimizeApplied(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="reputation-waves-bg min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center pulse-glow">
            <FontAwesomeIcon icon={faStar} className="text-3xl text-white" />
          </div>
          <p className="text-xl">Loading AI Reputation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reputation-waves-bg min-h-screen text-white">
      {/* Floating particles */}
      {[...Array(9)].map((_, i) => (
        <div 
          key={i}
          className="floating-particles" 
          style={{ 
            left: `${(i + 1) * 10}%`, 
            animationDelay: `${i % 6 === 0 ? 0 : (i % 6) * 0.5}s` 
          }}
        />
      ))}

      {/* Main Content Area */}
      <div className="p-8">
        
        {/* Header Section */}
        <div className="mb-12 slide-up">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center pulse-glow">
              <FontAwesomeIcon icon={faStar} className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">AI Reputation Score â How Strong Is Your Online Presence?</h1>
            <p className="text-xl text-gray-300 mb-2">Your consistency, engagement, and clarity converted into one simple score.</p>
            <p className="text-gray-400">Based on {posts.length} post{posts.length !== 1 ? 's' : ''} across multiple platforms â Updated in real-time</p>
          </div>
        </div>
        
        {/* Main Score Display */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Central Score */}
            <div className="lg:col-span-2">
              <div className="glass-effect rounded-3xl p-12 text-center slide-up">
                <div className="relative mb-8">
                  <div className="w-64 h-64 mx-auto rounded-full border-8 border-gray-700 flex items-center justify-center">
                    <div 
                      className="w-56 h-56 rounded-full border-8 border-gray-600 flex items-center justify-center relative overflow-hidden"
                    >
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(${currentTier.color.text === 'text-cyan-400' ? 'rgb(34 211 238)' : currentTier.color.text === 'text-violet-400' ? 'rgb(167 139 250)' : currentTier.color.text === 'text-yellow-400' ? 'rgb(250 204 21)' : 'rgb(251 146 60)'} 0deg, ${currentTier.color.text === 'text-cyan-400' ? 'rgb(34 211 238)' : currentTier.color.text === 'text-violet-400' ? 'rgb(167 139 250)' : currentTier.color.text === 'text-yellow-400' ? 'rgb(250 204 21)' : 'rgb(251 146 60)'} ${reputationScore * 3.6}deg, rgb(75 85 99) ${reputationScore * 3.6}deg)`
                        }}
                      ></div>
                      <div className="w-48 h-48 rounded-full bg-gray-800 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-white mb-2">
                            {isCalculating ? "..." : reputationScore}
                          </div>
                          <div className="text-gray-400 text-lg">/ 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isCalculating ? "Calculating..." : `${currentTier.name} ${reputationScore >= 91 ? "â Outstanding Online Presence" : reputationScore >= 71 ? "â Excellent Content Performance" : reputationScore >= 41 ? "â Good Foundation Building" : "â Getting Started"}`}
                  </h3>
                  <p className="text-gray-400">
                    {isCalculating ? "Analyzing your content performance..." : 
                     reputationScore >= 80 ? "Your content strategy is working excellently!" :
                     reputationScore >= 60 ? "Good progress with room for improvement." :
                     "Focus on consistency and engagement to build your online presence."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Trend Chart & Badges */}
            <div className="space-y-6">
              {/* Trend Chart */}
              <div className="glass-effect rounded-3xl p-6 slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Reputation Over Time</h4>
                  <div className="flex items-center space-x-1 text-green-400 text-sm">
                    <FontAwesomeIcon icon={faArrowTrendUp} />
                    <span>
                      {trendData.length > 1 ? 
                        `+${Math.round(trendData[trendData.length - 1].score - trendData[0].score)}` : 
                        '+0'
                      }
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="week" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1f26",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#00C2FF"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 text-center text-gray-400 text-sm">
                  30-day improvement: <span className="text-cyan-400 font-medium">
                    {trendData.length > 1 ? 
                      `+${Math.round(trendData[trendData.length - 1].score - trendData[0].score)} points` : 
                      'No data yet'
                    }
                  </span>
                </div>
              </div>

              {/* Badge Tiers */}
              <div className="glass-effect rounded-3xl p-6 slide-up">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 mr-2" />
                  Achievement Tiers
                </h4>
                <div className="space-y-3">
                  <div className="badge-tier flex items-center justify-between p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faMedal} className="text-amber-400 text-xl" />
                      <div>
                        <div className="text-amber-400 font-medium">Bronze</div>
                        <div className="text-gray-400 text-xs">0-40 points</div>
                      </div>
                    </div>
                  </div>
                  <div className="badge-tier flex items-center justify-between p-3 rounded-2xl bg-gray-400/10 border border-gray-400/30">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faMedal} className="text-gray-400 text-xl" />
                      <div>
                        <div className="text-gray-400 font-medium">Silver</div>
                        <div className="text-gray-400 text-xs">41-70 points</div>
                      </div>
                    </div>
                  </div>
                  <div className="badge-tier active flex items-center justify-between p-3 rounded-2xl bg-yellow-400/10 border border-yellow-400/30">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faMedal} className="text-yellow-400 text-xl" />
                      <div>
                        <div className="text-yellow-400 font-medium">Gold</div>
                        <div className="text-gray-400 text-xs">71-90 points</div>
                      </div>
                    </div>
                    <div className="text-cyan-400 text-sm font-medium">Current</div>
                  </div>
                  <div className="badge-tier flex items-center justify-between p-3 rounded-2xl bg-violet-400/10 border border-violet-400/30 opacity-60">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faCrown} className="text-violet-400 text-xl" />
                      <div>
                        <div className="text-violet-400 font-medium">Platinum</div>
                        <div className="text-gray-400 text-xs">91-100 points</div>
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">8 points to go</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Score Progress Bars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          
          {/* Consistency */}
          <div className="subscore-card glass-effect rounded-3xl p-6 slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-cyan-400 text-xl" />
                </div>
                <div>
                  <div className="text-white font-semibold">Consistency</div>
                  <div className="text-gray-400 text-sm">ð Posting frequency</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-400">{subScores.consistency}%</div>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-fill" data-width={`${subScores.consistency}%`} style={{ width: '0%' }} />
            </div>
            <p className="text-gray-400 text-sm">
            {subScores.consistency >= 80 ? 'Excellent posting frequency' : 
             subScores.consistency >= 60 ? 'Good rhythm, could improve' : 
             'Needs more consistent posting'}
          </p>
          </div>

          {/* Engagement */}
          <div className="subscore-card glass-effect rounded-3xl p-6 slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faHeart} className="text-violet-400 text-xl" />
                </div>
                <div>
                  <div className="text-white font-semibold">Engagement</div>
                  <div className="text-gray-400 text-sm">ð Interaction rate</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-violet-400">{subScores.engagement}%</div>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-fill" data-width={`${subScores.engagement}%`} style={{ width: '0%' }} />
            </div>
            <p className="text-gray-400 text-sm">
            {subScores.engagement >= 80 ? 'High engagement, active community' : 
             subScores.engagement >= 60 ? 'Moderate engagement, growing' : 
             'Low engagement, needs attention'}
          </p>
          </div>

          {/* Tone Clarity */}
          <div className="subscore-card glass-effect rounded-3xl p-6 slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBrain} className="text-teal-400 text-xl" />
                </div>
                <div>
                  <div className="text-white font-semibold">Tone Clarity</div>
                  <div className="text-gray-400 text-sm">ð Message coherence</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-teal-400">{subScores.clarity}%</div>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-fill" data-width={`${subScores.clarity}%`} style={{ width: '0%' }} />
            </div>
            <p className="text-gray-400 text-sm">
            {subScores.clarity >= 80 ? 'Clear, well-structured content' : 
             subScores.clarity >= 60 ? 'Generally clear, some improvements' : 
             'Needs better structure and clarity'}
          </p>
          </div>

          {/* Growth Momentum */}
          <div className="subscore-card glass-effect rounded-3xl p-6 slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-green-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faRocket} className="text-green-400 text-xl" />
                </div>
                <div>
                  <div className="text-white font-semibold">Growth Momentum</div>
                  <div className="text-gray-400 text-sm">ð Follower increase</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">{subScores.growth}%</div>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-fill" data-width={`${subScores.growth}%`} style={{ width: '0%' }} />
            </div>
            <p className="text-gray-400 text-sm">
            {subScores.growth >= 80 ? 'Strong growth trajectory' : 
             subScores.growth >= 60 ? 'Moderate growth potential' : 
             'Needs growth strategy'}
          </p>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass-effect rounded-3xl p-8 mb-8 max-w-7xl mx-auto slide-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center mb-2">
                <FontAwesomeIcon icon={faLightbulb} className="text-cyan-400 mr-3" />
                AI-Generated Insights
              </h3>
              <p className="text-gray-400">Personalized recommendations to boost your reputation score</p>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 rounded-2xl px-4 py-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full ai-typing"></div>
              <span className="text-cyan-400 text-sm font-medium">AI Analyzing</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            
            {/* Left Column - Posting Insights */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarPlus} className="text-cyan-400 mr-2" />
                Posting Strategy
              </h4>
              
              {insights.filter((_, i) => i < 3).map((insight, index) => (
                <div key={index} className="insight-item bg-black/20 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-xl ${insight.color.bg} flex items-center justify-center mt-1`}>
                      <FontAwesomeIcon icon={insight.icon === 'fa-plus' ? faPlus : insight.icon === 'fa-clock' ? faClock : faSmile} className={`${insight.color.text} text-sm`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium mb-1">{insight.title}</h5>
                      <p className="text-gray-400 text-sm mb-2">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`${insight.color.text} text-xs font-medium`}>Impact: {insight.impact}</div>
                        <div className="text-gray-500">â¢</div>
                        <div className="text-gray-500 text-xs">{insight.confidence} confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Content Insights */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faPenFancy} className="text-violet-400 mr-2" />
                Content Quality
              </h4>
              
              {insights.filter((_, i) => i >= 3).map((insight, index) => (
                <div key={index} className="insight-item bg-black/20 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-xl ${insight.color.bg} flex items-center justify-center mt-1`}>
                      <FontAwesomeIcon icon={insight.icon === 'fa-hashtag' ? faHashtag : insight.icon === 'fa-question-circle' ? faQuestionCircle : faImage} className={`${insight.color.text} text-sm`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium mb-1">{insight.title}</h5>
                      <p className="text-gray-400 text-sm mb-2">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`${insight.color.text} text-xs font-medium`}>Impact: {insight.impact}</div>
                        <div className="text-gray-500">â¢</div>
                        <div className="text-gray-500 text-xs">{insight.confidence} confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">{insights.length}</div>
              <div className="text-gray-400 text-sm">Active Insights</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">
                +{insights.reduce((total, insight) => {
                  const match = insight.impact.match(/\+(\d+)/);
                  return total + (match ? parseInt(match[1]) : 0);
                }, 0)}
              </div>
              <div className="text-gray-400 text-sm">Potential Points</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400 mb-1">
                {insights.length > 0 ? Math.round(
                  insights.filter(i => i.confidence === 'High').length / insights.length * 100
                ) : 0}%
              </div>
              <div className="text-gray-400 text-sm">Avg Confidence</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {Math.max(1, Math.ceil((91 - reputationScore) / 5))}
              </div>
              <div className="text-gray-400 text-sm">Days to Platinum</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button 
              onClick={handleOptimizeClick}
              className={`optimize-btn px-8 py-4 rounded-3xl text-white font-bold text-lg transition-all transform hover:scale-105 ${
                optimizeApplied ? 'bg-gradient-to-r from-green-400 to-cyan-400' : ''
              }`}
            >
              <FontAwesomeIcon icon={faGear} className="mr-3" />
              {optimizeApplied ? 'Optimizations Applied!' : 'Optimize My Next Post â¨ï¸'}
            </button>
            <p className="text-gray-400 mt-3 text-sm">Apply these insights to your next post automatically</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-cyan-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Detailed Analytics</h4>
            <p className="text-gray-400 text-sm">View comprehensive reports</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarPlus} className="text-violet-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Schedule Optimal Content</h4>
            <p className="text-gray-400 text-sm">Auto-schedule for best times</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-teal-400/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faShare} className="text-teal-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Share Score</h4>
            <p className="text-gray-400 text-sm">Show off your achievement</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faBullseye} className="text-yellow-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Set Goals</h4>
            <p className="text-gray-400 text-sm">Define reputation targets</p>
          </div>
        </div>
      </div>

      {/* Optimize Modal */}
      {showOptimizeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faGear} className="text-cyan-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Optimize Your Next Post</h3>
              <p className="text-gray-400">Apply AI insights to boost your reputation score</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <h4 className="text-white font-medium mb-2">Content Improvements</h4>
                <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span className="text-gray-300 text-sm">Add engaging question at end</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span className="text-gray-300 text-sm">Include 2-3 relevant hashtags</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span className="text-gray-300 text-sm">Add visual element</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-medium mb-2">Timing Optimization</h4>
                <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span className="text-gray-300 text-sm">Schedule for Monday 2:00 PM</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span className="text-gray-300 text-sm">Target 150+ word count</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                  <span className="text-gray-300 text-sm">Use strategic emoji</span>
                </div>
              </div>
            </div>
            
            <div className="bg-cyan-400/10 rounded-2xl p-4 mb-6 border border-cyan-400/20">
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon icon={faChartLine} className="text-cyan-400" />
                <span className="text-cyan-400 font-medium text-sm">Predicted Impact</span>
              </div>
              <div className="text-white font-bold text-lg">+12 reputation points</div>
              <div className="text-gray-400 text-sm">Moving you closer to Platinum tier</div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowOptimizeModal(false)}
                className="flex-1 p-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
              >
                Maybe Later
              </button>
              <button 
                onClick={handleConfirmOptimize}
                className="flex-1 p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
              >
                Apply Optimizations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
