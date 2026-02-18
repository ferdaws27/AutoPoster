import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

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
              <div className="text-gray-400 text-sm">2 minutes ago</div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
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
                <select className="bg-black/30 border border-gray-600 rounded-2xl px-4 py-2 text-white pr-8 focus:border-cyan-400 focus:outline-none">
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
                <select className="bg-black/30 border border-gray-600 rounded-2xl px-4 py-2 text-white pr-8 focus:border-cyan-400 focus:outline-none">
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
              <button className="time-filter active px-4 py-2 rounded-xl text-sm font-medium transition-all" data-range="24h">
                Last 24h
              </button>
              <button className="time-filter px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all" data-range="7d">
                Last 7 days
              </button>
              <button className="time-filter px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all" data-range="30d">
                Last 30 days
              </button>
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
            </h2>

      <div className="space-y-4">
        {/* Map over your topics */}
        {[
          {
            title: "UX Pilot AI DevDay 2024 Announcements",
            desc: "Major updates to GPT-4 and new API features driving massive engagement across platforms",
            twitter: "12.5K", linkedin: "8.3K", medium: "2.1K",
            score: 98,
            popularity: "Extremely Hot 🔥",
            heat: "98%"
          },
          {
            title: "Remote Work Productivity Hacks",
            desc: "Latest strategies and tools for maximizing productivity while working from home",
            twitter: "9.2K", linkedin: "15.7K", medium: "3.4K",
            score: 85,
            popularity: "Very Hot 🔥",
            heat: "85%"
          },
          {
            title: "Sustainable Business Practices",
            desc: "Companies adopting eco-friendly practices and the impact on their bottom line",
            twitter: "6.8K", linkedin: "11.2K", medium: "2.9K",
            score: 76,
            popularity: "Hot 🔥",
            heat: "76%"
          },
          {
            title: "Personal Branding for Entrepreneurs",
            desc: "Building authentic personal brands in the digital age and leveraging social media",
            twitter: "5.4K", linkedin: "9.7K", medium: "1.8K",
            score: 64,
            popularity: "Trending ↗️",
            heat: "64%"
          },
          {
            title: "Web3 and Blockchain Innovation",
            desc: "Latest developments in decentralized technologies and their business applications",
            twitter: "4.1K", linkedin: "6.3K", medium: "2.2K",
            score: 58,
            popularity: "Rising ↗️",
            heat: "58%"
          },
        ].map((topic, idx) => (
          <div key={idx} className="trend-card bg-black/20 rounded-2xl p-6 hover:bg-black/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{topic.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{topic.desc}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <i className="fa-brands fa-x-twitter text-blue-400"></i>
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
            <button className="w-full p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity">
              <i className="fa-solid fa-lightbulb mr-2"></i>
              Generate Post Idea
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Right Column: Hashtags + Power Keywords + Platform Insights */}
  <div className="space-y-6">
    {/* Trending Hashtags */}
    <div className="glass-effect rounded-3xl p-6 slide-up">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <i className="fa-solid fa-hashtag text-cyan-400 mr-3"></i>
        Trending Hashtags
      </h2>
      <div className="flex flex-wrap gap-2">
        {[
          "#UX Pilot AIDevDay", "#AI", "#MachineLearning", "#RemoteWork", "#Productivity",
          "#Sustainability", "#GreenBusiness", "#PersonalBranding", "#Entrepreneurship",
          "#Web3", "#Blockchain", "#Innovation", "#TechTrends", "#DigitalTransformation", "#Leadership"
        ].map((tag, idx) => (
          <span key={idx} className="hashtag-badge px-3 py-2 rounded-xl text-sm font-medium cursor-pointer">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Power Keywords */}
    <div className="glass-effect rounded-3xl p-6 slide-up">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <i className="fa-solid fa-key text-violet-400 mr-3"></i>
        Power Keywords
      </h2>
      <div className="space-y-3">
        {[
          { word: "breakthrough", color: "green", label: "High Impact" },
          { word: "game-changing", color: "green", label: "High Impact" },
          { word: "revolutionary", color: "yellow", label: "Medium Impact" },
          { word: "innovative", color: "yellow", label: "Medium Impact" },
          { word: "transformative", color: "cyan", label: "Rising" },
        ].map((kw, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-2xl border border-gray-700/50">
            <span className="text-white font-medium">{kw.word}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: `var(--tw-color-${kw.color}-400)` }}></div>
              <span className={`text-${kw.color}-400 text-sm`}>{kw.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Platform Insights */}
    <div className="glass-effect rounded-3xl p-6 slide-up">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <i className="fa-solid fa-chart-simple text-teal-400 mr-3"></i>
        Platform Insights
      </h2>
      {[
        { platform: "Twitter", icon: "fa-x-twitter", color: "blue", engagement: "+23%", times: "9AM, 1PM, 5PM EST" },
        { platform: "LinkedIn", icon: "fa-linkedin", color: "violet", engagement: "+18%", times: "8AM, 12PM, 6PM EST" },
        { platform: "Medium", icon: "fa-medium", color: "teal", engagement: "+15%", times: "7AM, 2PM, 8PM EST" },
      ].map((p, idx) => (
        <div key={idx} className="p-4 bg-black/20 rounded-2xl border border-gray-700/50 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <i className={`fa-brands ${p.icon} text-${p.color}-400`}></i>
              <span className="text-white font-medium">{p.platform}</span>
            </div>
            <span className={`text-${p.color}-400 text-sm`}>{p.engagement} engagement</span>
          </div>
          <p className="text-gray-400 text-sm">Best times: {p.times}</p>
        </div>
      ))}
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