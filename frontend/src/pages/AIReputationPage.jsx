import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";
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
import toast from "react-hot-toast";

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
  const t = useTranslation();
  const navigate = useNavigate();
  const { posts, stats, loading } = usePosts();
  const { voiceProfile } = useSettings();
  const [reputationScore, setReputationScore] = useState(0);
  const [subScores, setSubScores] = useState({
    consistency: 0,
    engagement: 0,
    clarity: 0,
    growth: 0
  });
  const [insights, setInsights] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [postDetails, setPostDetails] = useState([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [optimizeApplied, setOptimizeApplied] = useState(false);
  const [currentTier, setCurrentTier] = useState({ name: 'Bronze', color: COLORS.amber, range: '0-40' });
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const gaugeRef = useRef(null);
  const trendRef = useRef(null);

  useEffect(() => {
    fetchReputationScore();
  }, []);

  useEffect(() => {
    if (!isCalculating && reputationScore > 0) {
      animateProgressBars();
      animateSlideUpElements();
    }
  }, [isCalculating, reputationScore]);

  const fetchReputationScore = async () => {
    setIsCalculating(true);
    setInsightsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/reputation-score`, { headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text.slice(0, 200)}`);
      }
      const data = await res.json();

      setReputationScore(data.score || 0);
      setSubScores(data.sub_scores || { consistency: 0, engagement: 0, clarity: 0, growth: 0 });
      setTotalInteractions(data.total_interactions || 0);
      setAvgEngagement(data.avg_engagement_weighted || 0);

      // Map tier
      const tierName = data.tier?.name || "Bronze";
      const tierColors = {
        Platinum: COLORS.violet,
        Gold: COLORS.yellow,
        Silver: COLORS.cyan,
        Bronze: COLORS.amber,
      };
      setCurrentTier({
        name: tierName,
        color: tierColors[tierName] || COLORS.amber,
        range: data.tier?.range || "0-40",
      });

      // Evolution → trend chart data
      if (data.evolution && data.evolution.length > 0) {
        setTrendData(data.evolution.map((e) => ({
          week: e.date,
          score: e.score,
          likes: e.likes,
          comments: e.comments,
          shares: e.shares,
        })));
      }

      // Post details
      setPostDetails(data.post_details || []);

      // Advice → insights
      setInsights((data.advice || []).map((a) => ({
        type: a.criterion,
        title: a.title,
        description: a.description,
        impact: a.impact,
        confidence: "High",
        icon: a.icon,
        color: { cyan: COLORS.cyan, violet: COLORS.violet, teal: COLORS.teal, green: COLORS.green, yellow: COLORS.yellow }[a.color] || COLORS.cyan,
      })));
    } catch (err) {
      console.error("Failed to fetch reputation score:", err);
    } finally {
      setIsCalculating(false);
      setInsightsLoading(false);
    }
  };

  // Keep for backward compat — no longer used as primary
  const calculateReputationScore = () => {
    fetchReputationScore();
  };

  const insightIconMap = {
    'fa-calendar-check': faCalendarCheck,
    'fa-heart': faHeart,
    'fa-brain': faBrain,
    'fa-rocket': faRocket,
    'fa-star': faStar,
    'fa-plus': faPlus,
    'fa-clock': faClock,
    'fa-hashtag': faHashtag,
    'fa-image': faImage,
    'fa-lightbulb': faLightbulb,
    'fa-fire': faFire,
    'fa-users': faUsers,
    'fa-chart-line': faChartLine,
  };

  const getInsightIcon = (iconName) => insightIconMap[iconName] || faLightbulb;

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

  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalTier, setGoalTier] = useState(null);
  const [scoreCopied, setScoreCopied] = useState(false);

  const handleConfirmOptimize = async () => {
    setOptimizeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const bestType = postDetails.length > 0 ? postDetails[0].content_type : "insight";

      const res = await fetch(`${API_URL}/generate-optimized-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tips: insights.map(i => ({ title: i.title, description: i.description })),
          score: reputationScore,
          tier: currentTier.name,
          best_post_type: bestType,
          voiceProfile: voiceProfile || null,
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      if (data.success && data.content) {
        setShowOptimizeModal(false);
        setOptimizeApplied(true);
        setTimeout(() => {
          setOptimizeApplied(false);
          navigate(`/dashboard/CreatePostPage?content=${encodeURIComponent(data.content)}`);
        }, 600);
      } else {
        throw new Error(data.error || "Failed to generate post");
      }
    } catch (err) {
      console.error("Optimize error:", err);
      toast.error("Failed to generate optimized post. Please try again.");
    } finally {
      setOptimizeLoading(false);
    }
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
            <h1 className="text-4xl font-bold text-white mb-4">{t("reputation.title")}</h1>
            <p className="text-xl text-gray-300 mb-2">{t("reputation.subtitle")}</p>
            <p className="text-gray-400">Based on {posts.length} post{posts.length !== 1 ? 's' : ''} &middot; {totalInteractions.toLocaleString()} interactions &middot; Updated in real-time</p>
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
                  <h4 className="text-lg font-semibold text-white">Post Evolution</h4>
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
                    <XAxis dataKey="week" stroke="#aaa" fontSize={10} />
                    <YAxis stroke="#aaa" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1f26",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#00C2FF" strokeWidth={3} name="Score" dot={false} />
                    <Line type="monotone" dataKey="likes" stroke="#a78bfa" strokeWidth={1.5} name="Likes" dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="comments" stroke="#2dd4bf" strokeWidth={1.5} name="Comments" dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="shares" stroke="#facc15" strokeWidth={1.5} name="Shares" dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-400 inline-block rounded"></span> Score</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-400 inline-block rounded"></span> Likes</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-teal-400 inline-block rounded"></span> Comments</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-yellow-400 inline-block rounded"></span> Shares</span>
                </div>
              </div>

              {/* Badge Tiers */}
              <div className="glass-effect rounded-3xl p-6 slide-up">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 mr-2" />
                  Achievement Tiers
                </h4>
                <div className="space-y-3">
                  {[
                    { name: t("reputation.bronze"), range: "0-40", color: "amber", icon: faMedal },
                    { name: t("reputation.silver"), range: "41-70", color: "gray", icon: faMedal },
                    { name: t("reputation.gold"),   range: "71-90", color: "yellow", icon: faMedal },
                    { name: t("reputation.platinum"), range: "91-100", color: "violet", icon: faCrown },
                  ].map((tier) => {
                    const isCurrent = currentTier.name === tier.name;
                    const isAbove = ["Bronze","Silver","Gold","Platinum"].indexOf(currentTier.name) >= ["Bronze","Silver","Gold","Platinum"].indexOf(tier.name);
                    return (
                      <div key={tier.name} className={`badge-tier ${isCurrent ? 'active' : ''} flex items-center justify-between p-3 rounded-2xl bg-${tier.color}-400/10 border border-${tier.color}-400/30 ${!isAbove ? 'opacity-60' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={tier.icon} className={`text-${tier.color}-400 text-xl`} />
                          <div>
                            <div className={`text-${tier.color}-400 font-medium`}>{tier.name}</div>
                            <div className="text-gray-400 text-xs">{tier.range} points</div>
                          </div>
                        </div>
                        {isCurrent && <div className="text-cyan-400 text-sm font-medium">Current</div>}
                        {!isAbove && <div className="text-gray-500 text-xs">{Math.max(0, parseInt(tier.range) - reputationScore)} pts to go</div>}
                      </div>
                    );
                  })}
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
                  <div className="text-white font-semibold">{t("reputation.consistency")}</div>
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
                  <div className="text-white font-semibold">{t("reputation.engagement")}</div>
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
                  <div className="text-white font-semibold">{t("reputation.clarity")}</div>
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
                  <div className="text-white font-semibold">{t("reputation.growth")}</div>
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

        {/* Top & Worst Performing Posts */}
        {postDetails.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-7xl mx-auto">
            {/* Best Posts */}
            <div className="glass-effect rounded-3xl p-6 slide-up">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faFire} className="text-amber-400 mr-2" />
                Top Performing Posts
              </h4>
              <div className="space-y-3">
                {postDetails.slice(0, 3).map((post, idx) => (
                  <div key={idx} className="bg-black/20 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400">{post.content_type?.replace("_"," ") || "N/A"}</span>
                      <span className="text-green-400 text-sm font-bold">{post.weighted} pts</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{post.content_preview}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>🔁 {post.shares}</span>
                      <span className="text-gray-500">({post.total} total)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Posts */}
            <div className="glass-effect rounded-3xl p-6 slide-up">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faLightbulb} className="text-violet-400 mr-2" />
                Posts to Improve
              </h4>
              <div className="space-y-3">
                {postDetails.slice(-3).reverse().map((post, idx) => (
                  <div key={idx} className="bg-black/20 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/20 text-violet-400">{post.content_type?.replace("_"," ") || "N/A"}</span>
                      <span className="text-amber-400 text-sm font-bold">{post.weighted} pts</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{post.content_preview}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>🔁 {post.shares}</span>
                      <span className="text-gray-500">({post.total} total)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        <div className="glass-effect rounded-3xl p-8 mb-8 max-w-7xl mx-auto slide-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center mb-2">
                <FontAwesomeIcon icon={faLightbulb} className="text-cyan-400 mr-3" />
                {t("reputation.insights")}
              </h3>
              <p className="text-gray-400">{t("reputation.subtitle")}</p>
            </div>
            <div className={`flex items-center space-x-2 rounded-2xl px-4 py-2 ${insightsLoading ? 'bg-black/30' : 'bg-green-400/10'}`}>
              <div className={`w-2 h-2 rounded-full ${insightsLoading ? 'bg-cyan-400 ai-typing' : 'bg-green-400'}`}></div>
              <span className={`text-sm font-medium ${insightsLoading ? 'text-cyan-400' : 'text-green-400'}`}>
                {insightsLoading ? 'AI Analyzing...' : `${insights.length} Insights Generated`}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            
            {/* Left Column - Posting Insights */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarPlus} className="text-cyan-400 mr-2" />
                Posting Strategy
              </h4>
              
              {insights.filter((_, i) => i < Math.ceil(insights.length / 2)).map((insight, index) => (
                <div key={index} className="insight-item bg-black/20 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-xl ${insight.color.bg} flex items-center justify-center mt-1`}>
                      <FontAwesomeIcon icon={getInsightIcon(insight.icon)} className={`${insight.color.text} text-sm`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium mb-1">{insight.title}</h5>
                      <p className="text-gray-400 text-sm mb-2">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`${insight.color.text} text-xs font-medium`}>Impact: {insight.impact}</div>
                        <div className="text-gray-500">&bull;</div>
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
              
              {insights.filter((_, i) => i >= Math.ceil(insights.length / 2)).map((insight, index) => (
                <div key={index} className="insight-item bg-black/20 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-xl ${insight.color.bg} flex items-center justify-center mt-1`}>
                      <FontAwesomeIcon icon={getInsightIcon(insight.icon)} className={`${insight.color.text} text-sm`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium mb-1">{insight.title}</h5>
                      <p className="text-gray-400 text-sm mb-2">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`${insight.color.text} text-xs font-medium`}>Impact: {insight.impact}</div>
                        <div className="text-gray-500">&bull;</div>
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
              <div className="text-2xl font-bold text-cyan-400 mb-1">{totalInteractions.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Interactions</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">{avgEngagement}</div>
              <div className="text-gray-400 text-sm">Avg Engagement / Post</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400 mb-1">
                +{insights.reduce((total, insight) => {
                  const match = (insight.impact || "").match(/\+(\d+)/);
                  return total + (match ? parseInt(match[1]) : 0);
                }, 0)}
              </div>
              <div className="text-gray-400 text-sm">Potential Points</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {reputationScore >= 91 ? '🏆' : Math.max(1, Math.ceil((91 - reputationScore) / 5))}
              </div>
              <div className="text-gray-400 text-sm">{reputationScore >= 91 ? 'Platinum Reached!' : 'Days to Platinum'}</div>
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
          <div 
            onClick={() => navigate("/dashboard/analytics")}
            className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faChartLine} className="text-cyan-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Detailed Analytics</h4>
            <p className="text-gray-400 text-sm">{totalInteractions.toLocaleString()} interactions across {posts.length} posts</p>
          </div>

          <div 
            onClick={() => navigate("/dashboard/scheduling")}
            className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faCalendarPlus} className="text-violet-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Schedule Optimal Content</h4>
            <p className="text-gray-400 text-sm">{stats.scheduled || 0} posts scheduled</p>
          </div>

          <div 
            onClick={() => {
              const shareText = `🏆 My AI Reputation Score: ${reputationScore}/100 (${currentTier.name} Tier)\n📊 Consistency: ${subScores.consistency}% | Engagement: ${subScores.engagement}% | Clarity: ${subScores.clarity}% | Growth: ${subScores.growth}%\n🔥 ${totalInteractions.toLocaleString()} total interactions across ${posts.length} posts`;
              navigator.clipboard.writeText(shareText).then(() => {
                setScoreCopied(true);
                setTimeout(() => setScoreCopied(false), 2000);
              });
            }}
            className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-teal-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={scoreCopied ? faCheckCircle : faShare} className={scoreCopied ? "text-green-400" : "text-teal-400"} />
            </div>
            <h4 className="text-white font-medium mb-2">{scoreCopied ? 'Copied!' : 'Share Score'}</h4>
            <p className="text-gray-400 text-sm">{scoreCopied ? 'Score copied to clipboard' : `${currentTier.name} tier — ${reputationScore}/100`}</p>
          </div>

          <div 
            onClick={() => setShowGoalsModal(true)}
            className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-yellow-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faBullseye} className="text-yellow-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Set Goals</h4>
            <p className="text-gray-400 text-sm">
              {goalTier ? `Target: ${goalTier} — ${Math.max(0, (goalTier === 'Platinum' ? 91 : goalTier === 'Gold' ? 71 : 41) - reputationScore)} pts to go` : 'Define reputation targets'}
            </p>
          </div>
        </div>
      </div>

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="glass-effect rounded-3xl p-8 max-w-lg w-full border border-yellow-400/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faBullseye} className="text-yellow-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Set Your Goal</h3>
              <p className="text-gray-400">Choose a tier to aim for. Current score: <span className="text-cyan-400 font-bold">{reputationScore}/100</span></p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { name: "Silver", min: 41, color: "gray", icon: faMedal },
                { name: "Gold", min: 71, color: "yellow", icon: faMedal },
                { name: "Platinum", min: 91, color: "violet", icon: faCrown },
              ].map((tier) => {
                const ptsNeeded = Math.max(0, tier.min - reputationScore);
                const reached = reputationScore >= tier.min;
                const isSelected = goalTier === tier.name;
                return (
                  <button
                    key={tier.name}
                    onClick={() => setGoalTier(tier.name)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? `bg-${tier.color}-400/20 border-${tier.color}-400/60`
                        : 'bg-black/20 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={tier.icon} className={`text-${tier.color}-400 text-xl`} />
                      <div className="text-left">
                        <div className={`text-${tier.color}-400 font-medium`}>{tier.name}</div>
                        <div className="text-gray-400 text-xs">{tier.min}+ points required</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {reached ? (
                        <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheckCircle} /> Reached
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">{ptsNeeded} pts to go</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {goalTier && (
              <div className="bg-yellow-400/10 rounded-2xl p-4 mb-6 border border-yellow-400/20">
                <div className="text-yellow-400 font-medium text-sm mb-1">Your path to {goalTier}</div>
                <div className="text-gray-300 text-sm">
                  {reputationScore >= (goalTier === 'Platinum' ? 91 : goalTier === 'Gold' ? 71 : 41)
                    ? `You've already reached ${goalTier}! Set a higher goal to keep pushing.`
                    : `Focus on ${subScores.consistency <= subScores.engagement ? 'consistency' : 'engagement'} — your lowest score at ${Math.min(subScores.consistency, subScores.engagement, subScores.clarity, subScores.growth)}%. Apply the AI insights above to improve.`
                  }
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setShowGoalsModal(false)}
                className="flex-1 p-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowGoalsModal(false);
                  // Scroll to insights section
                  document.querySelector('.slide-up')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
              >
                View Action Plan
              </button>
            </div>
          </div>
        </div>
      )}

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
                {insights.filter(i => i.type === 'clarity' || i.type === 'engagement').map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-black/30 rounded-xl">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 mt-0.5" />
                    <div>
                      <span className="text-gray-200 text-sm font-medium">{insight.title}</span>
                      <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
                {insights.filter(i => i.type === 'clarity' || i.type === 'engagement').length === 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                    <span className="text-gray-300 text-sm">Content quality is excellent!</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-medium mb-2">Strategy & Growth</h4>
                {insights.filter(i => i.type === 'consistency' || i.type === 'growth' || i.type === 'general').map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-black/30 rounded-xl">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 mt-0.5" />
                    <div>
                      <span className="text-gray-200 text-sm font-medium">{insight.title}</span>
                      <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
                {insights.filter(i => i.type === 'consistency' || i.type === 'growth' || i.type === 'general').length === 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                    <span className="text-gray-300 text-sm">Growth strategy is on track!</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-cyan-400/10 rounded-2xl p-4 mb-6 border border-cyan-400/20">
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon icon={faChartLine} className="text-cyan-400" />
                <span className="text-cyan-400 font-medium text-sm">Predicted Impact</span>
              </div>
              <div className="text-white font-bold text-lg">
                +{insights.reduce((total, insight) => {
                  const match = (insight.impact || "").match(/\+(\d+)/);
                  return total + (match ? parseInt(match[1]) : 0);
                }, 0)} reputation points
              </div>
              <div className="text-gray-400 text-sm">
                {reputationScore < 91 
                  ? `Moving you from ${currentTier.name} toward ${reputationScore >= 71 ? 'Platinum' : reputationScore >= 41 ? 'Gold' : 'Silver'} tier`
                  : 'Maintaining your Platinum status'}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowOptimizeModal(false)}
                disabled={optimizeLoading}
                className="flex-1 p-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all disabled:opacity-50"
              >
                Maybe Later
              </button>
              <button 
                onClick={handleConfirmOptimize}
                disabled={optimizeLoading}
                className="flex-1 p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {optimizeLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    AI Writing Post...
                  </span>
                ) : 'Generate & Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}