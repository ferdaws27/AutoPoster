export default function UpcomingPosts({ posts = [], onPublish }) {
  return (
    <div id="upcoming-posts-section" className="glass-effect rounded-3xl p-6 glow-card" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Upcoming Posts</h2>
        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">View all</button>
      </div>

      <div className="space-y-4">
        {!posts || posts.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming posts yet</p>
        ) : (
          posts.map((post) => {
            // Handle both scheduledAt and scheduleDate/scheduleTime formats
            const formattedTime = post.scheduledAt
              ? new Date(post.scheduledAt).toLocaleString()
              : (post.scheduleDate && post.scheduleTime)
              ? new Date(`${post.scheduleDate} ${post.scheduleTime}`).toLocaleString()
              : post.time || "TBD";

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
                      const iconClass = platformName === "twitter" ? "fa-x-twitter" : platformName === "linkedin" ? "fa-linkedin-in" : "fa-medium";

                      return (
                        <div key={p} className={`w-6 h-6 ${platformStyle} rounded-lg flex items-center justify-center`}>
                          <i className={`fa-brands ${iconClass} text-white text-xs`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 ml-4">
                  <div className="text-white font-medium mb-1">{post.title || post.idea || "Untitled post"}</div>
                  <div className="text-gray-400 text-sm line-clamp-2">{post.desc || post.content || post.excerpt || "No description"}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>{post.status || "Draft"}</span>
                  {post.status !== "Published" && onPublish && (
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
        <button className="w-full p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-all text-sm font-medium">
          <i className="fa-solid fa-plus mr-2"></i>
          Schedule New Post
        </button>
      </div>
    </div>
  );
}
