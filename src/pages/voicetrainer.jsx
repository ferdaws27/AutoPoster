import MainTrainingInterface from "../components/MainTrainingInterface";

export default function VoiceTrainer() {
  return (
    <div className="gradient-bg purple-waves-bg min-h-screen">

      {/* ================= SIDEBAR ================= */}
      <div className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-gray-700/50 z-30">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <i className="fa-solid fa-pen-nib text-white"></i>
            </div>
            <span className="text-xl font-bold text-white">AutoPoster</span>
          </div>

          <nav className="space-y-2">
            {[
              ["fa-chart-line", "Dashboard"],
              ["fa-plus", "Create Post"],
              ["fa-calendar", "Scheduler"],
              ["fa-folder", "Posts Library"],
              ["fa-chart-bar", "Analytics"],
            ].map(([icon, label]) => (
              <div
                key={label}
                className="flex items-center space-x-3 p-3 rounded-2xl text-gray-300 hover:bg-white/5 cursor-pointer"
              >
                <i className={`fa-solid ${icon} w-5`} />
                <span>{label}</span>
              </div>
            ))}

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-violet-400/10 text-violet-400 border border-violet-400/20">
              <i className="fa-solid fa-microphone w-5"></i>
              <span>Voice Trainer</span>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-3 rounded-2xl glass-effect">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              className="w-10 h-10 rounded-xl"
              alt="Profile"
            />
            <div>
              <div className="text-white font-medium text-sm">Dr. Khalil</div>
              <div className="text-gray-400 text-xs">Pro Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="ml-64 p-8">

        {/* ================= HEADER ================= */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center animate-float">
            <i className="fa-solid fa-microphone text-3xl text-white"></i>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Teach AutoPoster Your Writing Style
          </h1>

          <p className="text-xl text-gray-300 mb-2">
            Upload your previous posts to train AI on your unique voice
          </p>

          <p className="text-gray-400">
            The more content you provide, the better results
          </p>
        </div>

        {/* ================= MAIN TRAINING INTERFACE ================= */}
        <MainTrainingInterface />

        {/* ================= TRAINING TIPS ================= */}
        <div className="max-w-6xl mx-auto glass-effect rounded-3xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <i className="fa-solid fa-lightbulb text-yellow-400 mr-3"></i>
            Training Tips
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center mb-4">
                <i className="fa-solid fa-file-lines text-cyan-400"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Quality Over Quantity
              </h3>
              <p className="text-gray-400 text-sm">
                Upload your best-performing posts rather than everything.
              </p>
            </div>

            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center mb-4">
                <i className="fa-solid fa-layer-group text-violet-400"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Diverse Content Types
              </h3>
              <p className="text-gray-400 text-sm">
                Insights, stories, tips, questions, announcements.
              </p>
            </div>

            <div className="bg-black/20 rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center mb-4">
                <i className="fa-solid fa-clock text-teal-400"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Regular Updates
              </h3>
              <p className="text-gray-400 text-sm">
                Retrain monthly to keep your AI voice aligned.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
