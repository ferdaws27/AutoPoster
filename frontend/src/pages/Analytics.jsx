// Analytics.jsx
import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket, faChartColumn, faFire, faBrain, faMagicWandSparkles,
  faCheck, faClock, faLightbulb, faTrophy, faDownload,
  faArrowUp, faArrowDown, faHeart, faEye, faUsers,
  faImage, faVideo, faAlignLeft, faPoll, faExternalLinkAlt, faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faMedium, faTwitter, faXTwitter } from "@fortawesome/free-brands-svg-icons";

export default function PostsLibrary() {
  const [activeTab, setActiveTab] = useState("drafts");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ platform: "", date: "", performance: "", sort: "newest" });
  const [activeRange, setActiveRange] = useState("30D");

  const ranges = ["7D", "30D", "90D"];

  useEffect(() => {
    // Engagement Line Chart
    Highcharts.chart("engagement-chart", {
      chart: { type: "line", backgroundColor: "transparent", height: 320 },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        categories: ["Dec 1","Dec 5","Dec 8","Dec 10","Dec 12","Dec 15","Dec 18"],
        lineColor: "rgba(255,255,255,0.1)",
        tickColor: "rgba(255,255,255,0.1)",
        labels: { style: { color: "#9CA3AF", fontSize: "12px" } }
      },
      yAxis: {
        title: { text: null },
        gridLineColor: "rgba(255,255,255,0.1)",
        labels: { style: { color: "#9CA3AF", fontSize: "12px" } }
      },
      legend: { enabled: false },
      plotOptions: { line: { marker: { radius: 6, symbol: "circle" }, lineWidth: 3 } },
      series: [
        { name: "Likes", data: [820,932,901,1134,1290,1330,1200], color:"#00C2FF", marker:{ fillColor:"#00C2FF", lineColor:"#00C2FF", lineWidth:2 } },
        { name: "Comments", data: [320,412,385,523,612,680,590], color:"#7B61FF", marker:{ fillColor:"#7B61FF", lineColor:"#7B61FF", lineWidth:2 } },
        { name: "Shares", data: [180,235,198,287,345,398,320], color:"#00E09D", marker:{ fillColor:"#00E09D", lineColor:"#00E09D", lineWidth:2 } }
      ]
    });

    // Platform Pie Chart
    Highcharts.chart("platform-chart", {
      chart: { type: "pie", backgroundColor:"transparent", height: 260 },
      title: { text: null },
      credits: { enabled: false },
      tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
      plotOptions: { pie: { allowPointSelect:true, cursor:"pointer", dataLabels:{enabled:false}, innerSize:"40%", borderWidth:0 } },
      series: [{ name:"Engagement", colorByPoint:true, data:[
        {name:"Twitter", y:42.3, color:"#1D9BF0"},
        {name:"LinkedIn", y:35.7, color:"#7B61FF"},
        {name:"Medium", y:22.0, color:"#00E09D"}
      ]}]
    });

    // Animate Cards
    const metricCards = document.querySelectorAll(".metric-card");
    metricCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "all 0.6s cubic-bezier(0.4,0,0.2,1)";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });

    const tableRows = document.querySelectorAll("tbody tr");
    tableRows.forEach((row, index) => {
      row.style.opacity = "0";
      row.style.transform = "translateX(-20px)";
      setTimeout(() => {
        row.style.transition = "all 0.4s ease-out";
        row.style.opacity = "1";
        row.style.transform = "translateX(0)";
      }, (index * 100) + 1000);
    });

  }, []);

  // Performance Insights Data
  const contentPerformance = [
    { icon: faImage, color: "bg-cyan-400", label: "Image Posts", value: 85 },
    { icon: faVideo, color: "bg-violet-400", label: "Video Content", value: 72 },
    { icon: faAlignLeft, color: "bg-teal-400", label: "Text Only", value: 58 },
    { icon: faPoll, color: "bg-orange-400", label: "Polls & Questions", value: 91 },
  ];

  const bestTimes = [
    { day: "Tuesday, 2:00 PM", desc: "Peak engagement time", value: "94%", color: "text-cyan-400" },
    { day: "Thursday, 9:00 AM", desc: "Professional content", value: "78%", color: "text-violet-400" },
    { day: "Sunday, 7:00 PM", desc: "Casual engagement", value: "65%", color: "text-teal-400" },
  ];

  const topPosts = [
    {
      rank: 1,
      title: "How AI is revolutionizing content creation",
      subtitle: "The future of automated posting...",
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/63f95caaec-47f7d4f9c4f55d6dc2ac.png",
      platforms: [faLinkedin, faXTwitter],
      engagement: "2,847",
      growth: "+342% vs avg",
      reach: "45.2K",
      date: "Dec 15",
    },
    {
      rank: 2,
      title: "5 lessons from building a SaaS startup",
      subtitle: "What I learned in my first year...",
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/2f3ddb66d9-6268a638bd4299c9dad3.png",
      platforms: [faMedium, faLinkedin],
      engagement: "1,924",
      growth: "+187% vs avg",
      reach: "32.1K",
      date: "Dec 12",
    },
    {
      rank: 3,
      title: "The ultimate guide to social media automation",
      subtitle: "Save 10+ hours per week with these tools...",
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/3808a2bf47-56d7a0f837f22ed8c61f.png",
      platforms: [faXTwitter],
      engagement: "1,673",
      growth: "+124% vs avg",
      reach: "28.7K",
      date: "Dec 10",
    },
    {
      rank: 4,
      title: "Building a personal brand as a tech founder",
      subtitle: "My journey from zero to 10k followers...",
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/81bc692b51-d0410671a53d52e72aa8.png",
      platforms: [faLinkedin, faMedium],
      engagement: "1,445",
      growth: "+98% vs avg",
      reach: "24.3K",
      date: "Dec 8",
    },
    {
      rank: 5,
      title: "10 productivity hacks for remote workers",
      subtitle: "Boost your efficiency while working from home...",
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/1b4d13dfcb-bab7c9dddbecc8979146.png",
      platforms: [faXTwitter, faLinkedin],
      engagement: "1,289",
      growth: "+76% vs avg",
      reach: "21.8K",
      date: "Dec 5",
    },
  ];

  return (
    <div id="main-content" className="p-8">

      {/* Header Section */}
      <div id="header-section" className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your content performance across all platforms</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Boutons/filtres si nécessaire */}
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-6">
        <div className="flex justify-between mb-8">
          <div className="flex items-center bg-black/30 rounded-2xl p-1">
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeRange === range
                    ? "bg-cyan-400/20 text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 glass-effect rounded-2xl text-white border border-gray-600 hover:border-cyan-400/50 transition-all">
            <FontAwesomeIcon icon={faDownload} />
            <span>Export Report</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div id="summary-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          {/* Total Engagement */}
          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faHeart} className="text-cyan-400 text-xl" />
              </div>
              <div className="flex items-center space-x-1 text-green-400 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                <span>12.5%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24,847</div>
              <div className="text-gray-400 text-sm">Total Engagement</div>
              <div className="text-xs text-gray-500 mt-1">vs last 30 days</div>
            </div>
          </div>

          {/* Follower Growth */}
          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-violet-400 text-xl" />
              </div>
              <div className="flex items-center space-x-1 text-green-400 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                <span>8.3%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">+1,247</div>
              <div className="text-gray-400 text-sm">Follower Growth</div>
              <div className="text-xs text-gray-500 mt-1">new followers</div>
            </div>
          </div>

          {/* Average Reach */}
          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faEye} className="text-teal-400 text-xl" />
              </div>
              <div className="flex items-center space-x-1 text-red-400 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                <span>2.1%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">18.6K</div>
              <div className="text-gray-400 text-sm">Average Reach</div>
              <div className="text-xs text-gray-500 mt-1">per post</div>
            </div>
          </div>

          {/* Posting Frequency */}
          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-orange-400 text-xl" />
              </div>
              <div className="flex items-center space-x-1 text-green-400 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                <span>5.2%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">4.2</div>
              <div className="text-gray-400 text-sm">Posts per Day</div>
              <div className="text-xs text-gray-500 mt-1">consistency score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement & Platform Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Engagement Chart */}
        <div id="engagement-chart-section" className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Engagement Over Time</h2>
              <p className="text-gray-400 text-sm">Track your content performance trends</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-cyan-400 rounded-full glow-point" />
                <span className="text-gray-300">Likes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-violet-400 rounded-full glow-point" />
                <span className="text-gray-300">Comments</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-teal-400 rounded-full glow-point" />
                <span className="text-gray-300">Shares</span>
              </div>
            </div>
          </div>
          <div id="engagement-chart" className="h-80"></div>
        </div>

        {/* Platform Chart */}
        <div id="platform-chart-section" className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">Platform Contribution</h2>
            <p className="text-gray-400 text-sm">Engagement breakdown by platform</p>
          </div>
          <div id="platform-chart" className="h-64"></div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <span className="text-gray-300 text-sm">Twitter</span>
              </div>
              <span className="text-white font-medium">42.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-violet-400 rounded-full" />
                <span className="text-gray-300 text-sm">LinkedIn</span>
              </div>
              <span className="text-white font-medium">35.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-teal-400 rounded-full" />
                <span className="text-gray-300 text-sm">Medium</span>
              </div>
              <span className="text-white font-medium">22.0%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Performance Insights Section */}
      <div id="insights-section" className="grid grid-cols-2 gap-8 mb-8 animate-slide-up" style={{ animationDelay: "0.6s" }}>

        {/* Best Performing Times */}
        <div className="glass-effect rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Best Performing Times</h3>
          <div className="space-y-4">
            {bestTimes.map((time, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
                <div>
                  <div className="text-white font-medium">{time.day}</div>
                  <div className="text-gray-400 text-sm">{time.desc}</div>
                </div>
                <div className={`${time.color} font-bold`}>{time.value} above avg</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Type Performance */}
        <div className="glass-effect rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Content Type Performance</h3>
          <div className="space-y-4">
            {contentPerformance.map((content, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={content.icon} className={`${content.color}`} />
                  <span className="text-gray-300">{content.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-2 bg-black/30 rounded-full overflow-hidden">
                    <div className={`h-full ${content.color} rounded-full`} style={{ width: `${content.value}%` }} />
                  </div>
                  <span className="text-white font-medium text-sm">{content.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Performing Posts Table */}
      <div id="top-posts-section" className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.8s" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Top Performing Posts</h2>
            <p className="text-gray-400 text-sm">Your highest engagement content this month</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-2xl text-gray-300 hover:text-white text-sm transition-colors">
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            <span>View All Posts</span>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-700/50">
          <table className="data-table w-full">
            <thead>
              <tr className="bg-black/30">
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Rank</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Post Title</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Platform</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Engagement</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Reach</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.map((post) => (
                <tr key={post.rank} className="hover:bg-black/20 transition-colors">
                  <td className="p-4">
                    <div className={`w-8 h-8 ${post.rank === 1 ? "rank-badge" : "bg-gray-600"} rounded-full flex items-center justify-center text-black font-bold text-sm ${post.rank !== 1 ? "text-white" : ""}`}>
                      {post.rank}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img className="w-10 h-10 rounded-xl object-cover" src={post.img} alt={post.title} />
                      <div>
                        <div className="text-white font-medium text-sm">{post.title}</div>
                        <div className="text-gray-400 text-xs">{post.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {post.platforms.map((icon, idx) => (
                        <FontAwesomeIcon key={idx} icon={icon} className="px-2 py-1 rounded-lg text-xs" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-semibold">{post.engagement}</div>
                    <div className="text-green-400 text-xs">{post.growth}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-semibold">{post.reach}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300 text-sm">{post.date}</div>
                  </td>
                  <td className="p-4">
                    <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Section */}
      <div
        id="ai-insights-section"
        className="glass-effect rounded-3xl p-6 mt-8 animate-slide-up"
        style={{ animationDelay: "1s" }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Insights & Recommendations</h2>
            <p className="text-gray-400 text-sm">Personalized suggestions to improve your content performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 rounded-2xl p-4 border border-cyan-400/20">
            <div className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon icon={faLightbulb} className="text-cyan-400" />
              <span className="text-cyan-400 font-medium text-sm">Content Suggestion</span>
            </div>
            <p className="text-white text-sm mb-2">
              Your audience engages 94% more with posts about AI and automation.
            </p>
            <p className="text-gray-400 text-xs">
              Consider creating more content around these topics for better reach.
            </p>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 border border-violet-400/20">
            <div className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon icon={faClock} className="text-violet-400" />
              <span className="text-violet-400 font-medium text-sm">Timing Optimization</span>
            </div>
            <p className="text-white text-sm mb-2">
              Post 2 hours earlier on weekdays for 35% better engagement.
            </p>
            <p className="text-gray-400 text-xs">
              Your audience is most active between 12-2 PM EST.
            </p>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 border border-teal-400/20">
            <div className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon icon={faChartLine} className="text-teal-400" />
              <span className="text-teal-400 font-medium text-sm">Growth Opportunity</span>
            </div>
            <p className="text-white text-sm mb-2">
              Medium posts get 3x more long-form engagement.
            </p>
            <p className="text-gray-400 text-xs">
              Expand your Twitter threads into Medium articles for better reach.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
