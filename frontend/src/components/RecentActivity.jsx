import { useMemo, useState } from "react";

export default function RecentActivity({ analyticsData, posts, navigate, t }) {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Calculate metrics based on real posts data and analytics data
  const calculateMetrics = (posts, analyticsData, period = '7days') => {
    const now = new Date();
    let periodStart;
    let previousPeriodStart;

    switch(period) {
      case '7days':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 7);
        periodStart.setHours(0, 0, 0, 0);
        previousPeriodStart = new Date(periodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        break;
      case '30days':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 30);
        periodStart.setHours(0, 0, 0, 0);
        previousPeriodStart = new Date(periodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
        break;
      case '90days':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 90);
        periodStart.setHours(0, 0, 0, 0);
        previousPeriodStart = new Date(periodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 90);
        break;
      default:
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 7);
        periodStart.setHours(0, 0, 0, 0);
        previousPeriodStart = new Date(periodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    }

    // Helper function to get post date (same as Dashboard)
    const getPostDate = (p) => new Date(p.created_at || p.createdAt || 0);

    // Filter posts for current period (for published count)
    const filteredPosts = posts.filter(post => {
      const isPublished = post.status === 'posted' || post.status === 'published' || post.status === 'Published';
      if (!isPublished) return false; // Only count published posts

      const postDate = getPostDate(post);
      return postDate >= periodStart && postDate <= now;
    });

    // Filter posts for previous period (for growth calculation)
    const previousPeriodPosts = posts.filter(post => {
      const isPublished = post.status === 'posted' || post.status === 'published' || post.status === 'Published';
      if (!isPublished) return false;

      const postDate = getPostDate(post);
      return postDate >= previousPeriodStart && postDate < periodStart;
    });

    // Published posts in current period
    const postsPublished = filteredPosts.length;

    // Published posts in previous period
    const previousPostsPublished = previousPeriodPosts.length;

    // Calculate real growth rate
    let growthRate = 0;
    if (previousPostsPublished > 0) {
      growthRate = Math.round(((postsPublished - previousPostsPublished) / previousPostsPublished) * 100);
    } else if (postsPublished > 0) {
      growthRate = 100;
    }

    // Filter analytics data for current period
    const filteredAnalytics = (analyticsData || []).filter(post => {
      const postDate = getPostDate(post);
      return postDate >= periodStart && postDate <= now;
    });

    // Filter analytics data for previous period
    const previousPeriodAnalytics = (analyticsData || []).filter(post => {
      const postDate = getPostDate(post);
      return postDate >= previousPeriodStart && postDate < periodStart;
    });

    // Total engagements
    const totalEngagement = filteredAnalytics.reduce((sum, post) => {
      const engagement = post.engagement;
      if (engagement) {
        return sum + (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0);
      }
      return sum;
    }, 0);

    // Calculate engagement growth
    const previousEngagement = previousPeriodAnalytics.reduce((sum, post) => {
      const engagement = post.engagement;
      if (engagement) {
        return sum + (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0);
      }
      return sum;
    }, 0);
    let engagementGrowth = 0;
    if (previousEngagement > 0) {
      engagementGrowth = Math.round(((totalEngagement - previousEngagement) / previousEngagement) * 100);
    } else if (totalEngagement > 0) {
      engagementGrowth = 100;
    }

    // Total Reach
    const totalReach = totalEngagement * 15;

    // Calculate reach growth
    const previousReach = previousEngagement * 15;
    let reachGrowth = 0;
    if (previousReach > 0) {
      reachGrowth = Math.round(((totalReach - previousReach) / previousReach) * 100);
    } else if (totalReach > 0) {
      reachGrowth = 100;
    }

    // Average rating
    const ratings = filteredAnalytics
      .filter(post => post.rating && post.rating > 0)
      .map(post => post.rating);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : '0.0';

    // Rating growth
    const previousRatings = previousPeriodAnalytics
      .filter(post => post.rating && post.rating > 0)
      .map(post => post.rating);
    const previousAvgRating = previousRatings.length > 0
      ? (previousRatings.reduce((sum, rating) => sum + rating, 0) / previousRatings.length)
      : 0;
    let ratingGrowth = 0;
    if (previousAvgRating > 0) {
      ratingGrowth = Math.round(((parseFloat(avgRating) - previousAvgRating) / previousAvgRating) * 100);
    }

    return {
      postsPublished,
      totalEngagement,
      totalReach,
      avgRating,
      growthRate,
      engagementGrowth,
      reachGrowth,
      ratingGrowth,
      periodPosts: filteredPosts.length
    };
  };

  const calculatedMetrics = useMemo(() =>
    calculateMetrics(posts || [], analyticsData || [], selectedPeriod),
    [posts, analyticsData, selectedPeriod]
  );

  // Use calculated metrics for all values based on selected period
  const metrics = calculatedMetrics;

  const ActivityItem = ({ icon, value, label, color, growth }) => (
    <div className="text-center p-4 rounded-2xl bg-gray-800/30">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-400/20 flex items-center justify-center mx-auto mb-3`}>
        <i className={`fa-solid ${icon} text-${color}-400`}></i>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {growth && (
        <div className="text-xs text-green-400 mt-1">+{growth}%</div>
      )}
    </div>
  );

  return (
    <div className="glass-effect rounded-3xl p-6 glow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{t ? t("dashboard.recentActivity") : "Recent Activity"}</h2>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="7days">{t ? t("dashboard.last7Days") : "Last 7 days"}</option>
            <option value="30days">{t ? t("dashboard.last30Days") : "Last 30 days"}</option>
            <option value="90days">{t ? t("dashboard.last90Days") : "Last 90 days"}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <ActivityItem
          icon="fa-paper-plane"
          value={metrics.postsPublished}
          label={t ? t("dashboard.postsPublished") : "Posts Published"}
          color="green"
          growth={metrics.growthRate}
        />

        <ActivityItem
          icon="fa-heart"
          value={metrics.totalEngagement}
          label={t ? t("dashboard.engagements") : "Engagements"}
          color="violet"
          growth={metrics.engagementGrowth}
        />

        <ActivityItem
          icon="fa-broadcast-tower"
          value={metrics.totalReach > 1000 ? `${(metrics.totalReach/1000).toFixed(1)}K` : metrics.totalReach}
          label={t ? t("dashboard.totalReach") : "Total Reach"}
          color="orange"
          growth={metrics.reachGrowth}
        />

        <ActivityItem
          icon="fa-star"
          value={metrics.avgRating}
          label={t ? t("dashboard.avgRating") : "Avg Rating"}
          color="yellow"
          growth={metrics.ratingGrowth}
        />
      </div>
    </div>
  );
}
