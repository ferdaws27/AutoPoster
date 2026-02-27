import { useEffect, useRef, useState } from "react"; 
import { useNavigate } from "react-router-dom";

export default function CreatePostPage() {
  const ideaRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [publishTo, setPublishTo] = useState({
    Twitter: true,
    LinkedIn: true,
    Medium: true,
  });
  const [variations, setVariations] = useState({});
  const [loading, setLoading] = useState(false);

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

  const generateText = async () => {
    const idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter(p => publishTo[p]);

    if (!idea) return alert("Enter your idea first");
    if (platforms.length === 0) return alert("Select at least one platform");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/generate_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, platforms })
      });
      const data = await res.json();
      // S'assurer que variations n'est jamais undefined
      setVariations(data.variations || {});
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white">
        <div className="p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold mb-2">Compose & Generate Post</h1>
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
            <textarea
              ref={ideaRef}
              className="w-full h-48 bg-gray-800/50 border border-gray-600 rounded-2xl p-6 resize-none"
              placeholder="Write your idea or topic here..."
            ></textarea>
            <div className="flex justify-between mt-3 text-gray-400 text-sm">
              <span>{charCount} characters</span>
              <button
                onClick={generateText}
                className="px-6 py-3 rounded-2xl gradient-accent text-white"
              >
                Generate Text
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 pb-8">
          {variations && Object.entries(variations).map(([p, text]) => (
            <div
              key={p}
              className="card-bg rounded-3xl p-6 border border-gray-700 h-full"
            >
              <h3 className="text-cyan-400 text-lg font-semibold mb-3">{p}</h3>
              <textarea
                className="w-full bg-gray-800/50 rounded-2xl p-4 text-gray-300 text-sm"
                value={text}
                onChange={(e) =>
                  setVariations((prev) => ({ ...prev, [p]: e.target.value }))
                }
              ></textarea>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center text-white mb-8">Generating...</div>
        )}
      </div>
    </div>
  );
}