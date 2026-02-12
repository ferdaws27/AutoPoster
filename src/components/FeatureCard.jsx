import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FeatureCard({ title, icon, items }) {
  return (
    <div className="w-72 glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FontAwesomeIcon icon={icon} className="text-cyan-400" />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <ul className="text-gray-400 text-sm space-y-2">
        {items.map((item, i) => (
          <li key={i}>✔ {item}</li>
        ))}
      </ul>
    </div>
  );
}
