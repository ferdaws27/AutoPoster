export default function UpcomingPosts({ posts }) {
  return (
    <div className="glass-effect rounded-3xl p-6 glow-card">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Upcoming Posts</h2>
        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
          View all
        </button>
      </div>

      {/* POSTS LIST */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-gray-400 text-sm">
            No upcoming posts yet.
          </p>
        )}

        {posts.map((post, index) => (
          <div
            key={index}
            className="flex items-center p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
          >
            {/* LEFT */}
            <div className="flex-shrink-0">
              <div className="text-white font-medium text-sm mb-1">
                {post.time}
              </div>

              <div className="flex space-x-2">
                {post.platforms.map((p, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      p === "linkedin"
                        ? "bg-blue-600"
                        : "bg-black"
                    }`}
                  >
                    <i
                      className={`fa-brands ${
                        p === "twitter"
                          ? "fa-x-twitter"
                          : p === "linkedin"
                          ? "fa-linkedin-in"
                          : "fa-medium"
                      } text-white text-xs`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 ml-4">
              <div className="text-white font-medium mb-1">
                {post.title}
              </div>
              <div className="text-gray-400 text-sm">
                {post.excerpt}
              </div>
            </div>

            {/* STATUS */}
            <div className="flex-shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === "Scheduled"
                    ? "bg-green-400/20 text-green-400"
                    : post.status === "Review"
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-cyan-400/20 text-cyan-400"
                }`}
              >
                {post.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <button className="w-full p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-all text-sm font-medium">
          <i className="fa-solid fa-plus mr-2"></i>
          Schedule New Post
        </button>
      </div>
    </div>
  );
}
