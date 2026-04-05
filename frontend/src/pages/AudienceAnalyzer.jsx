import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";

export default function AudienceAnalyzer() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [strategyApplied, setStrategyApplied] = useState(false);
  const [downloadState, setDownloadState] = useState("idle");
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;

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
        data: [7.8, 6.9, 8.2, 5.4],
        colorByPoint: true,
        colors: ["#00C2FF", "#7B61FF", "#14B8A6", "#F59E0B"]
      }],
      legend: { enabled: false }
    });

  }, []);

  const handleGenerateStrategy = () => {
    setShowModal(true);
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
          <p className="text-gray-400">Based on 2,847 followers • 1,234 active engagers • Last updated 3 hours ago</p>
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
            <div className="text-3xl font-bold metric-value">2,847</div>
            <div className="text-gray-400 text-sm">Total Audience Size</div>
          </div>
          <div className="text-gray-300 text-xs">
            <span className="text-cyan-400">LinkedIn:</span> 1,623 • 
            <span className="text-violet-400">Twitter:</span> 894 • 
            <span className="text-teal-400">Medium:</span> 330
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
            <div className="text-3xl font-bold metric-value">1,234</div>
            <div className="text-gray-400 text-sm">Active Commenters</div>
          </div>
          <div className="text-gray-300 text-xs">
            43% of total audience • 2.3 comments per person monthly
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
            <div className="text-3xl font-bold metric-value">6.8%</div>
            <div className="text-gray-400 text-sm">Engagement Rate</div>
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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">AI Analyzing</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <PersonaCard 
              name="Entrepreneurs"
              percent="34%"
              followers="967"
              icon="fa-rocket"
              color="cyan"
              interests={["AI Tools", "Productivity", "Startups"]}
              topPost="Short Hooks & Tips"
              onInterestClick={handleInterestClick}
            />
            <PersonaCard 
              name="AI Students"
              percent="28%"
              followers="797"
              icon="fa-graduation-cap"
              color="violet"
              interests={["Machine Learning", "Tutorials", "Research"]}
              topPost="Educational Content"
              onInterestClick={handleInterestClick}
            />
            <PersonaCard 
              name="Writers"
              percent="23%"
              followers="655"
              icon="fa-feather"
              color="teal"
              interests={["Storytelling", "Content", "Creativity"]}
              topPost="Personal Stories"
              onInterestClick={handleInterestClick}
            />
            <PersonaCard 
              name="Investors"
              percent="15%"
              followers="428"
              icon="fa-chart-line"
              color="yellow"
              interests={["Markets", "Tech Trends", "Analysis"]}
              topPost="Industry Insights"
              onInterestClick={handleInterestClick}
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
          
          {/* AI Insights List */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fa-solid fa-brain text-cyan-400 mr-2"></i>
              AI Insights
            </h4>
            
            <InsightItem 
              icon="fa-calendar-days"
              color="cyan"
              title="Your entrepreneur followers engage more on weekdays"
              description="Peak engagement: Tuesday-Thursday 2-4 PM"
            />
            <InsightItem 
              icon="fa-book-open"
              color="violet"
              title="Writers prefer your storytelling posts"
              description="3.2x higher engagement on personal narrative content"
            />
            <InsightItem 
              icon="fa-graduation-cap"
              color="teal"
              title="AI students love tutorial content"
              description="Step-by-step guides get 67% more saves"
            />
            <InsightItem 
              icon="fa-chart-line"
              color="yellow"
              title="Investors engage with data-driven posts"
              description="Charts and statistics increase comments by 45%"
            />
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
              { label: "United States", value: "42%", color: "cyan" },
              { label: "United Kingdom", value: "18%", color: "violet" },
              { label: "Canada", value: "12%", color: "teal" },
              { label: "Germany", value: "8%", color: "yellow" },
              { label: "Others", value: "20%", color: "gray" }
            ]}
          />
          <DemographicsCard 
            title="Industries"
            icon="fa-briefcase"
            color="violet"
            data={[
              { label: "Technology", value: "38%", color: "cyan" },
              { label: "Marketing", value: "24%", color: "violet" },
              { label: "Education", value: "16%", color: "teal" },
              { label: "Finance", value: "14%", color: "yellow" },
              { label: "Others", value: "8%", color: "gray" }
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
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Content Types */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Top Performing Content Types</h4>
            
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Optimal Posting Times by Persona */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Optimal Posting Times by Persona</h4>
            
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
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
          <div className="glass-effect bg-black/30 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <i className="fa-solid fa-lightbulb text-cyan-400 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AI-Generated Content Strategy</h3>
              <p className="text-gray-400">Based on your audience persona analysis</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-2">
                  <i className="fa-solid fa-calendar text-cyan-400"></i>
                  <span className="text-white font-medium">Optimal Posting Schedule</span>
                </div>
                <div className="text-gray-300 text-sm">
                  • Tuesdays 2:00 PM for Entrepreneurs (34% of audience)<br/>
                  • Wednesdays 7:00 PM for AI Students (28% of audience)<br/>
                  • Sundays 10:00 AM for Writers (23% of audience)
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-2">
                  <i className="fa-solid fa-pen text-violet-400"></i>
                  <span className="text-white font-medium">Content Mix Recommendation</span>
                </div>
                <div className="text-gray-300 text-sm">
                  • 40% Tutorial & How-to content<br/>
                  • 30% Personal stories and experiences<br/>
                  • 20% Industry insights and analysis<br/>
                  • 10% Quick tips and actionable advice
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-2">
                  <i className="fa-solid fa-target text-teal-400"></i>
                  <span className="text-white font-medium">Platform Focus</span>
                </div>
                <div className="text-gray-300 text-sm">
                  • LinkedIn: Professional insights and career advice<br/>
                  • Twitter: Quick tips and industry commentary<br/>
                  • Medium: In-depth tutorials and thought pieces
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 p-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleApplyStrategy}
                className="flex-1 p-3 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
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
function PersonaCard({ name, percent, followers, icon, color, interests, topPost, onInterestClick }) {
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
        <div className="text-white font-medium text-sm">{topPost}</div>
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