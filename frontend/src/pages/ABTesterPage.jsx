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
  pauseABTest,
  getABStats,
  aiAssistABTest,
  getABTestAnalysis,
  getABInsights,
  getABSettings,
  saveABSettings,
} from "../services/api";
import { FaPause, FaChartBar, FaMagic, FaBolt, FaCompressAlt, FaFire, FaPen, FaChevronDown, FaLightbulb, FaTimes, FaStar, FaEye, FaHandPointUp, FaDownload, FaCog, FaSave, FaBell } from "react-icons/fa";

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
  const [aiAssisting, setAiAssisting] = useState(false);
  const [aiAction, setAiAction] = useState(null);

  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    avg_improvement: "+0%",
    win_rate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
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

  async function handleAiAssist(action) {
    if (!content.trim()) return;
    setAiAssisting(true);
    setAiAction(action);
    try {
      const res = await aiAssistABTest(content, action);
      if (res.result) setContent(res.result);
    } catch (err) {
      alert(err.message);
    } finally {
      setAiAssisting(false);
      setAiAction(null);
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

  async function handlePause(testId) {
    try {
      await pauseABTest(testId);
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

            {/* AI Writing Assistant */}
            <div className="mt-3 p-4 rounded-2xl border border-violet-400/30 bg-violet-400/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FaMagic className="text-violet-400" />
                  <span className="text-white text-sm font-medium">AI Writing Assistant</span>
                </div>
                {aiAssisting && (
                  <div className="flex items-center text-violet-400 text-xs">
                    <FaSpinner className="animate-spin mr-1" /> Working...
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { action: "generate", label: "Generate Post", icon: <FaPen className="mr-1.5" /> },
                  { action: "improve", label: "Improve", icon: <FaMagic className="mr-1.5" /> },
                  { action: "hook", label: "Better Hook", icon: <FaBolt className="mr-1.5" /> },
                  { action: "shorter", label: "Make Shorter", icon: <FaCompressAlt className="mr-1.5" /> },
                  { action: "engaging", label: "More Engaging", icon: <FaFire className="mr-1.5" /> },
                ].map((btn) => (
                  <button
                    key={btn.action}
                    type="button"
                    disabled={aiAssisting || !content.trim()}
                    onClick={() => handleAiAssist(btn.action)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center transition-all disabled:opacity-40 ${
                      aiAction === btn.action
                        ? "bg-violet-400 text-white"
                        : "bg-violet-400/15 text-violet-300 hover:bg-violet-400/30"
                    }`}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
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
                onPause={handlePause}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowCompleted((prev) => !prev)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${
              showCompleted
                ? "glass-effect border-green-400/40 shadow-lg shadow-green-400/5"
                : "glass-effect border-gray-700/50 hover:border-green-400/30"
            }`}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                showCompleted ? "bg-green-400/20" : "bg-gray-700/30 group-hover:bg-green-400/10"
              }`}>
                <FaHistory className={`transition-colors ${showCompleted ? "text-green-400" : "text-gray-400 group-hover:text-green-400"}`} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white flex items-center">
                  Completed Tests
                  <span className="ml-2.5 px-2 py-0.5 text-xs font-semibold bg-green-400/20 text-green-400 rounded-full">
                    {completedTests.length}
                  </span>
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {showCompleted ? "Click to collapse" : "Click to view past results"}
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              showCompleted
                ? "bg-green-400/20 text-green-400 rotate-180"
                : "bg-gray-700/30 text-gray-400 group-hover:bg-green-400/10 group-hover:text-green-400"
            }`}>
              <FaChevronDown className="text-sm transition-transform duration-300" />
            </div>
          </button>
          {showCompleted && (
            <div className="grid gap-6 mt-6">
              {completedTests.map((test) => (
                <TestCard
                  key={test._id}
                  test={test}
                  onRun={handleRun}
                  onPause={handlePause}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Learning Insights */}
      {completedTests.length >= 1 && (
        <InsightsSection tests={completedTests} />
      )}

      {/* Performance Analytics */}
      {tests.filter((t) => t.status === "running" || t.status === "completed").length >= 1 && (
        <PerformanceAnalytics tests={tests.filter((t) => t.status === "running" || t.status === "completed")} />
      )}

      {/* Test History */}
      {completedTests.length >= 1 && (
        <TestHistory tests={completedTests} />
      )}

      {/* A/B Test Settings */}
      <ABTestSettings />

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
function getRemainingTime(test) {
  if (!test.started_at || !test.total_rounds || !test.current_round) return null;
  const remainingRounds = test.total_rounds - test.current_round;
  const remainingMinutes = remainingRounds * 1;
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

function TestCard({ test, onRun, onPause, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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

  const remaining = isRunning ? getRemainingTime(test) : null;
  const platformText = test.platforms?.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
  const totalImpressions = test.total_impressions || 0;

  async function handleViewDetails() {
    if (showDetails) {
      setShowDetails(false);
      return;
    }
    setShowDetails(true);
    if (!analysis) {
      setLoadingAnalysis(true);
      try {
        const res = await getABTestAnalysis(test._id);
        setAnalysis(res);
      } catch (err) {
        setAnalysis({ summary: "Could not load analysis. Try again later." });
      } finally {
        setLoadingAnalysis(false);
      }
    }
  }

  const progressPct = test.current_round && test.total_rounds
    ? Math.round((test.current_round / test.total_rounds) * 100)
    : 0;

  const statusClass = isRunning ? "test-card-running" : isCompleted ? "test-card-completed" : isReady ? "test-card-ready" : "test-card-generating";

  return (
    <div
      className={`test-card ${statusClass} glass-effect rounded-3xl border slide-up ${
        isCompleted ? "border-green-400/30" : isRunning ? "border-yellow-400/20" : "border-gray-700/50"
      }`}
    >
      {/* Progress bar for running tests */}
      {isRunning && (
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 progress-pulse rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isRunning ? "bg-yellow-400/15" : isCompleted ? "bg-green-400/15" : isReady ? "bg-cyan-400/15" : "bg-blue-400/15"
            }`}>
              {isRunning ? (
                <FaClock className="text-yellow-400" />
              ) : isCompleted ? (
                <FaCheckCircle className="text-green-400" />
              ) : isGenerating ? (
                <FaSpinner className="animate-spin text-blue-400" />
              ) : (
                <FaVials className="text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{test.name}</span>
                {isRunning ? (
                  <span className="px-2.5 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs font-medium rounded-full">
                    In Progress
                  </span>
                ) : (
                  statusBadge(test.status)
                )}
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                {test.platforms?.map((p) => (
                  <span key={p} className="text-gray-500 text-xs capitalize">{p}</span>
                ))}
                {test.platforms?.length > 0 && test.created_at && (
                  <span className="text-gray-700 text-xs">&bull;</span>
                )}
                {test.created_at && (
                  <span className="text-gray-500 text-xs">
                    {new Date(test.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isRunning && remaining && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-400/10 rounded-xl">
                <FaClock className="text-yellow-400 text-xs" />
                <span className="text-yellow-400 text-sm font-medium">{remaining}</span>
              </div>
            )}
            {isRunning && test.current_round && (
              <div className="text-gray-500 text-xs">
                Round {test.current_round}/{test.total_rounds}
              </div>
            )}
          </div>
        </div>

      {/* Generating state */}
      {isGenerating && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <FaSpinner className="animate-spin text-2xl mr-3" />
          <span>AI is generating two variations from your content...</span>
        </div>
      )}

      {/* Variant cards */}
      {!isGenerating && test.variant_a?.content && (
        <div className="grid lg:grid-cols-2 gap-6">
          <VariantCard
            variant={test.variant_a}
            letter="A"
            isWinner={isCompleted && test.winner === "A"}
            isLoser={isCompleted && test.winner === "B"}
            leading={!isCompleted && isRunning && aLeading}
            behind={!isCompleted && isRunning && !aLeading}
            showStats={isRunning || isCompleted}
            color="cyan"
          />
          <VariantCard
            variant={test.variant_b}
            letter="B"
            isWinner={isCompleted && test.winner === "B"}
            isLoser={isCompleted && test.winner === "A"}
            leading={!isCompleted && isRunning && !aLeading}
            behind={!isCompleted && isRunning && aLeading}
            showStats={isRunning || isCompleted}
            color="violet"
          />
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isReady && (
            <button
              onClick={() => onRun(test._id)}
              className="px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30 transition-colors flex items-center"
            >
              <FaPlay className="mr-2" /> Run Simulation
            </button>
          )}
          {isRunning && (
            <>
              <button
                onClick={() => onPause(test._id)}
                className="px-4 py-2 bg-black/30 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <FaPause className="mr-2" /> Pause Test
              </button>
              <button
                onClick={handleViewDetails}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center ${
                  showDetails
                    ? "bg-violet-400/20 text-violet-400"
                    : "bg-black/30 text-gray-400 hover:text-white"
                }`}
              >
                <FaChartBar className="mr-2" /> {showDetails ? "Hide Details" : "View Details"}
              </button>
            </>
          )}
          {isCompleted && (
            <>
              <button
                onClick={handleViewDetails}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center ${
                  showDetails
                    ? "bg-violet-400/20 text-violet-400"
                    : "bg-black/30 text-gray-400 hover:text-white"
                }`}
              >
                <FaChartBar className="mr-2" /> {showDetails ? "Hide Details" : "View Details"}
              </button>
              <button
                onClick={() => onDelete(test._id)}
                className="px-4 py-2 bg-black/30 rounded-xl text-gray-400 hover:text-red-400 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </>
          )}
          {!isRunning && !isCompleted && (
            <button
              onClick={() => onDelete(test._id)}
              className="px-4 py-2 bg-black/30 rounded-xl text-gray-400 hover:text-red-400 transition-colors flex items-center"
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          )}
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
          <div className="text-gray-400 text-sm">
            Posted on {platformText} &bull; {totalImpressions.toLocaleString()} total impressions
          </div>
        )}
      </div>

      {/* ── View Details Panel ── */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          {loadingAnalysis ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <FaSpinner className="animate-spin text-xl mr-3" />
              <span>AI is analyzing your test...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* AI Summary */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-violet-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaMagic className="text-violet-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">AI Writing Assistant Update</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
                </div>
              </div>

              {/* Variant Analysis Cards */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Variant A Analysis */}
                <div className="rounded-xl p-4 border border-cyan-400/20 bg-cyan-400/5">
                  <div className="flex items-center mb-3">
                    <span className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">A</span>
                    <span className="text-white text-sm font-medium">{test.variant_a?.label || "Variant A"}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">{analysis.variant_a_analysis}</p>

                  {analysis.hook_quality_a && (
                    <div className="space-y-2">
                      <ScoreBar label="Hook Quality" score={analysis.hook_quality_a} color="cyan" />
                      <ScoreBar label="Readability" score={analysis.readability_a} color="cyan" />
                      <ScoreBar label="Engagement Potential" score={analysis.engagement_potential_a} color="cyan" />
                    </div>
                  )}
                </div>

                {/* Variant B Analysis */}
                <div className="rounded-xl p-4 border border-violet-400/20 bg-violet-400/5">
                  <div className="flex items-center mb-3">
                    <span className="w-5 h-5 bg-violet-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">B</span>
                    <span className="text-white text-sm font-medium">{test.variant_b?.label || "Variant B"}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">{analysis.variant_b_analysis}</p>

                  {analysis.hook_quality_b && (
                    <div className="space-y-2">
                      <ScoreBar label="Hook Quality" score={analysis.hook_quality_b} color="violet" />
                      <ScoreBar label="Readability" score={analysis.readability_b} color="violet" />
                      <ScoreBar label="Engagement Potential" score={analysis.engagement_potential_b} color="violet" />
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              {analysis.recommendation && (
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
                  <FaLightbulb className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-400 text-xs font-semibold mb-1">RECOMMENDATION</h4>
                    <p className="text-gray-300 text-sm">{analysis.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Test Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Type", value: test.variation_type?.charAt(0).toUpperCase() + test.variation_type?.slice(1), icon: <FaVials className="text-cyan-400" /> },
                  { label: "Duration", value: test.duration, icon: <FaClock className="text-yellow-400" /> },
                  { label: "Impressions", value: totalImpressions.toLocaleString(), icon: <FaEye className="text-violet-400" /> },
                  { label: "Round", value: test.current_round ? `${test.current_round}/${test.total_rounds}` : "—", icon: <FaHandPointUp className="text-green-400" /> },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg p-3 bg-black/20 border border-gray-700/30 text-center">
                    <div className="flex justify-center mb-1">{item.icon}</div>
                    <div className="text-white text-sm font-medium">{item.value}</div>
                    <div className="text-gray-500 text-xs">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Refresh analysis */}
              <div className="flex justify-end">
                <button
                  onClick={() => { setAnalysis(null); handleViewDetails(); }}
                  className="px-3 py-1.5 text-xs bg-violet-400/15 text-violet-300 hover:bg-violet-400/30 rounded-lg transition-colors flex items-center"
                >
                  <FaMagic className="mr-1.5" /> Refresh Analysis
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </div>
  );
}

/* ═══════ SCORE BAR ═══════ */
function ScoreBar({ label, score, color }) {
  const pct = Math.min(Math.max((score || 0) * 10, 0), 100);
  const barColor = color === "cyan" ? "bg-cyan-400" : "bg-violet-400";
  const textColor = color === "cyan" ? "text-cyan-400" : "text-violet-400";
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-500 text-xs w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`${textColor} text-xs font-medium w-6 text-right`}>{score}</span>
    </div>
  );
}

/* ═══════ VARIANT CARD ═══════ */
function VariantCard({ variant, letter, isWinner, isLoser, leading, behind, showStats, color }) {
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
  const accentClass = isWinner
    ? "variant-card-green"
    : `variant-card-${color}`;

  const hasStats = showStats && (variant.likes > 0 || variant.comments > 0 || variant.shares > 0);

  return (
    <div
      className={`variant-card ${accentClass} rounded-2xl p-5 border ${borderCls} ${
        isLoser ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium flex items-center">
          <span
            className={`w-7 h-7 ${badgeColor} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2.5 shadow-lg`}
          >
            {letter}
          </span>
          {variant.label || `Variant ${letter}`}
          {isWinner && <FaCrown className="text-yellow-400 ml-2" />}
        </h4>
        {isWinner && (
          <span className="px-2.5 py-0.5 bg-green-400/20 text-green-400 text-xs font-semibold rounded-full">WINNER</span>
        )}
        {isLoser && <span className="px-2.5 py-0.5 bg-red-400/20 text-red-400 text-xs rounded-full">Lost</span>}
        {leading && (
          <span className={`px-2.5 py-0.5 bg-${color}-400/15 ${textColor} text-xs font-medium rounded-full`}>Leading</span>
        )}
        {behind && (
          <span className="px-2.5 py-0.5 bg-gray-700/30 text-gray-400 text-xs rounded-full">Behind</span>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-4 leading-relaxed">
        {variant.content}
      </p>

      {hasStats && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Likes", value: variant.likes, icon: "♥" },
              { label: "Comments", value: variant.comments, icon: "💬" },
              { label: "Shares", value: variant.shares, icon: "↗" },
            ].map((m, i) => (
              <div key={i} className="text-center p-2 rounded-xl bg-black/20">
                <div className={`text-lg font-bold ${textColor}`}>
                  {m.value?.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/15">
            <span className="text-gray-400 text-sm">Engagement Rate</span>
            <span className={`${textColor} font-semibold text-sm`}>
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
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadInsights() {
    setLoading(true);
    setError(null);
    try {
      const res = await getABInsights();
      setInsights(res);
    } catch (err) {
      setError(err.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tests.length >= 1) loadInsights();
  }, [tests.length]);

  const cards = insights ? [
    {
      key: "tone",
      title: "Tone Preference",
      icon: <FaComments className="text-cyan-400" />,
      iconBg: "bg-cyan-400/15",
      border: "border-cyan-400/20",
      accentText: "text-cyan-400",
      data: insights.tone_preference,
      mainValue: insights.tone_preference?.winning_tone,
    },
    {
      key: "timing",
      title: "Optimal Timing",
      icon: <FaClock className="text-yellow-400" />,
      iconBg: "bg-yellow-400/15",
      border: "border-yellow-400/20",
      accentText: "text-yellow-400",
      data: insights.optimal_timing,
      mainValue: insights.optimal_timing?.best_duration,
    },
    {
      key: "length",
      title: "Content Length",
      icon: <FaChartLine className="text-violet-400" />,
      iconBg: "bg-violet-400/15",
      border: "border-violet-400/20",
      accentText: "text-violet-400",
      data: insights.content_length,
      mainValue: insights.content_length?.optimal,
    },
  ] : [];

  return (
    <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-400/15 flex items-center justify-center">
            <FaBrain className="text-violet-400 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Learning Insights</h2>
            <p className="text-gray-500 text-xs">Patterns discovered from {tests.length} completed test{tests.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-violet-400/15 text-violet-300 hover:bg-violet-400/30 rounded-lg transition-colors flex items-center disabled:opacity-40"
        >
          {loading ? <FaSpinner className="animate-spin mr-1.5" /> : <FaMagic className="mr-1.5" />}
          {loading ? "Analyzing..." : "Refresh Insights"}
        </button>
      </div>

      {loading && !insights && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <FaSpinner className="animate-spin text-2xl mr-3" />
          <span>AI is analyzing your test history...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* 3 Insight Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {cards.map((card) => (
              <div
                key={card.key}
                className={`rounded-2xl p-5 border ${card.border} bg-black/20 hover:bg-black/30 transition-colors`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{card.title}</h3>
                    {card.mainValue && (
                      <span className={`${card.accentText} text-xs font-medium`}>{card.mainValue}</span>
                    )}
                  </div>
                </div>

                {card.data?.description && (
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">{card.data.description}</p>
                )}

                {card.data?.confidence && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 text-xs">Confidence</span>
                      <span className={`${card.accentText} text-xs font-medium`}>{card.data.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          card.key === "tone" ? "bg-cyan-400" : card.key === "timing" ? "bg-yellow-400" : "bg-violet-400"
                        }`}
                        style={{ width: `${card.data.confidence}%` }}
                      />
                    </div>
                  </div>
                )}

                {card.data?.tip && (
                  <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-black/20 border border-gray-700/30">
                    <FaLightbulb className="text-yellow-400 text-xs mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-xs leading-relaxed">{card.data.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Recommendation */}
          {insights.overall_recommendation && (
            <div className="flex items-start space-x-3 p-5 rounded-xl bg-violet-400/5 border border-violet-400/20">
              <div className="w-8 h-8 rounded-lg bg-violet-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaBrain className="text-violet-400 text-sm" />
              </div>
              <div>
                <h4 className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">Overall Recommendation</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{insights.overall_recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════ PERFORMANCE ANALYTICS ═══════ */
function PerformanceAnalytics({ tests }) {
  // ── Win rates per platform (from completed tests with a winner) ──
  const platformStats = {};
  tests.forEach((t) => {
    (t.platforms || []).forEach((p) => {
      if (!platformStats[p]) platformStats[p] = { wins: 0, total: 0 };
      platformStats[p].total += 1;
      if (t.winner) platformStats[p].wins += 1;
    });
  });

  const platformMeta = {
    twitter: { label: "Twitter", icon: "fa-brands fa-twitter", color: "text-blue-400", bg: "bg-blue-400" },
    linkedin: { label: "LinkedIn", icon: "fa-brands fa-linkedin", color: "text-blue-600", bg: "bg-blue-600" },
    medium: { label: "Medium", icon: "fa-brands fa-medium", color: "text-green-400", bg: "bg-green-400" },
  };

  const platformRows = Object.entries(platformStats).map(([key, { wins, total }]) => {
    const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const meta = platformMeta[key] || { label: key, icon: "fa-solid fa-globe", color: "text-gray-400", bg: "bg-gray-400" };
    return { key, rate, meta, total };
  });

  // ── Improvement trend — per round (minute-by-minute) ──
  // Collect round-level data: prefer rounds_history, fallback to current variant stats
  const roundPoints = [];
  tests.forEach((t) => {
    if (t.rounds_history && t.rounds_history.length > 0) {
      t.rounds_history.forEach((r) => {
        roundPoints.push({ round: r.round, improvementPct: r.improvement_pct || 0 });
      });
    } else {
      // Fallback for tests without rounds_history
      const va = t.variant_a || {};
      const vb = t.variant_b || {};
      const aScore = (va.likes || 0) + (va.comments || 0) * 3 + (va.shares || 0) * 5;
      const bScore = (vb.likes || 0) + (vb.comments || 0) * 3 + (vb.shares || 0) * 5;
      if (aScore + bScore > 0) {
        const delta = Math.abs(aScore - bScore);
        const loser = Math.min(aScore, bScore);
        const impPct = loser > 0 ? Math.round((delta / loser) * 100) : (delta > 0 ? 100 : 0);
        const totalRounds = t.current_round || t.total_rounds || 1;
        for (let r = 1; r <= totalRounds; r++) {
          // Simulate a ramp: scale linearly from 0 to final improvement
          roundPoints.push({ round: r, improvementPct: Math.round((impPct * r) / totalRounds) });
        }
      }
    }
  });

  // Group by round number and average
  const roundBuckets = {};
  roundPoints.forEach((rp) => {
    if (!roundBuckets[rp.round]) roundBuckets[rp.round] = [];
    roundBuckets[rp.round].push(rp.improvementPct);
  });

  const sortedRounds = Object.keys(roundBuckets).map(Number).sort((a, b) => a - b);
  const roundData = sortedRounds.map((rn) => {
    const arr = roundBuckets[rn];
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    return { round: rn, avg };
  });

  const recentRounds = roundData.slice(-12);
  const maxAvg = Math.max(...recentRounds.map((r) => r.avg), 1);

  return (
    <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-400/15 flex items-center justify-center">
          <FaChartLine className="text-cyan-400 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
          <p className="text-gray-500 text-xs">Based on {tests.length} test{tests.length !== 1 ? "s" : ""} &middot; {roundPoints.length} data point{roundPoints.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Win Rate by Platform */}
        <div className="bg-black/20 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Win Rate by Platform</h3>
          <div className="space-y-4">
            {platformRows.length === 0 && (
              <p className="text-gray-500 text-sm">No platform data yet.</p>
            )}
            {platformRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className={`${row.meta.icon} ${row.meta.color}`} />
                  <span className="text-gray-300">{row.meta.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${row.meta.bg} rounded-full transition-all duration-700`}
                      style={{ width: `${row.rate}%` }}
                    />
                  </div>
                  <span className={`${row.meta.color} font-medium text-sm min-w-[2.5rem] text-right`}>{row.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Trends — by minute */}
        <div className="bg-black/20 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Average Improvement Over Time</h3>
          {recentRounds.length === 0 ? (
            <p className="text-gray-500 text-sm">Run a test to see improvement trends.</p>
          ) : (
            <>
              <div className="h-40 flex items-end space-x-1">
                {recentRounds.map((r, i) => {
                  const pct = Math.max((r.avg / maxAvg) * 100, 5);
                  const opacity = 0.2 + (i / Math.max(recentRounds.length - 1, 1)) * 0.8;
                  return (
                    <div
                      key={r.round}
                      className="flex-1 rounded-t transition-all duration-500 relative group"
                      style={{
                        height: `${pct}%`,
                        backgroundColor: `rgba(34,211,238,${opacity.toFixed(2)})`,
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-cyan-300 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        +{r.avg.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-gray-400 text-[10px] mt-2 overflow-hidden">
                {recentRounds.map((r) => (
                  <span key={r.round} className="truncate">Min {r.round}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════ TEST HISTORY ═══════ */
const PLATFORM_ICONS = {
  twitter: { icon: "fa-brands fa-twitter", color: "text-blue-400" },
  linkedin: { icon: "fa-brands fa-linkedin", color: "text-blue-600" },
  medium: { icon: "fa-brands fa-medium", color: "text-green-400" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function TestHistory({ tests }) {
  function exportAllCSV() {
    const header = "Test Name,Platform,Winner,Improvement,Date\n";
    const rows = tests.map((t) => {
      const platforms = (t.platforms || []).join("/");
      const winner = t.winner ? `Variant ${t.winner}` : "No winner";
      const imp = t.improvement || "—";
      const date = t.completed_at || t.created_at || "";
      return `"${t.name || "Untitled"}","${platforms}","${winner}","${imp}","${date}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ab_test_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSingleCSV(t) {
    const header = "Field,Value\n";
    const rows = [
      `"Name","${t.name || "Untitled"}"`,
      `"Platforms","${(t.platforms || []).join(", ")}"`,
      `"Winner","Variant ${t.winner || "—"}"`,
      `"Improvement","${t.improvement || "—"}"`,
      `"Variant A Likes","${t.variant_a?.likes || 0}"`,
      `"Variant A Comments","${t.variant_a?.comments || 0}"`,
      `"Variant A Shares","${t.variant_a?.shares || 0}"`,
      `"Variant B Likes","${t.variant_b?.likes || 0}"`,
      `"Variant B Comments","${t.variant_b?.comments || 0}"`,
      `"Variant B Shares","${t.variant_b?.shares || 0}"`,
      `"Created","${t.created_at || ""}"`,
      `"Completed","${t.completed_at || ""}"`,
    ].join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ab_test_${(t.name || "test").replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 flex items-center justify-center">
            <FaHistory className="text-cyan-400 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Test History</h2>
            <p className="text-gray-500 text-xs">{tests.length} completed test{tests.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={exportAllCSV}
          className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-cyan-400 hover:bg-cyan-400/20 transition-all flex items-center text-sm group"
        >
          <FaDownload className="mr-2 group-hover:animate-bounce" />
          Export All
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-700/30 bg-black/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/40 bg-white/[0.02]">
              <th className="text-left text-gray-500 font-semibold uppercase tracking-wider py-3.5 px-5 text-[11px]">Test Name</th>
              <th className="text-left text-gray-500 font-semibold uppercase tracking-wider py-3.5 px-5 text-[11px]">Platform</th>
              <th className="text-left text-gray-500 font-semibold uppercase tracking-wider py-3.5 px-5 text-[11px]">Winner</th>
              <th className="text-left text-gray-500 font-semibold uppercase tracking-wider py-3.5 px-5 text-[11px]">Improvement</th>
              <th className="text-left text-gray-500 font-semibold uppercase tracking-wider py-3.5 px-5 text-[11px]">Date</th>
              <th className="text-right text-gray-500 font-semibold uppercase tracking-wider py-3.5 px-5 text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t, idx) => {
              const imp = t.improvement || "—";
              const isPositive = typeof imp === "string" && imp.startsWith("+");
              const impColor = isPositive ? "text-green-400" : "text-red-400";
              const impBg = isPositive ? "bg-green-400/10" : "bg-red-400/10";
              const isLast = idx === tests.length - 1;
              return (
                <tr
                  key={t._id}
                  className={`${!isLast ? "border-b border-gray-700/20" : ""} hover:bg-white/[0.03] transition-colors group`}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPositive ? "bg-green-400" : "bg-red-400"}`} />
                      <span className="text-white text-sm font-medium">{t.name || "Untitled Test"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex space-x-1.5">
                      {(t.platforms || []).map((p) => {
                        const pm = PLATFORM_ICONS[p];
                        return pm ? (
                          <span key={p} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                            <i className={`${pm.icon} ${pm.color} text-xs`} />
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {t.winner ? (
                      <span className={`inline-flex items-center space-x-1.5 text-sm ${impColor}`}>
                        <FaTrophy className="text-[10px]" />
                        <span>Variant {t.winner}</span>
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${impColor} ${impBg}`}>
                      {imp}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-gray-500 text-sm flex items-center space-x-1.5">
                      <FaClock className="text-[10px]" />
                      <span>{timeAgo(t.completed_at || t.created_at)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => exportSingleCSV(t)}
                      className="w-8 h-8 rounded-lg bg-white/5 text-gray-500 hover:bg-cyan-400/15 hover:text-cyan-400 transition-all inline-flex items-center justify-center"
                      title="Download results"
                    >
                      <FaDownload className="text-xs" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════ A/B TEST SETTINGS ═══════ */
const DURATION_SETTING_OPTIONS = [
  { value: "24h", label: "24 Hours" },
  { value: "48h", label: "48 Hours" },
  { value: "72h", label: "72 Hours" },
  { value: "1w", label: "1 Week" },
];

const SIGNIFICANCE_OPTIONS = [
  { value: 90, label: "90%" },
  { value: 95, label: "95% (Recommended)" },
  { value: 99, label: "99%" },
];

const NOTIFICATION_OPTIONS = [
  { key: "notify_complete", label: "Notify when test completes", icon: <FaCheckCircle className="text-green-400 text-xs" /> },
  { key: "daily_progress", label: "Daily progress updates", icon: <FaChartLine className="text-cyan-400 text-xs" /> },
  { key: "weekly_summary", label: "Weekly insights summary", icon: <FaBrain className="text-violet-400 text-xs" /> },
  { key: "auto_apply_winner", label: "Auto-apply winning variants", icon: <FaTrophy className="text-yellow-400 text-xs" /> },
];

function ABTestSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getABSettings()
      .then((s) => setSettings(s))
      .catch(() =>
        setSettings({
          default_duration: "24h",
          min_sample_size: 1000,
          statistical_significance: 95,
          notify_complete: true,
          daily_progress: true,
          weekly_summary: false,
          auto_apply_winner: true,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      await saveABSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Save settings error:", e);
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  if (loading || !settings) {
    return (
      <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
        <div className="flex items-center justify-center py-12 text-gray-400">
          <FaSpinner className="animate-spin text-xl mr-3" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400/20 to-cyan-400/20 flex items-center justify-center">
            <FaCog className="text-gray-300 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">A/B Test Settings</h2>
            <p className="text-gray-500 text-xs">Configure defaults & notifications</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center transition-all ${
            saved
              ? "bg-green-400/15 text-green-400 border border-green-400/30"
              : "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/25"
          } disabled:opacity-50`}
        >
          {saving ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : saved ? (
            <FaCheck className="mr-2" />
          ) : (
            <FaSave className="mr-2" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Default Test Parameters */}
        <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/20">
          <h3 className="text-white font-semibold mb-5 flex items-center">
            <FaVials className="text-cyan-400 mr-2 text-sm" />
            Default Test Parameters
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Default Test Duration</label>
              <select
                value={settings.default_duration}
                onChange={(e) => update("default_duration", e.target.value)}
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl p-3 text-gray-100 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
              >
                {DURATION_SETTING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Minimum Sample Size</label>
              <input
                type="number"
                value={settings.min_sample_size}
                onChange={(e) => update("min_sample_size", parseInt(e.target.value) || 0)}
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl p-3 text-gray-100 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Statistical Significance</label>
              <select
                value={settings.statistical_significance}
                onChange={(e) => update("statistical_significance", parseInt(e.target.value))}
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl p-3 text-gray-100 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
              >
                {SIGNIFICANCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/20">
          <h3 className="text-white font-semibold mb-5 flex items-center">
            <FaBell className="text-yellow-400 mr-2 text-sm" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            {NOTIFICATION_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center space-x-3 cursor-pointer group p-3 rounded-xl hover:bg-white/[0.03] transition-colors -mx-3"
              >
                <button
                  type="button"
                  onClick={() => update(opt.key, !settings[opt.key])}
                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                    settings[opt.key]
                      ? "bg-cyan-400 border-cyan-400"
                      : "border-gray-600 group-hover:border-gray-500"
                  }`}
                >
                  {settings[opt.key] && <FaCheck className="text-white text-[8px]" />}
                </button>
                <div className="flex items-center space-x-2">
                  {opt.icon}
                  <span className="text-gray-300 text-sm">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
