import { create } from "zustand";
import { apiFetch } from "../services/api";
import { getSettings } from "../hooks/useSettings";

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
  generationCount: 0,

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

  refreshAIIdeas: async () => {
    try {
      set({ aiSuggestion: "Generating AI ideas..." });
      
      // Incrémenter le compteur de générations
      const currentCount = get().generationCount + 1;
      set({ generationCount: currentCount });
      
      const settings = getSettings();
      
      const data = await apiFetch("/api/ai-ideas/generate", {
        method: "POST",
        body: JSON.stringify({
          generationCount: currentCount,
          model: settings.modelId,
          temperature: settings.temperature,
          tone: settings.toneLabel,
          creativity: settings.creativity,
          contentLength: settings.contentLength,
          voiceProfile: settings.voiceProfile,
          language: settings.language || "en",
        }),
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to generate ideas");
      }

      // Ajouter des IDs uniques
      const formattedIdeas = data.ideas.map((idea, index) => ({
        id: Date.now() + index,
        ...idea,
      }));

      set({ 
        aiIdeas: formattedIdeas, 
        aiSuggestion: `✅ Generation ${currentCount} completed: 5 new ${data.phase} ideas!` 
      });
      
    } catch (error) {
      console.error("Error generating AI ideas:", error);
      
      // On error, generate dynamic fallback ideas based on generation count
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
      const fallbackThemes = [
        {
          phase: "discovery",
          topics: [
            `AI in ${currentMonth}: new tools to explore`,
            `Emerging tech: what's new and exciting`,
            `AI tools: latest releases`,
            `Trends: recent innovations`,
            `Discovery: fresh technologies`
          ]
        },
        {
          phase: "deep-dive",
          topics: [
            `Productivity: optimize 80% of your workflow`,
            `Advanced AI strategies`,
            `Workflow: concrete techniques`,
            `Optimization: proven methods`,
            `Performance: how to improve`
          ]
        },
        {
          phase: "specialization",
          topics: [
            `Expert prompts for developers`,
            `Advanced technical niches`,
            `Specialization: advanced topics`,
            `Expertise: rare skills`,
            `Mastery: pro techniques`
          ]
        },
        {
          phase: "experimentation",
          topics: [
            `Challenge: 30 days without social media`,
            `Unconventional approaches`,
            `Experimentation: try the unexpected`,
            `Innovation: think outside the box`,
            `Testing: original methods`
          ]
        },
        {
          phase: "domination",
          topics: [
            `Leadership: become the AI reference`,
            `Authority: LinkedIn expertise`,
            `Domination: market strategy`,
            `Influence: build your brand`,
            `Excellence: lead the field`
          ]
        }
      ];
      
      const themeIndex = (currentCount - 1) % fallbackThemes.length;
      const currentFallbackTheme = fallbackThemes[themeIndex];
      
      const fallbackIdeas = currentFallbackTheme.topics.map((topic, index) => ({
        id: Date.now() + index,
        category: ["Strategy", "Trend", "Growth", "Tips", "Tech"][index],
        platform: ["twitter", "linkedin", "medium", "twitter", "linkedin"][index],
        title: topic,
        desc: `${currentFallbackTheme.phase} strategy for ${currentMonth}.`,
        status: ["Scheduled", "Review", "Draft", "Scheduled", "Review"][index],
      }));
      
      set({ 
        aiIdeas: fallbackIdeas, 
        aiSuggestion: `⚠️ Error: ${error.message}` 
      });
    }
  },

  importPosts: (importedPosts) =>
    set((state) => {
      const merged = [...importedPosts, ...state.posts];
      const deduped = Array.from(new Map(merged.map((item) => [item.id, item])).values());
      return { posts: deduped };
    }),

  // action to add a generated post from ai idea or input
  createDraft: async (content, platforms) => {
    try {
      const platformsObj = Array.isArray(platforms) 
        ? platforms.reduce((acc, p) => ({ ...acc, [p]: true }), {})
        : platforms || {};

      // Create via backend API
      const response = await apiFetch('/api/posts/', {
        method: 'POST',
        body: JSON.stringify({
          content: content,
          platforms: platformsObj,
          status: 'draft'
        })
      });

      if (response.success && response.data) {
        const newPost = {
          id: response.data._id,
          title: content.slice(0, 50),
          desc: response.data.content,
          content: response.data.content,
          status: 'draft',
          statusColor: 'cyan',
          platforms: platformsObj,
          scheduledAt: null,
          createdAt: response.data.created_at,
          idea: response.data.content
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
          aiSuggestion: '✅ Draft saved successfully!'
        }));
      } else {
        throw new Error(response.error || 'Failed to create draft');
      }
    } catch (error) {
      console.error('Failed to create draft:', error);
      set({ aiSuggestion: `❌ Error: ${error.message}` });
      throw error;
    }
  },

  createScheduled: async (content, platforms) => {
    try {
      const platformsObj = Array.isArray(platforms) 
        ? platforms.reduce((acc, p) => ({ ...acc, [p]: true }), {})
        : platforms || {};

      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      // Create via backend API
      const response = await apiFetch('/api/posts/', {
        method: 'POST',
        body: JSON.stringify({
          content: content,
          platforms: platformsObj,
          status: 'scheduled',
          schedule_date: scheduledAt.split('T')[0],
          schedule_time: scheduledAt.split('T')[1].slice(0, 5)
        })
      });

      if (response.success && response.data) {
        const newPost = {
          id: response.data._id,
          title: content.slice(0, 50),
          desc: response.data.content,
          content: response.data.content,
          status: 'scheduled',
          statusColor: 'green',
          platforms: platformsObj,
          scheduledAt,
          createdAt: response.data.created_at,
          idea: response.data.content
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
          aiSuggestion: '✅ Post scheduled successfully!'
        }));
      } else {
        throw new Error(response.error || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Failed to schedule post:', error);
      set({ aiSuggestion: `❌ Error: ${error.message}` });
      throw error;
    }
  },
}));

export default useDashboardStore;
