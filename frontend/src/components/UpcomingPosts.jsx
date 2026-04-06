export default function UpcomingPosts({ posts = [], onPublish, onScheduleNew }) {
  // Format date in a logical and dynamic way
  const formatScheduleDate = (scheduleDate, scheduleTime) => {
    if (!scheduleDate || !scheduleTime) return "TBD";
    
    try {
      const postDate = new Date(`${scheduleDate}T${scheduleTime}`);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const postDateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
      
      let dateStr = "";
      const timePart = postDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      
      if (postDateOnly.getTime() === today.getTime()) {
        dateStr = `Today at ${timePart}`;
      } else if (postDateOnly.getTime() === tomorrow.getTime()) {
        dateStr = `Tomorrow at ${timePart}`;
      } else {
        const daysDiff = Math.floor((postDateOnly - today) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0 && daysDiff <= 7) {
          dateStr = `${postDate.toLocaleDateString("en-US", { weekday: "short" })} at ${timePart}`;
        } else {
          dateStr = `${postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timePart}`;
        }
      }
      return dateStr;
    } catch (e) {
      return "Invalid date";
    }
  };

  // Show all posts passed in, sorted by date, limited to 5
  const upcomingPosts = (posts || [])
    .sort((a, b) => {
      const dateA = a.scheduleDate ? new Date(`${a.scheduleDate}T${a.scheduleTime || '00:00'}`) : new Date(a.createdAt || 0);
      const dateB = b.scheduleDate ? new Date(`${b.scheduleDate}T${b.scheduleTime || '00:00'}`) : new Date(b.createdAt || 0);
      return dateA - dateB;
    })
    .slice(0, 5); // Show only next 5 posts

  return (
    <div id="upcoming-posts-section" className="glass-effect rounded-3xl p-6 glow-card" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Upcoming Posts</h2>
        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">View all</button>
      </div>

      <div className="space-y-4">
        {!upcomingPosts || upcomingPosts.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming posts yet</p>
        ) : (
          upcomingPosts.map((post) => {
            // Use the new dynamic date formatter
            const formattedTime = formatScheduleDate(post.scheduleDate, post.scheduleTime) || 
                                  (post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "TBD");

            const statusStyle =
              post.status === "scheduled"
                ? "bg-green-400/20 text-green-400"
                : post.status === "draft"
                ? "bg-yellow-400/20 text-yellow-400"
                : post.status === "posted"
                ? "bg-blue-400/20 text-blue-400"
                : post.status === "Review"
                ? "bg-yellow-400/20 text-yellow-400"
                : "bg-cyan-400/20 text-cyan-400";

            // Handle both array and object platforms formats
            const platformArray = Array.isArray(post.platforms) 
              ? post.platforms 
              : post.platforms 
              ? Object.keys(post.platforms).filter(p => post.platforms[p])
              : [];

            return (
              <div
                key={post.id ?? formattedTime}
                className="flex items-center p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="text-white font-medium text-sm mb-1">{formattedTime}</div>
                  <div className="flex space-x-2">
                    {platformArray.map((p) => {
                      const platformName = typeof p === 'string' ? p.toLowerCase() : p;
                      const platformStyle = platformName === "linkedin" ? "bg-blue-600" : platformName === "twitter" ? "bg-black" : "bg-teal-600";
                      const iconClass = platformName === "twitter" ? "fa-twitter" : platformName === "linkedin" ? "fa-linkedin-in" : "fa-medium";

                      return (
                        <div key={p} className={`w-6 h-6 ${platformStyle} rounded-lg flex items-center justify-center`}>
                          <i className={`fa-brands ${iconClass} text-white text-xs`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 ml-4">
                  <div className="text-white font-medium mb-1">{post.title || post.idea || post.content || "Untitled post"}</div>
                  <div className="text-gray-400 text-sm line-clamp-2">{post.desc || post.content || post.excerpt || "No description"}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>{post.status || "Draft"}</span>
                  {post.status !== "posted" && onPublish && (
                    <button
                      onClick={() => onPublish(post.id)}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      Mark as Published
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <button 
          onClick={onScheduleNew}
          className="w-full p-4 rounded-2xl border-2 border-cyan-400/40 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/15 hover:border-cyan-400/70 transition-all text-sm font-semibold flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-calendar-plus"></i>
          Schedule New Post
        </button>
      </div>
    </div>
  );
}
