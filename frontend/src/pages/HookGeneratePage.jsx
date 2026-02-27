import { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

const sampleHooksData = [
  { text: "Here's the uncomfortable truth about AI that nobody talks about:", score: 94, type: "bold-statement" },
  { text: "I spent 3 years studying AI implementation, and this shocked me the most:", score: 89, type: "personal-story" },
  { text: "What if everything you know about artificial intelligence is wrong?", score: 87, type: "question" },
  { text: "73% of businesses will fail to adapt to AI. Here's why:", score: 92, type: "statistic" },
  { text: "The AI revolution isn't coming. It's already here, and you're missing it.", score: 90, type: "urgency" },
];

const platformsList = [
  { key: 'twitter', label: 'Twitter', icon: 'fa-brands fa-twitter' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin' },
  { key: 'medium', label: 'Medium', icon: 'fa-brands fa-medium' },
];

export default function HookGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState([]); // <-- vide au départ
  const [selectedHook, setSelectedHook] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(platformsList.map(p => p.key));
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => setCharCount(topic.length), [topic]);

  const togglePlatform = (key) => {
    let updated = [...selectedPlatforms];
    if (updated.includes(key)) {
      if (updated.length === 1) return;
      updated = updated.filter(p => p !== key);
    } else {
      updated.push(key);
    }
    setSelectedPlatforms(updated);
  };

  const generateHooks = () => {
    if (!topic.trim()) return;
    setLoading(true);
    setSelectedHook(null);
    setTimeout(() => {
      setHooks([...sampleHooksData]); // Simuler API
      setLoading(false);
    }, 2000);
  };

  const regenerateHook = (index) => {
    const newHooks = [...hooks];
    const randomHooks = [
      "Stop scrolling. This will change how you think about AI forever.",
      "I made a $50K mistake with AI. Here's what I learned:",
      "The AI trend everyone's talking about is actually dangerous. Here's why:",
      "3 AI predictions that will seem obvious in 2025:",
      "This AI breakthrough happened yesterday. No one noticed."
    ];
    const randIndex = Math.floor(Math.random() * randomHooks.length);
    newHooks[index] = { text: randomHooks[randIndex], score: 85 + Math.floor(Math.random() * 15), type: 'regenerated' };
    setHooks(newHooks);
    if (selectedHook?.index === index) setSelectedHook(null);
  };

  const selectHook = (hook, index) => setSelectedHook({ ...hook, index });
  const insertHook = () => { if (selectedHook) setSuccessOpen(true); };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0E1116] to-[#1A1F26] text-white">
     
      {/* Main */}
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center pulse-glow">
            <i className="fa-solid fa-fish-fins text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">Generate Powerful Hooks</h1>
          <p className="text-xl text-gray-300 mb-2">Create engaging openings for your LinkedIn, X, or Medium posts</p>
          <p className="text-gray-400">Transform any topic into scroll-stopping content from the first line</p>
        </div>

        {/* SECTION: Input Area */}
<div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
  <div className="mb-6">
    <label className="block text-white font-semibold text-lg mb-3 flex items-center">
      <i className="fa-solid fa-lightbulb text-cyan-400 mr-2"></i>
      What's your topic or idea?
    </label>
    <textarea
      id="topic-input"
      value={topic}
      onChange={e => setTopic(e.target.value)}
      maxLength={500}
      placeholder="Enter your topic or paragraph idea... (e.g., 'The future of AI in healthcare', 'Why remote work is changing everything', 'My biggest business mistake')"
      className="w-full h-32 bg-black/20 border border-gray-600 rounded-2xl p-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
    ></textarea>
    <div className="flex justify-between items-center mt-2">
      <span className="text-gray-400 text-sm">Tip: Be specific about your angle or key message</span>
      <span id="char-count" className="text-gray-400 text-sm">{topic.length}/500</span>
    </div>
  </div>

  {/* Platform Selector */}
  <div className="mb-8">
    <label className="block text-white font-semibold text-lg mb-4 flex items-center">
      <i className="fa-solid fa-globe text-violet-400 mr-2"></i>
      Target Platforms
    </label>
    <div className="flex flex-wrap gap-4">
      {platformsList.map(p => (
        <div
          key={p.key}
          onClick={() => togglePlatform(p.key)}
          className={`platform-selector flex items-center space-x-3 p-4 border border-gray-600 rounded-2xl cursor-pointer ${selectedPlatforms.includes(p.key) ? 'active bg-cyan-400/15 border-cyan-400 text-cyan-400' : ''}`}
          data-platform={p.key}
        >
          <i className={`${p.icon} text-xl ${p.color ? p.color : ''}`}></i>
          <div>
            <div className="font-semibold">{p.label}</div>
            <div className="text-sm text-gray-400">{p.description}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Generate Button */}
  <div className="text-center">
    <button
      id="generate-btn"
      onClick={generateHooks}
      className="px-8 py-4 gradient-accent rounded-2xl text-white font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105"
    >
      <i className="fa-solid fa-bolt mr-2"></i>
      Generate Hooks
    </button>
  </div>
</div>


        {/* Hooks Section (Visible uniquement après génération) */}
        {hooks.length > 0 && !loading && (
          <div className="glass-effect rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-sparkles text-cyan-400 mr-3"></i>
                AI-Suggested Hooks (Top 5)
              </h2>
              <button
                onClick={generateHooks}
                className="px-4 py-2 bg-black/30 border border-gray-600 rounded-2xl text-gray-300 hover:text-white hover:border-cyan-400 transition-all"
              >
                <i className="fa-solid fa-refresh mr-2"></i> Regenerate All
              </button>
            </div>

            <div className="space-y-4">
              {hooks.map((hook, idx) => (
                <div
                  key={idx}
                  className={`hook-card rounded-2xl p-6 cursor-pointer fade-in ${selectedHook?.index === idx ? "selected" : ""}`}
                  onClick={() => selectHook(hook, idx)}
                >
                  <p className="text-white text-lg mb-2">"{hook.text}"</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{hook.type.replace("-", " ")} Hook</span>
                    <div className="flex items-center space-x-4">
                      <div className="engagement-bar w-20 h-2 rounded-full bg-gray-700/40">
                        <div className="engagement-fill rounded-full bg-cyan-400" style={{ width: `${hook.score}%` }}></div>
                      </div>
                      <span className="text-cyan-400 font-semibold">{hook.score}%</span>
                      <button
  onClick={(e) => {
    e.stopPropagation(); // empêche la sélection via le parent
    selectHook(hook, idx); // optionnel, rend le hook visuellement sélectionné
    insertHook();          // ouvre le modal de succès
  }}
  className="px-4 py-2 gradient-accent rounded-xl text-white text-sm font-medium hover:opacity-90"
>
  <i className="fa-solid fa-pen mr-1"></i> Use
</button>

                      <button onClick={(e) => { e.stopPropagation(); regenerateHook(idx); }} className="p-2 bg-black/30 border border-gray-600 rounded-xl text-gray-300 hover:text-white hover:border-cyan-400">
                        <i className="fa-solid fa-refresh"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Selected Hook Section */}
{selectedHook && (
  <div id="selected-hook-section" className="glass-effect rounded-3xl p-8 mb-4">
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <i className="text-green-400 fa-solid fa-circle-check mr-3"></i>
      Selected Hook
    </h3>
    <div id="selected-hook-display" className="bg-black/20 rounded-2xl p-6 border border-cyan-400/30">
      <p id="selected-hook-text" className="text-white text-lg leading-relaxed">
        "{selectedHook.text}"
      </p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">Platform:</span>
          <div id="selected-platforms" className="flex space-x-2">
            {selectedPlatforms.includes('medium') && <i className="text-green-400 fa-brands fa-medium"></i>}
            {selectedPlatforms.includes('linkedin') && <i className="text-blue-600 fa-brands fa-linkedin"></i>}
            {selectedPlatforms.includes('twitter') && <i className="text-blue-400 fa-brands fa-twitter"></i>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Engagement Score:</span>
          <span id="selected-score" className="text-cyan-400 font-semibold">{selectedHook.score}%</span>
        </div>
      </div>
    </div>
  </div>
)}


{selectedHook && (
  <div className="text-center mb-8">
    <button
      id="insert-hook-btn"
      onClick={() => setSuccessOpen(true)}
      className="px-8 py-4 gradient-accent rounded-2xl text-white font-semibold text-lg hover:opacity-90 transition-all"
    >
      <i className="fa-solid fa-pen mr-2"></i>
      Insert Selected Hook Into Post
    </button>
  </div>
)}



        {/* Loader */}
        {loading && (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center pulse-glow">
              <i className="fa-solid fa-magic-wand-sparkles text-cyan-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 generating-dots">Crafting your hooks</h3>
            <p className="text-gray-400">AI is analyzing your topic and creating engaging openings...</p>
          </div>
        )}

        {/* Success Modal */}
        {successOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-md w-full border border-green-400/30 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-green-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hook Inserted Successfully!</h3>
              <p className="text-gray-400 mb-6">Your selected hook has been added to the post creator.</p>
              <button onClick={() => setSuccessOpen(false)} className="w-full p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90">
                Continue Writing Post
              </button>
            </div>
          </div>
          
        )}
        {/* Tips Section */}
<div id="tips-section" className="glass-effect rounded-3xl p-8 mt-8">
  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
    <i className="fas fa-graduation-cap text-yellow-400 mr-3"></i>
    Hook Writing Tips
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Tip 1 */}
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center mb-4">
        <i className="fas fa-question text-cyan-400"></i>
      </div>
      <h3 className="text-white font-semibold mb-2">Ask Questions</h3>
      <p className="text-gray-400 text-sm">
        Start with thought-provoking questions that make readers pause and think. Questions create immediate engagement.
      </p>
    </div>

    {/* Tip 2 */}
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center mb-4">
        <i className="fas fa-exclamation text-violet-400"></i>
      </div>
      <h3 className="text-white font-semibold mb-2">Make Bold Statements</h3>
      <p className="text-gray-400 text-sm">
        Controversial or surprising statements grab attention. Back them up with solid reasoning in your content.
      </p>
    </div>

    {/* Tip 3 */}
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center mb-4">
        <i className="fas fa-book-open text-teal-400"></i>
      </div>
      <h3 className="text-white font-semibold mb-2">Tell Stories</h3>
      <p className="text-gray-400 text-sm">
        Personal anecdotes and mini-stories create emotional connections. Start with "Last week..." or "I learned..."
      </p>
    </div>

    {/* Tip 4 */}
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center mb-4">
        <i className="fas fa-list text-yellow-400"></i>
      </div>
      <h3 className="text-white font-semibold mb-2">Use Numbers</h3>
      <p className="text-gray-400 text-sm">
        Specific numbers and statistics add credibility. "5 ways...", "73% of people...", "In 30 seconds..."
      </p>
    </div>

    {/* Tip 5 */}
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <div className="w-12 h-12 rounded-2xl bg-red-400/20 flex items-center justify-center mb-4">
        <i className="fas fa-triangle-exclamation text-red-400"></i>
      </div>
      <h3 className="text-white font-semibold mb-2">Create Urgency</h3>
      <p className="text-gray-400 text-sm">
        Time-sensitive language motivates action. "Before it's too late...", "Right now...", "This changes everything..."
      </p>
    </div>

    {/* Tip 6 */}
    <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
      <div className="w-12 h-12 rounded-2xl bg-pink-400/20 flex items-center justify-center mb-4">
        <i className="fas fa-heart text-pink-400"></i>
      </div>
      <h3 className="text-white font-semibold mb-2">Appeal to Emotions</h3>
      <p className="text-gray-400 text-sm">
        Tap into feelings like curiosity, fear, excitement, or surprise. Emotional hooks drive engagement and shares.
      </p>
    </div>
  </div>
</div>

        
      </main>
    </div>

  );
}
