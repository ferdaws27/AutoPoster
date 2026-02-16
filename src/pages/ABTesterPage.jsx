import { useState } from "react";
import { 
  FaPlusCircle, 
  FaRocket, 
  FaCheck, 
  FaClock, 
  FaPause, 
  FaChartBar, 
  FaCrown, 
  FaDownload,
  FaVials,
  FaTrophy,
  FaChartLine,
  FaCheckCircle,
  FaBrain,
  FaComments,
  FaHashtag,
  FaHistory,
  FaEye
} from "react-icons/fa";

export default function CreateTestSection() {
  const [originalContent, setOriginalContent] = useState("");

  const platforms = [
    { name: "Twitter", color: "cyan-400", defaultChecked: true },
    { name: "LinkedIn", color: "violet-400", defaultChecked: true },
    { name: "Medium", color: "teal-400", defaultChecked: false },
  ];

  const testsHistory = [
    {
      name: "Product Launch Announcement",
      platforms: ["twitter", "linkedin"],
      winner: "Variant A (Story)",
      improvement: "+59%",
      date: "2h ago",
      winnerColor: "green-400",
    },
    {
      name: "Feature Update Announcement",
      platforms: ["twitter"],
      winner: "Variant B (Casual)",
      improvement: "+23%",
      date: "1 day ago",
      winnerColor: "green-400",
    },
    {
      name: "Industry Insights Post",
      platforms: ["linkedin"],
      winner: "Variant A (Question CTA)",
      improvement: "+41%",
      date: "3 days ago",
      winnerColor: "green-400",
    },
    {
      name: "Team Hiring Post",
      platforms: ["twitter", "linkedin"],
      winner: "Variant B (Direct)",
      improvement: "-12%",
      date: "5 days ago",
      winnerColor: "red-400",
    },
  ];

  return (
    <div id="main-content" className=" p-8">

      {/* Header Section */}
      <div id="header-section" className="mb-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center float-animation">
            <FaVials className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Post A/B Tester — Optimize Your Content Performance
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Compare two AI-generated variations, measure engagement, and learn what works best
          </p>
          <p className="text-gray-400">
            Automatically keeps the winner and evolves your content strategy
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div id="stats-overview" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">24</div>
              <div className="text-gray-400 text-sm">Active Tests</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center">
              <FaVials className="text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">87%</div>
              <div className="text-gray-400 text-sm">Win Rate</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center">
              <FaTrophy className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">+34%</div>
              <div className="text-gray-400 text-sm">Avg. Improvement</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-400/20 flex items-center justify-center">
              <FaChartLine className="text-violet-400" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-gray-400 text-sm">Tests Completed</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
              <FaCheckCircle className="text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Create New Test Section */}
      <div id="create-test-section" className="glass-effect rounded-3xl p-8 mb-8 slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaPlusCircle className="text-cyan-400 mr-3" /> Create New A/B Test
          </h2>
          <button className="px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-all">
            <FaRocket className="mr-2" /> Start Test
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-white font-medium mb-3">Original Post Content</label>
            <textarea
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="Enter your original post content here..."
              className="w-full h-40 bg-black/20 border border-gray-700/50 rounded-2xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-400/50 focus:bg-black/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-3">Test Parameters</label>
            <div className="space-y-4">
              {/* Platforms */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Platforms to Test</label>
                <div className="flex space-x-3">
                  {platforms.map((platform, idx) => (
                    <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="hidden peer" defaultChecked={platform.defaultChecked} />
                      <div className={`w-5 h-5 border-2 border-gray-600 rounded flex items-center justify-center peer-checked:bg-${platform.color}`}>
                        <FaCheck className="text-white text-xs" />
                      </div>
                      <span className="text-gray-300 text-sm">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Variation Type */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Variation Type</label>
                <select className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50">
                  <option>Tone Variation (Professional vs Casual)</option>
                  <option>Structure Variation (Story vs Direct)</option>
                  <option>CTA Variation (Question vs Statement)</option>
                  <option>Length Variation (Short vs Detailed)</option>
                  <option>Emoji Variation (With vs Without)</option>
                </select>
              </div>

              {/* Test Duration */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Test Duration</label>
                <select className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50">
                  <option>24 Hours (Recommended)</option>
                  <option>48 Hours</option>
                  <option>72 Hours</option>
                  <option>1 Week</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tests Section */}
      <div id="active-tests-section" className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaClock className="text-yellow-400 mr-3" /> Active Tests
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Live monitoring</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Test 1 - In Progress */}
          <div className="glass-effect rounded-3xl p-6 border border-gray-700/50 slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">AI Writing Assistant Update</span>
                <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded-full">In Progress</span>
              </div>
              <div className="text-gray-400 text-sm">18h 23m remaining</div>
            </div>

            {/* Variants */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Variant A */}
              <div className="variant-card bg-black/20 rounded-2xl p-5 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center">
                    <span className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">A</span>
                    Professional Tone
                  </h4>
                  <div className="text-cyan-400 text-sm">Leading</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  We're excited to announce a major update to our AI writing assistant...
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Likes", value: 342 },
                    { label: "Comments", value: 28 },
                    { label: "Shares", value: 15 },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xl font-bold text-cyan-400">{item.value}</div>
                      <div className="text-gray-400 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Engagement Rate</span>
                  <span className="text-cyan-400 font-medium">4.2%</span>
                </div>
              </div>

              {/* Variant B */}
              <div className="variant-card bg-black/20 rounded-2xl p-5 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center">
                    <span className="w-6 h-6 bg-violet-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">B</span>
                    Casual Tone
                  </h4>
                  <div className="text-gray-400 text-sm">Behind</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Just dropped some amazing updates to our AI writing tool! 🚀...
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Likes", value: 298 },
                    { label: "Comments", value: 22 },
                    { label: "Shares", value: 11 },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xl font-bold text-violet-400">{item.value}</div>
                      <div className="text-gray-400 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Engagement Rate</span>
                  <span className="text-violet-400 font-medium">3.8%</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-black/30 rounded-xl text-gray-400 hover:text-white transition-colors">
                  <FaPause className="mr-2" /> Pause Test
                </button>
                <button className="px-4 py-2 bg-black/30 rounded-xl text-gray-400 hover:text-white transition-colors">
                  <FaChartBar className="mr-2" /> View Details
                </button>
              </div>
              <div className="text-gray-400 text-sm">Posted on Twitter, LinkedIn • 8,234 total impressions</div>
            </div>
          </div>

          {/* Test 2 - Recently Completed */}
          <div className="glass-effect rounded-3xl p-6 border border-green-400/30 winner-glow slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">Product Launch Announcement</span>
                <span className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">Winner Selected</span>
              </div>
              <div className="text-gray-400 text-sm">Completed 2h ago</div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Winner Variant */}
              <div className="variant-card bg-green-400/10 rounded-2xl p-5 border border-green-400/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center">
                    <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">A</span>
                    Story Structure
                    <FaCrown className="text-yellow-400 ml-2" />
                  </h4>
                  <div className="text-green-400 text-sm font-medium">WINNER</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Three months ago, we had a crazy idea. What if we could solve the biggest pain point...
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Likes", value: "1,247" },
                    { label: "Comments", value: 89 },
                    { label: "Shares", value: 52 },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xl font-bold text-green-400">{item.value}</div>
                      <div className="text-gray-400 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Engagement Rate</span>
                  <span className="text-green-400 font-medium">7.8%</span>
                </div>
              </div>

              {/* Losing Variant */}
              <div className="variant-card bg-black/20 rounded-2xl p-5 border border-gray-700/50 opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center">
                    <span className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">B</span>
                    Direct Approach
                  </h4>
                  <div className="text-red-400 text-sm">Lost</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  We're launching our new AI content platform today! Key features include automated posting...
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Likes", value: 823 },
                    { label: "Comments", value: 34 },
                    { label: "Shares", value: 18 },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xl font-bold text-red-400">{item.value}</div>
                      <div className="text-gray-400 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Engagement Rate</span>
                  <span className="text-red-400 font-medium">4.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* ---------------- AI Learning Insights Section ---------------- */}
      <div id="insights-section" className="glass-effect rounded-3xl p-8 mb-8 slide-up">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaBrain className="text-violet-400 mr-3" /> AI Learning Insights
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="learning-insight rounded-2xl p-6 border border-violet-400/30">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center">
              <FaComments className="text-violet-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Tone Preference</h3>
            <p className="text-gray-400 text-sm mb-3">Your audience responds 34% better to conversational tone over formal language</p>
            <div className="text-violet-400 text-sm font-medium">Confidence: 87%</div>
          </div>

          <div className="learning-insight rounded-2xl p-6 border border-cyan-400/30">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
              <FaClock className="text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Optimal Timing</h3>
            <p className="text-gray-400 text-sm mb-3">Posts with story structure perform 45% better on LinkedIn vs Twitter</p>
            <div className="text-cyan-400 text-sm font-medium">Confidence: 92%</div>
          </div>

          <div className="learning-insight rounded-2xl p-6 border border-teal-400/30">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-teal-400/20 flex items-center justify-center">
              <FaHashtag className="text-teal-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Content Length</h3>
            <p className="text-gray-400 text-sm mb-3">Medium-length posts (150-200 words) generate highest engagement</p>
            <div className="text-teal-400 text-sm font-medium">Confidence: 78%</div>
          </div>
        </div>
      </div>

      {/* ---------------- Performance Analytics Section ---------------- */}
      <div id="analytics-section" className="glass-effect rounded-3xl p-8 mb-8 slide-up">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaChartLine className="text-cyan-400 mr-3" /> Performance Analytics
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-black/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Win Rate by Platform</h3>
            <div className="space-y-4">
              {[
                { platform: "Twitter", icon: "fa-twitter", color: "blue-400", value: 87 },
                { platform: "LinkedIn", icon: "fa-linkedin", color: "blue-600", value: 74 },
                { platform: "Medium", icon: "fa-medium", color: "green-400", value: 62 },
              ].map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className={`fa-brands ${p.icon} text-${p.color}`}></i>
                    <span className="text-gray-300">{p.platform}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 h-2 bg-gray-700 rounded-full">
                      <div className={`w-[${p.value}%] h-2 bg-${p.color} rounded-full`}></div>
                    </div>
                    <span className={`text-${p.color} font-medium`}>{p.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Average Improvement Over Time</h3>
            <div className="h-40 flex items-end space-x-2">
              {[30,45,60,75,85,100].map((h, idx) => (
                <div key={idx} className={`flex-1 bg-cyan-400/20 rounded-t`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-gray-400 text-xs mt-2">
              {["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"].map((w, idx) => <span key={idx}>{w}</span>)}
            </div>
          </div>
        </div>
      </div>
      {/* Test History Section */}
      <div id="test-history-section" className="glass-effect rounded-3xl p-8 mb-8 slide-up">
        <h2 className="text-2xl font-bold text-white flex items-center mb-6">
          <FaHistory className="text-gray-400 mr-3" /> Test History
        </h2>
        <div className="grid gap-4">
          {testsHistory.map((test, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-gray-700/50">
              <div>
                <div className="text-white font-medium">{test.name}</div>
                <div className="flex items-center space-x-2 mt-1">
                  {test.platforms.map((p, i) => (
                    <span key={i} className="text-gray-400 text-xs">{p}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-${test.winnerColor} font-medium`}>{test.winner}</div>
                <div className="text-gray-400 text-sm">{test.improvement} improvement</div>
                <div className="text-gray-500 text-xs">{test.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Settings & Configuration Section ---------------- */}
      <div id="settings-section" className="glass-effect rounded-3xl p-8 slide-up">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaCrown className="text-gray-400 mr-3" /> A/B Test Settings
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Default Test Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Default Test Duration</label>
                <select className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50">
                  <option>24 Hours</option>
                  <option>48 Hours</option>
                  <option>72 Hours</option>
                  <option>1 Week</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Minimum Sample Size</label>
                <input type="number" value="1000" className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Statistical Significance</label>
                <select className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50">
                  <option>95% (Recommended)</option>
                  <option>90%</option>
                  <option>99%</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-4">
              {[
                { label: "Notify when test completes", checked: true },
                { label: "Daily progress updates", checked: true },
                { label: "Weekly insights summary", checked: false },
                { label: "Auto-apply winning variants", checked: true },
              ].map((n, idx) => (
                <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="hidden peer" defaultChecked={n.checked} />
                  <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:bg-cyan-400 peer-checked:border-cyan-400 flex items-center justify-center">
                    <FaCheck className="text-white text-xs" />
                  </div>
                  <span className="text-gray-300">{n.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
