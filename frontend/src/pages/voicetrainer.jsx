import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import useTranslation from "../i18n/useTranslation";

/* ================= HELPERS ================= */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u._id || u.id || "guest";
  } catch { return "guest"; }
}

export default function VoiceTrainer() {
  const t = useTranslation();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [phase, setPhase] = useState("upload"); // upljoad | recording | uploading | analysis | results
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  /* ================= SAVED PRESETS STATE ================= */
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [expandedPreset, setExpandedPreset] = useState(null);

  /* ================= RECORDING STATE ================= */
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* ================= START RECORDING ================= */
  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");
      transcriptRef.current = "";

      // Get microphone stream for audio level visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio level visualizer
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // MediaRecorder to capture actual audio for AssemblyAI transcription
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000); // collect chunks every second
      mediaRecorderRef.current = mediaRecorder;

      // Web Speech API for real-time transcription (live preview only)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";
      recognitionRef.current = recognition;

      let finalTranscript = "";

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text + " ";
          } else {
            interim = text;
          }
        }
        transcriptRef.current = finalTranscript;
        setTranscript(finalTranscript + interim);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error, e.message);
        if (e.error === "not-allowed") {
          setError("Microphone access denied for speech recognition. Check browser permissions.");
        }
      };

      recognition.onend = () => {
        // Restart if still recording (browser may stop after silence)
        if (isRecordingRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch {}
        }
      };

      recognition.start();
      console.log("Speech recognition started, lang:", recognition.lang);
      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingTime(0);
      setPhase("recording");

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Could not access microphone. Please allow microphone permission.");
    }
  };

  /* ================= STOP RECORDING ================= */
  const stopRecording = () => {
    // Require at least 5 seconds of recording
    if (recordingTime < 5) {
      setError("Please record at least 5 seconds of speech for accurate analysis.");
      return;
    }
    // Stop speech recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);

    // Use the live transcript captured by Web Speech API
    const text = transcriptRef.current.trim();
    console.log("Transcript captured:", text.length, "chars:", text.substring(0, 100));
    if (text.length < 10) {
      setError("Could not capture your speech. Make sure:\n• You allowed microphone access\n• You spoke clearly into the microphone\n• You're using Chrome or Edge browser");
      setPhase("upload");
      return;
    }
    // Send transcript for AI analysis
    setPhase("analysis");
    analyzeTranscript(text);
  };

  /* ================= SEND AUDIO TO BACKEND (AssemblyAI fallback) ================= */
  const sendAudioForAnalysis = async (audioFile) => {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch("http://127.0.0.1:5000/api/voice/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setTimeout(() => setPhase("results"), 800);
      } else {
        setError(data.error || "Analysis failed. Please speak louder and try again.");
        setPhase("upload");
      }
    } catch (err) {
      console.error("Audio analysis error:", err);
      setError("Could not connect to the server.");
      setPhase("upload");
    }
  };

  /* ================= CANCEL RECORDING ================= */
  const cancelRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);
    setRecordingTime(0);
    setTranscript("");
    transcriptRef.current = "";
    setPhase("upload");
  };

  /* ================= ANALYZE TRANSCRIPT (text only, no file) ================= */
  const analyzeTranscript = async (text) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/voice/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text, source_type: "audio" }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setTimeout(() => setPhase("results"), 800);
      } else {
        setError(data.error || "Analysis failed");
        setPhase("upload");
      }
    } catch (err) {
      console.error("Transcript analysis error:", err);
      setError("Could not connect to the server.");
      setPhase("upload");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") try { mediaRecorderRef.current.stop(); } catch {}
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ================= LOAD PRESETS FROM MONGO ================= */
  useEffect(() => { loadPresets(); }, []);

  const loadPresets = async () => {
    try {
      setPresetsLoading(true);
      const data = await apiFetch(`/api/clone/presets?user_id=${getUserId()}`);
      if (data.success) {
        // Show vocal presets (type personal or sourceType vocal)
        const vocal = (data.presets || []).filter(p =>
          p.type === "personal" || p.analysis?.sourceType === "vocal" || p.profile?.platform === "Audio"
        );
        setPresets(vocal);
      }
    } catch (e) {
      console.error("Failed to load presets:", e);
    } finally {
      setPresetsLoading(false);
    }
  };

  const handleDeletePreset = async (id) => {
    try {
      await apiFetch(`/api/clone/presets/${id}`, { method: "DELETE" });
      setPresets(prev => prev.filter(p => p._id !== id));
      if (expandedPreset?._id === id) setExpandedPreset(null);
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleActivatePreset = async (id) => {
    try {
      await apiFetch(`/api/clone/presets/${id}/activate`, {
        method: "POST",
        body: JSON.stringify({ user_id: getUserId() }),
      });
      setPresets(prev => prev.map(p => ({ ...p, active: p._id === id })));
      if (expandedPreset) setExpandedPreset(prev => ({ ...prev, active: prev._id === id }));
    } catch (e) {
      console.error("Activate failed:", e);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ================= FILE HANDLING ================= */
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["mp3", "wav", "m4a", "flac", "ogg", "webm"].includes(ext)) {
      setError("Please upload an audio file (MP3, WAV, M4A, FLAC, OGG, WEBM)");
      return;
    }
    setError("");
    setFile(selectedFile);
    setProgress(0);
    setPhase("uploading");
  };

  /* ================= ANALYZE AUDIO ================= */
  const analyzeAudio = async () => {
    if (!file) return;
    setPhase("analysis");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/voice/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setTimeout(() => setPhase("results"), 800);
      } else {
        setError(data.error || "Analysis failed");
        setPhase("upload");
      }
    } catch (err) {
      console.error("Voice analysis error:", err);
      setError("Could not connect to the server. Make sure the backend is running.");
      setPhase("upload");
    }
  };

  /* ================= UPLOAD PROGRESS SIM ================= */
  useEffect(() => {
    if (phase !== "uploading") return;
    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 15;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
        setTimeout(() => {
          setProgress(0);
          analyzeAudio();
        }, 500);
      }
      setProgress(Math.floor(value));
    }, 180);
    return () => clearInterval(interval);
  }, [phase, file]);

  /* ================= SAVE AS VOICE PRESET ================= */
  const saveVoicePreset = async () => {
    if (!result) return;

    const ai = result.ai;
    const voice = result.voice;
    const analysis = ai
      ? {
          tone: ai.tone || "Natural",
          sentenceStyle: ai.sentenceStyle || "Conversational",
          structure: ai.structure || "Free-flowing",
          emojiUsage: ai.emojiUsage || "None",
          hashtagUsage: ai.hashtagUsage || "None",
          vocabularyLevel: ai.vocabularyLevel || "Intermediate",
          hookStyle: ai.hookStyle || "Conversational Opening",
          ctaStyle: ai.ctaStyle || "None",
          contentThemes: ai.contentThemes || [],
          writingPatterns: ai.writingPatterns || [],
          uniqueTraits: ai.uniqueTraits || [],
          confidenceScore: ai.confidenceScore || 60,
          samplePost: "",
          sourceType: "vocal",
          audioDuration: voice?.duration || null,
          audioClarity: voice?.clarity || null,
        }
      : {
          tone: "Natural",
          sentenceStyle: "Conversational",
          structure: "Free-flowing",
          emojiUsage: "None",
          hashtagUsage: "None",
          vocabularyLevel: "Intermediate",
          hookStyle: "Conversational Opening",
          ctaStyle: "None",
          contentThemes: [],
          writingPatterns: [],
          uniqueTraits: [],
          confidenceScore: 50,
          samplePost: "",
          sourceType: "vocal",
        };

    try {
      const presetName = file?.name ? `Vocal: ${file.name}` : `Vocal: Recording ${new Date().toLocaleDateString()}`;
      const data = await apiFetch("/api/clone/presets", {
        method: "POST",
        body: JSON.stringify({
          user_id: getUserId(),
          name: presetName,
          profile: { name: presetName, platform: "Audio", imageUrl: null },
          analysis,
          postStats: null,
          url: "",
          type: "personal",
        }),
      });
      if (data.success) {
        setShowSaved(true);
        loadPresets(); // Refresh presets list
      }
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  /* ================= CREATE POST WITH VOICE ================= */
  const createPostWithVoice = () => {
    if (!result) return;
    const ai = result.ai;
    const tempVoice = {
      name: "Vocal Analysis",
      tone: ai?.tone || "Natural",
      sentenceStyle: ai?.sentenceStyle || "Conversational",
      structure: ai?.structure || "Free-flowing",
      emojiUsage: ai?.emojiUsage || "None",
      hashtagUsage: ai?.hashtagUsage || "None",
      vocabularyLevel: ai?.vocabularyLevel || "Intermediate",
      hookStyle: ai?.hookStyle || "Conversational",
      ctaStyle: ai?.ctaStyle || "None",
      contentThemes: ai?.contentThemes || [],
      writingPatterns: ai?.writingPatterns || [],
      uniqueTraits: ai?.uniqueTraits || [],
      confidenceScore: ai?.confidenceScore || 60,
      samplePost: "",
    };
    navigate("/dashboard/CreatePostPage", { state: { tempVoice } });
  };

  /* ================= DRAG & DROP ================= */
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  /* ================= RENDER ================= */
  return (
    <div className="gradient-bg min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-microphone-lines text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t("voiceTrainer.title")}</h1>
          <p className="text-xl text-gray-300 mb-2">
            {t("voiceTrainer.subtitle")}
          </p>
          <p className="text-gray-400">
            Record your voice or upload a recording — our AI will detect your tone, pace, energy, and speaking patterns
          </p>
        </div>

        {/* ================= UPLOAD / RECORD ================= */}
        {(phase === "upload" || phase === "uploading" || phase === "recording") && (
          <div className="glass-effect rounded-3xl p-8 mb-8 slide-up">

            {/* Recording Mode */}
            {phase === "recording" && (
              <div className="text-center py-8">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  {/* Pulsing rings */}
                  <div
                    className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"
                    style={{ animationDuration: "1.5s" }}
                  ></div>
                  <div
                    className="absolute rounded-full bg-rose-500/10 transition-all duration-150"
                    style={{
                      inset: `${50 - audioLevel * 0.4}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                      <i className="fa-solid fa-microphone text-3xl text-white"></i>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Recording...</h3>
                <p className="text-4xl font-mono text-rose-400 mb-2">{formatTime(recordingTime)}</p>
                <p className="text-gray-400 text-sm mb-6">Speak naturally — describe a topic you're passionate about</p>

                {/* Live transcript */}
                {transcript && (
                  <div className="max-w-lg mx-auto mb-6 p-4 bg-black/30 rounded-2xl border border-gray-700/50 text-left">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                      <i className="fa-solid fa-closed-captioning text-rose-400 mr-1"></i> Live Transcription
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">{transcript}</p>
                  </div>
                )}

                {/* Audio level bar */}
                <div className="max-w-xs mx-auto mb-8">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-rose-500 rounded-full transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Audio Level</p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={cancelRecording}
                    className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 border border-gray-600 hover:border-gray-400"
                  >
                    <i className="fa-solid fa-xmark mr-2"></i>Cancel
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-8 py-3 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl text-white font-semibold hover:opacity-90"
                  >
                    <i className="fa-solid fa-stop mr-2"></i>Stop & Analyze
                  </button>
                </div>

                {recordingTime >= 5 && (
                  <p className="text-green-400 text-xs mt-4">
                    <i className="fa-solid fa-check mr-1"></i>Good length! You can stop anytime.
                  </p>
                )}
              </div>
            )}

            {/* Upload / Record Choice */}
            {phase === "upload" && (
              <div>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Record Button */}
                  <button
                    onClick={startRecording}
                    className="group upload-zone rounded-3xl p-10 text-center cursor-pointer transition-all hover:border-rose-400/50 hover:bg-rose-400/5"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg group-hover:shadow-rose-500/30 transition-shadow">
                      <i className="fa-solid fa-microphone text-3xl text-white"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t("voiceTrainer.startRecording")}</h3>
                    <p className="text-gray-400 text-sm">
                      Speak directly into your microphone
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Recommended: 30s - 2min</p>
                  </button>

                  {/* Upload Button */}
                  <div
                    className={`upload-zone rounded-3xl p-10 text-center cursor-pointer transition-all hover:border-violet-400/50 hover:bg-violet-400/5 ${dragActive ? "border-violet-400 bg-violet-400/10" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-400/20 flex items-center justify-center">
                      <i className="fa-solid fa-file-audio text-3xl text-violet-400"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Upload Recording</h3>
                    <p className="text-gray-400 text-sm">
                      Drop or browse an audio file
                    </p>
                    <p className="text-gray-500 text-xs mt-2">MP3, WAV, M4A, FLAC, OGG, WEBM</p>
                  </div>
                </div>

                {/* Selected file */}
                {file && (
                  <div className="bg-black/20 rounded-xl p-4 border border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fa-solid fa-file-audio text-rose-400"></i>
                      <span className="text-gray-300 text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <button className="text-red-400 hover:text-red-300" onClick={() => setFile(null)}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Uploading progress */}
            {phase === "uploading" && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-cyan-400/20 flex items-center justify-center">
                  <i className="fa-solid fa-wave-square text-4xl text-cyan-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Processing Audio...</h3>
                <div className="w-80 mx-auto">
                  <div className="progress-bar h-3 rounded-full mb-2">
                    <div className="progress-fill rounded-full h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-gray-400 text-sm">{progress}% Complete</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center whitespace-pre-line">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".mp3,.wav,.m4a,.flac,.ogg,.webm"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>
        )}

        {/* ================= ANALYZING ================= */}
        {phase === "analysis" && (
          <div className="glass-effect rounded-3xl p-8 slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-400/20 flex items-center justify-center pulse-glow">
                <i className="fa-solid fa-ear-listen text-2xl text-rose-400"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t("voiceTrainer.analyzing")}</h2>
              <p className="text-gray-400 analyzing-dots">AI is listening to your recording</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { icon: "fa-microphone", color: "text-rose-400", label: "Speech-to-Text Transcription" },
                { icon: "fa-brain", color: "text-violet-400", label: "Tone & Energy Detection" },
                { icon: "fa-wave-square", color: "text-teal-400", label: "Speaking Rhythm Analysis" },
                { icon: "fa-fingerprint", color: "text-cyan-400", label: "Voice Identity Mapping" },
              ].map((step, i) => (
                <div key={i} className="scanning-line bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <i className={`fa-solid ${step.icon} ${step.color}`}></i>
                      <span className="text-white font-semibold">{step.label}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{i === 0 ? "Processing..." : "Waiting..."}</span>
                  </div>
                  <div className="progress-bar h-2 rounded-full">
                    <div className={`progress-fill w-full rounded-full animate-pulse ${i > 0 ? "opacity-40" : ""}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= RESULTS ================= */}
        {phase === "results" && result && (
          <div className="glass-effect rounded-3xl p-8 slide-up">

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-2xl text-green-400"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t("voiceTrainer.results")}</h2>
              <p className="text-gray-400">Here's what we detected from your voice recording</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">

              {/* LEFT — Voice Profile */}
              <div className="space-y-6">

                {/* Transcription Preview */}
                {result.extracted_text && (
                  <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <i className="fa-solid fa-closed-captioning text-rose-400 mr-3"></i>
                      Transcription
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed italic">
                      "{result.extracted_text}"
                    </p>
                  </div>
                )}

                {/* Detected Tone */}
                <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className="fa-solid fa-palette text-violet-400 mr-3"></i>
                    Detected Speaking Tone
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {result.ai ? (
                      <>
                        <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">{result.ai.tone}</span>
                        <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">{result.ai.sentenceStyle}</span>
                        <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">{result.ai.hookStyle}</span>
                      </>
                    ) : (
                      <>
                        <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">{result.nltk?.sentiment || "Natural"}</span>
                        <span className="tone-badge px-4 py-2 rounded-xl font-medium text-violet-300">{result.spacy?.tone || "Balanced"}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-violet-400/10 rounded-xl border border-violet-400/20">
                    <p className="text-gray-300 text-sm">
                      <i className="fa-solid fa-quote-left text-violet-400 mr-2"></i>
                      {result.ai
                        ? `Your speaking voice is ${result.ai.tone?.toLowerCase()}. You tend to use ${result.ai.sentenceStyle?.toLowerCase()} sentences with ${result.ai.vocabularyLevel?.toLowerCase()} vocabulary.`
                        : `Your voice shows a ${(result.nltk?.sentiment || "neutral").toLowerCase()} tone with ${result.nltk?.writing_style?.toLowerCase() || "natural"} delivery.`
                      }
                    </p>
                  </div>
                </div>

                {/* Audio Info */}
                {result.voice && (
                  <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <i className="fa-solid fa-wave-square text-teal-400 mr-3"></i>
                      Audio Properties
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Duration", value: result.voice.duration },
                        { label: "Sample Rate", value: result.voice.pitch },
                        { label: "Channels", value: result.voice.channels === 2 ? "Stereo" : "Mono" },
                        { label: "Clarity", value: result.voice.clarity },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-teal-400 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Patterns & Themes */}
              <div className="space-y-6">

                {/* Speaking Style */}
                <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <i className="fa-solid fa-comments text-cyan-400 mr-3"></i>
                    Speaking Style
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Sentence Style", value: result.ai?.sentenceStyle || result.nltk?.writing_style || "Conversational" },
                      { label: "Structure", value: result.ai?.structure || "Free-flowing" },
                      { label: "Vocabulary", value: result.ai?.vocabularyLevel || "Intermediate" },
                      { label: "CTA Style", value: result.ai?.ctaStyle || "None" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="text-cyan-400 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics Mentioned */}
                {(result.ai?.contentThemes?.length > 0 || result.spacy?.keywords?.length > 0) && (
                  <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <i className="fa-solid fa-tags text-yellow-400 mr-3"></i>
                      Topics Mentioned
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.ai?.contentThemes || result.spacy?.keywords?.slice(0, 6) || []).map((theme, i) => (
                        <span key={i} className="keyword-tag px-3 py-1 rounded-lg text-sm font-medium text-yellow-300">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unique Traits */}
                {result.ai && (
                  <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <i className="fa-solid fa-fingerprint text-rose-400 mr-3"></i>
                      Vocal Identity
                    </h3>

                    {result.ai.writingPatterns?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Speech Patterns</p>
                        <div className="space-y-2">
                          {result.ai.writingPatterns.map((p, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <i className="fa-solid fa-circle-dot text-rose-400 text-xs mt-1.5"></i>
                              <span className="text-gray-300 text-sm">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.ai.uniqueTraits?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Unique Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {result.ai.uniqueTraits.map((trait, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg text-sm font-medium text-rose-300 bg-rose-400/10 border border-rose-400/20">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between p-3 bg-green-400/10 rounded-xl border border-green-400/20">
                      <span className="text-gray-300 text-sm">AI Confidence</span>
                      <span className="text-green-400 font-bold">{result.ai.confidenceScore}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <button
                className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
                onClick={() => { setPhase("upload"); setFile(null); setResult(null); setError(""); }}
              >
                <i className="fa-solid fa-arrow-rotate-right mr-2"></i>
                Analyze Another Recording
              </button>

              <button
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-violet-500 rounded-2xl text-white font-semibold hover:opacity-90 transition-opacity"
                onClick={saveVoicePreset}
              >
                <i className="fa-solid fa-bookmark mr-2"></i>
                {t("voiceTrainer.saveVoice")}
              </button>

              <button
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl text-white font-semibold hover:opacity-90 transition-opacity"
                onClick={createPostWithVoice}
              >
                <i className="fa-solid fa-pen-to-square mr-2"></i>
                {t("voiceTrainer.createPostWithVoice")}
              </button>
            </div>
          </div>
        )}

        {/* ================= SAVED MODAL ================= */}
        {showSaved && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-md w-full border border-green-400/30">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Voice Preset Saved!</h3>
                <p className="text-gray-400 mb-6">
                  Your vocal profile has been saved. You can activate it below or from the Clone page.
                </p>
                <button
                  onClick={() => setShowSaved(false)}
                  className="w-full p-3 gradient-accent rounded-2xl text-white font-medium"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SAVED PRESETS ================= */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <i className="fa-solid fa-bookmark text-rose-400 mr-3"></i>
              {t("voiceTrainer.savedPresets")}
            </h2>
            <span className="text-gray-400 text-sm">{presets.length} preset{presets.length !== 1 ? "s" : ""}</span>
          </div>

          {presetsLoading ? (
            <div className="glass-effect rounded-2xl p-12 text-center">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400 mb-3"></i>
              <p className="text-gray-400">{t("common.loading")}</p>
            </div>
          ) : presets.length === 0 ? (
            <div className="glass-effect rounded-2xl p-12 text-center">
              <i className="fa-solid fa-microphone-slash text-3xl text-gray-600 mb-3"></i>
              <p className="text-gray-400">No vocal presets yet. Record or upload audio to create one.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset._id}
                  onClick={() => setExpandedPreset(preset)}
                  className={`neo-card rounded-2xl p-6 cursor-pointer relative overflow-hidden transition-all hover:scale-[1.02] ${preset.active ? "border-l-2 border-l-cyan-400" : ""}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center">
                      <i className="fa-solid fa-microphone text-white"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{preset.name}</h3>
                      <p className="text-gray-400 text-sm">{preset.analysis?.tone || "Vocal"}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">
                    {preset.analysis?.sentenceStyle || "Conversational"} · {preset.analysis?.vocabularyLevel || "Intermediate"}
                  </p>

                  {preset.created_at && (
                    <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                      <i className="fa-regular fa-clock"></i>
                      {timeAgo(preset.created_at)}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    {preset.active ? (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <i className="fa-solid fa-circle text-[6px]"></i> Active
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Inactive</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset._id); }}
                      className="w-8 h-8 bg-black/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= PRESET DETAIL MODAL ================= */}
        {expandedPreset && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedPreset(null)}>
            <div className="glass-effect rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b border-gray-700/30 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center">
                    <i className="fa-solid fa-microphone text-xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{expandedPreset.name}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-microphone-lines text-rose-400"></i> Vocal Analysis
                      {expandedPreset.active && (
                        <span className="text-green-400 text-xs flex items-center gap-1 ml-2">
                          <i className="fa-solid fa-circle text-[6px]"></i> Active
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={() => setExpandedPreset(null)} className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Voice Profile */}
                {expandedPreset.analysis && (
                  <>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
                        <i className="fa-solid fa-palette text-violet-400 mr-2 text-xs"></i> Voice Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ["Tone", expandedPreset.analysis.tone],
                          ["Style", expandedPreset.analysis.sentenceStyle],
                          ["Structure", expandedPreset.analysis.structure],
                          ["Vocabulary", expandedPreset.analysis.vocabularyLevel],
                          ["Emoji", expandedPreset.analysis.emojiUsage],
                          ["Hashtags", expandedPreset.analysis.hashtagUsage],
                          ["Hook", expandedPreset.analysis.hookStyle],
                          ["CTA", expandedPreset.analysis.ctaStyle],
                        ].filter(([, v]) => v).map(([label, value], i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                            <span className="text-gray-400 text-xs">{label}</span>
                            <span className="text-white text-xs font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Themes */}
                    {expandedPreset.analysis.contentThemes?.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
                          <i className="fa-solid fa-tags text-yellow-400 mr-2 text-xs"></i> Content Themes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {expandedPreset.analysis.contentThemes.map((theme, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg text-xs bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">{theme}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Writing Patterns */}
                    {expandedPreset.analysis.writingPatterns?.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
                          <i className="fa-solid fa-list text-cyan-400 mr-2 text-xs"></i> Speaking Patterns
                        </h4>
                        <div className="space-y-1">
                          {expandedPreset.analysis.writingPatterns.map((p, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <i className="fa-solid fa-circle-dot text-cyan-400 text-[8px] mt-1.5"></i>
                              <span className="text-gray-300 text-sm">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unique Traits */}
                    {expandedPreset.analysis.uniqueTraits?.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
                          <i className="fa-solid fa-fingerprint text-rose-400 mr-2 text-xs"></i> Unique Traits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {expandedPreset.analysis.uniqueTraits.map((trait, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg text-xs bg-rose-400/10 text-rose-300 border border-rose-400/20">{trait}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence */}
                    {expandedPreset.analysis.confidenceScore && (
                      <div className="flex items-center justify-between p-3 bg-green-400/10 rounded-xl border border-green-400/20">
                        <span className="text-gray-300 text-sm">AI Confidence</span>
                        <span className="text-green-400 font-bold">{expandedPreset.analysis.confidenceScore}%</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700/30 flex justify-between items-center">
                {expandedPreset.created_at && (
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fa-regular fa-clock"></i> Saved {timeAgo(expandedPreset.created_at)}
                  </span>
                )}
                <div className="flex gap-3">
                  {!expandedPreset.active && (
                    <button
                      onClick={() => handleActivatePreset(expandedPreset._id)}
                      className="px-4 py-2 gradient-accent rounded-xl text-white text-sm font-medium"
                    >
                      <i className="fa-solid fa-check mr-1"></i> Set Active
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const ai = expandedPreset.analysis;
                      const tempVoice = {
                        name: expandedPreset.name,
                        tone: ai?.tone || "Natural",
                        sentenceStyle: ai?.sentenceStyle || "Conversational",
                        structure: ai?.structure || "Free-flowing",
                        emojiUsage: ai?.emojiUsage || "None",
                        hashtagUsage: ai?.hashtagUsage || "None",
                        vocabularyLevel: ai?.vocabularyLevel || "Intermediate",
                        hookStyle: ai?.hookStyle || "Conversational",
                        ctaStyle: ai?.ctaStyle || "None",
                        contentThemes: ai?.contentThemes || [],
                        writingPatterns: ai?.writingPatterns || [],
                        uniqueTraits: ai?.uniqueTraits || [],
                        confidenceScore: ai?.confidenceScore || 60,
                      };
                      navigate("/dashboard/CreatePostPage", { state: { tempVoice } });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white text-sm font-medium"
                  >
                    <i className="fa-solid fa-pen-to-square mr-1"></i> Create Post
                  </button>
                  <button
                    onClick={() => { handleDeletePreset(expandedPreset._id); setExpandedPreset(null); }}
                    className="px-4 py-2 bg-black/30 rounded-xl text-red-400 text-sm border border-red-400/20 hover:border-red-400/50 transition-colors"
                  >
                    <i className="fa-solid fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
