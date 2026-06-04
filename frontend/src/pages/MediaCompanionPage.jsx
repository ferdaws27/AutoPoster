import { useEffect, useRef, useState } from "react";
import Generate from "../components/generat";
import useTranslation from "../i18n/useTranslation";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function App() {
  const t = useTranslation();
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [viewingCarousel, setViewingCarousel] = useState(null);
  const inputRef = useRef(null);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (viewingCarousel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [viewingCarousel]);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  useEffect(() => {
    const handleViewCarousel = (event) => {
      setViewingCarousel(event.detail);
    };

    window.addEventListener('viewCarousel', handleViewCarousel);
    return () => {
      window.removeEventListener('viewCarousel', handleViewCarousel);
    };
  }, []);

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
            {t("media.title")}
          </h1>
          <p className="text-xl text-gray-300">
            {t("media.subtitle")}
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
      {t("media.inputLabel")}
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
          {t("media.quickTips")}
        </h3>
        <div className="space-y-3 text-sm text-gray-400">
          {[
            t("media.tip1"),
            t("media.tip2"),
            t("media.tip3"),
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
          {t("media.contentAnalysis")}
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">{t("media.readability")}</span>
            <span className="text-green-400">{t("media.good")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{t("media.engagementPotential")}</span>
            <span className="text-cyan-400">{t("media.high")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{t("media.keyTopics")}</span>
            <span className="text-violet-400">3 {t("media.detected")}</span>
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
      {t("media.chooseOutput")}
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

        {/* ================= SAVED VISUAL PLANS ================= */}
        <section
          id="saved-plans-section"
          className="glass-effect rounded-3xl p-8 mb-8 slide-up max-w-7xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <i className="fa-solid fa-bookmark text-yellow-400 mr-3"></i>
            Saved Visual Plans
          </h3>

          <div id="saved-plans-container" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Saved plans will be dynamically added here */}
            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50 text-center text-gray-400">
              <i className="fa-solid fa-folder-open text-4xl mb-4 text-gray-500"></i>
              <p>No saved visual plans yet</p>
              <p className="text-sm mt-2">Generate and save your first carousel to see it here</p>
            </div>
          </div>
        </section>

        {/* Carousel View Modal */}
        {viewingCarousel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 className="text-2xl font-bold text-white">
                  <i className="fa-solid fa-images text-violet-400 mr-3" />
                  {viewingCarousel.title}
                </h3>
                <button
                  onClick={() => setViewingCarousel(null)}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                >
                  <i className="fa-solid fa-times" />
                </button>
              </div>

              {/* Carousel Container */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="relative bg-black/30 rounded-2xl p-4 min-h-[300px]">
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('modal-carousel');
                      if (container) {
                        container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
                      }
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                  >
                    <i className="fa-solid fa-chevron-left text-xs" />
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById('modal-carousel');
                      if (container) {
                        container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                  >
                    <i className="fa-solid fa-chevron-right text-xs" />
                  </button>

                  {/* Carousel Slides */}
                  <div
                    id="modal-carousel"
                    className="flex overflow-x-hidden snap-x snap-mandatory rounded-xl mb-4"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {viewingCarousel.data?.slides?.map((slide, i) => (
                      <div
                        key={i}
                        className="flex-none w-full snap-center px-1"
                        style={{ scrollSnapAlign: 'center' }}
                      >
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
                          {/* Image Section */}
                          <div className="aspect-video relative">
                            {viewingCarousel.slideImages && viewingCarousel.slideImages[i] ? (
                              <img
                                src={viewingCarousel.slideImages[i]}
                                alt={`Slide ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : viewingCarousel.image ? (
                              // Extract individual slide from full carousel image for old saves
                              <div className="w-full h-full relative overflow-hidden">
                                <img
                                  src={viewingCarousel.image}
                                  alt={`Slide ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  style={{
                                    transform: `translateX(-${i * 100}%)`,
                                    width: `${viewingCarousel.slides * 100}%`
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                                <i className="fa-solid fa-image text-4xl text-violet-400" />
                              </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            
                            {/* Slide Number Badge */}
                            <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{i + 1}</span>
                            </div>
                          </div>

                          {/* Text Section */}
                          <div className="p-4 text-center bg-gray-800/50">
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                              {slide.headline}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                              {slide.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dots Navigation */}
                  <div className="flex justify-center space-x-2 mt-4 mb-4">
                    {viewingCarousel.data?.slides?.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const container = document.getElementById('modal-carousel');
                          if (container) {
                            const slideWidth = container.offsetWidth;
                            container.scrollTo({ left: i * slideWidth, behavior: 'smooth' });
                          }
                        }}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i === 0 ? '#8B5CF6' : '#374151',
                          width: i === 0 ? '24px' : '6px'
                        }}
                      />
                    ))}
                  </div>

                  {/* Scroll Indicator */}
                  <div className="text-center text-gray-400 text-xs mb-4">
                    <i className="fa-solid fa-arrows-up-down mr-2" />
                    Scroll down to see all slides
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center p-4 border-t border-gray-700 bg-gray-900">
                <div className="text-gray-400 text-sm">
                  <i className="fa-solid fa-images mr-2" />
                  {viewingCarousel.slides} slides • {new Date(viewingCarousel.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = viewingCarousel.image;
                      a.download = `${viewingCarousel.title.replace(/[^a-zA-Z0-9]/g, '_')}_carousel.png`;
                      a.click();
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                  >
                    <i className="fa-solid fa-download mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => setViewingCarousel(null)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>
    </div>
    
    );  
}
