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
      set({ aiSuggestion: "Génération d'idées AI en cours..." });
      
      // Incrémenter le compteur de générations
      const currentCount = get().generationCount + 1;
      set({ generationCount: currentCount });
      
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
      
      // Debug: Vérifier si la clé API est chargée
      console.log("=== AI IDEAS DEBUG ===");
      console.log("API Key exists:", !!apiKey);
      console.log("API Key length:", apiKey?.length);
      console.log("API Key starts with:", apiKey?.substring(0, 10) + "...");
      console.log("Génération numéro:", currentCount);
      
      if (!apiKey) {
        throw new Error("Clé API OpenRouter non trouvée. Veuillez configurer VITE_OPENROUTER_API_KEY dans .env");
      }
      
      // Adapter le contenu en fonction du numéro de génération
      const generationThemes = [
        {
          phase: "découverte",
          focus: "tendances émergentes et innovations récentes",
          angle: "ce qui est nouveau et surprenant"
        },
        {
          phase: "approfondissement", 
          focus: "stratégies avancées et techniques concrètes",
          angle: "comment appliquer et optimiser"
        },
        {
          phase: "spécialisation",
          focus: "niches spécifiques et expertises pointues", 
          angle: "sujets techniques et avancés"
        },
        {
          phase: "expérimentation",
          focus: "approches non conventionnelles et tests",
          angle: "essayer ce que les autres ne font pas"
        },
        {
          phase: "domination",
          focus: "stratégies de leadership et d'autorité",
          angle: "devenir la référence dans son domaine"
        }
      ];
      
      const themeIndex = (currentCount - 1) % generationThemes.length;
      const currentTheme = generationThemes[themeIndex];
      
      const prompt = `Tu es un expert en marketing digital et création de contenu. C'est la GÉNÉRATION ${currentCount}.

CONTEXTE: ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
PHASE ACTUELLE: ${currentTheme.phase}
FOCUS SPÉCIFIQUE: ${currentTheme.focus}
ANGLE D'APPROCHE: ${currentTheme.angle}

GÉNÈRE 5 idées de contenu UNIQUEMENT pour cette phase ${currentTheme.phase}. 
Ces idées doivent être COMPLÈTEMENT DIFFÉRENTES des générations précédentes.

FORMAT JSON EXACT:
[
  {
    "category": "Trending|Insights|Growth|Strategy|Tips|Tech|Business",
    "platform": "twitter|linkedin|medium", 
    "title": "TITRE SPÉCIFIQUE (max 60 caractères)",
    "desc": "Description avec VALEUR CONCRÈTE (max 150 caractères)",
    "status": "Scheduled|Review|Draft"
  }
]

EXEMPLES POUR CETTE PHASE:
- Génération 1 (découverte): "Nouveaux outils IA qui sortent ce mois-ci"
- Génération 2 (approfondissement): "Comment optimiser son workflow avec Notion IA"
- Génération 3 (spécialisation): "Prompts avancés pour développeurs ChatGPT"
- Génération 4 (expérimentation): "Test: 30 jours sans réseaux sociaux"
- Génération 5 (domination): "Devenir l'expert IA référent sur LinkedIn"

IMPORTANT: Sois SPÉCIFIQUE à cette phase. Retourne UNIQUEMENT le JSON valide avec 5 objets.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AutoPoster - AI Ideas Generator"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.9, // Plus de créativité et variété
          max_tokens: 1000,
          top_p: 0.95
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0].message.content;
      
      // Debug: Voir la réponse brute de l'API
      console.log("=== AI API RESPONSE ===");
      console.log("Raw response:", aiContent);
      console.log("Response type:", typeof aiContent);
      
      let ideas;
      
      try {
        // Essayer de parser le JSON directement
        ideas = JSON.parse(aiContent);
      } catch (parseError) {
        // Si le parsing échoue, essayer d'extraire le JSON du texte
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          ideas = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Format de réponse invalide");
        }
      }

      // Ajouter des IDs uniques et formater les idées
      const formattedIdeas = ideas.map((idea, index) => ({
        id: Date.now() + index,
        category: idea.category || "Strategy",
        platform: idea.platform || "twitter",
        title: idea.title || "Nouvelle idée",
        desc: idea.desc || "Description à venir",
        status: idea.status || "Draft"
      }));

      set({ 
        aiIdeas: formattedIdeas, 
        aiSuggestion: `✅ Génération ${currentCount} complétée : 5 nouvelles idées ${currentTheme.phase} !` 
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération des idées AI:", error);
      
      // En cas d'erreur, générer des idées de fallback dynamiques basées sur la génération
      const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long' });
      const fallbackThemes = [
        {
          phase: "découverte",
          topics: [
            `IA ${currentMonth}: nouveautés à découvrir`,
            `Tech émergentes: ce qui est nouveau`,
            `Outils IA: dernières sorties`,
            `Tendances: innovations récentes`,
            `Découverte: technologies fraîches`
          ]
        },
        {
          phase: "approfondissement",
          topics: [
            `Productivité: optimiser 80% du travail`,
            `Stratégies IA avancées`,
            `Workflow: techniques concrètes`,
            `Optimisation: méthodes éprouvées`,
            `Performance: comment améliorer`
          ]
        },
        {
          phase: "spécialisation",
          topics: [
            `Prompts experts pour développeurs`,
            `Niches techniques pointues`,
            `Spécialisation: sujets avancés`,
            `Expertise: compétences rares`,
            `Maitrise: techniques pro`
          ]
        },
        {
          phase: "expérimentation",
          topics: [
            `Test: 30 jours sans réseaux sociaux`,
            `Approches non conventionnelles`,
            `Expérimentation: essayer l'inattendu`,
            `Innovation: sortir du cadre`,
            `Test: méthodes originales`
          ]
        },
        {
          phase: "domination",
          topics: [
            `Leadership: devenir référent IA`,
            `Autorité: expertise LinkedIn`,
            `Domination: stratégie market`,
            `Influence: construire sa marque`,
            `Excellence: leader du domaine`
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
        desc: `Stratégie ${currentFallbackTheme.phase} pour ${currentMonth}.`,
        status: ["Scheduled", "Review", "Draft", "Scheduled", "Review"][index],
      }));
      
      set({ 
        aiIdeas: fallbackIdeas, 
        aiSuggestion: `⚠️ Erreur: ${error.message}` 
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
