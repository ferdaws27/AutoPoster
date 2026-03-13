import { create } from "zustand";
import { apiFetch } from "../services/api";

const initialAIIdeas = [
  {
    id: 1,
    category: "Trending",
    platform: "twitter",
    title: "5 AI Tools That Will Transform Your Workflow",
    desc: "Discover the latest AI innovations that are revolutionizing productivity and content creation.",
    status: "Scheduled",
  },
  {
    id: 2,
    category: "Insights",
    platform: "medium",
    title: "The Future of Content Creation is Here",
    desc: "How AI is changing the way we create and distribute content across channels.",
    status: "Review",
  },
  {
    id: 3,
    category: "Growth",
    platform: "linkedin",
    title: "Building a Personal Brand in the AI Era",
    desc: "Essential strategies for standing out in a world of automation.",
    status: "Draft",
  },
];

const useDashboardStore = create((set, get) => ({
  posts: [],
  content: "",
  user: null,
  loading: true,
  showCreateModal: false,
  platforms: { twitter: true, linkedin: true, medium: false },
  aiOptions: { optimize: true, images: true },
  aiSuggestion: "",
  aiIdeas: initialAIIdeas,

  setContent: (content) => set({ content }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setPlatforms: (platforms) => set({ platforms }),
  setAiOptions: (aiOptions) => set({ aiOptions }),
  setAiSuggestion: (aiSuggestion) => set({ aiSuggestion }),
  setAiIdeas: (aiIdeas) => set({ aiIdeas }),

  loadUserFromStorage: () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) set({ user: storedUser });
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
    }
  },

  loadPostsFromStorage: () => {
    try {
      const storedPosts = JSON.parse(localStorage.getItem("autoposter_posts") || "[]");
      set({ posts: storedPosts, loading: false });
    } catch (error) {
      console.error("Failed to load posts from localStorage", error);
      set({ posts: [], loading: false });
    }
  },

  fetchPostsFromServer: async () => {
    set({ loading: true });
    try {
      const posts = await apiFetch("/api/posts");
      if (Array.isArray(posts)) {
        set({ posts });
      }
    } catch (error) {
      console.error("Unable to fetch posts from backend", error);
    } finally {
      set({ loading: false });
    }
  },

  savePostsToStorage: () => {
    const posts = get().posts;
    localStorage.setItem("autoposter_posts", JSON.stringify(posts));
  },

  setPosts: (posts) => set({ posts }),

  addPost: async (post) => {
    set((state) => ({ posts: [post, ...state.posts] }));
    try {
      await apiFetch("/api/posts", { method: "post", data: post });
    } catch (error) {
      console.warn("Failed to save post to backend; keeping local copy", error);
    }
  },

  updatePost: async (id, patch) => {
    set((state) => ({
      posts: state.posts.map((post) => (post.id === id ? { ...post, ...patch } : post)),
    }));

    try {
      await apiFetch(`/api/posts/${id}`, { method: "put", data: patch });
    } catch (error) {
      console.warn("Failed to update post on backend", error);
    }
  },

  markPublished: async (id) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? {
              ...post,
              status: "Published",
              statusColor: "green",
              time: "Published",
              publishedAt: new Date().toISOString(),
              views: post.views || Math.floor(Math.random() * 500 + 100),
              engagement: post.engagement || Math.floor(Math.random() * 50 + 10),
              rating: post.rating || Number((Math.random() * 2 + 3).toFixed(1)),
            }
          : post
      ),
    }));

    try {
      await apiFetch(`/api/posts/${id}/publish`, { method: "post" });
    } catch (error) {
      console.warn("Failed to mark published on backend", error);
    }
  },

  refreshAIIdeas: () => {
    const newIdeas = [
      {
        id: Date.now(),
        category: "Strategy",
        platform: "twitter",
        title: "How to Use AI for Smarter Content Repurposing",
        desc: "Turn existing posts into 5 high-engagement formats in minutes.",
        status: "Scheduled",
      },
      {
        id: Date.now() + 1,
        category: "Trend",
        platform: "medium",
        title: "AI Writing Prompts for LinkedIn Thought Leadership",
        desc: "Capture industry attention with data-driven insights and practical examples.",
        status: "Review",
      },
      {
        id: Date.now() + 2,
        category: "Growth",
        platform: "linkedin",
        title: "A 7-Day AI Newsletter Challenge",
        desc: "Create daily micro-articles that drive subscribers and engagement.",
        status: "Draft",
      },
    ];
    set({ aiIdeas: newIdeas, aiSuggestion: "AI ideas rafraîchies !" });
  },

  importPosts: (importedPosts) =>
    set((state) => {
      const merged = [...importedPosts, ...state.posts];
      const deduped = Array.from(new Map(merged.map((item) => [item.id, item])).values());
      return { posts: deduped };
    }),

  // action to add a generated post from ai idea or input
  createDraft: (content, platforms) =>
    set((state) => ({
      posts: [
        {
          id: Date.now(),
          time: "Draft",
          title: content.slice(0, 50),
          desc: "Saved as draft",
          status: "Draft",
          statusColor: "cyan",
          platforms: platforms,
          scheduledAt: null,
        },
        ...state.posts,
      ],
    })),

  createScheduled: (content, platforms) =>
    set((state) => {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      return {
        posts: [
          {
            id: Date.now(),
            time: "Scheduled",
            title: content.slice(0, 50),
            desc: "Post scheduled",
            status: "Scheduled",
            statusColor: "green",
            platforms: platforms,
            scheduledAt,
          },
          ...state.posts,
        ],
      };
    }),
}));

export default useDashboardStore;
