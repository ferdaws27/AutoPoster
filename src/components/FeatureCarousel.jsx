import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagicWandSparkles,
  faClock,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const FEATURES = [
  {
    icon: faMagicWandSparkles,
    title: "AI Content Optimization",
    description:
      "Automatically adapts your content for each platform’s audience and format.",
    color: "cyan",
  },
  {
    icon: faClock,
    title: "Smart Scheduling",
    description:
      "Posts at optimal times based on engagement and audience behavior.",
    color: "violet",
  },
  {
    icon: faChartLine,
    title: "Advanced Analytics",
    description:
      "Track growth, engagement, and ROI across all platforms.",
    color: "green",
  },
];

export default function FeatureCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const feature = FEATURES[index];

  return (
    <div className="fixed top-8 left-8 w-96 z-20 hidden lg:block">
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Why AutoPoster?</h3>
          <div className="flex space-x-1">
            {FEATURES.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === index ? "bg-cyan-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 transition-all">
          <div className="flex items-start space-x-3">
            <div
              className={`w-8 h-8 rounded-lg bg-${feature.color}-400/20 flex items-center justify-center`}
            >
              <FontAwesomeIcon
                icon={feature.icon}
                className={`text-${feature.color}-400 text-sm`}
              />
            </div>
            <div>
              <div className="text-white font-medium mb-1">
                {feature.title}
              </div>
              <div className="text-gray-400 text-sm">
                {feature.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
