import { useState, useEffect } from "react";
import useTranslation from "../i18n/useTranslation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket, faChartColumn, faFire, faBrain,
  faCheck, faClock, faLightbulb, faTrophy,
  faDownload, faCalendarPlus, faShareNodes,
  faChartLine, faArrowTrendUp, faUsers, faStar, faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { apiFetch } from "../services/api";

/* ------------------- Tailwind color mapping ------------------- */
const colorMap = {
  "green-400": "text-green-400",
  "violet-400": "text-violet-400",
  "teal-400": "text-teal-400",
  "yellow-400": "text-yellow-400",
  "cyan-400": "text-cyan-400",
  "blue-400": "text-blue-400",
  "pink-400": "text-pink-400",
  "gray-300": "text-gray-300"
};

const colors = ["#00C2FF", "#7B61FF", "#00E09D", "#FFB800", "#FF6B6B", "#A0AEC0", "#F472B6", "#818CF8"];

const iconMap = {
  "fa-rocket": faRocket,
  "fa-brain": faBrain,
  "fa-clock": faClock,
  "fa-lightbulb": faLightbulb,
  "fa-chart-line": faChartLine,
  "fa-users": faUsers,
  "fa-star": faStar,
  "fa-fire": faFire,
  "fa-calendar-plus": faCalendarPlus,
  "fa-share-nodes": faShareNodes,
  "fa-trophy": faTrophy,
  "fa-download": faDownload,
};

/* ------------------- COMPONENT ------------------- */
export default function PerformanceOptimizer() {
  const t = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [applied, setApplied] = useState(false);
  const [perfData, setPerfData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/performance-analytics")
      .then((data) => setPerfData(data))
      .catch((err) => console.error("Performance analytics error:", err))
      .finally(() => setLoading(false));
  }, []);

  const barData = perfData?.engagement_by_type || [];
  const bestTimeData = perfData?.best_time_data || [];
  const avgEngagementPct = perfData?.avg_engagement_pct ?? "—";
  const platformEngPct = perfData?.platform_engagement_pct || {};
  const bestTime = perfData?.best_time ?? "—";
  const topPlatform = perfData?.top_platform ?? "—";
  const totalPosts = perfData?.total_posts ?? 0;
  const bestDay = perfData?.best_day ?? "";

  const quickActions = [
    { icon: faDownload, title: t("performance.exportReport"), description: t("performance.exportDesc"), color: "cyan-400" },
    { icon: faCalendarPlus, title: t("performance.scheduleOptimal"), description: t("performance.scheduleDesc"), color: "violet-400" },
    { icon: faLightbulb, title: t("performance.contentIdeas"), description: t("performance.contentDesc"), color: "teal-400" },
    { icon: faShareNodes, title: t("performance.shareInsights"), description: t("performance.shareDesc"), color: "yellow-400" }
  ];

  /* ------------------- EXPORT CSV ------------------- */
  const exportReport = () => {
    let csvRows = [];
    csvRows.push("Type,Engagement");
    barData.forEach(d => csvRows.push(`${d.name},${d.value}`));
    csvRows.push("");
    csvRows.push("Hour,Engagement");
    bestTimeData.forEach(d => csvRows.push(`${d.hour},${d.engagement}`));

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "performance_report.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="performance-waves-bg min-h-screen text-white p-6">

      {/* HEADER */}
      <div className="text-center mb-12 slide-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center">
          <FontAwesomeIcon icon={faRocket} size="2x" />
        </div>
        <h1 className="text-4xl font-bold mb-2">{t("performance.title")}</h1>
        <p className="text-gray-400">{t("performance.subtitle")}</p>
        <p className="text-gray-400">
          {loading ? "Loading..." : `Analyze ${totalPosts} posts across ${Object.keys(perfData?.platforms || {}).length} platforms • Last updated just now`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FontAwesomeIcon icon={faSpinner} spin className="text-cyan-400 text-4xl" />
        </div>
      ) : (
        <>
          {/* METRICS */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="metric-card glass-effect rounded-3xl p-6 text-center">
              <FontAwesomeIcon icon={faLightbulb} className="text-cyan-400 text-2xl mb-2" />
              <div className="text-2xl font-bold metric-value">{avgEngagementPct}</div>
              <div className="text-gray-400">{t("performance.avgEngagement")}</div>
              <div className="text-gray-500 text-xs mt-2">
                {["LinkedIn", "Twitter", "Medium"].map((p, i) => (
                  <span key={p}>{i > 0 && " • "}{p}: {platformEngPct[p] ?? "—"}</span>
                ))}
              </div>
            </div>
            <Metric title={t("performance.bestTime")} value={`${bestDay} ${bestTime}`} icon={faClock} />
            <Metric title={t("performance.topPlatform")} value={topPlatform} icon={faTrophy} />
          </div>

          {/* CHARTS */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="chart-container rounded-3xl p-6 glass-effect">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartColumn} /> {t("performance.engagementByType")}
              </h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={barData} margin={{ bottom: 40 }}>
                    <XAxis dataKey="name" stroke="#9CA3AF" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12 }} height={60} />
                    <YAxis stroke="#9CA3AF" unit="%" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm">
                            <p className="text-white font-medium mb-1">{d.name}</p>
                            <p className="text-cyan-400">{d.value}% of total engagement</p>
                            <p className="text-gray-400">{d.post_count} posts • {d.total_interactions} interactions</p>
                            <p className="text-gray-500 text-xs mt-1">👍 {d.likes} • 💬 {d.comments} • 🔁 {d.shares}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value">
                      {barData.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No content type data yet. <button onClick={() => apiFetch("/detect-content-types").then(() => window.location.reload())} className="text-cyan-400 underline">Run AI classifier</button></p>
                </div>
              )}
            </div>

            <div className="chart-container rounded-3xl p-6 glass-effect">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFire} /> Best Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bestTimeData}>
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#FFB800" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-gray-400 mt-2 text-center">{bestDay} {bestTime} peak engagement</p>
            </div>
          </div>

          {/* AI RECOMMENDATIONS */}
          <AIRecommendations totalPosts={totalPosts} />

          {/* Historical Performance */}
          <HistoricalPerformance
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            quickActions={quickActions}
            applied={applied}
            setApplied={setApplied}
            exportReport={exportReport}
            bestTime={bestTime}
            bestDay={bestDay}
            topPlatform={topPlatform}
            perfData={perfData}
          />
        </>
      )}
    </div>
  );
}

