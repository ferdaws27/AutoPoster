import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import { apiFetch } from "../services/api";

export default function AudienceAnalyzer() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [strategyApplied, setStrategyApplied] = useState(false);
  const [downloadState, setDownloadState] = useState("idle");
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("idle"); // idle | analyzing | done | error
  const [aiInsights, setAiInsights] = useState([]);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState(null);
  const [aiStrategyLoading, setAiStrategyLoading] = useState(false);
  const [contentPrefs, setContentPrefs] = useState(null);
  const [contentPrefsLoading, setContentPrefsLoading] = useState(false);

  useEffect(() => {
    apiFetch("/audience-analytics")
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Audience analytics fetch error:", err));
  }, []);

  // Auto-trigger AI analysis when analytics data is loaded
  useEffect(() => {
    if (!analytics || analytics.total_interactions === 0) return;
    setAiLoading(true);
    setAiStatus("analyzing");
    apiFetch("/ai-persona-analysis")
      .then((data) => {
        if (data.success) {
          setAiAnalysis(data.data);
          setAiStatus("done");
        } else {
          setAiStatus("error");
        }
      })
      .catch((err) => {
        console.error("AI analysis error:", err);
        setAiStatus("error");
      })
      .finally(() => setAiLoading(false));
  }, [analytics]);

  // Derived values from analytics
  const personas = analytics?.personas || {};
  const platforms = analytics?.platforms || {};
  const locations = analytics?.locations || {};
  const industries = analytics?.industries || {};
  const totalInteractions = analytics?.total_interactions || 0;
  const activeUsers = analytics?.active_users || 0;
  const engagementRate = analytics?.engagement_rate || 0;

  const personaTotal = Object.values(personas).reduce((a, b) => a + b, 0) || 1;
  const personaPercent = (name) => Math.round((personas[name] || 0) / personaTotal * 100);
  const personaFollowers = (name) => personas[name] || 0;

  const platformTotal = Object.values(platforms).reduce((a, b) => a + b, 0) || 1;
  const locationTotal = Object.values(locations).reduce((a, b) => a + b, 0) || 1;
  const industryTotal = Object.values(industries).reduce((a, b) => a + b, 0) || 1;
  const personaBreakdown = analytics?.persona_breakdown || {};

  useEffect(() => {
    if (!chartRef.current || !analytics) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = Highcharts.chart(chartRef.current, {
      chart: {
        type: "column",
        backgroundColor: "transparent",
        style: {
          fontFamily: "Inter"
        }
      },
      credits: { enabled: false },
      title: { text: null },
      xAxis: {
        categories: ["Entrepreneurs", "AI Students", "Writers", "Investors"],
        labels: {
          style: { color: "#9CA3AF", fontSize: "12px" }
        },
        lineColor: "transparent",
        tickColor: "transparent"
      },
      yAxis: {
        title: {
          text: "Engagement Rate (%)",
          style: { color: "#9CA3AF" }
        },
        labels: {
          style: { color: "#9CA3AF" }
        },
        gridLineColor: "rgba(255, 255, 255, 0.1)"
      },
      plotOptions: {
        column: {
          borderRadius: 8,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            style: { color: "#F8F9FA", fontWeight: "bold" },
            format: "{y}%"
          }
        }
      },
      series: [{
        name: "Engagement Rate",
        data: [
          personaPercent("Entrepreneurs"),
          personaPercent("AI Students"),
          personaPercent("Writers"),
          personaPercent("Investors")
        ],
        colorByPoint: true,
        colors: ["#00C2FF", "#7B61FF", "#14B8A6", "#F59E0B"]
      }],
      legend: { enabled: false }
    });

  }, [analytics]);

  const handleGenerateAiInsights = () => {
    setAiInsightsLoading(true);
    apiFetch("/ai-audience-insights")
      .then((data) => {
        if (data.success) {
          setAiInsights(data.insights);
        }
      })
      .catch((err) => console.error("AI insights error:", err))
      .finally(() => setAiInsightsLoading(false));
  };

  const handleGenerateStrategy = () => {
    setShowModal(true);
    setAiStrategyLoading(true);
    setAiStrategy(null);
    apiFetch("/ai-generate-strategy")
      .then((data) => {
        if (data.success) {
          setAiStrategy(data.strategy);
        }
      })
      .catch((err) => console.error("AI strategy error:", err))
      .finally(() => setAiStrategyLoading(false));
  };

  const handleApplyStrategy = () => {
    setShowModal(false);
    setStrategyApplied(true);
    setTimeout(() => setStrategyApplied(false), 3000);
  };

  const handleDownloadReport = () => {
    setDownloadState("generating");
    setTimeout(() => {
      setDownloadState("downloaded");
      setTimeout(() => setDownloadState("idle"), 2000);
    }, 2000);
  };

  const handleInterestClick = (interest) => {
    setSelectedInterest(interest);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Get AI insight for a specific persona
  const getAiPersonaInsight = (personaName) => {
    if (!aiAnalysis?.persona_insights) return null;
    return aiAnalysis.persona_insights.find(p => p.persona === personaName);
  };

  return (
    <div className=" p-8">
      
      {/* Header Section */}
      <div className="mb-12 slide-up">
        <div className="text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 flex items-center justify-center data-point">
            <i className="fa-solid fa-users text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Audience Persona Analyzer — Know Your Readers</h1>
          <p className="text-xl text-gray-300 mb-2">AI analyzes your followers and interactions to reveal audience types and preferences</p>
          <p className="text-gray-400">Based on {totalInteractions.toLocaleString()} interactions • {activeUsers.toLocaleString()} active engagers • {analytics?.total_posts || 0} posts analyzed</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
        
        {/* Total Audience Size */}
        <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 slide-up border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
              <i className="fa-solid fa-users text-cyan-400 text-xl"></i>
            </div>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <i className="fa-solid fa-arrow-up"></i>
              <span>+12%</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-3xl font-bold metric-value">{totalInteractions.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Interactions</div>
          </div>
          <div className="text-gray-300 text-xs">
            <span className="text-cyan-400">LinkedIn:</span> {(platforms["LinkedIn"] || 0).toLocaleString()} • 
            <span className="text-violet-400">Twitter:</span> {(platforms["Twitter"] || 0).toLocaleString()} • 
            <span className="text-teal-400">Medium:</span> {(platforms["Medium"] || 0).toLocaleString()}
          </div>
        </div>

        {/* Active Commenters */}
        <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 slide-up border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
              <i className="fa-solid fa-comments text-violet-400 text-xl"></i>
            </div>
            <div className="flex items-center space-x-1 text-cyan-400 text-sm">
              <i className="fa-solid fa-fire"></i>
              <span>Active</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-3xl font-bold metric-value">{activeUsers.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <div className="text-gray-300 text-xs">
            {totalInteractions > 0 ? Math.round(activeUsers / (analytics?.total_posts || 1) * 100) / 100 : 0} users per post average
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 slide-up border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-teal-400 text-xl"></i>
            </div>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <i className="fa-solid fa-trophy"></i>
              <span>High</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-3xl font-bold metric-value">{engagementRate}</div>
            <div className="text-gray-400 text-sm">Engagement Rate (per post)</div>
          </div>
          <div className="text-gray-300 text-xs">
            2x industry average • Strongest on professional content
          </div>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
        
        {/* LEFT PANEL: Persona Clusters */}
        <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 slide-up border border-gray-700/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <i className="fa-solid fa-user-group text-cyan-400 mr-3"></i>
              Persona Clusters
            </h3>
            <div className="flex items-center space-x-2 bg-black/30 rounded-2xl px-4 py-2">
              <div className={`w-2 h-2 rounded-full ${
                aiStatus === "analyzing" ? "bg-yellow-400 animate-pulse" :
                aiStatus === "done" ? "bg-green-400" :
                aiStatus === "error" ? "bg-red-400" :
                "bg-gray-400"
              }`}></div>
              <span className={`text-sm font-medium ${
                aiStatus === "analyzing" ? "text-yellow-400" :
                aiStatus === "done" ? "text-green-400" :
                aiStatus === "error" ? "text-red-400" :
                "text-gray-400"
              }`}>{
                aiStatus === "analyzing" ? "AI Analyzing..." :
                aiStatus === "done" ? "AI Analysis Complete" :
                aiStatus === "error" ? "AI Error" :
                "Waiting for data"
              }</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <PersonaCard 
              name="Entrepreneurs"
              percent={`${personaPercent("Entrepreneurs")}%`}
              followers={personaFollowers("Entrepreneurs").toLocaleString()}
              icon="fa-rocket"
              color="cyan"
              interests={["AI Tools", "Productivity", "Startups"]}
              topPost="Short Hooks & Tips"
              onInterestClick={handleInterestClick}
              aiInsight={getAiPersonaInsight("Entrepreneurs")}
            />
            <PersonaCard 
              name="AI Students"
              percent={`${personaPercent("AI Students")}%`}
              followers={personaFollowers("AI Students").toLocaleString()}
              icon="fa-graduation-cap"
              color="violet"
              interests={["Machine Learning", "Tutorials", "Research"]}
              topPost="Educational Content"
              onInterestClick={handleInterestClick}
              aiInsight={getAiPersonaInsight("AI Students")}
            />
            <PersonaCard 
              name="Writers"
              percent={`${personaPercent("Writers")}%`}
              followers={personaFollowers("Writers").toLocaleString()}
              icon="fa-feather"
              color="teal"
              interests={["Storytelling", "Content", "Creativity"]}
              topPost="Personal Stories"
              onInterestClick={handleInterestClick}
              aiInsight={getAiPersonaInsight("Writers")}
            />
            <PersonaCard 
              name="Investors"
              percent={`${personaPercent("Investors")}%`}
              followers={personaFollowers("Investors").toLocaleString()}
              icon="fa-chart-line"
              color="yellow"
              interests={["Markets", "Tech Trends", "Analysis"]}
              topPost="Industry Insights"
              onInterestClick={handleInterestClick}
              aiInsight={getAiPersonaInsight("Investors")}
            />
          </div>
        </div>

        {/* RIGHT PANEL: Insights Summary */}
        <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 slide-up border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <i className="fa-solid fa-lightbulb text-violet-400 mr-3"></i>
              Engagement Insights
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-400 rounded-full"></div>
              <span className="text-gray-400 text-sm">By persona type</span>
            </div>
          </div>
          
          {/* Chart */}
          <div ref={chartRef} className="h-64 mb-6"></div>

          {/* Per-Persona Engagement Breakdown */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Engagement Breakdown</h4>
            {[
              { name: "Entrepreneurs", color: "cyan", icon: "fa-rocket" },
              { name: "AI Students", color: "violet", icon: "fa-graduation-cap" },
              { name: "Writers", color: "teal", icon: "fa-feather" },
              { name: "Investors", color: "yellow", icon: "fa-chart-line" },
            ].map(({ name, color, icon }) => {
              const bd = personaBreakdown[name] || {};
              return (
                <div key={name} className="bg-black/20 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className={`fa-solid ${icon} text-${color}-400`}></i>
                      <span className="text-white font-medium text-sm">{name}</span>
                    </div>
                    <span className={`text-${color}-400 font-bold text-lg`}>{personaPercent(name)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                    <div className={`bg-${color}-400 h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${personaPercent(name)}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-pink-400"><i className="fa-solid fa-heart mr-1"></i>{bd.likes ?? 0} likes <span className="text-gray-500">({bd.like_rate ?? 0}%)</span></span>
                    <span className="text-cyan-400"><i className="fa-solid fa-comment mr-1"></i>{bd.comments ?? 0} comments <span className="text-gray-500">({bd.comment_rate ?? 0}%)</span></span>
                    <span className="text-green-400"><i className="fa-solid fa-share mr-1"></i>{bd.shares ?? 0} shares <span className="text-gray-500">({bd.share_rate ?? 0}%)</span></span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* AI Insights List */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <i className="fa-solid fa-brain text-cyan-400 mr-2"></i>
                AI Insights
              </h4>
              <button
                onClick={handleGenerateAiInsights}
                disabled={aiInsightsLoading}
                className="px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-cyan-400 hover:from-cyan-400/30 hover:to-violet-500/30 border border-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className={`fa-solid ${aiInsightsLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                {aiInsightsLoading ? 'Generating...' : 'Generate AI Insights'}
              </button>
            </div>
            
            {aiInsightsLoading && (
              <div className="text-center py-6">
                <i className="fa-solid fa-spinner fa-spin text-cyan-400 text-2xl mb-3"></i>
                <p className="text-gray-400 text-sm">AI is analyzing your audience data...</p>
              </div>
            )}

            {!aiInsightsLoading && aiInsights.length > 0 && aiInsights.map((insight, index) => (
              <InsightItem 
                key={index}
                icon={insight.icon}
                color={insight.color}
                title={insight.title}
                description={insight.description}
              />
            ))}

            {!aiInsightsLoading && aiInsights.length === 0 && (analytics?.insights || []).map((insight, index) => (
              <InsightItem 
                key={index}
                icon={insight.icon}
                color={insight.color}
                title={insight.title}
                description={insight.description}
              />
            ))}
          </div>

          {/* Generate Strategy Button */}
          <button
            onClick={handleGenerateStrategy}
            className={`w-full px-6 py-4 rounded-3xl text-white font-bold text-lg transition-all transform hover:scale-105 ${
              strategyApplied 
                ? 'bg-gradient-to-r from-green-400 to-cyan-400' 
                : 'bg-gradient-to-r from-cyan-400 to-violet-500'
            }`}
          >
            <i className={`fa-solid ${strategyApplied ? 'fa-check' : 'fa-lightbulb'} mr-3`}></i>
            {strategyApplied ? 'Strategy Applied!' : 'Generate New Strategy'}
          </button>
        </div>
      </div>

      {/* Audience Demographics */}
      <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 mb-8 max-w-7xl mx-auto slide-up border border-gray-700/30">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <i className="fa-solid fa-globe text-teal-400 mr-3"></i>
            Audience Demographics
          </h3>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <DemographicsCard 
            title="Top Locations"
            icon="fa-map-marker-alt"
            color="cyan"
            data={[
              { label: "USA", value: `${Math.round((locations["USA"] || 0) / locationTotal * 100)}%`, color: "cyan" },
              { label: "UK", value: `${Math.round((locations["UK"] || 0) / locationTotal * 100)}%`, color: "violet" },
              { label: "Canada", value: `${Math.round((locations["Canada"] || 0) / locationTotal * 100)}%`, color: "teal" },
              { label: "Germany", value: `${Math.round((locations["Germany"] || 0) / locationTotal * 100)}%`, color: "yellow" },
              { label: "France", value: `${Math.round((locations["France"] || 0) / locationTotal * 100)}%`, color: "gray" },
              { label: "Tunisia", value: `${Math.round((locations["Tunisia"] || 0) / locationTotal * 100)}%`, color: "cyan" }
            ]}
          />
          <DemographicsCard 
            title="Industries"
            icon="fa-briefcase"
            color="violet"
            data={[
              { label: "Tech", value: `${Math.round((industries["Tech"] || 0) / industryTotal * 100)}%`, color: "cyan" },
              { label: "Marketing", value: `${Math.round((industries["Marketing"] || 0) / industryTotal * 100)}%`, color: "violet" },
              { label: "Education", value: `${Math.round((industries["Education"] || 0) / industryTotal * 100)}%`, color: "teal" },
              { label: "Finance", value: `${Math.round((industries["Finance"] || 0) / industryTotal * 100)}%`, color: "yellow" }
            ]}
          />
          <DemographicsCard 
            title="Activity Patterns"
            icon="fa-clock"
            color="teal"
            data={[
              { label: "Morning (6-12)", value: "35%", color: "cyan" },
              { label: "Afternoon (12-18)", value: "45%", color: "violet" },
              { label: "Evening (18-24)", value: "15%", color: "teal" },
              { label: "Night (24-6)", value: "5%", color: "gray" }
            ]}
          />
        </div>
      </div>

      {/* Content Preferences */}
      <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 mb-8 max-w-7xl mx-auto slide-up border border-gray-700/30">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <i className="fa-solid fa-heart text-pink-400 mr-3"></i>
            Content Preferences by Persona
          </h3>
          <button
            onClick={() => {
              setContentPrefsLoading(true);
              apiFetch("/ai-content-preferences")
                .then((data) => {
                  if (data.success) setContentPrefs(data);
                })
                .catch((err) => console.error("Content prefs error:", err))
                .finally(() => setContentPrefsLoading(false));
            }}
            disabled={contentPrefsLoading}
            className="px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-pink-400/20 to-violet-500/20 text-pink-400 hover:from-pink-400/30 hover:to-violet-500/30 border border-pink-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fa-solid ${contentPrefsLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
            {contentPrefsLoading ? 'Analyzing...' : 'Generate with AI'}
          </button>
        </div>

        {contentPrefsLoading && (
          <div className="text-center py-12">
            <i className="fa-solid fa-spinner fa-spin text-pink-400 text-3xl mb-4"></i>
            <p className="text-gray-400">AI is analyzing content performance and posting times...</p>
          </div>
        )}

        {!contentPrefsLoading && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Content Types */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Top Performing Content Types</h4>
            
            <div className="space-y-4">
              {contentPrefs?.content_types?.length > 0 ? (
                contentPrefs.content_types.map((ct, i) => (
                  <ContentTypeBar
                    key={i}
                    title={ct.title}
                    engagement={ct.engagement}
                    percentage={ct.percentage}
                    gradient={ct.gradient}
                    description={ct.description}
                  />
                ))
              ) : (
                <>
                  <ContentTypeBar 
                    title="Tutorial & How-to Posts"
                    engagement="8.4%"
                    percentage={84}
                    gradient="from-cyan-400 to-violet-400"
                    description="Most loved by AI Students & Entrepreneurs"
                  />
                  <ContentTypeBar 
                    title="Personal Stories"
                    engagement="7.1%"
                    percentage={71}
                    gradient="from-violet-400 to-teal-400"
                    description="Writers & Entrepreneurs resonate most"
                  />
                  <ContentTypeBar 
                    title="Industry Insights"
                    engagement="6.8%"
                    percentage={68}
                    gradient="from-teal-400 to-yellow-400"
                    description="Investors & Entrepreneurs prefer these"
                  />
                  <ContentTypeBar 
                    title="Quick Tips"
                    engagement="5.9%"
                    percentage={59}
                    gradient="from-yellow-400 to-orange-400"
                    description="Universal appeal across all personas"
                  />
                </>
              )}
            </div>
          </div>

          {/* Optimal Posting Times by Persona */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Optimal Posting Times by Persona</h4>
            
            <div className="space-y-4">
              {contentPrefs?.posting_times?.length > 0 ? (
                contentPrefs.posting_times.map((pt, i) => (
                  <PostingTimeCard
                    key={i}
                    icon={pt.icon}
                    persona={pt.persona}
                    time={pt.time}
                    color={pt.color}
                    performance={pt.performance}
                  />
                ))
              ) : (
                <>
                  <PostingTimeCard 
                    icon="fa-rocket"
                    persona="Entrepreneurs"
                    time="Tuesday, 2:00 PM"
                    color="cyan"
                    performance="+73% above average"
                  />
                  <PostingTimeCard 
                    icon="fa-graduation-cap"
                    persona="AI Students"
                    time="Wednesday, 7:00 PM"
                    color="violet"
                    performance="+65% above average"
                  />
                  <PostingTimeCard 
                    icon="fa-feather"
                    persona="Writers"
                    time="Sunday, 10:00 AM"
                    color="teal"
                    performance="+58% above average"
                  />
                  <PostingTimeCard 
                    icon="fa-chart-line"
                    persona="Investors"
                    time="Thursday, 9:00 AM"
                    color="yellow"
                    performance="+52% above average"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Action Button */}
      <div className="text-center mb-8 slide-up">
        <button
          onClick={handleDownloadReport}
          disabled={downloadState !== "idle"}
          className={`px-12 py-4 rounded-3xl text-white font-bold text-xl transition-all transform hover:scale-105 ${
            downloadState === "downloaded" 
              ? 'bg-gradient-to-r from-green-400 to-cyan-400' 
              : 'bg-gradient-to-r from-green-400 to-cyan-400'
          } ${downloadState !== "idle" ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          <i className={`fa-solid ${
            downloadState === "generating" ? 'fa-spinner fa-spin' : 
            downloadState === "downloaded" ? 'fa-check' : 
            'fa-download'
          } mr-3`}></i>
          {
            downloadState === "generating" ? 'Generating Report...' :
            downloadState === "downloaded" ? 'Report Downloaded!' :
            'Download Persona Report PDF'
          }
        </button>
        <p className="text-gray-400 mt-4">Get detailed insights and recommendations for each audience segment</p>
      </div>

      {/* Strategy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <i className={`fa-solid ${aiStrategyLoading ? 'fa-spinner fa-spin' : 'fa-lightbulb'} text-cyan-400 text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AI-Generated Content Strategy</h3>
              <p className="text-gray-400">
                {aiStrategyLoading ? 'AI is crafting your strategy...' : 'Based on your audience persona analysis'}
              </p>
            </div>
            
            {aiStrategyLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin"></div>
                <p className="text-gray-300 text-lg mb-2">Analyzing your audience data...</p>
                <p className="text-gray-500 text-sm">This may take a few seconds</p>
              </div>
            )}

            {!aiStrategyLoading && aiStrategy && (
              <div className="space-y-4 mb-6">
                {/* Posting Schedule */}
                <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fa-solid fa-calendar text-cyan-400"></i>
                    <span className="text-white font-medium">Optimal Posting Schedule</span>
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    {(aiStrategy.posting_schedule || []).map((s, i) => (
                      <div key={i}>• {s.best_time} for {s.persona} ({s.audience_pct}% of audience) — {s.tip}</div>
                    ))}
                  </div>
                </div>

                {/* Content Mix */}
                <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fa-solid fa-pen text-violet-400"></i>
                    <span className="text-white font-medium">Content Mix Recommendation</span>
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    {(aiStrategy.content_mix || []).map((c, i) => (
                      <div key={i}>• {c.percentage}% {c.type} — {c.description}</div>
                    ))}
                  </div>
                </div>

                {/* Platform Focus */}
                <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fa-solid fa-share-nodes text-teal-400"></i>
                    <span className="text-white font-medium">Platform Focus</span>
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    {(aiStrategy.platform_focus || []).map((p, i) => (
                      <div key={i}>• <span className="text-white font-medium">{p.platform}:</span> {p.strategy}</div>
                    ))}
                  </div>
                </div>

                {/* AI Strategy */}
                <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <i className="fa-solid fa-brain text-violet-400"></i>
                    <span className="text-white font-medium">AI Strategy</span>
                  </div>
                  <div className="text-gray-300 text-sm">{aiStrategy.overall_strategy}</div>
                </div>

                {/* Top Opportunity */}
                <div className="bg-black/30 rounded-2xl p-4 border border-cyan-400/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <i className="fa-solid fa-rocket text-teal-400"></i>
                    <span className="text-white font-medium">Top Opportunity</span>
                  </div>
                  <div className="text-gray-300 text-sm">{aiStrategy.top_opportunity}</div>
                </div>

                {/* Quick Wins */}
                {aiStrategy.quick_wins && (
                  <div className="bg-black/30 rounded-2xl p-4 border border-green-400/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <i className="fa-solid fa-bolt text-green-400"></i>
                      <span className="text-white font-medium">Quick Wins</span>
                    </div>
                    <div className="text-gray-300 text-sm space-y-1">
                      {aiStrategy.quick_wins.map((w, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <i className="fa-solid fa-check text-green-400 mt-1 text-xs"></i>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!aiStrategyLoading && !aiStrategy && (
              <div className="text-center py-8">
                <p className="text-gray-400">Failed to generate strategy. Please try again.</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 p-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleApplyStrategy}
                disabled={aiStrategyLoading || !aiStrategy}
                className="flex-1 p-3 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-2xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interest Notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 bg-cyan-400/20 border border-cyan-400/30 rounded-2xl p-4 text-white z-50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-search text-cyan-400"></i>
            <span>Analyzing "{selectedInterest}" content performance...</span>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper Components
function PersonaCard({ name, percent, followers, icon, color, interests, topPost, onInterestClick, aiInsight }) {
  const colorClasses = {
    cyan: "from-cyan-400/20 to-violet-400/20 text-cyan-400 border-cyan-400/20",
    violet: "from-violet-400/20 to-teal-400/20 text-violet-400 border-violet-400/20",
    teal: "from-teal-400/20 to-cyan-400/20 text-teal-400 border-teal-400/20",
    yellow: "from-yellow-400/20 to-orange-400/20 text-yellow-400 border-yellow-400/20"
  };

  return (
    <div className={`persona-card bg-black/20 rounded-3xl p-6 border border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg`}>
      <div className="text-center mb-4">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <i className={`fa-solid ${icon} text-2xl`}></i>
        </div>
        <h4 className="text-white font-bold text-lg mb-1">{name}</h4>
        <div className={`text-2xl font-bold text-${color}-400 mb-2`}>{percent}</div>
        <div className="text-gray-400 text-sm">{followers} followers</div>
      </div>
      
      {aiInsight && (
        <div className={`bg-${color}-400/10 rounded-2xl p-3 mb-4 border border-${color}-400/20`}>
          <div className="flex items-center space-x-2 mb-1">
            <i className={`fa-solid fa-brain text-${color}-400 text-xs`}></i>
            <span className={`text-${color}-400 text-xs font-medium`}>AI Tip</span>
          </div>
          <div className="text-gray-300 text-xs">{aiInsight.engagement_tip}</div>
          {aiInsight.best_time && (
            <div className="text-gray-400 text-xs mt-1">
              <i className="fa-solid fa-clock mr-1"></i>{aiInsight.best_time}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="text-gray-300 text-sm font-medium">Key Interests:</div>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <button
              key={index}
              onClick={() => onInterestClick(interest)}
              className={`interest-tag px-3 py-1 rounded-xl text-xs text-${color}-400 bg-${color}-400/10 hover:bg-${color}-400/20 transition-all cursor-pointer`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-black/30 rounded-2xl p-3">
        <div className="text-gray-400 text-xs mb-1">Top Post Type</div>
        <div className="text-white font-medium text-sm">{aiInsight?.best_content || topPost}</div>
      </div>
    </div>
  );
}

function InsightItem({ icon, color, title, description }) {
  return (
    <div className="insight-item bg-black/20 rounded-2xl p-4 border border-gray-700/50 hover:bg-black/30 transition-all cursor-pointer">
      <div className="flex items-start space-x-3">
        <i className={`fa-solid ${icon} text-${color}-400 mt-1`}></i>
        <div>
          <div className="text-white font-medium mb-1">{title}</div>
          <div className="text-gray-400 text-sm">{description}</div>
        </div>
      </div>
    </div>
  );
}

function DemographicsCard({ title, icon, color, data }) {
  return (
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <h4 className="text-white font-semibold mb-4 flex items-center">
        <i className={`fa-solid ${icon} text-${color}-400 mr-2`}></i>
        {title}
      </h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-300">{item.label}</span>
            <span className={`text-${item.color}-400 font-medium`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTypeBar({ title, engagement, percentage, gradient, description }) {
  return (
    <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{title}</span>
        <span className="text-cyan-400 font-bold">{engagement}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all duration-1000`} style={{width: `${percentage}%`}}></div>
      </div>
      <div className="text-gray-400 text-sm mt-2">{description}</div>
    </div>
  );
}

function PostingTimeCard({ icon, persona, time, color, performance }) {
  return (
    <div className={`bg-black/20 rounded-2xl p-4 border border-${color}-400/20 hover:bg-black/30 transition-all`}>
      <div className="flex items-center space-x-3 mb-3">
        <i className={`fa-solid ${icon} text-${color}-400`}></i>
        <span className="text-white font-medium">{persona}</span>
      </div>
      <div className={`text-${color}-400 text-lg font-bold mb-1`}>{time}</div>
      <div className="text-gray-400 text-sm">Peak engagement: {performance}</div>
    </div>
  );
}