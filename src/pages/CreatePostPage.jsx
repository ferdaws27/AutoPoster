import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePostPage() {
  const ideaRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [showDraft, setShowDraft] = useState(false);
  const [publishTo, setPublishTo] = useState({
    Twitter: true,
    LinkedIn: true,
    Medium: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const textarea = ideaRef.current;
    const handler = () => setCharCount(textarea.value.length);
    textarea.addEventListener("input", handler);
    return () => textarea.removeEventListener("input", handler);
  }, []);

  const togglePublish = (platform) => {
    setPublishTo((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Compose & Generate Post
              </h1>
              <p className="text-gray-400">
                Write once, publish everywhere with AI optimization
              </p>
            </div>
          </div>
        </div>

        {/* TOGGLES */}
        <div className="p-8 pb-0 flex items-center space-x-6">
          <span className="text-gray-400 font-medium">Publish to:</span>
          {["Twitter", "LinkedIn", "Medium"].map((p) => (
            <label key={p} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publishTo[p]}
                onChange={() => togglePublish(p)}
                className="sr-only"
              />
              <div className="ml-3 flex items-center">
                <i
                  className={`fa-brands fa-${
                    p === "Twitter" ? "x-twitter" : p.toLowerCase()
                  } mr-2`}
                ></i>
                <span className="font-medium">{p}</span>
              </div>
            </label>
          ))}
        </div>

        {/* IDEA INPUT */}
        <div className="p-8">
          <div className="card-bg rounded-3xl p-8 border border-gray-700 glow-border">
            <h2 className="text-xl font-semibold mb-4">Your Idea</h2>
            <textarea
              ref={ideaRef}
              className="w-full h-48 bg-gray-800/50 border border-gray-600 rounded-2xl p-6 resize-none"
              placeholder="Write your idea or topic here..."
            ></textarea>
            <div className="flex justify-between mt-3 text-gray-400 text-sm">
              <span>{charCount} characters</span>
            </div>
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 pb-8">
          {["Twitter", "LinkedIn", "Medium"].map(
            (p, i) =>
              publishTo[p] && (
                <div
                  key={i}
                  className="card-bg rounded-3xl p-6 border border-gray-700 h-full"
                >
                  <h3 className="text-cyan-400 text-lg font-semibold mb-3">
                    {p}
                  </h3>
                  <div className="bg-gray-800/50 rounded-2xl p-4 text-gray-300 text-sm">
                    Generated content preview...
                  </div>
                  <div className="mt-2 text-cyan-400 text-xs">
                    Est. engagement
                  </div>
                </div>
              )
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-center space-x-4 pb-8">
          <button className="px-6 py-3 rounded-2xl bg-violet-400/20 border border-violet-400/30 text-violet-400">
            <i className="fa-solid fa-palette mr-2"></i>Plan Images
          </button>

          <button className="px-6 py-3 rounded-2xl gradient-accent text-white">
            <i className="fa-solid fa-comments mr-2"></i>Generate Text
          </button>

          <button
            onClick={() => setShowDraft(true)}
            className="px-6 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-gray-300"
          >
            <i className="fa-solid fa-save mr-2"></i>Save Draft
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-400"
          >
            <i className="fa-solid fa-clock mr-2"></i>Schedule
          </button>
        </div>

        {/* MODAL */}
        {showDraft && (
          <Modal title="Save Draft" onClose={() => setShowDraft(false)} />
        )}
      </div>
    </div>
  );
}

/* MODAL */
function Modal({ title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="card-bg rounded-3xl p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <button
          onClick={onClose}
          className="w-full p-3 rounded-2xl border border-gray-600 text-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
