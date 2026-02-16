import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket, faChartColumn, faFire, faBrain, faMagicWandSparkles,
  faCheck, faClock, faLightbulb, faTrophy,
  faDownload, faCalendarPlus, faShareNodes,
  faChartLine, faArrowTrendUp, faUsers, faStar
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";

/* ------------------- DATA ------------------- */
const barData = [
  { name: "Tutorial", value: 7.2 },
  { name: "Story", value: 5.8 },
  { name: "News", value: 3.4 },
  { name: "Tips", value: 6.1 },
  { name: "Scenes", value: 4.7 },
  { name: "Promo", value: 2.3 },
];
const colors = ["#00C2FF", "#7B61FF", "#00E09D", "#FFB800", "#FF6B6B", "#A0AEC0"];
const bestTimeData = [
  { hour: "8 AM", engagement: 2 },
  { hour: "10 AM", engagement: 3 },
  { hour: "12 PM", engagement: 4 },
  { hour: "2 PM", engagement: 8 },
  { hour: "4 PM", engagement: 5 },
  { hour: "6 PM", engagement: 3 },
  { hour: "8 PM", engagement: 2 },
];

/* ------------------- AI Recommendations DATA ------------------- */
const recommendationsData = [
  {
    category: "Content Structure",
    icon: faBrain,
    items: [
      {
        icon: faRocket,
        text: "Shorten your openings",
        confidence: 92,
        color: "green-400",
        description: "Your most engaging posts start with 5-8 words. Current average: 12 words."
      },
      {
        icon: faRocket,
        text: "Use story-hook structure",
        confidence: 87,
        color: "violet-400",
        description: "Posts with personal stories get 2.3x more engagement than pure insights."
      },
      {
        icon: faRocket,
        text: "Add question CTA",
        confidence: 94,
        color: "teal-400",
        description: "Posts ending with questions receive 67% more comments and shares."
      }
    ]
  },
  {
    category: "Timing & Platform",
    icon: faClock,
    items: [
      {
        icon: faCalendarPlus,
        text: "Post on Tuesdays more",
        confidence: 89,
        color: "yellow-400",
        description: "Your Tuesday posts outperform other days by 45% on average."
      },
      {
        icon: faLinkedin,
        text: "Focus more on LinkedIn",
        confidence: 91,
        color: "blue-400",
        description: "Your LinkedIn engagement rate is 63% higher than other platforms."
      },
      {
        icon: faRocket,
        text: "Use 3-5 hashtags optimal",
        confidence: 85,
        color: "pink-400",
        description: "Posts with 3-5 hashtags perform 28% better than no hashtags."
      }
    ]
  }
];

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

/* ------------------- COMPONENT ------------------- */
export default function PerformanceOptimizer() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [applied, setApplied] = useState(false);

  const quickActions = [
    {
      icon: faDownload,
      title: "Export Report",
      description: "Download detailed analytics",
      color: "cyan-400"
    },
    {
      icon: faCalendarPlus,
      title: "Schedule Optimal Posts",
      description: "Auto-schedule at best times",
      color: "violet-400"
    },
    {
      icon: faLightbulb,
      title: "Content Ideas",
      description: "Get AI-powered suggestions",
      color: "teal-400"
    },
    {
      icon: faShareNodes,
      title: "Share Insights",
      description: "Send report to team",
      color: "yellow-400"
    }
  ];

  /* ------------------- EXPORT CSV ------------------- */
  const exportReport = () => {
    const data = barData.map(d => ({ Type: d.name, Engagement: d.value }));
    const bestTime = bestTimeData.map(d => ({ Hour: d.hour, Engagement: d.engagement }));

    let csvRows = [];
    csvRows.push("Type,Engagement");
    data.forEach(row => csvRows.push(`${row.Type},${row.Engagement}`));
    csvRows.push("");
    csvRows.push("Hour,Engagement");
    bestTime.forEach(row => csvRows.push(`${row.Hour},${row.Engagement}`));

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
        <h1 className="text-4xl font-bold mb-2">Performance Optimizer — Learn From Your Data</h1>
        <p className="text-gray-400">AI-powered insights to boost engagement</p>
        <p className="text-gray-400">Analyze 127 posts across 3 platforms • Last updated 2 hours ago</p>
      </div>

      {/* METRICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Metric title="Avg Engagement" value="4.7%" icon={faLightbulb} />
        <Metric title="Best Time" value="2:00 PM" icon={faClock} />
        <Metric title="Top Platform" value="LinkedIn" icon={faTrophy} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="chart-container rounded-3xl p-6 glass-effect">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartColumn} /> Engagement per type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="value">
                {barData.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
          <p className="text-gray-400 mt-2 text-center">Tuesday 2PM peak engagement</p>
        </div>
      </div>

      {/* AI RECOMMENDATIONS */}
      <AIRecommendations />

      {/* APPLY BUTTON */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => setShowModal(true)}
          className="apply-suggestions-btn px-10 py-4 rounded-3xl text-xl flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faMagicWandSparkles} /> Apply Suggestions
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="glass-effect rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl mb-4">Apply AI Recommendations?</h3>
            <div className="space-y-2 mb-4">
              <ModalItem text="Short hooks" />
              <ModalItem text="Story structure" />
              <ModalItem text="CTA questions" />
              <ModalItem text="Tuesday 2PM" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 p-3 rounded-xl">Cancel</button>
              <button onClick={() => { setApplied(true); setShowModal(false); }} className="flex-1 gradient-accent p-3 rounded-xl">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Performance */}
      <HistoricalPerformance
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        quickActions={quickActions}
        applied={applied}
        setApplied={setApplied}
        exportReport={exportReport}
      />
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

function ModalItem({ text }) {
  return (
    <div className="bg-black/30 p-3 rounded-xl flex items-center gap-2">
      <FontAwesomeIcon icon={faCheck} className="text-green-400" />
      {text}
    </div>
  );
}

/* ------------------- AIRecommendations ------------------- */
function AIRecommendations() {
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
        <div className="flex items-center space-x-2 bg-black/30 rounded-2xl px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full pulse-data"></div>
          <span className="text-green-400 text-sm font-medium">AI Analyzing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {recommendationsData.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={cat.icon} className="text-cyan-400 mr-2" />
              {cat.category}
            </h4>
            {cat.items.map((item, i) => (
              <div key={i} className="recommendation-item bg-black/20 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={item.icon} className={colorMap[item.color]} />
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                  <div className={`${colorMap[item.color]} text-sm font-medium`}>{item.confidence}% confidence</div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                <div className="confidence-bar bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className={`${colorMap[item.color]} h-2`} style={{ width: `${item.confidence}%`, backgroundColor: undefined }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <SummaryStat number="8" label="Recommendations" color="cyan-400" />
        <SummaryStat number="89%" label="Avg Confidence" color="violet-400" />
        <SummaryStat number="+47%" label="Potential Boost" color="teal-400" />
        <SummaryStat number="127" label="Posts Analyzed" color="yellow-400" />
      </div>
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
function HistoricalPerformance({ selectedPeriod, setSelectedPeriod, quickActions, applied, setApplied, exportReport }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mb-12">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => {
                if (action.title === "Export Report") exportReport();
                else setShowModal(true);
              }}
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

        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-lg w-full border border-cyan-400/30">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMagicWandSparkles} className="text-cyan-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Apply This Action?</h3>
                <p className="text-gray-400 text-sm">
                  Applying this will optimize your performance metrics based on AI recommendations.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700/80 p-3 rounded-xl text-white hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setApplied(true); setShowModal(false); }}
                  className="flex-1 gradient-accent p-3 rounded-xl text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
