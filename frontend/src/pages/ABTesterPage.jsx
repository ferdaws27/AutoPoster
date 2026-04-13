import { useState, useEffect, useRef } from "react";
import {
  FaPlusCircle,
  FaRocket,
  FaCheck,
  FaClock,
  FaCrown,
  FaTrash,
  FaVials,
  FaTrophy,
  FaChartLine,
  FaCheckCircle,
  FaBrain,
  FaComments,
  FaHistory,
  FaPlay,
  FaSpinner,
} from "react-icons/fa";
import {
  createABTest,
  getABTests,
  runABTest,
  deleteABTest,
  getABStats,
} from "../services/api";

const VARIATION_OPTIONS = [
  { value: "tone", label: "Tone Variation (Professional vs Casual)" },
  { value: "structure", label: "Structure Variation (Story vs Direct)" },
  { value: "cta", label: "CTA Variation (Question vs Statement)" },
  { value: "length", label: "Length Variation (Short vs Detailed)" },
  { value: "emoji", label: "Emoji Variation (With vs Without)" },
];

const DURATION_OPTIONS = [
  { value: "24h", label: "24 Hours (Recommended)" },
  { value: "48h", label: "48 Hours" },
  { value: "72h", label: "72 Hours" },
  { value: "1w", label: "1 Week" },
];

const PLATFORM_LIST = [
  { name: "Twitter", key: "twitter", color: "cyan-400" },
  { name: "LinkedIn", key: "linkedin", color: "violet-400" },
  { name: "Medium", key: "medium", color: "teal-400" },
];

function statusBadge(status) {
  const map = {
    generating: ["bg-blue-400/20 text-blue-400", "Generating..."],
    ready: ["bg-cyan-400/20 text-cyan-400", "Ready"],
    running: ["bg-yellow-400/20 text-yellow-400", "Running..."],
    completed: ["bg-green-400/20 text-green-400", "Completed"],
    error: ["bg-red-400/20 text-red-400", "Error"],
    pending: ["bg-gray-400/20 text-gray-400", "Pending"],
  };
  const [cls, text] = map[status] || map.pending;
  return <span className={`px-3 py-1 text-xs rounded-full ${cls}`}>{text}</span>;
}

function dotColor(status) {
  const m = {
    generating: "bg-blue-400",
    ready: "bg-cyan-400",
    running: "bg-yellow-400",
    completed: "bg-green-400",
    error: "bg-red-400",
  };
  return m[status] || "bg-gray-400";
}