/* ------------------- SUB-COMPONENTS ------------------- */
function Metric({ title, value, icon }) {
  return (
    <div className="metric-card glass-effect rounded-3xl p-6 text-center">
      <FontAwesomeIcon icon={icon} className="text-cyan-400 text-2xl mb-2" />
      <div className="text-2xl font-bold metric-value">{value}</div>
      <div className="text-gray-400">{title}</div>
    </div>
  );
}

/* ------------------- AIRecommendations ------------------- */
function AIRecommendations({ totalPosts }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = () => {
    setLoading(true);
    setError(null);
    apiFetch("/ai-performance-recommendations")
      .then((data) => {
        if (data.success) {
          setRecommendations(data);
        } else {
          setError(data.error || "Failed to get AI recommendations");
        }
      })
      .catch((err) => {
        console.error("AI recommendations error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  const categories = recommendations?.categories || [];
  const summary = recommendations?.summary || {};
  const categoryIcons = [faBrain, faClock, faChartLine, faUsers];

  return (
    <div className="glass-effect rounded-3xl p-8 mt-6 mb-8 max-w-7xl mx-auto slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center mb-2">
            <FontAwesomeIcon icon={faBrain} className="text-cyan-400 mr-3" />
            AI Performance Recommendations
          </h3>
          <p className="text-gray-400">Based on analysis of your top-performing content</p>
        </div>
        {!recommendations && !loading && (
          <button
            onClick={fetchRecommendations}
            className="flex items-center space-x-2 bg-cyan-400/20 hover:bg-cyan-400/30 rounded-2xl px-5 py-2.5 transition-colors"
          >
            <FontAwesomeIcon icon={faBrain} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Analyze with AI</span>
          </button>
        )}
        {loading && (
          <div className="flex items-center space-x-2 bg-black/30 rounded-2xl px-4 py-2">
            <FontAwesomeIcon icon={faSpinner} spin className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">AI Analyzing...</span>
          </div>
        )}
        {recommendations && !loading && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-black/30 rounded-2xl px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-data"></div>
              <span className="text-green-400 text-sm font-medium">Analysis Complete</span>
            </div>
            <button
              onClick={fetchRecommendations}
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchRecommendations} className="text-cyan-400 text-sm mt-2 underline">Try again</button>
        </div>
      )}

      {!recommendations && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <FontAwesomeIcon icon={faBrain} className="text-4xl mb-4 text-gray-600" />
          <p className="text-lg">Click "Analyze with AI" to get personalized recommendations</p>
          <p className="text-sm mt-2">AI will analyze your {totalPosts} posts and interactions to find optimization opportunities</p>
        </div>
      )}

      {categories.length > 0 && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FontAwesomeIcon icon={categoryIcons[idx % categoryIcons.length]} className="text-cyan-400 mr-2" />
                  {cat.category}
                </h4>
                {cat.items.map((item, i) => (
                  <div key={i} className="recommendation-item bg-black/20 rounded-2xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faRocket} className={colorMap[item.color] || "text-cyan-400"} />
                        <span className="text-white font-medium">{item.text}</span>
                      </div>
                      <div className={`${colorMap[item.color] || "text-cyan-400"} text-sm font-medium`}>{item.confidence}% confidence</div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                    <div className="confidence-bar bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${item.confidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <SummaryStat number={String(summary.total_recommendations || categories.reduce((a, c) => a + c.items.length, 0))} label="Recommendations" color="cyan-400" />
            <SummaryStat number={`${summary.avg_confidence || Math.round(categories.flatMap(c => c.items).reduce((a, i) => a + i.confidence, 0) / Math.max(categories.flatMap(c => c.items).length, 1))}%`} label="Avg Confidence" color="violet-400" />
            <SummaryStat number={summary.potential_boost || "+—%"} label="Potential Boost" color="teal-400" />
            <SummaryStat number={String(summary.posts_analyzed || totalPosts)} label="Posts Analyzed" color="yellow-400" />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryStat({ number, label, color }) {
  return (
    <div className="bg-black/30 rounded-2xl p-4 text-center">
      <div className={`text-2xl font-bold ${colorMap[color]} mb-1`}>{number}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

/* ------------------- HistoricalPerformance Component ------------------- */
function HistoricalPerformance({ selectedPeriod, setSelectedPeriod, quickActions, applied, setApplied, exportReport, bestTime, bestDay, topPlatform, perfData }) {
  const [activeModal, setActiveModal] = useState(null); // "schedule" | "ideas" | "share" | null
  const [trends, setTrends] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [contentIdeas, setContentIdeas] = useState(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTrendsLoading(true);
    apiFetch(`/performance-trends?period=${selectedPeriod}`)
      .then((data) => setTrends(data))
      .catch((err) => console.error("Performance trends error:", err))
      .finally(() => setTrendsLoading(false));
  }, [selectedPeriod]);

  const eg = trends?.engagement_growth;
  const re = trends?.reach_expansion;
  const cq = trends?.content_quality;

  /* --- Quick Action Handlers --- */
  const handleQuickAction = (title) => {
    if (title === "Export Report") {
      exportReport();
    } else if (title === "Schedule Optimal Posts") {
      setActiveModal("schedule");
    } else if (title === "Content Ideas") {
      setActiveModal("ideas");
      if (!contentIdeas && !ideasLoading) {
        fetchContentIdeas();
      }
    } else if (title === "Share Insights") {
      setActiveModal("share");
    }
  };

  const fetchContentIdeas = () => {
    setIdeasLoading(true);
    setIdeasError(null);
    apiFetch("/ai-content-ideas")
      .then((data) => {
        if (data.success) {
          setContentIdeas(data.ideas);
        } else {
          setIdeasError(data.error || "Failed to generate ideas");
        }
      })
      .catch((err) => setIdeasError(err.message))
      .finally(() => setIdeasLoading(false));
  };

  const handleShareInsights = () => {
    const summary = [
      `📊 Performance Report (${selectedPeriod})`,
      ``,
      `🚀 Engagement Growth: ${eg?.growth_pct >= 0 ? "+" : ""}${eg?.growth_pct ?? 0}%`,
      `   ${eg?.this_period?.label}: ${eg?.this_period?.value}`,
      ``,
      `👥 Reach: ${re?.total_impressions?.value} impressions | ${re?.unique_users?.value} unique users`,
      ``,
      `⭐ Content Quality: ${cq?.quality_label}`,
      `   Share rate: ${cq?.share_rate?.value} | Save rate: ${cq?.save_rate?.value}`,
      ``,
      `🏆 Top Platform: ${topPlatform}`,
      `⏰ Best Time: ${bestDay} ${bestTime}`,
      ``,
      `Generated by AutoPoster Performance Optimizer`
    ].join("\n");

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mb-12">
      {/* Performance Trends Section */}
      <div className="glass-effect rounded-3xl p-8 mb-8 max-w-7xl mx-auto slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="text-teal-400 mr-3" />
            Performance Trends
          </h3>
          <div className="flex items-center space-x-4">
            {["7D", "30D", "90D"].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  selectedPeriod === period
                    ? "bg-cyan-400/20 text-cyan-400"
                    : "bg-black/30 text-gray-400 hover:bg-black/50"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {trendsLoading ? (
          <div className="flex justify-center items-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="text-cyan-400 text-2xl" />
          </div>
        ) : trends ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Engagement Growth */}
            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">{eg?.title || "Engagement Growth"}</h4>
                <div className={`flex items-center space-x-1 text-sm ${(eg?.growth_pct ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  <FontAwesomeIcon icon={faArrowTrendUp} />
                  <span>{(eg?.growth_pct ?? 0) >= 0 ? "+" : ""}{eg?.growth_pct ?? 0}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{eg?.this_period?.label}</span>
                  <span className="text-green-400 font-medium">{eg?.this_period?.value}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{eg?.last_period?.label}</span>
                  <span className="text-gray-300">{eg?.last_period?.value}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{eg?.prev_period?.label}</span>
                  <span className="text-gray-300">{eg?.prev_period?.value}</span>
                </div>
              </div>
            </div>

            {/* Reach Expansion */}
            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">{re?.title || "Reach Expansion"}</h4>
                <div className="flex items-center space-x-1 text-cyan-400 text-sm">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{re?.change}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{re?.total_impressions?.label}</span>
                  <span className="text-cyan-400 font-medium">{re?.total_impressions?.value}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{re?.unique_users?.label}</span>
                  <span className="text-gray-300">{re?.unique_users?.value}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{re?.avg_per_post?.label}</span>
                  <span className="text-gray-300">{re?.avg_per_post?.value}</span>
                </div>
              </div>
            </div>

            {/* Content Quality */}
            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">{cq?.title || "Content Quality"}</h4>
                <div className="flex items-center space-x-1 text-violet-400 text-sm">
                  <FontAwesomeIcon icon={faStar} />
                  <span>{cq?.quality_label}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{cq?.avg_time?.label}</span>
                  <span className="text-violet-400 font-medium">{cq?.avg_time?.value}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{cq?.share_rate?.label}</span>
                  <span className="text-gray-300">{cq?.share_rate?.value}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{cq?.save_rate?.label}</span>
                  <span className="text-gray-300">{cq?.save_rate?.value}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No trend data available</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-8 mb-8">
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => handleQuickAction(action.title)}
              className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-${action.color}/20 flex items-center justify-center`}>
                <FontAwesomeIcon icon={action.icon} className={`text-${action.color}`} />
              </div>
              <h4 className="text-white font-medium mb-2">{action.title}</h4>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </div>
          ))}
        </div>

        {/* SCHEDULE MODAL */}
        {activeModal === "schedule" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-lg w-full border border-violet-400/30">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarPlus} className="text-violet-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Schedule Optimal Posts</h3>
                <p className="text-gray-400 text-sm">Based on your performance data, here are the best times to post</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="bg-black/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faClock} className="text-violet-400" />
                    <span className="text-white">Best time</span>
                  </div>
                  <span className="text-violet-400 font-medium">{bestDay} {bestTime}</span>
                </div>
                <div className="bg-black/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
                    <span className="text-white">Top platform</span>
                  </div>
                  <span className="text-yellow-400 font-medium">{topPlatform}</span>
                </div>
                <div className="bg-black/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
                    <span className="text-white">Engagement boost</span>
                  </div>
                  <span className="text-green-400 font-medium">{eg?.growth_pct >= 0 ? "+" : ""}{eg?.growth_pct ?? 0}%</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 bg-gray-700/80 p-3 rounded-xl text-white hover:bg-gray-600 transition-colors">Close</button>
                <button
                  onClick={() => { setApplied(true); setActiveModal(null); window.location.href = `/dashboard/CreatePostPage?bestTime=${encodeURIComponent(bestTime)}&bestDay=${encodeURIComponent(bestDay)}&topPlatform=${encodeURIComponent(topPlatform)}`; }}
                  className="flex-1 gradient-accent p-3 rounded-xl text-white"
                >
                  Go to Scheduler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT IDEAS MODAL */}
        {activeModal === "ideas" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-teal-400/30 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLightbulb} className="text-teal-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Content Ideas</h3>
                <p className="text-gray-400 text-sm">Personalized suggestions based on your audience data</p>
              </div>

              {ideasLoading && (
                <div className="flex flex-col items-center py-8">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-teal-400 text-3xl mb-4" />
                  <p className="text-gray-400">AI is generating content ideas...</p>
                </div>
              )}

              {ideasError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-red-400 mb-2">{ideasError}</p>
                  <button onClick={fetchContentIdeas} className="text-cyan-400 text-sm underline">Try again</button>
                </div>
              )}

              {contentIdeas && contentIdeas.length > 0 && (
                <div className="space-y-4 mb-6">
                  {contentIdeas.map((idea, i) => (
                    <div key={i} className="bg-black/20 rounded-2xl p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{idea.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${idea.estimated_engagement === "high" ? "bg-green-400/20 text-green-400" : "bg-yellow-400/20 text-yellow-400"}`}>
                          {idea.estimated_engagement} engagement
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{idea.description}</p>
                      <div className="bg-black/30 rounded-xl p-3 mb-3">
                        <p className="text-gray-500 text-xs mb-1">Hook:</p>
                        <p className="text-gray-200 text-sm italic">"{idea.hook}"</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="bg-black/30 px-2 py-1 rounded">{idea.platform}</span>
                        <span className="bg-black/30 px-2 py-1 rounded">{idea.content_type}</span>
                        <span className="bg-black/30 px-2 py-1 rounded">Target: {idea.target_persona}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 bg-gray-700/80 p-3 rounded-xl text-white hover:bg-gray-600 transition-colors">Close</button>
                <button
                  onClick={fetchContentIdeas}
                  disabled={ideasLoading}
                  className="flex-1 gradient-accent p-3 rounded-xl text-white disabled:opacity-50"
                >
                  {ideasLoading ? "Generating..." : "Regenerate Ideas"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE INSIGHTS MODAL */}
        {activeModal === "share" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-lg w-full border border-yellow-400/30">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faShareNodes} className="text-yellow-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Share Insights</h3>
                <p className="text-gray-400 text-sm">Copy your performance summary to share with your team</p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 mb-6 font-mono text-sm text-gray-300 whitespace-pre-line">
                {`📊 Performance Report (${selectedPeriod})\n\n🚀 Engagement Growth: ${eg?.growth_pct >= 0 ? "+" : ""}${eg?.growth_pct ?? 0}%\n   ${eg?.this_period?.label}: ${eg?.this_period?.value}\n\n👥 Reach: ${re?.total_impressions?.value} impressions\n   ${re?.unique_users?.value} unique users\n\n⭐ Quality: ${cq?.quality_label}\n   Share rate: ${cq?.share_rate?.value}\n\n🏆 Top Platform: ${topPlatform}\n⏰ Best Time: ${bestDay} ${bestTime}`}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 bg-gray-700/80 p-3 rounded-xl text-white hover:bg-gray-600 transition-colors">Close</button>
                <button
                  onClick={handleShareInsights}
                  className={`flex-1 p-3 rounded-xl text-white transition-colors ${copied ? "bg-green-500/30 border border-green-400/50" : "gradient-accent"}`}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faShareNodes} className="mr-2" />
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
