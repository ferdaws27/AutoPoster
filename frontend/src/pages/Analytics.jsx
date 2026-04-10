// Analytics.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// ✅ Map platform name → icône FontAwesome
const PLATFORM_ICONS = {
  Twitter: faTwitter,
  LinkedIn: faLinkedin,
  Medium: faMedium,
};

export default function PostsLibrary() {
  const navigate = useNavigate();
  const { fetchAnalyticsData } = usePosts();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drafts");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ platform: "", date: "", performance: "", sort: "newest" });
  const [activeRange, setActiveRange] = useState("30D");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  const ranges = ["7D", "30D", "90D"];

  const generateExportReport = () => {
    const now = new Date();
    const daysAgo = parseInt(activeRange.replace('D', ''));
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const currentAnalytics = calculateAnalytics();

    const reportData = {
      generatedAt: now.toLocaleString(),
      period: `Last ${activeRange}`,
      summary: {
        totalEngagement: currentAnalytics.totalEngagement,
        totalLikes: currentAnalytics.totalLikes,
        totalComments: currentAnalytics.totalComments,
        totalShares: currentAnalytics.totalShares,
        estimatedReach: currentAnalytics.estimatedReach,
        postsCount: analyticsData.filter(p => new Date(p.createdAt) >= cutoffDate).length,
        engagementRate: parseFloat(currentAnalytics.engagementPerPost),
        engagementTrend: currentAnalytics.engagementTrend
      },
      platformBreakdown: {
        Twitter: currentAnalytics.platformPercentages.Twitter,
        LinkedIn: currentAnalytics.platformPercentages.LinkedIn,
        Medium: currentAnalytics.platformPercentages.Medium
      },
      topPosts: currentAnalytics.topPosts.map(p => ({
        rank: p.rank,
        title: p.title,
        engagement: p.engagement,
        reach: p.reach,
        date: p.date
      })),
      contentType: currentAnalytics.contentPerformance.map(c => ({
        type: c.label,
        performance: c.value,
        posts: c.posts,
        avgEngagement: c.avgEngagement
      }))
    };

    if (exportFormat === "json") {
      downloadJSON(reportData);
    } else {
      downloadCSV(reportData);
    }
  };

  const downloadJSON = (data) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadCSV = (data) => {
    let csv = "Analytics Report\n";
    csv += `Generated: ${data.generatedAt}\n`;
    csv += `Period: ${data.period}\n\n`;
    csv += "SUMMARY\n";
    csv += `Total Engagement,${data.summary.totalEngagement}\n`;
    csv += `Total Likes,${data.summary.totalLikes}\n`;
    csv += `Total Comments,${data.summary.totalComments}\n`;
    csv += `Total Shares,${data.summary.totalShares}\n`;
    csv += `Estimated Reach,${data.summary.estimatedReach}\n`;
    csv += `Posts Count,${data.summary.postsCount}\n`;
    csv += `Engagement Rate,${data.summary.engagementRate}\n`;
    csv += `Engagement Trend,${data.summary.engagementTrend}%\n\n`;
    csv += "PLATFORM BREAKDOWN\n";
    csv += "Platform,Percentage\n";
    csv += `Twitter,${data.platformBreakdown.Twitter}%\n`;
    csv += `LinkedIn,${data.platformBreakdown.LinkedIn}%\n`;
    csv += `Medium,${data.platformBreakdown.Medium}%\n\n`;
    csv += "TOP POSTS\n";
    csv += "Rank,Title,Engagement,Reach,Date\n";
    data.topPosts.forEach(p => {
      csv += `${p.rank},"${p.title}",${p.engagement},${p.reach},${p.date}\n`;
    });
    csv += "\nCONTENT TYPE PERFORMANCE\n";
    csv += "Type,Performance,Posts,Avg Engagement\n";
    data.contentType.forEach(c => {
      csv += `${c.type},${c.performance}%,${c.posts},${c.avgEngagement}\n`;
    });
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleViewAllPosts = () => {
    navigate('/posts-library');
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalyticsData();
        setAnalyticsData(data || []);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setAnalyticsData([]);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [fetchAnalyticsData]);

  const calculateAnalytics = () => {
    const now = new Date();
    const daysAgo = parseInt(activeRange.replace('D', ''));
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const previousCutoffDate = new Date(cutoffDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const postsInRange = analyticsData.filter(post => {
      const postDate = new Date(post.createdAt);
      return !isNaN(postDate) && postDate >= cutoffDate;
    });

    const postsInPreviousRange = analyticsData.filter(post => {
      const postDate = new Date(post.createdAt);
      return !isNaN(postDate) && postDate >= previousCutoffDate && postDate < cutoffDate;
    });

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalEngagement = 0;

    postsInRange.forEach(post => {
      if (post.engagement) {
        totalLikes += post.engagement.likes || 0;
        totalComments += post.engagement.comments || 0;
        totalShares += post.engagement.shares || 0;
        totalEngagement += post.totalEngagement || 0;
      }
    });

    let previousEngagement = 0;
    postsInPreviousRange.forEach(post => {
      if (post.engagement) {
        previousEngagement += post.totalEngagement || 0;
      }
    });

    // ✅ BUG FIX : stocker comme number, pas string
    const engagementTrend = previousEngagement > 0
      ? parseFloat(((totalEngagement - previousEngagement) / previousEngagement * 100).toFixed(1))
      : (totalEngagement > 0 ? 100 : 0);

    const engagementPerPost = postsInRange.length > 0
      ? (totalEngagement / postsInRange.length).toFixed(1)
      : 0;

    const followerGrowthPercent = previousEngagement > 0
      ? parseFloat(((totalEngagement - previousEngagement) / previousEngagement * 100).toFixed(1))
      : 0;

    const prevAvgLikes = postsInPreviousRange.length > 0
      ? postsInPreviousRange.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0) / postsInPreviousRange.length
      : 0;
    const currAvgLikes = postsInRange.length > 0 ? totalLikes / postsInRange.length : 0;

    const reachGrowthPercent = prevAvgLikes > 0
      ? parseFloat(((currAvgLikes - prevAvgLikes) / prevAvgLikes * 100).toFixed(1))
      : 0;

    const estimatedReach = totalEngagement * 15;

    // ✅ BUG FIX : platforms est un objet { Twitter: true/false }, pas un tableau d'icônes
    const topPosts = [...analyticsData]
      .sort((a, b) => (b.totalEngagement || 0) - (a.totalEngagement || 0))
      .slice(0, 5)
      .map((post, index) => {
        const avgEngagement = analyticsData.length > 0
          ? analyticsData.reduce((sum, p) => sum + (p.totalEngagement || 0), 0) / analyticsData.length
          : 0;
        const growthPercent = avgEngagement > 0
          ? Math.round(((post.totalEngagement - avgEngagement) / avgEngagement) * 100)
          : 0;

        // ✅ Convertir les noms de plateformes actives en icônes FontAwesome
        const platformIcons = post.platforms
          ? Object.keys(post.platforms)
              .filter(p => post.platforms[p] && PLATFORM_ICONS[p])
              .map(p => PLATFORM_ICONS[p])
          : [];

        const postDate = new Date(post.createdAt);

        return {
          rank: index + 1,
          title: post.content?.substring(0, 50) + (post.content?.length > 50 ? '...' : '') || 'Untitled Post',
          subtitle: post.content?.substring(50, 100) + (post.content?.length > 100 ? '...' : '') || '',
          platforms: platformIcons,
          engagement: (post.totalEngagement || 0).toLocaleString(),
          growth: growthPercent >= 0 ? `+${growthPercent}% vs avg` : `${growthPercent}% vs avg`,
          reach: ((post.totalEngagement || 0) * 15).toLocaleString(),
          // ✅ BUG FIX : date invalide → fallback "—"
          date: !isNaN(postDate)
            ? postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—'
        };
      });

    const platformEngagement = { Twitter: 0, LinkedIn: 0, Medium: 0 };
    const platformPostCount = { Twitter: 0, LinkedIn: 0, Medium: 0 };

    postsInRange.forEach(post => {
      if (post.platforms) {
        Object.keys(post.platforms).forEach(platform => {
          if (post.platforms[platform] && platformEngagement.hasOwnProperty(platform)) {
            platformEngagement[platform] += post.totalEngagement || 0;
            platformPostCount[platform] += 1;
          }
        });
      }
    });

    const platformAvgEngagement = {
      Twitter: platformPostCount.Twitter > 0 ? platformEngagement.Twitter / platformPostCount.Twitter : 0,
      LinkedIn: platformPostCount.LinkedIn > 0 ? platformEngagement.LinkedIn / platformPostCount.LinkedIn : 0,
      Medium: platformPostCount.Medium > 0 ? platformEngagement.Medium / platformPostCount.Medium : 0
    };

    const totalAvgEngagement = Object.values(platformAvgEngagement).reduce((sum, val) => sum + val, 0);

    const platformPercentages = {
      Twitter: totalAvgEngagement > 0 ? parseFloat((platformAvgEngagement.Twitter / totalAvgEngagement * 100).toFixed(1)) : 0,
      LinkedIn: totalAvgEngagement > 0 ? parseFloat((platformAvgEngagement.LinkedIn / totalAvgEngagement * 100).toFixed(1)) : 0,
      Medium: totalAvgEngagement > 0 ? parseFloat((platformAvgEngagement.Medium / totalAvgEngagement * 100).toFixed(1)) : 0
    };

    const hourlyPerformance = {};
    postsInRange.forEach(post => {
      const date = new Date(post.createdAt);
      if (isNaN(date)) return; // ✅ ignorer dates invalides
      const hour = date.getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { totalEngagement: 0, count: 0 };
      }
      hourlyPerformance[hour].totalEngagement += post.totalEngagement || 0;
      hourlyPerformance[hour].count += 1;
    });

    const bestHours = Object.keys(hourlyPerformance)
      .map(hour => ({
        hour: parseInt(hour),
        avgEngagement: hourlyPerformance[hour].totalEngagement / hourlyPerformance[hour].count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 3);

    const bestTimes = bestHours.map((hourData, index) => {
      const hourLabel = hourData.hour === 0 ? '12:00 AM'
        : hourData.hour === 12 ? '12:00 PM'
        : hourData.hour < 12 ? `${hourData.hour}:00 AM`
        : `${hourData.hour - 12}:00 PM`;
      const colors = ['text-cyan-400', 'text-violet-400', 'text-teal-400'];
      const descriptions = ['Peak engagement time', 'High performance window', 'Consistent engagement'];
      const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      return {
        day: `${day}, ${hourLabel}`,
        desc: descriptions[index] || 'Good performance',
        value: hourData.avgEngagement > 0 ? `${Math.round(hourData.avgEngagement)} avg` : 'No data',
        color: colors[index]
      };
    });

    const contentTypeStats = { image: 0, video: 0, text: 0, poll: 0 };
    const contentTypeCount = { image: 0, video: 0, text: 0, poll: 0 };

    const analyzeContentType = (content) => {
      if (!content) return 'text';
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('image') || lowerContent.includes('photo') || lowerContent.includes('picture')) return 'image';
      if (lowerContent.includes('video') || lowerContent.includes('watch') || lowerContent.includes('youtube')) return 'video';
      if (lowerContent.includes('?') || lowerContent.includes('poll') || lowerContent.includes('vote')) return 'poll';
      return 'text';
    };

    postsInRange.forEach(post => {
      const type = analyzeContentType(post.content);
      contentTypeStats[type] += post.totalEngagement || 0;
      contentTypeCount[type] += 1;
    });

    const contentTypeAvg = {
      image: contentTypeCount.image > 0 ? contentTypeStats.image / contentTypeCount.image : 0,
      video: contentTypeCount.video > 0 ? contentTypeStats.video / contentTypeCount.video : 0,
      text: contentTypeCount.text > 0 ? contentTypeStats.text / contentTypeCount.text : 0,
      poll: contentTypeCount.poll > 0 ? contentTypeStats.poll / contentTypeCount.poll : 0
    };

    const maxContentAvg = Math.max(...Object.values(contentTypeAvg));

    const contentPerformance = [
      { icon: faImage, color: "bg-cyan-400", label: "Image Posts", value: maxContentAvg > 0 ? Math.round((contentTypeAvg.image / maxContentAvg) * 100) : 0, posts: contentTypeCount.image, avgEngagement: Math.round(contentTypeAvg.image) },
      { icon: faVideo, color: "bg-violet-400", label: "Video Content", value: maxContentAvg > 0 ? Math.round((contentTypeAvg.video / maxContentAvg) * 100) : 0, posts: contentTypeCount.video, avgEngagement: Math.round(contentTypeAvg.video) },
      { icon: faAlignLeft, color: "bg-teal-400", label: "Text Only", value: maxContentAvg > 0 ? Math.round((contentTypeAvg.text / maxContentAvg) * 100) : 0, posts: contentTypeCount.text, avgEngagement: Math.round(contentTypeAvg.text) },
      { icon: faPoll, color: "bg-orange-400", label: "Polls & Questions", value: maxContentAvg > 0 ? Math.round((contentTypeAvg.poll / maxContentAvg) * 100) : 0, posts: contentTypeCount.poll, avgEngagement: Math.round(contentTypeAvg.poll) },
    ];

    const totalEngagementBreakdown = totalLikes + totalComments + totalShares;
    const likesPercent = totalEngagementBreakdown > 0 ? parseFloat((totalLikes / totalEngagementBreakdown * 100).toFixed(1)) : 0;
    const commentsPercent = totalEngagementBreakdown > 0 ? parseFloat((totalComments / totalEngagementBreakdown * 100).toFixed(1)) : 0;
    const sharesPercent = totalEngagementBreakdown > 0 ? parseFloat((totalShares / totalEngagementBreakdown * 100).toFixed(1)) : 0;

    return {
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      likesPercent,
      commentsPercent,
      sharesPercent,
      engagementPerPost,
      engagementTrend,
      followerGrowthPercent,
      reachGrowthPercent,
      estimatedReach: Math.round(estimatedReach),
      platformEngagement,
      platformPercentages,
      topPosts,
      contentPerformance,
      bestTimes,
      postsPerDay: postsInRange.length > 0 ? parseFloat((postsInRange.length / daysAgo).toFixed(2)) : 0,
      averageReach: postsInRange.length > 0 ? Math.round(totalEngagement / postsInRange.length * 15) : 0
    };
  };

  const analytics = calculateAnalytics();

  useEffect(() => {
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

    const generateChartData = () => {
      const categories = generateDateCategories();
      const daysAgo = parseInt(activeRange.replace('D', ''));
      const now = new Date();
      const timeBuckets = categories.map(() => ({ likes: 0, comments: 0, shares: 0, count: 0 }));

      analyticsData.forEach(post => {
        if (post.engagement) {
          const postDate = new Date(post.createdAt);
          if (isNaN(postDate)) return; // ✅ ignorer dates invalides
          const daysDiff = Math.floor((now - postDate) / (24 * 60 * 60 * 1000));
          if (daysDiff <= daysAgo) {
            const bucketIndex = Math.min(
              Math.floor((daysDiff / daysAgo) * categories.length),
              categories.length - 1
            );
            timeBuckets[bucketIndex].likes += post.engagement.likes || 0;
            timeBuckets[bucketIndex].comments += post.engagement.comments || 0;
            timeBuckets[bucketIndex].shares += post.engagement.shares || 0;
            timeBuckets[bucketIndex].count += 1;
          }
        }
      });

      return {
        likesData: timeBuckets.map(b => b.count > 0 ? Math.round(b.likes / b.count) : 0),
        commentsData: timeBuckets.map(b => b.count > 0 ? Math.round(b.comments / b.count) : 0),
        sharesData: timeBuckets.map(b => b.count > 0 ? Math.round(b.shares / b.count) : 0),
      };
    };

    const chartData = generateChartData();

    Highcharts.chart("engagement-chart", {
      chart: { type: "line", backgroundColor: "transparent", height: 320 },
      title: { text: null },
      credits: { enabled: false },
      xAxis: { categories: generateDateCategories(), lineColor: "rgba(255,255,255,0.1)", tickColor: "rgba(255,255,255,0.1)", labels: { style: { color: "#9CA3AF", fontSize: "12px" } } },
      yAxis: { title: { text: null }, gridLineColor: "rgba(255,255,255,0.1)", labels: { style: { color: "#9CA3AF", fontSize: "12px" } } },
      legend: { enabled: false },
      plotOptions: { line: { marker: { radius: 6, symbol: "circle" }, lineWidth: 3 } },
      series: [
        { name: "Likes", data: chartData.likesData, color: "#00C2FF", marker: { fillColor: "#00C2FF", lineColor: "#00C2FF", lineWidth: 2 } },
        { name: "Comments", data: chartData.commentsData, color: "#7B61FF", marker: { fillColor: "#7B61FF", lineColor: "#7B61FF", lineWidth: 2 } },
        { name: "Shares", data: chartData.sharesData, color: "#00E09D", marker: { fillColor: "#00E09D", lineColor: "#00E09D", lineWidth: 2 } }
      ]
    });

    const platformEngagement = { Twitter: 0, LinkedIn: 0, Medium: 0 };
    analyticsData.forEach(post => {
      if (post.platforms) {
        Object.keys(post.platforms).forEach(platform => {
          if (post.platforms[platform] && platformEngagement.hasOwnProperty(platform)) {
            platformEngagement[platform] += post.totalEngagement || 0;
          }
        });
      }
    });

    const totalPlatformEngagement = Object.values(platformEngagement).reduce((sum, val) => sum + val, 0);
    const platformChartData = totalPlatformEngagement > 0 ? [
      { name: "Twitter", y: (platformEngagement.Twitter / totalPlatformEngagement * 100), color: "#1D9BF0" },
      { name: "LinkedIn", y: (platformEngagement.LinkedIn / totalPlatformEngagement * 100), color: "#7B61FF" },
      { name: "Medium", y: (platformEngagement.Medium / totalPlatformEngagement * 100), color: "#00E09D" }
    ] : [{ name: "No Data", y: 100, color: "#4B5563" }];

    Highcharts.chart("platform-chart", {
      chart: { type: "pie", backgroundColor: "transparent", height: 260 },
      title: { text: null },
      credits: { enabled: false },
      tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
      plotOptions: { pie: { allowPointSelect: true, cursor: "pointer", dataLabels: { enabled: false }, innerSize: "40%", borderWidth: 0 } },
      series: [{ name: "Engagement", colorByPoint: true, data: platformChartData }]
    });

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

  }, [analyticsData, activeRange, analytics]);

  const contentPerformance = analytics.contentPerformance;
  const bestTimes = analytics.bestTimes;
  const topPosts = analytics.topPosts;

  return (
    <div id="main-content" className="p-8">

      <div id="header-section" className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your content performance across all platforms</p>
        </div>
        <div className="flex items-center space-x-4"></div>
      </div>

      <div className="p-6">
        <div className="flex justify-between mb-8">
          <div className="flex items-center bg-black/30 rounded-2xl p-1">
            {ranges.map((range) => (
              <button key={range} onClick={() => setActiveRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeRange === range ? "bg-cyan-400/20 text-cyan-400" : "text-gray-400 hover:text-white"}`}>
                {range}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-6 py-3 glass-effect rounded-2xl text-white border border-gray-600 hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-400/20">
              <FontAwesomeIcon icon={faDownload} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        <div id="summary-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faHeart} className="text-cyan-400 text-xl" />
              </div>
              {/* ✅ engagementTrend est maintenant un number */}
              <div className={`flex items-center space-x-1 text-sm font-medium ${analytics.engagementTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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

          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-violet-400 text-xl" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${analytics.followerGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <FontAwesomeIcon icon={analytics.followerGrowthPercent >= 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{Math.abs(analytics.followerGrowthPercent)}%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {analytics.totalComments > 0 ? `+${analytics.totalComments.toLocaleString()}` : '0'}
              </div>
              <div className="text-gray-400 text-sm">Engagement Growth</div>
              <div className="text-xs text-gray-500 mt-1">comments & interactions</div>
            </div>
          </div>

          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faEye} className="text-teal-400 text-xl" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${analytics.reachGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <FontAwesomeIcon icon={analytics.reachGrowthPercent >= 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{Math.abs(analytics.reachGrowthPercent)}%</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{analytics.estimatedReach.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Estimated Reach</div>
              <div className="text-xs text-gray-500 mt-1">based on engagement</div>
            </div>
          </div>

          <div className="metric-card glass-effect rounded-3xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-orange-400 text-xl" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${analytics.postsPerDay > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                <FontAwesomeIcon icon={analytics.postsPerDay > 0 ? faArrowUp : faArrowDown} className="text-xs" />
                <span>{analytics.postsPerDay > 0 ? 'Active' : 'Inactive'}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div id="engagement-chart-section" className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Engagement Over Time</h2>
              <p className="text-gray-400 text-sm">Track your content performance trends</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm"><div className="w-3 h-3 bg-cyan-400 rounded-full glow-point" /><span className="text-gray-300">Likes</span></div>
              <div className="flex items-center space-x-2 text-sm"><div className="w-3 h-3 bg-violet-400 rounded-full glow-point" /><span className="text-gray-300">Comments</span></div>
              <div className="flex items-center space-x-2 text-sm"><div className="w-3 h-3 bg-teal-400 rounded-full glow-point" /><span className="text-gray-300">Shares</span></div>
            </div>
          </div>
          <div id="engagement-chart" className="h-80"></div>
        </div>

        <div id="platform-chart-section" className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">Platform Contribution</h2>
            <p className="text-gray-400 text-sm">Engagement breakdown by platform</p>
          </div>
          <div id="platform-chart" className="h-64"></div>
          <div className="mt-8 space-y-4">
            {["Twitter", "LinkedIn", "Medium"].map((platform, i) => {
              const colors = ["blue", "violet", "teal"];
              const c = colors[i];
              return (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 bg-${c}-400 rounded-full`} />
                      <span className="text-gray-300 text-sm font-medium">{platform}</span>
                    </div>
                    <span className="text-white font-bold">{analytics.platformPercentages[platform]}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-${c}-400 to-${c}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${analytics.platformPercentages[platform]}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{analyticsData.filter(p => p.platforms?.[platform]).length} posts</span>
                    <span>{(analytics.platformEngagement[platform] || 0).toLocaleString()} engagement</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div id="engagement-breakdown" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <div className="glass-effect rounded-3xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center"><FontAwesomeIcon icon={faHeart} className="text-cyan-400 text-xl" /></div>
            <div><div className="text-white text-sm font-medium">Likes</div><div className="text-gray-400 text-xs">{analytics.likesPercent}% of engagement</div></div>
          </div>
          <div className="text-2xl font-bold text-cyan-400 mb-2">{analytics.totalLikes.toLocaleString()}</div>
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${analytics.likesPercent}%` }} /></div>
        </div>

        <div className="glass-effect rounded-3xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center"><FontAwesomeIcon icon={faChartColumn} className="text-violet-400 text-xl" /></div>
            <div><div className="text-white text-sm font-medium">Comments</div><div className="text-gray-400 text-xs">{analytics.commentsPercent}% of engagement</div></div>
          </div>
          <div className="text-2xl font-bold text-violet-400 mb-2">{analytics.totalComments.toLocaleString()}</div>
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-violet-400 rounded-full" style={{ width: `${analytics.commentsPercent}%` }} /></div>
        </div>

        <div className="glass-effect rounded-3xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center"><FontAwesomeIcon icon={faRocket} className="text-teal-400 text-xl" /></div>
            <div><div className="text-white text-sm font-medium">Shares</div><div className="text-gray-400 text-xs">{analytics.sharesPercent}% of engagement</div></div>
          </div>
          <div className="text-2xl font-bold text-teal-400 mb-2">{analytics.totalShares.toLocaleString()}</div>
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-teal-400 rounded-full" style={{ width: `${analytics.sharesPercent}%` }} /></div>
        </div>
      </div>

      <div id="insights-section" className="grid grid-cols-2 gap-8 mb-8 animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <div className="glass-effect rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Best Performing Times</h3>
          <div className="space-y-4">
            {bestTimes.length > 0 ? bestTimes.map((time, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
                <div>
                  <div className="text-white font-medium">{time.day}</div>
                  <div className="text-gray-400 text-sm">{time.desc}</div>
                </div>
                <div className={`${time.color} font-bold`}>{time.value} above avg</div>
              </div>
            )) : (
              <div className="text-gray-500 text-sm p-3">Not enough data for this range.</div>
            )}
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Content Type Performance</h3>
          <div className="space-y-4">
            {contentPerformance.map((content, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={content.icon} className={`${content.color}`} />
                    <div>
                      <span className="text-gray-300">{content.label}</span>
                      <div className="text-gray-500 text-xs">{content.posts} posts • avg {content.avgEngagement} eng</div>
                    </div>
                  </div>
                  <span className="text-white font-medium text-sm">{content.value}%</span>
                </div>
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className={`h-full ${content.color} rounded-full`} style={{ width: `${content.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="top-posts-section" className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.8s" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Top Performing Posts</h2>
            <p className="text-gray-400 text-sm">Your highest engagement content this month</p>
          </div>
          <button onClick={handleViewAllPosts}
            className="flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-2xl text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10 text-sm transition-all">
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
                      {/* ✅ BUG FIX : post.img n'existe pas → fallback placeholder */}
                      <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                        {post.rank}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{post.title}</div>
                        <div className="text-gray-400 text-xs">{post.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {/* ✅ post.platforms est maintenant un tableau d'icônes FontAwesome */}
                      {post.platforms.map((icon, idx) => (
                        <FontAwesomeIcon key={idx} icon={icon} className="px-2 py-1 rounded-lg text-xs text-gray-300" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-semibold">{post.engagement}</div>
                    <div className="text-green-400 text-xs">{post.growth}</div>
                  </td>
                  <td className="p-4"><div className="text-white font-semibold">{post.reach}</div></td>
                  <td className="p-4"><div className="text-gray-300 text-sm">{post.date}</div></td>
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

      <div id="ai-insights-section" className="glass-effect rounded-3xl p-6 mt-8 animate-slide-up" style={{ animationDelay: "1s" }}>
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
            <div className="flex items-center space-x-2 mb-3"><FontAwesomeIcon icon={faLightbulb} className="text-cyan-400" /><span className="text-cyan-400 font-medium text-sm">Content Suggestion</span></div>
            <p className="text-white text-sm mb-2">Your audience engages 94% more with posts about AI and automation.</p>
            <p className="text-gray-400 text-xs">Consider creating more content around these topics for better reach.</p>
          </div>
          <div className="bg-black/30 rounded-2xl p-4 border border-violet-400/20">
            <div className="flex items-center space-x-2 mb-3"><FontAwesomeIcon icon={faClock} className="text-violet-400" /><span className="text-violet-400 font-medium text-sm">Timing Optimization</span></div>
            <p className="text-white text-sm mb-2">Post 2 hours earlier on weekdays for 35% better engagement.</p>
            <p className="text-gray-400 text-xs">Your audience is most active between 12-2 PM EST.</p>
          </div>
          <div className="bg-black/30 rounded-2xl p-4 border border-teal-400/20">
            <div className="flex items-center space-x-2 mb-3"><FontAwesomeIcon icon={faChartLine} className="text-teal-400" /><span className="text-teal-400 font-medium text-sm">Growth Opportunity</span></div>
            <p className="text-white text-sm mb-2">Medium posts get 3x more long-form engagement.</p>
            <p className="text-gray-400 text-xs">Expand your Twitter threads into Medium articles for better reach.</p>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-3xl p-8 border border-gray-700/50 max-w-md w-full mx-4 animate-scale-in">
            <h2 className="text-2xl font-bold text-white mb-2">Export Analytics Report</h2>
            <p className="text-gray-400 text-sm mb-6">Choose your preferred format</p>
            <div className="space-y-3 mb-6">
              <label className={`flex items-center p-4 rounded-2xl cursor-pointer border transition-all ${exportFormat === 'json' ? 'bg-cyan-400/10 border-cyan-400/50' : 'border-gray-700/50 hover:border-gray-600'}`}>
                <input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={(e) => setExportFormat(e.target.value)} className="w-4 h-4 accent-cyan-400" />
                <div className="ml-3"><div className="text-white font-medium">JSON Format</div><div className="text-gray-400 text-xs">Structured data format for integration</div></div>
              </label>
              <label className={`flex items-center p-4 rounded-2xl cursor-pointer border transition-all ${exportFormat === 'csv' ? 'bg-cyan-400/10 border-cyan-400/50' : 'border-gray-700/50 hover:border-gray-600'}`}>
                <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={(e) => setExportFormat(e.target.value)} className="w-4 h-4 accent-cyan-400" />
                <div className="ml-3"><div className="text-white font-medium">CSV Format</div><div className="text-gray-400 text-xs">Spreadsheet format for Excel/Sheets</div></div>
              </label>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2 bg-black/30 text-gray-300 rounded-xl hover:bg-black/50 transition-all font-medium">Cancel</button>
              <button onClick={() => { generateExportReport(); setShowExportModal(false); }} className="flex-1 px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30 transition-all font-medium border border-cyan-400/50">Download Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}