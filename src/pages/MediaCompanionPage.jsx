import { useEffect, useRef, useState } from "react";
import Generate from "../components/generat";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function App() {
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const inputRef = useRef(null);
  

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  return (
    <div className="gradient-bg min-h-screen text-gray-100">

     

      {/* MAIN */}
      <main className="p-8">
         <div className="space-y-16">
        {/* HEADER */}
        <section className="text-center max-w-4xl mx-auto mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center float-animation">
            <i className="fa-solid fa-photo-film text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Media Companion — Turn Posts Into Visual Stories
          </h1>
          <p className="text-xl text-gray-300">
            Transform your text posts into engaging video scripts or carousels
          </p>
        </section>

        {/* ================= STEP 1 : INPUT TEXT ================= */}
<section
  id="input-section"
  className="glass-effect rounded-3xl p-8 mb-8 slide-up max-w-7xl mx-auto"
>
  <div className="flex items-center mb-6">
    <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white font-bold mr-4">
      1
    </div>
    <h2 className="text-2xl font-bold text-white">
      Input Your Post Content
    </h2>
  </div>

  <div className="grid lg:grid-cols-3 gap-6">
    {/* TEXTAREA */}
    <div className="lg:col-span-2">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste your existing post or write new content here...

Example:
Just launched our new AI feature that automatically generates social media posts from blog articles. The results have been incredible - 300% increase in engagement and 50% time savings for our content team.

Key learnings:
• AI doesn't replace creativity, it amplifies it
• Consistency beats perfection
• Data-driven content performs better

What's your experience with AI-powered content tools?`}
          className="w-full h-80 bg-black/20 border border-gray-700/50 rounded-2xl p-6 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-400/50 focus:bg-black/30 transition-all"
        />

        <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-gray-400 text-sm">
          <i className="fa-solid fa-keyboard"></i>
          <span>{charCount} / 2000</span>
        </div>
      </div>
    </div>

    {/* SIDE CARDS */}
    <div className="space-y-4">
      {/* QUICK TIPS */}
      <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fa-solid fa-lightbulb text-yellow-400 mr-2"></i>
          Quick Tips
        </h3>
        <div className="space-y-3 text-sm text-gray-400">
          {[
            "Include key points and insights for better script generation",
            "Add emotional hooks or compelling statistics",
            "Mention your target audience for better adaptation",
          ].map((tip) => (
            <div key={tip} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT ANALYSIS */}
      <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <i className="fa-solid fa-chart-line text-cyan-400 mr-2"></i>
          Content Analysis
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Readability</span>
            <span className="text-green-400">Good</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Engagement Potential</span>
            <span className="text-cyan-400">High</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Key Topics</span>
            <span className="text-violet-400">3 detected</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ================= STEP 2 : OUTPUT TYPE ================= */}
<section
  id="type-section"
 className="glass-effect rounded-3xl p-8 mb-8 slide-up max-w-7xl mx-auto"
>
  <div className="flex items-center mb-8">
    <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white font-bold mr-4">
      2
    </div>
    <h2 className="text-2xl font-bold text-white">
      Choose Your Output Type
    </h2>
  </div>

  <div className="grid md:grid-cols-2 gap-8">
    {/* VIDEO */}
    <div
      onClick={() => setSelectedType("video")}
      className={`type-selector cursor-pointer border rounded-3xl p-8 text-center transition ${
        selectedType === "video"
          ? "border-cyan-400/60 bg-cyan-400/10"
          : "bg-black/20 border-gray-700/50"
      }`}
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-cyan-400/20 flex items-center justify-center">
        <i className="fa-solid fa-video text-3xl text-cyan-400"></i>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        Video Script 🎬
      </h3>
      <p className="text-gray-400 mb-6">
        Generate a detailed script with scene-by-scene breakdown, timing,
        and visual cues perfect for short-form videos
      </p>
      <div className="space-y-2 text-sm text-gray-300">
        {[
          "Hook, body, and CTA structure",
          "Timing and pacing suggestions",
          "Visual direction notes",
        ].map((item) => (
          <div key={item} className="flex justify-center space-x-2">
            <i className="fa-solid fa-check text-green-400"></i>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>

    {/* CAROUSEL */}
    <div
      onClick={() => setSelectedType("carousel")}
      className={`type-selector cursor-pointer border rounded-3xl p-8 text-center transition ${
        selectedType === "carousel"
          ? "border-violet-400/60 bg-violet-400/10"
          : "bg-black/20 border-gray-700/50"
      }`}
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-violet-400/20 flex items-center justify-center">
        <i className="fa-solid fa-images text-3xl text-violet-400"></i>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        Carousel Slides 🖼️
      </h3>
      <p className="text-gray-400 mb-6">
        Create a multi-slide carousel with compelling headlines, key
        points, and design suggestions for each slide
      </p>
      <div className="space-y-2 text-sm text-gray-300">
        {[
          "5–10 optimized slides",
          "Headline and body text",
          "Visual design recommendations",
        ].map((item) => (
          <div key={item} className="flex justify-center space-x-2">
            <i className="fa-solid fa-check text-green-400"></i>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

        {/* ================= STEP 3 : GENERATE / RESULTS ================= */}
<Generate text={text} selectedType={selectedType} />

        {/* ================= TEMPLATES GALLERY ================= */}
<section
  id="templates-section"
  className="glass-effect rounded-3xl p-8 mb-8 slide-up max-w-7xl mx-auto"
>
  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
    <i className="fa-solid fa-layer-group text-yellow-400 mr-3"></i>
    Popular Templates
  </h3>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* TEMPLATE 1 */}
    <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/50 hover:border-cyan-400/50 transition-all cursor-pointer group">
      <div className="w-full h-32 bg-gradient-to-br from-cyan-400/20 to-violet-400/20 rounded-xl mb-4 flex items-center justify-center">
        <i className="fa-solid fa-rocket text-2xl text-cyan-400"></i>
      </div>
      <h4 className="text-white font-semibold mb-1">
        Product Launch
      </h4>
      <p className="text-gray-400 text-xs">
        Perfect for announcing new features or products
      </p>
    </div>

    {/* TEMPLATE 2 */}
    <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/50 hover:border-violet-400/50 transition-all cursor-pointer group">
      <div className="w-full h-32 bg-gradient-to-br from-violet-400/20 to-teal-400/20 rounded-xl mb-4 flex items-center justify-center">
        <i className="fa-solid fa-chart-line text-2xl text-violet-400"></i>
      </div>
      <h4 className="text-white font-semibold mb-1">
        Growth Story
      </h4>
      <p className="text-gray-400 text-xs">
        Share metrics, achievements, and milestones
      </p>
    </div>

    {/* TEMPLATE 3 */}
    <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/50 hover:border-teal-400/50 transition-all cursor-pointer group">
      <div className="w-full h-32 bg-gradient-to-br from-teal-400/20 to-yellow-400/20 rounded-xl mb-4 flex items-center justify-center">
        <i className="fa-solid fa-lightbulb text-2xl text-teal-400"></i>
      </div>
      <h4 className="text-white font-semibold mb-1">
        Tips & Insights
      </h4>
      <p className="text-gray-400 text-xs">
        Educational content and valuable tips
      </p>
    </div>

    {/* TEMPLATE 4 */}
    <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/50 hover:border-yellow-400/50 transition-all cursor-pointer group">
      <div className="w-full h-32 bg-gradient-to-br from-yellow-400/20 to-cyan-400/20 rounded-xl mb-4 flex items-center justify-center">
        <i className="fa-solid fa-users text-2xl text-yellow-400"></i>
      </div>
      <h4 className="text-white font-semibold mb-1">
        Behind the Scenes
      </h4>
      <p className="text-gray-400 text-xs">
        Personal stories and team highlights
      </p>
    </div>
  </div>
</section>
</div>
      </main>
    </div>
    
    );  
}