export default function ABTesterPage() {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [variationType, setVariationType] = useState("tone");
  const [duration, setDuration] = useState("24h");
  const [platforms, setPlatforms] = useState(["twitter", "linkedin"]);
  const [creating, setCreating] = useState(false);

  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    avg_improvement: "+0%",
    win_rate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  async function fetchAll() {
    try {
      const [t, s] = await Promise.all([getABTests(), getABStats()]);
      setTests(t);
      setStats(s);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setCreating(true);
    try {
      await createABTest({
        content,
        variation_type: variationType,
        platforms,
        duration,
        name,
      });
      setContent("");
      setName("");
      await fetchAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRun(testId) {
    try {
      await runABTest(testId);
      await fetchAll();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(testId) {
    if (!confirm("Delete this A/B test?")) return;
    try {
      await deleteABTest(testId);
      await fetchAll();
    } catch (err) {
      alert(err.message);
    }
  }

  function togglePlatform(key) {
    setPlatforms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  const activeTests = tests.filter((t) =>
    ["generating", "ready", "running"].includes(t.status)
  );
  const completedTests = tests.filter((t) => t.status === "completed");

  return (
    <div id="main-content" className="p-8">
      {/* Header */}
      <div className="mb-12 text-center max-w-4xl mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center float-animation">
          <FaVials className="text-3xl text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Post A/B Tester — Optimize Your Content Performance
        </h1>
        <p className="text-xl text-gray-300 mb-2">
          Write your post, AI generates two variations, simulate engagement, and
          pick the winner
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        {[
          {
            label: "Active Tests",
            value: stats.active,
            icon: <FaVials className="text-cyan-400" />,
            bg: "bg-cyan-400/20",
          },
          {
            label: "Win Rate",
            value: stats.win_rate,
            icon: <FaTrophy className="text-green-400" />,
            bg: "bg-green-400/20",
          },
          {
            label: "Avg. Improvement",
            value: stats.avg_improvement,
            icon: <FaChartLine className="text-violet-400" />,
            bg: "bg-violet-400/20",
          },
          {
            label: "Tests Completed",
            value: stats.completed,
            icon: <FaCheckCircle className="text-yellow-400" />,
            bg: "bg-yellow-400/20",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="glass-effect rounded-2xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Test */}
      <form
        onSubmit={handleCreate}
        className="glass-effect rounded-3xl p-8 mb-8 slide-up"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaPlusCircle className="text-cyan-400 mr-3" /> Create New A/B Test
          </h2>
          <button
            type="submit"
            disabled={creating || !content.trim()}
            className="px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center"
          >
            {creating ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaRocket className="mr-2" />
            )}
            {creating ? "Generating..." : "Start Test"}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-white font-medium mb-3">
              Test Name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Launch Announcement"
              className="w-full mb-4 bg-black/20 border border-gray-700/50 rounded-2xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
            />
            <label className="block text-white font-medium mb-3">
              Your Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post idea here. AI will generate two variations from it..."
              className="w-full h-40 bg-black/20 border border-gray-700/50 rounded-2xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-400/50 transition-all"
            />
          </div>

          <div className="space-y-4">
            <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Platforms to Test
                </label>
              <div className="flex space-x-3">
                {PLATFORM_LIST.map((p) => (
                  <label
                    key={p.key}
                    className="flex items-center space-x-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={platforms.includes(p.key)}
                      onChange={() => togglePlatform(p.key)}
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        platforms.includes(p.key)
                          ? `bg-${p.color} border-${p.color}`
                          : "border-gray-600"
                      }`}
                    >
                      {platforms.includes(p.key) && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                    <span className="text-gray-300 text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Variation Type
              </label>
              <select
                value={variationType}
                onChange={(e) => setVariationType(e.target.value)}
                className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50"
              >
                {VARIATION_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Test Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>

      {/* Active Tests */}
      {activeTests.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaClock className="text-yellow-400 mr-3" /> Active Tests
            </h2>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span>Live monitoring</span>
            </div>
          </div>
          <div className="grid gap-6">
            {activeTests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onRun={handleRun}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center mb-6">
            <FaHistory className="text-gray-400 mr-3" /> Completed Tests
          </h2>
          <div className="grid gap-6">
            {completedTests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onRun={handleRun}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Learning Insights */}
      {completedTests.length >= 2 && (
        <InsightsSection tests={completedTests} />
      )}

      {/* Empty state */}
      {!loading && tests.length === 0 && (
        <div className="text-center text-gray-500 py-20">
          <FaVials className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="text-lg">
            No A/B tests yet. Create one above to start optimising!
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════ TEST CARD ═══════ */
function TestCard({ test, onRun, onDelete }) {
  const isCompleted = test.status === "completed";
  const isReady = test.status === "ready";
  const isRunning = test.status === "running";
  const isGenerating = test.status === "generating";

  const aScore =
    (test.variant_a?.likes || 0) +
    (test.variant_a?.comments || 0) * 3 +
    (test.variant_a?.shares || 0) * 5;
  const bScore =
    (test.variant_b?.likes || 0) +
    (test.variant_b?.comments || 0) * 3 +
    (test.variant_b?.shares || 0) * 5;
  const aLeading = aScore >= bScore;

  return (
    <div
      className={`glass-effect rounded-3xl p-6 border slide-up ${
        isCompleted ? "border-green-400/30" : "border-gray-700/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${dotColor(test.status)} ${
              isRunning || isGenerating ? "animate-pulse" : ""
            }`}
          />
          <span className="text-white font-medium">{test.name}</span>
          {statusBadge(test.status)}
        </div>
        <div className="flex items-center space-x-3">
          {test.platforms?.map((p) => (
            <span key={p} className="text-gray-500 text-xs capitalize">
              {p}
            </span>
          ))}
          {test.created_at && (
            <span className="text-gray-500 text-xs">
              {new Date(test.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <FaSpinner className="animate-spin text-2xl mr-3" />
          <span>AI is generating two variations from your content...</span>
        </div>
      )}

      {!isGenerating && test.variant_a?.content && (
        <div className="grid lg:grid-cols-2 gap-6">
          <VariantCard
            variant={test.variant_a}
            letter="A"
            isWinner={isCompleted && test.winner === "A"}
            isLoser={isCompleted && test.winner === "B"}
            leading={!isCompleted && aLeading}
            color="cyan"
          />
          <VariantCard
            variant={test.variant_b}
            letter="B"
            isWinner={isCompleted && test.winner === "B"}
            isLoser={isCompleted && test.winner === "A"}
            leading={!isCompleted && !aLeading}
            color="violet"
          />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isReady && (
            <button
              onClick={() => onRun(test._id)}
              className="px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30 transition-colors flex items-center"
            >
              <FaPlay className="mr-2" /> Run Simulation
            </button>
          )}
          <button
            onClick={() => onDelete(test._id)}
            className="px-4 py-2 bg-black/30 rounded-xl text-gray-400 hover:text-red-400 transition-colors flex items-center"
          >
            <FaTrash className="mr-2" /> Delete
          </button>
        </div>

        {isCompleted && test.improvement && (
          <div className="text-right">
            <span className="text-green-400 font-medium mr-2">
              <FaCrown className="inline mr-1 text-yellow-400" />
              Winner: Variant {test.winner}
            </span>
            <span
              className={`font-medium ${
                test.improvement.startsWith("+")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              ({test.improvement})
            </span>
          </div>
        )}

        {isRunning && (
          <div className="text-gray-400 text-sm flex items-center">
            <FaSpinner className="animate-spin mr-2" /> Simulating
            engagement...
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ VARIANT CARD ═══════ */
function VariantCard({ variant, letter, isWinner, isLoser, leading, color }) {
  const borderCls = isWinner
    ? "border-green-400/30 bg-green-400/10"
    : "border-gray-700/50 bg-black/20";
  const textColor = isWinner
    ? "text-green-400"
    : isLoser
    ? "text-red-400"
    : `text-${color}-400`;
  const badgeColor = isWinner
    ? "bg-green-400"
    : isLoser
    ? "bg-red-400"
    : `bg-${color}-400`;

  return (
    <div
      className={`rounded-2xl p-5 border ${borderCls} ${
        isLoser ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium flex items-center">
          <span
            className={`w-6 h-6 ${badgeColor} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2`}
          >
            {letter}
          </span>
          {variant.label || `Variant ${letter}`}
          {isWinner && <FaCrown className="text-yellow-400 ml-2" />}
        </h4>
        {isWinner && (
          <span className="text-green-400 text-sm font-medium">WINNER</span>
        )}
        {isLoser && <span className="text-red-400 text-sm">Lost</span>}
        {!isWinner && !isLoser && leading && (
          <span className={`${textColor} text-sm`}>Leading</span>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-4">
        {variant.content}
      </p>

      {(variant.likes > 0 ||
        variant.comments > 0 ||
        variant.shares > 0) && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Likes", value: variant.likes },
              { label: "Comments", value: variant.comments },
              { label: "Shares", value: variant.shares },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <div className={`text-xl font-bold ${textColor}`}>
                  {m.value?.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Engagement Rate</span>
            <span className={`${textColor} font-medium`}>
              {variant.engagement_rate}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════ INSIGHTS ═══════ */
function InsightsSection({ tests }) {
  const typeCounts = {};
  tests.forEach((t) => {
    const vt = t.variation_type || "tone";
    if (!typeCounts[vt])
      typeCounts[vt] = { total: 0, aWins: 0, bWins: 0, improvements: [] };
    typeCounts[vt].total++;
    if (t.winner === "A") typeCounts[vt].aWins++;
    else typeCounts[vt].bWins++;
    const imp = parseInt((t.improvement || "0").replace(/[+%]/g, ""), 10);
    if (!isNaN(imp)) typeCounts[vt].improvements.push(imp);
  });

  const insights = Object.entries(typeCounts).map(([type, data]) => {
    const avgImp = data.improvements.length
      ? Math.round(
          data.improvements.reduce((a, b) => a + b, 0) /
            data.improvements.length
        )
      : 0;
    const confidence = Math.min(95, 50 + data.total * 10);
    const labels =
      VARIATION_OPTIONS.find((v) => v.value === type)?.label || type;
    return { type, labels, avgImp, confidence, ...data };
  });

  return (
    <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <FaBrain className="text-violet-400 mr-3" /> AI Learning Insights
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((ins) => (
          <div
            key={ins.type}
            className="rounded-2xl p-6 border border-violet-400/30 bg-black/20"
          >
            <div className="w-12 h-12 mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center">
              <FaComments className="text-violet-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">{ins.labels}</h3>
            <p className="text-gray-400 text-sm mb-1">
              Tested {ins.total} time{ins.total > 1 ? "s" : ""} — avg
              improvement{" "}
              <span className="text-green-400">+{ins.avgImp}%</span>
            </p>
            <p className="text-gray-400 text-sm mb-3">
              A wins: {ins.aWins} | B wins: {ins.bWins}
            </p>
            <div className="text-violet-400 text-sm font-medium">
              Confidence: {ins.confidence}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
