import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  FontAwesomeIcon
} from "@fortawesome/react-fontawesome";
import {
  faRocket, faChartColumn, faFire, faBrain, faMagicWandSparkles,
  faCheck, faClock, faLightbulb, faTrophy, faUsers,
  faDownload, faCalendarPlus, faShareNodes
} from "@fortawesome/free-solid-svg-icons";

const barData = [
  { name: "Tutorial", value: 7.2 },
  { name: "Story", value: 5.8 },
  { name: "News", value: 3.4 },
  { name: "Tips", value: 6.1 },
  { name: "Scenes", value: 4.7 },
  { name: "Promo", value: 2.3 },
];

const colors = ["#00C2FF", "#7B61FF", "#00E09D", "#FFB800", "#FF6B6B", "#A0AEC0"];

export default function PerformanceOptimizer() {
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied] = useState(false);

  return (
    <div className="performance-waves-bg min-h-screen text-white ml-64 p-8">

      {/* HEADER */}
      <div className="text-center mb-12 slide-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center">
          <FontAwesomeIcon icon={faRocket} size="2x" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Performance Optimizer</h1>
        <p className="text-gray-400">AI-powered insights to boost engagement</p>
      </div>

      {/* METRICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Metric title="Avg Engagement" value="4.7%" icon={faLightbulb} />
        <Metric title="Best Time" value="2:00 PM" icon={faClock} />
        <Metric title="Top Platform" value="LinkedIn" icon={faTrophy} />
      </div>

      {/* CHART */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">

        <div className="chart-container rounded-3xl p-6">
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

        <div className="chart-container rounded-3xl p-6">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faFire} /> Best Time
          </h3>
          <p className="text-gray-400">Tuesday 2PM peak engagement</p>
        </div>

      </div>

      {/* RECOMMENDATIONS */}
      <div className="glass-effect rounded-3xl p-8 mb-8">
        <h3 className="text-2xl mb-6 flex items-center gap-3">
          <FontAwesomeIcon icon={faBrain} /> AI Recommendations
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <Recommendation text="Shorten your opening" />
          <Recommendation text="Use story hook" />
          <Recommendation text="Add question CTA" />
          <Recommendation text="Post Tuesday 2PM" />
        </div>
      </div>

      {/* ACTION */}
      <div className="text-center">
        <button
          onClick={() => setShowModal(true)}
          className="apply-suggestions-btn px-10 py-4 rounded-3xl text-xl"
        >
          <FontAwesomeIcon icon={faMagicWandSparkles} /> Apply Suggestions
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="glass-effect rounded-3xl p-8 max-w-md">
            <h3 className="text-xl mb-4">Apply AI Recommendations?</h3>

            <div className="space-y-2 mb-4">
              <ModalItem text="Short hooks" />
              <ModalItem text="Story structure" />
              <ModalItem text="CTA questions" />
              <ModalItem text="Tuesday 2PM" />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-700 p-3 rounded-xl">Cancel</button>
              <button
                onClick={() => {
                  setApplied(true);
                  setShowModal(false);
                }}
                className="flex-1 gradient-accent p-3 rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Metric({ title, value, icon }) {
  return (
    <div className="metric-card glass-effect rounded-3xl p-6">
      <FontAwesomeIcon icon={icon} className="text-cyan-400 text-xl mb-2" />
      <div className="text-2xl font-bold metric-value">{value}</div>
      <div className="text-gray-400">{title}</div>
    </div>
  );
}

function Recommendation({ text }) {
  return (
    <div className="recommendation-item bg-black/20 p-4 rounded-xl">
      <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2" />
      {text}
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
