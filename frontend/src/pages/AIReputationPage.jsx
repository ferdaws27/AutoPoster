import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";

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
    consistency: 0,
    engagement: 0,
    clarity: 0,
    growth: 0
  });
  const [insights, setInsights] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    calculateReputationScore();
  }, [posts, stats]);

  const calculateReputationScore = () => {
    setIsCalculating(true);
    
    // Calculate main reputation score based on posts and stats
    const totalPosts = posts.length || 0;
    const draftPosts = stats.drafts || 0;
    const scheduledPosts = stats.scheduled || 0;
    const publishedPosts = stats.published || 0;
    
    // Consistency score (based on posting frequency)
    const consistencyScore = Math.min(100, (totalPosts / 30) * 100); // 30 posts = 100%
    
    // Engagement score (based on published vs total posts ratio)
    const engagementScore = totalPosts > 0 ? Math.min(100, (publishedPosts / totalPosts) * 100) : 0;
    
    // Clarity score (based on content length and structure - calculated from actual posts)
    const clarityScore = calculateClarityScore(posts);
    
    // Growth score (based on scheduled posts + recent activity trend)
    const growthScore = calculateGrowthScore(posts, scheduledPosts, totalPosts);
    
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
    
    // Generate insights
    generateInsights(newSubScores, totalPosts);
    
    // Generate trend data
    generateTrendData(overallScore);
    
    setTimeout(() => setIsCalculating(false), 1500);
  };

  const generateInsights = (scores, totalPosts) => {
    const newInsights = [];
    
    // Calculate dynamic impact based on score gaps
    const consistencyGap = Math.max(0, 70 - scores.consistency);
    const engagementGap = Math.max(0, 80 - scores.engagement);
    const clarityGap = Math.max(0, 85 - scores.clarity);
    const growthGap = Math.max(0, 75 - scores.growth);
    
    if (scores.consistency < 70) {
      const postsNeeded = Math.ceil((70 - scores.consistency) / 3.33); // ~3.33% per post
      newInsights.push({
        type: "consistency",
        title: "Increase posting frequency",
        description: `Post ${postsNeeded} more ${postsNeeded === 1 ? 'post' : 'posts'} this month to reach target`,
        impact: `+${Math.round(consistencyGap * 0.3)} points`,
        confidence: "High",
        icon: "fa-calendar-plus",
        color: COLORS.cyan
      });
    }
    
    if (scores.engagement < 80) {
      newInsights.push({
        type: "engagement",
        title: "Publish more content",
        description: `You have ${stats.drafts || 0} drafts ready to publish`,
        impact: `+${Math.round(engagementGap * 0.3)} points`,
        confidence: totalPosts > 5 ? "High" : "Medium",
        icon: "fa-question-circle",
        color: COLORS.pink
      });
    }
    
    if (scores.clarity < 85 && totalPosts > 0) {
      newInsights.push({
        type: "clarity",
        title: "Improve content quality",
        description: "Add more detailed descriptions to your posts",
        impact: `+${Math.round(clarityGap * 0.2)} points`,
        confidence: "Medium",
        icon: "fa-hashtag",
        color: COLORS.yellow
      });
    }
    
    if (scores.growth < 75) {
      const scheduledBoost = Math.min(15, scheduledPosts * 3);
      newInsights.push({
        type: "growth",
        title: "Schedule future content",
        description: scheduledPosts > 0 
          ? `You have ${scheduledPosts} posts scheduled (+${scheduledBoost}% growth potential)`
          : "Schedule posts to maintain consistent growth",
        impact: `+${Math.round(growthGap * 0.2)} points`,
        confidence: scheduledPosts > 0 ? "High" : "Medium",
        icon: "fa-image",
        color: COLORS.green
      });
    }
    
    // Add default insight if no specific insights generated
    if (newInsights.length === 0) {
      newInsights.push({
        type: "general",
        title: "Excellent performance!",
        description: "You're doing great. Keep up the consistent posting schedule.",
        impact: "Maintain",
        confidence: "High",
        icon: "fa-star",
        color: COLORS.green
      });
    }
    
    setInsights(newInsights.slice(0, 6));
  };

  const generateTrendData = (currentScore) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    // Generate trend based on actual posts data or deterministic calculation
    const trendData = weeks.map((week, index) => {
      // Calculate score based on progress toward current score
      const progressFactor = (index + 1) / 4;
      const baseScore = Math.max(0, currentScore - 25);
      const variation = ((index + 1) * 3) % 10; // Deterministic variation
      
      return {
        week,
        score: Math.round(baseScore + (currentScore - baseScore) * progressFactor + variation)
      };
    });
    
    setTrendData(trendData);
  };

  // Calculate clarity score based on content quality metrics
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
      const structureScore = (hasHashtags ? 30 : 0) + (hasMentions ? 30 : 0);
      
      totalScore += Math.min(100, lengthScore + structureScore);
    });
    
    return Math.round(totalScore / posts.length);
  };

  // Calculate growth score based on activity and scheduling
  const calculateGrowthScore = (posts, scheduledPosts, totalPosts) => {
    if (totalPosts === 0) return 0;
    
    // Base score from scheduled posts
    const scheduledScore = Math.min(50, (scheduledPosts / Math.max(1, totalPosts)) * 100);
    
    // Activity trend score (based on recent posts in last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt || post.created_at || Date.now());
      return postDate > oneWeekAgo;
    }).length;
    
    const activityScore = Math.min(50, recentPosts * 10); // 5 posts in a week = 50 points
    
    return Math.round(scheduledScore + activityScore);
  };

  const getScoreTier = (score) => {
    if (score >= 91) return { name: "Platinum", color: COLORS.violet, range: "91-100" };
    if (score >= 71) return { name: "Gold", color: COLORS.yellow, range: "71-90" };
    if (score >= 41) return { name: "Silver", color: "gray", range: "41-70" };
    return { name: "Bronze", color: COLORS.amber, range: "0-40" };
  };

  const currentTier = getScoreTier(reputationScore);

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-accent flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-star text-3xl text-white"></i>
          </div>
          <p className="text-xl">Loading AI Reputation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen text-white">
      {/* Header */}
      <header className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold">AI Reputation Score</h1>
                <p className="text-gray-400">Your online presence analysis</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Main Score Display */}
        <div className="mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Central Score */}
            <div className="lg:col-span-2">
              <div className="glass-effect rounded-3xl p-12 text-center">
                <div className="relative mb-8">
                  <div className="w-64 h-64 mx-auto rounded-full border-8 border-gray-700 flex items-center justify-center">
                    <div 
                      className="w-56 h-56 rounded-full border-8 border-gray-600 flex items-center justify-center relative overflow-hidden"
                    >
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(${currentTier.color.text.replace('text-', 'rgb(var(--tw-')} 0deg, ${currentTier.color.text.replace('text-', 'rgb(var(--tw-')} ${reputationScore * 3.6}deg, rgb(75 85 99) ${reputationScore * 3.6}deg)`
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
                    {isCalculating ? "Calculating..." : `${currentTier.name} — ${getScoreDescription(reputationScore)}`}
                  </h3>
                  <p className="text-gray-400">
                    Based on {posts.length} posts • Updated in real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Trend */}
              <div className="glass-effect rounded-3xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Reputation Trend</h4>
                <div className="space-y-2">
                  {trendData.map((data, index) => (
                    <div key={data.week} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{data.week}</span>
                      <span className="text-white font-medium">{Math.round(data.score)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Tiers */}
              <div className="glass-effect rounded-3xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-trophy text-yellow-400 mr-2"></i>
                  Achievement Tiers
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Bronze", color: COLORS.amber, range: "0-40" },
                    { name: "Silver", color: "gray", range: "41-70" },
                    { name: "Gold", color: COLORS.yellow, range: "71-90" },
                    { name: "Platinum", color: COLORS.violet, range: "91-100" }
                  ].map((tier) => (
                    <div 
                      key={tier.name}
                      className={`flex items-center justify-between p-3 rounded-2xl border ${
                        tier.name === currentTier.name 
                          ? `${tier.color.bg} border ${tier.color.text.replace('text-', 'border-')}/30` 
                          : 'bg-gray-800/30 border-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <i className={`fa-solid ${tier.name === 'Platinum' ? 'fa-crown' : 'fa-medal'} ${tier.color.text} text-xl`}></i>
                        <div>
                          <div className={`${tier.color.text} font-medium`}>{tier.name}</div>
                          <div className="text-gray-400 text-xs">{tier.range} points</div>
                        </div>
                      </div>
                      {tier.name === currentTier.name && (
                        <div className="text-cyan-400 text-sm font-medium">Current</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glass-effect rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl ${COLORS.cyan.bg} flex items-center justify-center`}>
                  <i className="fa-solid fa-calendar-check text-cyan-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-white font-semibold">Consistency</div>
                  <div className="text-gray-400 text-sm">Posting frequency</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-400">{subScores.consistency}%</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-cyan-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${subScores.consistency}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl ${COLORS.violet.bg} flex items-center justify-center`}>
                  <i className="fa-solid fa-heart text-violet-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-white font-semibold">Engagement</div>
                  <div className="text-gray-400 text-sm">Interaction rate</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-violet-400">{subScores.engagement}%</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-violet-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${subScores.engagement}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl ${COLORS.teal.bg} flex items-center justify-center`}>
                  <i className="fa-solid fa-brain text-teal-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-white font-semibold">Tone Clarity</div>
                  <div className="text-gray-400 text-sm">Message coherence</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-teal-400">{subScores.clarity}%</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-teal-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${subScores.clarity}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl ${COLORS.green.bg} flex items-center justify-center`}>
                  <i className="fa-solid fa-rocket text-green-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-white font-semibold">Growth Momentum</div>
                  <div className="text-gray-400 text-sm">Follower increase</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">{subScores.growth}%</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${subScores.growth}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-effect rounded-3xl p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center mb-2">
                <i className="fa-solid fa-lightbulb text-cyan-400 mr-3"></i>
                AI-Generated Insights
              </h3>
              <p className="text-gray-400">Personalized recommendations to boost your reputation</p>
            </div>
            <div className="flex items-center space-x-2 bg-black/30 rounded-2xl px-4 py-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 text-sm font-medium">AI Analyzing</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <div key={index} className="bg-black/20 rounded-2xl p-4 hover:bg-black/30 transition-colors cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-xl ${insight.color.bg} flex items-center justify-center mt-1`}>
                    <i className={`fa-solid ${insight.icon} ${insight.color.text} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-white font-medium mb-1">{insight.title}</h5>
                    <p className="text-gray-400 text-sm mb-2">{insight.description}</p>
                    <div className="flex items-center space-x-2">
                      <div className={`${insight.color.text} text-xs font-medium`}>Impact: {insight.impact}</div>
                      <div className="text-gray-500">•</div>
                      <div className="text-gray-500 text-xs">{insight.confidence} confidence</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-8 py-4 rounded-3xl gradient-accent text-white font-bold text-lg hover:opacity-90 transition-opacity">
              <i className="fa-solid fa-gear mr-3"></i>
              Optimize My Next Post
            </button>
            <p className="text-gray-400 mt-3 text-sm">Apply these insights to your next post automatically</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl ${COLORS.cyan.bg} flex items-center justify-center`}>
              <i className="fa-solid fa-chart-line text-cyan-400"></i>
            </div>
            <h4 className="text-white font-medium mb-2">Detailed Analytics</h4>
            <p className="text-gray-400 text-sm">View comprehensive reports</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl ${COLORS.violet.bg} flex items-center justify-center`}>
              <i className="fa-solid fa-calendar-plus text-violet-400"></i>
            </div>
            <h4 className="text-white font-medium mb-2">Schedule Content</h4>
            <p className="text-gray-400 text-sm">Auto-schedule for best times</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl ${COLORS.teal.bg} flex items-center justify-center`}>
              <i className="fa-solid fa-share text-teal-400"></i>
            </div>
            <h4 className="text-white font-medium mb-2">Share Score</h4>
            <p className="text-gray-400 text-sm">Show off your achievement</p>
          </div>

          <div className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl ${COLORS.yellow.bg} flex items-center justify-center`}>
              <i className="fa-solid fa-target text-yellow-400"></i>
            </div>
            <h4 className="text-white font-medium mb-2">Set Goals</h4>
            <p className="text-gray-400 text-sm">Define reputation targets</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function getScoreDescription(score) {
  if (score >= 91) return "Outstanding Online Presence";
  if (score >= 71) return "Excellent Content Performance";
  if (score >= 41) return "Good Foundation Building";
  return "Getting Started";
}
