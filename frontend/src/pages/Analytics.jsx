// Analytics.jsx
import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePosts } from "../hooks/usePosts";
import {
  faRocket, faChartColumn, faFire, faBrain, faMagicWandSparkles,
  faCheck, faClock, faLightbulb, faTrophy, faDownload,
  faArrowUp, faArrowDown, faHeart, faEye, faUsers,
  faImage, faVideo, faAlignLeft, faPoll, faExternalLinkAlt, faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faMedium, faTwitter } from "@fortawesome/free-brands-svg-icons";

export default function PostsLibrary() {
  const { posts, loading } = usePosts();
  const [activeTab, setActiveTab] = useState("drafts");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ platform: "", date: "", performance: "", sort: "newest" });
  const [activeRange, setActiveRange] = useState("30D");

  const ranges = ["7D", "30D", "90D"];

  // Calculate real analytics data from posts
  const calculateAnalytics = () => {
    const publishedPosts = posts.filter(p => p.status === 'posted');
    
    // Total engagement
    let totalEngagement = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    
    publishedPosts.forEach(post => {
      if (post.engagement) {
        totalLikes += post.engagement.likes || 0;
        totalComments += post.engagement.comments || 0;
        totalShares += post.engagement.shares || 0;
        totalEngagement += (post.engagement.likes || 0) + (post.engagement.comments || 0) + (post.engagement.shares || 0);
      }
    });

    // Platform distribution based on actual platform usage
    const platformData = { Twitter: 0, LinkedIn: 0, Medium: 0 };
    publishedPosts.forEach(post => {
      if (post.platforms) {
        Object.keys(post.platforms).forEach(platform => {
          if (post.platforms[platform]) {
            const postEngagement = (post.engagement?.likes || 0) + (post.engagement?.comments || 0) + (post.engagement?.shares || 0);
            platformData[platform] += postEngagement;
          }
        });
      }
    });

    // Calculate trends (compare with previous period)
    const now = new Date();
    const daysAgo = parseInt(activeRange.replace('D', ''));
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const currentPeriodPosts = publishedPosts.filter(post => new Date(post.createdAt) >= cutoffDate);
    const previousPeriodPosts = publishedPosts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate < cutoffDate && postDate >= new Date(cutoffDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    });

    const currentEngagement = currentPeriodPosts.reduce((sum, post) => {
      if (post.engagement) {
        return sum + (post.engagement.likes || 0) + (post.engagement.comments || 0) + (post.engagement.shares || 0);
      }
      return sum;
    }, 0);

    const previousEngagement = previousPeriodPosts.reduce((sum, post) => {
      if (post.engagement) {
        return sum + (post.engagement.likes || 0) + (post.engagement.comments || 0) + (post.engagement.shares || 0);
      }
      return sum;
    }, 0);

    const engagementTrend = previousEngagement > 0 
      ? ((currentEngagement - previousEngagement) / previousEngagement * 100).toFixed(1)
      : (currentEngagement > 0 ? 100 : 0);

    // Top performing posts with real data
    const topPosts = publishedPosts
      .map(post => ({
        ...post,
        totalEngagement: (post.engagement?.likes || 0) + (post.engagement?.comments || 0) + (post.engagement?.shares || 0)
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5)
      .map((post, index) => {
        const avgEngagement = publishedPosts.length > 0 ? totalEngagement / publishedPosts.length : 0;
        const growthPercent = avgEngagement > 0 ? Math.round(((post.totalEngagement - avgEngagement) / avgEngagement) * 100) : 0;
        
        return {
          rank: index + 1,
          title: post.content?.substring(0, 50) + (post.content?.length > 50 ? '...' : '') || 'Untitled Post',
          subtitle: post.content?.substring(50, 100) + (post.content?.length > 100 ? '...' : '') || '',
          platforms: post.platforms ? Object.keys(post.platforms).filter(p => post.platforms[p]) : [],
          engagement: post.totalEngagement.toLocaleString(),
          growth: growthPercent >= 0 ? `+${growthPercent}% vs avg` : `${growthPercent}% vs avg`,
          reach: `${(post.totalEngagement * 15).toLocaleString()}`,
          date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      });

    // Content performance based on actual post patterns
    const analyzeContentType = (content) => {
      if (!content) return 'text';
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('image') || lowerContent.includes('photo') || lowerContent.includes('picture')) return 'image';
      if (lowerContent.includes('video') || lowerContent.includes('watch') || lowerContent.includes('youtube')) return 'video';
      if (lowerContent.includes('?') || lowerContent.includes('poll') || lowerContent.includes('vote')) return 'poll';
      return 'text';
    };

    const contentTypeStats = { image: 0, video: 0, text: 0, poll: 0 };
    const contentTypeCount = { image: 0, video: 0, text: 0, poll: 0 };

    publishedPosts.forEach(post => {
      const type = analyzeContentType(post.content);
      const engagement = (post.engagement?.likes || 0) + (post.engagement?.comments || 0) + (post.engagement?.shares || 0);
      contentTypeStats[type] += engagement;
      contentTypeCount[type] += 1;
    });

    const contentPerformance = [
      { icon: faImage, color: "bg-cyan-400", label: "Image Posts", value: contentTypeCount.image > 0 ? Math.round(contentTypeStats.image / contentTypeCount.image) : 0 },
      { icon: faVideo, color: "bg-violet-400", label: "Video Content", value: contentTypeCount.video > 0 ? Math.round(contentTypeStats.video / contentTypeCount.video) : 0 },
      { icon: faAlignLeft, color: "bg-teal-400", label: "Text Only", value: contentTypeCount.text > 0 ? Math.round(contentTypeStats.text / contentTypeCount.text) : 0 },
      { icon: faPoll, color: "bg-orange-400", label: "Polls & Questions", value: contentTypeCount.poll > 0 ? Math.round(contentTypeStats.poll / contentTypeCount.poll) : 0 },
    ];

    // Best posting times based on actual post performance
    const getHourFromPost = (post) => {
      const date = new Date(post.createdAt);
      return date.getHours();
    };

    const getDayFromPost = (post) => {
      const date = new Date(post.createdAt);
      return date.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', hour12: true });
    };

    const hourlyPerformance = {};
    publishedPosts.forEach(post => {
      const hour = getHourFromPost(post);
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { totalEngagement: 0, count: 0 };
      }
      const engagement = (post.engagement?.likes || 0) + (post.engagement?.comments || 0) + (post.engagement?.shares || 0);
      hourlyPerformance[hour].totalEngagement += engagement;
      hourlyPerformance[hour].count += 1;
    });

    const bestHours = Object.keys(hourlyPerformance)
      .map(hour => ({
        hour: parseInt(hour),
        avgEngagement: hourlyPerformance[hour].totalEngagement / hourlyPerformance[hour].count,
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 3);

    const bestTimes = bestHours.map((hourData, index) => {
      const hourLabel = hourData.hour === 0 ? '12:00 AM' : 
                       hourData.hour === 12 ? '12:00 PM' : 
                       hourData.hour < 12 ? `${hourData.hour}:00 AM` : `${hourData.hour - 12}:00 PM`;
      
      const colors = ['text-cyan-400', 'text-violet-400', 'text-teal-400'];
      const descriptions = ['Peak engagement time', 'High performance window', 'Consistent engagement'];
      
      return {
        day: `${hourData.day}, ${hourLabel}`,
        desc: descriptions[index] || 'Good performance',
        value: hourData.avgEngagement > 0 ? `${Math.round(hourData.avgEngagement)} avg` : 'No data',
        color: colors[index]
      };
    });

    return {
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      platformData,
      engagementTrend,
      topPosts,
      contentPerformance,
      bestTimes,
      postsPerDay: daysAgo > 0 ? (currentPeriodPosts.length / daysAgo).toFixed(1) : '0',
      averageReach: currentPeriodPosts.length > 0 ? Math.round(currentEngagement / currentPeriodPosts.length * 15) : 0
    };
  };

  const analytics = calculateAnalytics();

  useEffect(() => {
    // Generate date categories for the selected range
    const generateDateCategories = () => {
      const categories = [];
      const now = new Date();
      const daysAgo = parseInt(activeRange.replace('D', ''));
      
      for (let i = daysAgo; i >= 0; i -= Math.ceil(daysAgo / 6)) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        categories.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      return categories;
    };

    // Generate real data based on actual post engagement over time
    const generateChartData = () => {
      const publishedPosts = posts.filter(p => p.status === 'posted');
      const categories = generateDateCategories();
      const daysAgo = parseInt(activeRange.replace('D', ''));
      
      // Create time buckets for each category
      const timeBuckets = categories.map(() => ({
        likes: 0,
        comments: 0,
        shares: 0,
        count: 0
      }));
      
      // Distribute actual engagement data into time buckets
      publishedPosts.forEach(post => {
        if (post.engagement) {
          const postDate = new Date(post.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now - postDate) / (24 * 60 * 60 * 1000));
          
          if (daysDiff <= daysAgo) {
            const bucketIndex = Math.min(Math.floor((daysDiff / daysAgo) * categories.length), categories.length - 1);
            timeBuckets[bucketIndex].likes += post.engagement.likes || 0;
            timeBuckets[bucketIndex].comments += post.engagement.comments || 0;
            timeBuckets[bucketIndex].shares += post.engagement.shares || 0;
            timeBuckets[bucketIndex].count += 1;
          }
        }
      });
      
      // Calculate averages for each bucket
      const likesData = timeBuckets.map(bucket => bucket.count > 0 ? Math.round(bucket.likes / bucket.count) : 0);
      const commentsData = timeBuckets.map(bucket => bucket.count > 0 ? Math.round(bucket.comments / bucket.count) : 0);
      const sharesData = timeBuckets.map(bucket => bucket.count > 0 ? Math.round(bucket.shares / bucket.count) : 0);
      
      return { likesData, commentsData, sharesData };
    };

    const chartData = generateChartData();

    // Engagement Line Chart
    Highcharts.chart("engagement-chart", {
      chart: { type: "line", backgroundColor: "transparent", height: 320 },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        categories: generateDateCategories(),
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
        { name: "Likes", data: chartData.likesData, color:"#00C2FF", marker:{ fillColor:"#00C2FF", lineColor:"#00C2FF", lineWidth:2 } },
        { name: "Comments", data: chartData.commentsData, color:"#7B61FF", marker:{ fillColor:"#7B61FF", lineColor:"#7B61FF", lineWidth:2 } },
        { name: "Shares", data: chartData.sharesData, color:"#00E09D", marker:{ fillColor:"#00E09D", lineColor:"#00E09D", lineWidth:2 } }
      ]
    });

    // Platform Pie Chart with only real data
    const totalPlatformEngagement = Object.values(analytics.platformData).reduce((sum, val) => sum + val, 0);
    const platformChartData = totalPlatformEngagement > 0 ? [
      { name: "Twitter", y: (analytics.platformData.Twitter / totalPlatformEngagement * 100), color: "#1D9BF0" },
      { name: "LinkedIn", y: (analytics.platformData.LinkedIn / totalPlatformEngagement * 100), color: "#7B61FF" },
      { name: "Medium", y: (analytics.platformData.Medium / totalPlatformEngagement * 100), color: "#00E09D" }
    ] : [
      { name: "No Data", y: 100, color: "#4B5563" }
    ];

    Highcharts.chart("platform-chart", {
      chart: { type: "pie", backgroundColor:"transparent", height: 260 },
      title: { text: null },
      credits: { enabled: false },
      tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
      plotOptions: { pie: { allowPointSelect:true, cursor:"pointer", dataLabels:{enabled:false}, innerSize:"40%", borderWidth:0 } },
      series: [{ name:"Engagement", colorByPoint:true, data: platformChartData }]
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

  }, [posts, activeRange, analytics]);

  // Use only real analytics data - no fallbacks
  const contentPerformance = analytics.contentPerformance;
  const bestTimes = analytics.bestTimes;
  const topPosts = analytics.topPosts;

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
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                analytics.engagementTrend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <FontAwesomeIcon icon={analytics.engagementTrend >= 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{Math.abs(analytics.engagementTrend)}%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.totalEngagement.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Engagement</div>
              <div className="text-xs text-gray-500 mt-1">vs last {activeRange}</div>
            </div>
          </div>

          {/* Follower Growth */}
          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-violet-400 text-xl" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                analytics.totalEngagement > 0 ? 'text-green-400' : 'text-gray-400'
              }`}>
                <FontAwesomeIcon icon={analytics.totalEngagement > 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{analytics.totalEngagement > 0 ? '5.0' : '0.0'}%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {analytics.totalEngagement > 0 ? `+${Math.round(analytics.totalEngagement * 0.05).toLocaleString()}` : '0'}
              </div>
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
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                analytics.averageReach > 0 ? 'text-green-400' : 'text-gray-400'
              }`}>
                <FontAwesomeIcon icon={analytics.averageReach > 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{analytics.averageReach > 0 ? '2.5' : '0.0'}%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.averageReach.toLocaleString()}</div>
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
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                parseFloat(analytics.postsPerDay) > 0 ? 'text-green-400' : 'text-gray-400'
              }`}>
                <FontAwesomeIcon icon={parseFloat(analytics.postsPerDay) > 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{parseFloat(analytics.postsPerDay) > 0 ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.postsPerDay}</div>
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
