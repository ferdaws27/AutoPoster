export default function ExportDanger() {
  const handleExport = (type) => {
    switch (type) {
      case "posts":
        console.log("Exporting all posts...");
        alert("Exporting All Posts (CSV / JSON)");
        break;

      case "analytics":
        console.log("Exporting analytics...");
        alert("Exporting Analytics (PDF / Excel)");
        break;

      case "settings":
        console.log("Exporting settings...");
        alert("Exporting Settings (JSON)");
        break;

      default:
        break;
    }
  };

  const handleDangerAction = (action) => {
    const confirmed = window.confirm(
      "⚠️ This action is irreversible. Are you sure?"
    );

    if (!confirmed) return;

    if (action === "posts") {
      console.log("Deleting all posts...");
      alert("All posts deleted");
    }

    if (action === "account") {
      console.log("Deleting account...");
      alert("Account deleted");
    }
  };

  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-red-400/20 flex items-center justify-center">
          <i className="fa-solid fa-exclamation-triangle text-red-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Export & Danger Zone
          </h2>
          <p className="text-gray-400">
            Export your data or perform destructive actions
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* EXPORT */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Export Data</h3>
          <p className="text-gray-400">
            Download your posts, analytics, and settings
          </p>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleExport("posts")}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-cyan-400/50 transition-all group"
            >
              <i className="fa-solid fa-file-export text-2xl text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">All Posts</span>
              <span className="text-gray-400 text-sm">CSV, JSON</span>
            </button>

            <button
              onClick={() => handleExport("analytics")}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-violet-400/50 transition-all group"
            >
              <i className="fa-solid fa-chart-bar text-2xl text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Analytics</span>
              <span className="text-gray-400 text-sm">PDF, Excel</span>
            </button>

            <button
              onClick={() => handleExport("settings")}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-teal-400/50 transition-all group"
            >
              <i className="fa-solid fa-cog text-2xl text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Settings</span>
              <span className="text-gray-400 text-sm">JSON</span>
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="danger-zone rounded-2xl p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-exclamation-triangle text-red-400"></i>
            <h3 className="text-xl font-semibold text-white">Danger Zone</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-400/30">
            <div>
              <h4 className="text-white font-medium">Delete All Posts</h4>
              <p className="text-gray-400 text-sm">
                Permanently delete all your posts and drafts
              </p>
            </div>
            <button
              onClick={() => handleDangerAction("posts")}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30"
            >
              Delete All Posts
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-400/30">
            <div>
              <h4 className="text-white font-medium">Delete Account</h4>
              <p className="text-gray-400 text-sm">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() => handleDangerAction("account")}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
