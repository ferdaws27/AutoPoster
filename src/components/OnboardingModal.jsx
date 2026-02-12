import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import {
  faXTwitter,
  faLinkedin,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30 relative">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faRocket} className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Let’s Get You Started
          </h2>
          <p className="text-gray-400">
            Complete your profile to unlock AutoPoster
          </p>
        </div>

        {/* STEPS */}
        <div className="flex items-center justify-between mb-8">
          <Step active label="Connect Platforms" number="1" />
          <Divider />
          <Step label="Set Preferences" number="2" />
          <Divider />
          <Step label="Create First Post" number="3" />
        </div>

        {/* CONTENT */}
        <div className="bg-black/30 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Choose Your Platforms
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <Platform icon={faXTwitter} label="Twitter / X" />
            <Platform icon={faLinkedin} label="LinkedIn" />
            <Platform icon={faMedium} label="Medium" />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white"
          >
            Skip for now
          </button>
          <button className="flex-1 p-4 rounded-2xl bg-cyan-500 text-white font-medium">
            Continue Setup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function Step({ number, label, active }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          active ? "bg-cyan-400 text-black" : "bg-gray-600 text-white"
        }`}
      >
        {number}
      </div>
      <span className={active ? "text-white" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="flex-1 h-px bg-gray-600 mx-4" />;
}

function Platform({ icon, label }) {
  return (
    <div className="text-center p-4 rounded-xl border border-gray-600 hover:border-cyan-400 cursor-pointer">
      <FontAwesomeIcon icon={icon} className="text-3xl text-white mb-2" />
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  );
}
