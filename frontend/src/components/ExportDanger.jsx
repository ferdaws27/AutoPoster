import * as Dialog from "@radix-ui/react-dialog";
import { Toaster, toast } from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function ExportDanger() {
  // Fonction pour afficher un toast
  const showSuccessToast = (title, message) => {
    toast.success(`${title}\n${message}`, {
      style: {
        background: "#1f1f1f",
        color: "#fff",
        border: "1px solid #00ffff",
        padding: "16px",
        borderRadius: "12px",
      },
    });
  };

  // Gestion des exports
  const handleExport = (type) => {
    switch (type) {
      case "posts":
        console.log("Exporting all posts...");
        showSuccessToast("Export Started", "Your All Posts export is being prepared");
        break;
      case "analytics":
        console.log("Exporting analytics...");
        showSuccessToast("Export Started", "Your Analytics export is being prepared");
        break;
      case "settings":
        console.log("Exporting settings...");
        showSuccessToast("Export Started", "Your Settings export is being prepared");
        break;
      default:
        break;
    }
  };

  // Gestion des actions dangereuses
  const handleDangerAction = (action) => {
    if (action === "posts") {
      console.log("Deleting all posts...");
      toast.error("All posts deleted");
    }
    if (action === "account") {
      console.log("Deleting account...");
      toast.error("Account deleted");
    }
  };

  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      {/* Toaster global */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* HEADER */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-red-400/20 flex items-center justify-center">
          <i className="fa-solid fa-exclamation-triangle text-red-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Export & Danger Zone</h2>
          <p className="text-gray-400">Export your data or perform destructive actions</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* EXPORT SECTION */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Export Data</h3>
          <p className="text-gray-400">Download your posts, analytics, and settings</p>

          <div className="grid grid-cols-3 gap-4">
            {/* All Posts */}
            <button
              onClick={() => handleExport("posts")}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-cyan-400/50 transition-all group"
            >
              <i className="fa-solid fa-file-export text-2xl text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">All Posts</span>
              <span className="text-gray-400 text-sm">CSV, JSON</span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => handleExport("analytics")}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-violet-400/50 transition-all group"
            >
              <i className="fa-solid fa-chart-bar text-2xl text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Analytics</span>
              <span className="text-gray-400 text-sm">PDF, Excel</span>
            </button>

            {/* Settings */}
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

          {/* DELETE ALL POSTS */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-400/30 cursor-pointer">
                <div>
                  <h4 className="text-white font-medium">Delete All Posts</h4>
                  <p className="text-gray-400 text-sm">Permanently delete all your posts and drafts</p>
                </div>
                <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30">
                  Delete All Posts
                </button>
              </div>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-black/90 rounded-3xl p-6 border border-red-400/30">
                <Dialog.Title className="text-xl font-bold text-white mb-4">
                  ⚠️ Confirm Delete All Posts
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 mb-6">
                  This action is irreversible. Are you sure you want to delete all posts?
                </Dialog.Description>
                <div className="flex justify-end space-x-3">
                  <Dialog.Close className="px-4 py-2 bg-gray-700 rounded-xl text-white">Cancel</Dialog.Close>
                  
                  {/* Close first, toast second */}
                  <Dialog.Close asChild>
                    <button
                      onClick={() => setTimeout(() => handleDangerAction("posts"), 50)}
                      className="px-4 py-2 bg-red-500 rounded-xl text-white"
                    >
                      Delete All Posts
                    </button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* DELETE ACCOUNT */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-400/30 cursor-pointer">
                <div>
                  <h4 className="text-white font-medium">Delete Account</h4>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30">
                  Delete Account
                </button>
              </div>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-black/90 rounded-3xl p-6 border border-red-400/30">
                <Dialog.Title className="text-xl font-bold text-white mb-4">⚠️ Confirm Delete Account</Dialog.Title>
                <Dialog.Description className="text-gray-400 mb-6">
                  This action is irreversible. Are you sure you want to delete your account?
                </Dialog.Description>
                <div className="flex justify-end space-x-3">
                  <Dialog.Close className="px-4 py-2 bg-gray-700 rounded-xl text-white">Cancel</Dialog.Close>
                  
                  {/* Close first, toast second */}
                  <Dialog.Close asChild>
                    <button
                      onClick={() => setTimeout(() => handleDangerAction("account"), 50)}
                      className="px-4 py-2 bg-red-500 rounded-xl text-white"
                    >
                      Delete Account
                    </button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

        </div>
      </div>
    </div>
  );
}
