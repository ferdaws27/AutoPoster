import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function OAuthButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-black/50 border border-gray-700 hover:border-cyan-400 transition-all group relative overflow-hidden"
    >
      <div className="relative z-10 flex items-center justify-center space-x-4">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={icon} className="text-white text-lg" />
        </div>
        <span className="text-white font-medium text-lg">{label}</span>
      </div>
    </button>
  );
}
