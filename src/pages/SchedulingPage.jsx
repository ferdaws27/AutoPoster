import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";

export default function SchedulingPage() {
  const calendarRef = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [filter, setFilter] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [draft, setDraft] = useState(false);
  const navigateTo = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const addPost = (newPost, isDraft = false) => {
    setPosts([...posts, { id: Date.now(), ...newPost, draft: isDraft }]);
    showToast(isDraft ? "Post saved as Draft" : "Post Scheduled");
  };

  const deletePost = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
    showToast("Post Deleted");
    setShowDeleteModal(false);
  };

  const getPlatformColor = (platform) => {
    if (platform === "Twitter") return "#60a5fa";
    if (platform === "LinkedIn") return "#a78bfa";
    if (platform === "Medium") return "#34d399";
    return "#64748b";
  };

  const getStatus = (p) => {
    if (p.draft) return "Draft";
    const postDate = new Date(`${p.date}T${p.time}`);
    const now = new Date();
    return postDate <= now ? "Posted" : "Scheduled";
  };

  const filteredPosts = posts.filter((p) => {
    const postDate = new Date(`${p.date}T${p.time}`);
    const today = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(today.getDate() + 7);

    if (filter === "Today") return postDate.toDateString() === today.toDateString();
    if (filter === "This Week") return postDate >= today && postDate <= weekEnd;
    return true;
  });

  const navigate = (action) => {
    const calendarApi = calendarRef.current.getApi();
    if (action === "prev") calendarApi.prev();
    if (action === "next") calendarApi.next();
    if (action === "today") calendarApi.today();
    setCurrentDate(calendarApi.getDate());
  };

  return (
    <div className="flex text-white gradient-bg min-h-screen">
      {/* SIDEBAR */}
      <div className="w-64 glass-effect p-6 fixed h-full border-r border-white/10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
            <i className="fa-solid fa-pen-nib"></i>
          </div>
          <span className="text-xl font-bold">AutoPoster</span>
        </div>

        <nav className="space-y-2">
          {[
            { name: "Dashboard", icon: "fa-chart-line", path: "/dashboard" },
            { name: "Create Post", icon: "fa-plus", path: "/create-post" },
           { name: "Hook Generator", icon: "fa-calendar-days", path: "/hook-generator" },
            { name: "Create Post", icon: "fa-plus", path: "/create-post" },
            { name: "Posts Library", icon: "fa-folder", path: "/posts-library" },
            { name: "Analytics", icon: "fa-chart-pie", path: "/analytics" },
            { name: "Settings", icon: "fa-gear", path: "/settings" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => item.path && navigateTo(item.path)}
              className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer ${
                item.name === "Scheduler"
                  ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                  : "text-gray-300 hover:bg-white/5 transition-colors"
              }`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        {/* PROFILE */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-3 rounded-2xl glass-effect border border-white/10">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              className="w-10 h-10 rounded-xl"
            />
            <div>
              <div className="text-white font-medium text-sm">Dr. Khalil</div>
              <div className="text-gray-400 text-xs">Pro Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Content Scheduler</h1>
            <p className="text-gray-400">
              Plan and schedule your content across all platforms
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 gradient-accent rounded-2xl font-medium hover:opacity-90 transition"
          >
            + Add Schedule
          </button>
        </div>

        <div className="flex gap-6 h-[80vh]">
          {/* UPCOMING POSTS */}
          <div className="glass-effect rounded-3xl p-6 w-80 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Upcoming Posts</h2>

            <div className="flex space-x-2 mb-6">
              {["All", "Today", "This Week"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-sm ${
                    filter === f
                      ? "bg-cyan-400/20 text-cyan-400"
                      : "text-gray-400 hover:text-white transition-colors"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {filteredPosts.map((p) => {
              const status = getStatus(p);
              return (
                <div
                  key={p.id}
                  className="bg-black/30 p-4 rounded-2xl mb-4 border border-white/5 relative hover:border-cyan-400/30 transition"
                >
                  <div className="absolute top-2 right-2 flex space-x-2 text-gray-400 text-sm">
                    <i
                      className="fa-solid fa-pen cursor-pointer hover:text-cyan-400"
                      onClick={() => setShowAddModal(true)}
                    ></i>
                    <i
                      className="fa-solid fa-trash cursor-pointer hover:text-red-400"
                      onClick={() => {
                        setCurrentPost(p.id);
                        setShowDeleteModal(true);
                      }}
                    ></i>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        status === "Scheduled"
                          ? "bg-cyan-400/20 text-cyan-400"
                          : status === "Posted"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-400/20 text-yellow-400"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1 truncate">{p.content}</p>
                  <p className="text-xs text-gray-400">
                    {p.platform} — {p.date} {p.time}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CALENDAR */}
          <div className="flex-1 glass-effect rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                {[{ name: "LinkedIn", color: "#a78bfa" },
                  { name: "Twitter", color: "#60a5fa" },
                  { name: "Medium", color: "#34d399" }]
                  .map((p) => (
                    <div key={p.name} className="flex items-center space-x-1 text-sm">
                      <div
                        style={{ backgroundColor: p.color }}
                        className="w-4 h-4 rounded-full"
                      ></div>
                      <span>{p.name}</span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("prev")}
                  className="px-3 py-2 bg-black/30 rounded-xl hover:bg-black/50"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="px-4 py-2 bg-black/30 rounded-xl">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => navigate("next")}
                  className="px-3 py-2 bg-black/30 rounded-xl hover:bg-black/50"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
                <button
                  onClick={() => navigate("today")}
                  className="px-3 py-2 bg-cyan-400/20 rounded-xl hover:bg-cyan-400/30"
                >
                  Today
                </button>
              </div>
            </div>

            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridWeek"
              headerToolbar={false}
              height={200}
              editable={false}
              events={posts.map((p) => ({
                id: p.id,
                title: `${p.platform}: ${p.content}`,
                start: `${p.date}T${p.time}`,
                backgroundColor: getPlatformColor(p.platform),
                allDay: false,
              }))}
              eventContent={(arg) => (
                <div
                  className="text-white p-2 rounded-md font-semibold text-sm truncate"
                  style={{
                    backgroundColor: arg.event.backgroundColor,
                    margin: "2px 0",
                  }}
                >
                  {arg.event.title}
                </div>
              )}
              eventClick={(info) => {
                setCurrentPost(info.event.id);
                setShowDeleteModal(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30 relative overflow-hidden">
            <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Schedule New Post</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-3">Post Content</label>
                <textarea
                  id="modalPostContent"
                  className="w-full h-32 bg-black/30 rounded-2xl p-4 text-white placeholder-gray-500 border border-gray-600 focus:border-cyan-400 transition-colors resize-none"
                  placeholder="What's on your mind? Write your post here..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-3">Select Platforms</label>
                <div className="grid grid-cols-3 gap-4">
                  {["Twitter", "LinkedIn", "Medium"].map((p) => (
                    <label
                      key={p}
                      className="flex items-center space-x-2 p-4 rounded-2xl border border-gray-600 hover:border-blue-400 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms([...selectedPlatforms, p]);
                          } else {
                            setSelectedPlatforms(selectedPlatforms.filter((pl) => pl !== p));
                          }
                        }}
                        className="w-5 h-5 rounded bg-black/30 border-gray-600 text-blue-400 focus:ring-blue-400 focus:ring-2"
                      />
                      <i
                        className={`fa-brands fa-${p.toLowerCase()} text-xl`}
                        style={{ color: getPlatformColor(p) }}
                      ></i>
                      <span className="text-white">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-3">Date</label>
                  <input
                    type="date"
                    id="modalPostDate"
                    className="w-full bg-black/30 rounded-2xl p-4 text-white border border-gray-600 focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-3">Time</label>
                  <input
                    type="time"
                    id="modalPostTime"
                    className="w-full bg-black/30 rounded-2xl p-4 text-white border border-gray-600 focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* --- IMAGE SUGGESTIONS --- */}
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-3">Image Suggestions</label>
                <div className="flex space-x-3 overflow-x-auto">
                  {["image1.png","image2.png","image3.png"].map((img, i) => (
                    <img
                      key={i}
                      src={`/path/to/${img}`}
                      alt={`Suggestion ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => document.getElementById("modalPostContent").value += ` [Image: ${img}]`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">

                {/* SAVE AS DRAFT */}
                <button
                  className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                  onClick={() => {
                    const content = document.getElementById("modalPostContent").value;
                    const date = document.getElementById("modalPostDate").value;
                    const time = document.getElementById("modalPostTime").value;

                    if (!content || !date || !time)
                      return showToast("Fill all fields");
                    if (selectedPlatforms.length === 0)
                      return showToast("Select at least one platform");

                    selectedPlatforms.forEach((platform) =>
                      addPost({ content, date, time, platform }, true)
                    );

                    setSelectedPlatforms([]);
                    setDraft(false);
                    setShowAddModal(false);
                  }}
                >
                  Save as Draft
                </button>
                            
                {/* SCHEDULE POST */}
                <button
                  className="flex-1 p-4 rounded-2xl gradient-accent text-white font-medium hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const content = document.getElementById("modalPostContent").value;
                    const date = document.getElementById("modalPostDate").value;
                    const time = document.getElementById("modalPostTime").value;

                    if (!content || !date || !time)
                      return showToast("Fill all fields");
                    if (selectedPlatforms.length === 0)
                      return showToast("Select at least one platform");

                    selectedPlatforms.forEach((platform) =>
                      addPost({ content, date, time, platform }, false)
                    );

                    setSelectedPlatforms([]);
                    setDraft(false);
                    setShowAddModal(false);
                  }}
                >
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="glass-effect p-6 rounded-2xl text-center">
            <h3 className="text-xl mb-4">Delete Post?</h3>
            <button
              onClick={() => deletePost(currentPost)}
              className="bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed top-5 right-5 glass-effect p-3 rounded-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
