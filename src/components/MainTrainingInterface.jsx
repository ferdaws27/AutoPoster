import { useState, useRef, useEffect } from "react";

export default function MainTrainingInterface() {
  const fileInputRef = useRef(null);

  const [phase, setPhase] = useState("upload"); // upload | uploading | analysis | results
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);

  /* ================= FILE HANDLING ================= */

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || !selectedFiles.length) return;

    // Transforme FileList en tableau
    const newFiles = Array.from(selectedFiles);

    // Évite les doublons basés sur le nom et la taille
    setFiles((prevFiles) => {
      const allFiles = [...prevFiles];
      newFiles.forEach((file) => {
        if (!allFiles.some((f) => f.name === file.name && f.size === file.size)) {
          allFiles.push(file);
        }
      });
      return allFiles;
    });

    // Lance le processus de progression
    setProgress(0);
    setPhase("uploading");
  };

  /* ================= UPLOAD PROGRESS ================= */

  useEffect(() => {
    if (phase !== "uploading") return;

    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 12;

      if (value >= 100) {
        value = 100;
        clearInterval(interval);
        setTimeout(() => setPhase("analysis"), 600);
      }

      setProgress(Math.floor(value));
    }, 200);

    return () => clearInterval(interval);
  }, [phase]);

  /* ================= ANALYSIS SIMULATION ================= */

  useEffect(() => {
    if (phase !== "analysis") return;

    const timer = setTimeout(() => setPhase("results"), 4500);

    return () => clearTimeout(timer);
  }, [phase]);

  /* ================= RESET WITHOUT REMOVING FILES ================= */
  const resetAll = () => {
    setPhase("upload");
    setProgress(0);
    setShowModal(false);
    // ⚠️ Ne pas vider les fichiers existants pour garder l’historique
    // setFiles([]); <-- supprimé
  };

  /* ================= OPEN FILE BROWSER ================= */
  const openFileBrowser = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* ================= UPLOAD SECTION ================= */}
      {(phase === "upload" || phase === "uploading") && (
        <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Upload Your Content
            </h2>
            <p className="text-gray-400">
              Support for TXT, DOCX, CSV files up to 50MB
            </p>
          </div>

          <div
            className="upload-zone rounded-3xl p-12 text-center cursor-pointer transition-all"
            onClick={openFileBrowser}
          >
            {phase === "upload" && (
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-violet-400/20 flex items-center justify-center">
                  <i className="fa-solid fa-cloud-upload-alt text-4xl text-violet-400"></i>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Drag & Drop Your Files Here
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Or click to browse your computer
                  </p>
                  <button
                    type="button"
                    className="px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileBrowser();
                    }}
                  >
                    <i className="fa-solid fa-folder-open mr-2"></i>
                    Browse Files
                  </button>
                </div>
              </div>
            )}

            {phase === "uploading" && (
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-cyan-400/20 flex items-center justify-center">
                  <i className="fa-solid fa-file-upload text-4xl text-cyan-400"></i>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Uploading Files...
                  </h3>

                  <div className="w-80 mx-auto">
                    <div className="progress-bar h-3 rounded-full mb-2">
                      <div
                        className="progress-fill rounded-full h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {progress}% Complete
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= DISPLAY UPLOADED FILES ================= */}
          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Uploaded Files
              </h3>
              <div className="grid gap-3">
  {files.map((file, index) => (
    <div
      key={index}
      className="bg-black/20 rounded-xl p-4 border border-gray-700/50 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <i className="fa-solid fa-file text-cyan-400"></i>
        <span className="text-gray-300 text-sm">{file.name}</span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-xs text-gray-500">
          {(file.size / 1024).toFixed(1)} KB
        </span>
        <button
          className="text-red-400 hover:text-red-600 font-bold"
          onClick={() => {
            setFiles(prev => prev.filter((_, i) => i !== index));
          }}
        >
          &times;
        </button>
      </div>
    </div>
  ))}
</div>

            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".txt,.docx,.csv"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* ================= ANALYSIS SECTION ================= */}
      {phase === "analysis" && (
        <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center pulse-glow">
              <i className="fa-solid fa-brain text-2xl text-violet-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyzing Your Writing Style
            </h2>
            <p className="text-gray-400 analyzing-dots">
              AI is processing your content
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">

            {/* Tone Analysis */}
            <div className="scanning-line bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <i className="fa-solid fa-palette text-violet-400"></i>
                  <span className="text-white font-semibold">Analyzing Tone</span>
                </div>
                <span className="text-cyan-400 text-sm">Processing...</span>
              </div>
              <div className="progress-bar h-2 rounded-full">
                <div className="progress-fill w-full rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Keywords Analysis */}
            <div className="scanning-line bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <i className="fa-solid fa-tags text-cyan-400"></i>
                  <span className="text-white font-semibold">Extracting Keywords</span>
                </div>
                <span className="text-gray-400 text-sm">Waiting...</span>
              </div>
              <div className="progress-bar h-2 rounded-full">
                <div className="progress-fill w-full rounded-full animate-pulse opacity-40"></div>
              </div>
            </div>

            {/* Rhythm Analysis */}
            <div className="scanning-line bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <i className="fa-solid fa-wave-square text-teal-400"></i>
                  <span className="text-white font-semibold">Understanding Rhythm</span>
                </div>
                <span className="text-gray-400 text-sm">Waiting...</span>
              </div>
              <div className="progress-bar h-2 rounded-full">
                <div className="progress-fill w-full rounded-full animate-pulse opacity-40"></div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-black/30 rounded-2xl p-6 border border-violet-400/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-lg">
                  Overall Progress
                </span>
                <span className="text-violet-400 font-bold text-lg">
                  Processing
                </span>
              </div>
              <div className="progress-bar h-4 rounded-full">
                <div className="progress-fill w-full rounded-full animate-pulse"></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= RESULTS SECTION ================= */}
      {phase === "results" && (
        <div className="glass-effect rounded-3xl p-8 slide-up">

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
              <i className="fa-solid fa-check-circle text-2xl text-green-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Analysis Complete!
            </h2>
            <p className="text-gray-400">
              Here's what we learned about your writing style
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* LEFT */}
            <div className="space-y-6">
              <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-palette text-violet-400 mr-3"></i>
                  Detected Tone
                </h3>

                <div className="flex flex-wrap gap-3">
                  <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">Insightful</span>
                  <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">Friendly</span>
                  <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">Motivational</span>
                  <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">Professional</span>
                </div>

                <div className="mt-4 p-4 bg-violet-400/10 rounded-xl border border-violet-400/20">
                  <p className="text-gray-300 text-sm">
                    <i className="fa-solid fa-quote-left text-violet-400 mr-2"></i>
                    Your writing combines technical expertise with approachable language,
                    making complex topics accessible while maintaining authority.
                  </p>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-wave-square text-teal-400 mr-3"></i>
                  Writing Rhythm
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Sentence Length</span>
                    <span className="text-teal-400 font-medium">18 words</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Paragraph Structure</span>
                    <span className="text-teal-400 font-medium">Medium (3-4 sentences)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Reading Level</span>
                    <span className="text-teal-400 font-medium">College Graduate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-tags text-cyan-400 mr-3"></i>
                  Key Topics & Themes
                </h3>

                <div className="flex flex-wrap gap-2">
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">AI & Technology</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Entrepreneurship</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Innovation</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Leadership</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Digital Strategy</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Future Trends</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Business Growth</span>
                  <span className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-cyan-300">Tech Solutions</span>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-chart-pie text-yellow-400 mr-3"></i>
                  Platform Adaptation
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fa-brands fa-x-twitter text-blue-400"></i>
                      <span className="text-gray-300">Twitter</span>
                    </div>
                    <span className="text-blue-400 font-medium">Concise & Punchy</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fa-brands fa-linkedin text-violet-400"></i>
                      <span className="text-gray-300">LinkedIn</span>
                    </div>
                    <span className="text-violet-400 font-medium">Professional & Detailed</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fa-brands fa-medium text-teal-400"></i>
                      <span className="text-gray-300">Medium</span>
                    </div>
                    <span className="text-teal-400 font-medium">Narrative & In-depth</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center space-x-4 mt-12">
            <button
              className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 border border-gray-600"
              onClick={resetAll}
            >
              <i className="fa-solid fa-redo mr-2"></i>
              Upload More Content
            </button>

            <button
              className="px-8 py-3 gradient-accent rounded-2xl text-white font-semibold"
              onClick={() => setShowModal(true)}
            >
              <i className="fa-solid fa-magic-wand-sparkles mr-2"></i>
              Apply to All Future Posts
            </button>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="glass-effect rounded-3xl p-8 max-w-md w-full border border-green-400/30">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-green-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Style Applied Successfully!
              </h3>
              <p className="text-gray-400 mb-6">
                AutoPoster has learned your writing style and will apply it to all future posts.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full p-3 gradient-accent rounded-2xl text-white font-medium"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
