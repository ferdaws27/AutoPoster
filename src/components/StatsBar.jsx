export default function StatsBar() {
  return (
    <div className="fixed bottom-8 left-8 right-8 glass-effect rounded-2xl p-6 flex justify-around text-center z-20">
      <Stat value="10K+" label="Posts Created" />
      <Stat value="500+" label="Active Users" />
      <Stat value="95%" label="Time Saved" />
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-2xl font-bold text-cyan-400">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
