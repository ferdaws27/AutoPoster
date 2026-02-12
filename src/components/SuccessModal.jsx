import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export default function SuccessModal() {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-cyan-500 flex items-center justify-center animate-pulse">
          <FontAwesomeIcon icon={faCheck} className="text-white text-4xl" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-4">
          Welcome Aboard!
        </h2>

        <p className="text-xl text-gray-300 mb-8">
          Your AutoPoster account is ready 🚀
        </p>

        <div className="flex items-center justify-center gap-2">
          <Dot delay="0s" />
          <Dot delay="0.1s" />
          <Dot delay="0.2s" />
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <div
      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
      style={{ animationDelay: delay }}
    ></div>
  );
}
