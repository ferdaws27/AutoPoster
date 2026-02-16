function Stat({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

export default function StatsCard() {
  return (
    <div className="fixed bottom-8 left-8 right-8 glass-effect rounded-2xl p-6 border border-gray-700/50 flex justify-between items-center z-20">
      {/* Left stats */}
      <div className="flex items-center space-x-8">
        <Stat value="10K+" label="Posts Created" color="text-cyan-400" />
        <Stat value="500+" label="Active Users" color="text-violet-400" />
        <Stat value="95%" label="Time Saved" color="text-green-400" />
      </div>

      {/* Right side: Trusted by / avatars */}
      <div className="hidden md:flex flex-col items-end text-right space-y-2">
        <div className="text-white font-medium">Trusted by creators worldwide</div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
              className="w-8 h-8 rounded-full border-2 border-gray-700"
              alt="User"
            />
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              className="w-8 h-8 rounded-full border-2 border-gray-700"
              alt="User"
            />
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"
              className="w-8 h-8 rounded-full border-2 border-gray-700"
              alt="User"
            />
          </div>
          <span className="text-sm text-gray-400">+497 others</span>
        </div>
      </div>
    </div>
  );
}
