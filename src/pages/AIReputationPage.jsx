// AIReputationPage.jsx
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faArrowTrendUp,
  faTrophy,
  faCalendarCheck,
  faHeart,
  faBrain,
  faRocket,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

export default function AIReputationPage() {
  const targetScore = 82;
  const [score, setScore] = useState(0);

  const trendData = [
    { day: "1", score: 65 },
    { day: "5", score: 68 },
    { day: "10", score: 70 },
    { day: "15", score: 75 },
    { day: "20", score: 78 },
    { day: "25", score: 80 },
    { day: "30", score: 82 },
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < targetScore) {
        current += 1;
        setScore(current);
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // ✅ classes fixes (pas dynamiques)
  const colorMap = {
    cyan: {
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30",
      text: "text-cyan-400",
      iconBg: "bg-cyan-400/20",
    },
    violet: {
      bg: "bg-violet-400/10",
      border: "border-violet-400/30",
      text: "text-violet-400",
      iconBg: "bg-violet-400/20",
    },
    teal: {
      bg: "bg-teal-400/10",
      border: "border-teal-400/30",
      text: "text-teal-400",
      iconBg: "bg-teal-400/20",
    },
    green: {
      bg: "bg-green-400/10",
      border: "border-green-400/30",
      text: "text-green-400",
      iconBg: "bg-green-400/20",
    },
    amber: {
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
      text: "text-amber-400",
    },
    gray: {
      bg: "bg-gray-400/10",
      border: "border-gray-400/30",
      text: "text-gray-400",
    },
    yellow: {
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/30",
      text: "text-yellow-400",
    },
  };

  const progressBars = [
    { label: "Consistency", icon: faCalendarCheck, value: 87, color: "cyan" },
    { label: "Engagement", icon: faHeart, value: 92, color: "violet" },
    { label: "Tone Clarity", icon: faBrain, value: 78, color: "teal" },
    { label: "Growth Momentum", icon: faRocket, value: 85, color: "green" },
  ];

  const badgeTiers = [
    { name: "Bronze", points: "0-40", icon: faTrophy, color: "amber" },
    { name: "Silver", points: "41-70", icon: faTrophy, color: "gray" },
    { name: "Gold", points: "71-90", icon: faTrophy, color: "yellow", active: true },
    { name: "Platinum", points: "91-100", icon: faCrown, color: "violet", opacity: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">

      {/* Header */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 animate-pulse mb-4">
          <FontAwesomeIcon icon={faStar} className="text-3xl" />
        </div>
        <h1 className="text-4xl font-bold mb-2">
          AI Reputation Score — How Strong Is Your Online Presence?
        </h1>
        <p className="text-gray-400 mb-1">
          Based on 127 posts across 3 platforms • Updated in real-time
        </p>
      </div>

      {/* Main Score */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 mb-12">

        {/* Score Card */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center relative">
          <div className="text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
            {score}
          </div>
          <div className="text-gray-400 text-lg">/ 100</div>

          <div className="mt-4">
            <h3 className="text-2xl font-bold">
              {score > 70 ? "Excellent!" : "Good"}
            </h3>
            <p className="text-gray-400">
              {score > 70
                ? "You have a strong reputation!"
                : "Keep improving your posts."}
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Trend Chart */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">
                Reputation Over Time
              </h4>
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <FontAwesomeIcon icon={faArrowTrendUp} />
                <span>+12</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#aaa" />
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
          </div>

          {/* Badges */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-6 space-y-3">
            <h4 className="text-lg font-semibold flex items-center mb-4">
              <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 mr-2" />
              Achievement Tiers
            </h4>

            {badgeTiers.map((tier, idx) => {
              const c = colorMap[tier.color];

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${c.bg} ${c.border} ${tier.active ? "border-cyan-400 shadow-lg" : ""} ${tier.opacity ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={tier.icon} className={`${c.text} text-xl`} />
                    <div>
                      <div className={`${c.text} font-medium`}>
                        {tier.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {tier.points} points
                      </div>
                    </div>
                  </div>

                  {tier.active && (
                    <div className="text-cyan-400 text-sm font-medium">
                      Current
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subscores */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {progressBars.map((bar, idx) => {
          const c = colorMap[bar.color];

          return (
            <div
              key={idx}
              className="bg-gray-900/50 backdrop-blur-lg rounded-3xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={bar.icon} className={`${c.text} text-xl`} />
                  </div>
                  <div>
                    <div className="font-semibold">{bar.label}</div>
                    <div className="text-gray-400 text-sm">
                      {bar.label} description
                    </div>
                  </div>
                </div>

                <div className={`text-2xl font-bold ${c.text}`}>
                  {bar.value}%
                </div>
              </div>

              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  style={{
                    width: `${bar.value}%`,
                    transition: "width 2s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
