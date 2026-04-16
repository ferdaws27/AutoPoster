import { useNavigate } from "react-router-dom";

export default function UpcomingPosts({ posts = [], onPublish, onScheduleNew }) {
  const navigate = useNavigate();

  const truncateContent = (content, maxLength = 80) => {
    if (!content) return "No description";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatScheduleDate = (scheduleDate, scheduleTime) => {
    if (!scheduleDate || !scheduleTime) return null;
    try {
      const postDate = new Date(`${scheduleDate}T${scheduleTime}`);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const postDateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
      const timePart = postDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      if (postDateOnly.getTime() === today.getTime()) return { label: "Today", time: timePart, urgent: true };
      if (postDateOnly.getTime() === tomorrow.getTime()) return { label: "Tomorrow", time: timePart, urgent: false };

      const daysDiff = Math.floor((postDateOnly - today) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 7) {
        return { label: postDate.toLocaleDateString("en-US", { weekday: "short" }), time: timePart, urgent: false };
      }
      return { label: postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }), time: timePart, urgent: false };
    } catch {
      return null;
    }
  };

  const getTimeUntil = (scheduleDate, scheduleTime) => {
    if (!scheduleDate || !scheduleTime) return null;
    try {
      const postDate = new Date(`${scheduleDate}T${scheduleTime}`);
      const now = new Date();
      const diffMs = postDate - now;
      if (diffMs < 0) return "Overdue";
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    } catch {
      return null;
    }
  };

  const upcomingPosts = (posts || [])
    .sort((a, b) => {
      const dateA = a.scheduleDate ? new Date(`${a.scheduleDate}T${a.scheduleTime || "00:00"}`) : new Date(a.createdAt || 0);
      const dateB = b.scheduleDate ? new Date(`${b.scheduleDate}T${b.scheduleTime || "00:00"}`) : new Date(b.createdAt || 0);
      return dateA - dateB;
    });

  const platformConfig = {
    twitter: { icon: "fa-x-twitter", bg: "bg-black", ring: "ring-gray-600", label: "X" },
    linkedin: { icon: "fa-linkedin-in", bg: "bg-blue-600", ring: "ring-blue-500", label: "LinkedIn" },
    medium: { icon: "fa-medium", bg: "bg-green-700", ring: "ring-green-600", label: "Medium" },
  };

  const statusConfig = {
    scheduled: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20", dot: "bg-emerald-400", icon: "fa-clock" },
    draft: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/20", dot: "bg-amber-400", icon: "fa-pen" },
    posted: { bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/20", dot: "bg-blue-400", icon: "fa-check" },
    Review: { bg: "bg-orange-400/10", text: "text-orange-400", border: "border-orange-400/20", dot: "bg-orange-400", icon: "fa-eye" },
  };
  const defaultStatus = { bg: "bg-cyan-400/10", text: "text-cyan-400", border: "border-cyan-400/20", dot: "bg-cyan-400", icon: "fa-circle" };

  return (
    <div className="glass-effect rounded-3xl overflow-hidden glow-card" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <i className="fa-solid fa-calendar-days text-cyan-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Upcoming Posts</h2>
            <p className="text-xs text-gray-400">{upcomingPosts.length} scheduled</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/scheduling")}
          className="text-xs text-gray-400 hover:text-cyan-400 transition-colors font-medium flex items-center gap-1.5"
        >
          View all
          <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>

      {/* Posts list */}
      <div className="px-4 pb-2">
        {!upcomingPosts || upcomingPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4">
              <i className="fa-solid fa-calendar-xmark text-gray-600 text-xl"></i>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">No posts scheduled</p>
            <p className="text-gray-600 text-xs">Create and schedule your first post</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {upcomingPosts.map((post, index) => {
              const dateInfo = formatScheduleDate(post.scheduleDate, post.scheduleTime);
              const countdown = getTimeUntil(post.scheduleDate, post.scheduleTime);
              const status = statusConfig[post.status] || defaultStatus;

              const platformArray = Array.isArray(post.platforms)
                ? post.platforms
                : post.platforms
                ? Object.keys(post.platforms).filter((p) => post.platforms[p])
                : [];

              return (
                <div
                  key={post.id ?? index}
                  className="group relative flex items-start gap-3 p-4 rounded-2xl hover:bg-white/[0.03] transition-all duration-200 cursor-default"
                >
                  {/* Post thumbnail */}
                  <img 
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10" 
                    src={post.selectedImages && post.selectedImages.length > 0 ? (typeof post.selectedImages[0] === 'string' ? post.selectedImages[0] : (post.selectedImages[0].thumbnail || post.selectedImages[0].url)) : `https://picsum.photos/100/100?random=${post.id ?? index}`}
                    alt="" 
                    onError={(e) => { e.target.src = `https://picsum.photos/100/100?random=${post.id ?? index}`; }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-sm font-semibold text-gray-100 truncate leading-snug">
                        {post.title || post.idea || "Untitled post"}
                      </h4>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${status.bg} ${status.text} border ${status.border}`}>
                        <i className={`fa-solid ${status.icon} text-[8px]`}></i>
                        {post.status || "Draft"}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {dateInfo ? `${dateInfo.label}, ${dateInfo.time}` : "TBD"}
                    </span>

                    {/* Bottom row: platforms + countdown */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {platformArray.map((p) => {
                          const name = typeof p === "string" ? p.toLowerCase() : p;
                          const cfg = platformConfig[name] || platformConfig.twitter;
                          return (
                            <div
                              key={p}
                              className={`w-5 h-5 ${cfg.bg} rounded-md flex items-center justify-center ring-1 ${cfg.ring}/30`}
                              title={cfg.label}
                            >
                              <i className={`fa-brands ${cfg.icon} text-white text-[10px]`}></i>
                            </div>
                          );
                        })}
                      </div>

                      {countdown && (
                        <span className={`text-xs font-medium ${countdown === "Overdue" ? "text-red-400" : "text-gray-400"}`}>
                          {countdown === "Overdue" ? (
                            <><i className="fa-solid fa-triangle-exclamation mr-1 text-[8px]"></i>Overdue</>
                          ) : (
                            <><i className="fa-regular fa-clock mr-1 text-[8px]"></i>in {countdown}</>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={onScheduleNew}
          className="w-full p-3 rounded-2xl border border-gray-700/50 bg-white/[0.02] text-gray-300 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          Schedule New Post
        </button>
      </div>
    </div>
  );
}
