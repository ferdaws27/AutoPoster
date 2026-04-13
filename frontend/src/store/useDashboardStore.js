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
      set({ aiSuggestion: "Génération d'idées AI en cours..." });
      
      // Incrémenter le compteur de générations
      const currentCount = get().generationCount + 1;
      set({ generationCount: currentCount });
      
      const settings = getSettings();
      const apiKey = settings.openRouterKey;
      
      // Debug: Vérifier si la clé API est chargée
      console.log("=== AI IDEAS DEBUG ===");
      console.log("API Key exists:", !!apiKey);
      console.log("API Key length:", apiKey?.length);
      console.log("Génération numéro:", currentCount);
      
      if (!apiKey) {
        throw new Error("API key not found. Set it in Settings > API Keys.");
      }
      
      // Adapter le contenu en fonction du numéro de génération
      const userLang = navigator.language?.startsWith("fr") ? "fr" : "en";
      
      const generationThemes = userLang === "fr" ? [
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
      ] : [
        {
          phase: "discovery",
          focus: "emerging trends and recent innovations",
          angle: "what is new and surprising"
        },
        {
          phase: "deep-dive",
          focus: "advanced strategies and actionable techniques",
          angle: "how to apply and optimize"
        },
        {
          phase: "specialization",
          focus: "specific niches and sharp expertise",
          angle: "technical and advanced topics"
        },
        {
          phase: "experimentation",
          focus: "unconventional approaches and bold tests",
          angle: "trying what others won't"
        },
        {
          phase: "domination",
          focus: "leadership strategies and authority building",
          angle: "becoming the go-to reference"
        }
      ];
      
      const themeIndex = (currentCount - 1) % generationThemes.length;
      const currentTheme = generationThemes[themeIndex];
      
      const dateStr = userLang === "fr" 
        ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const prompt = userLang === "fr" 
        ? `Tu es un stratège de contenu digital de niveau expert, spécialisé dans la création de contenu viral et à forte valeur ajoutée. C'est la GÉNÉRATION ${currentCount}.

CONTEXTE: ${dateStr}
PHASE ACTUELLE: ${currentTheme.phase}
FOCUS SPÉCIFIQUE: ${currentTheme.focus}
ANGLE D'APPROCHE: ${currentTheme.angle}
TONE D'ÉCRITURE: ${settings.toneLabel}
LONGUEUR DE CONTENU: ${settings.contentLength}

MÉTHODOLOGIE DE GÉNÉRATION:

1. PERTINENCE TEMPORELLE: Chaque idée doit être connectée aux tendances ACTUELLES, pas des sujets génériques
2. SPÉCIFICITÉ: "Comment j'ai augmenté mon taux d'engagement de 340% en 30 jours" > "Comment améliorer son engagement"
3. VALEUR IMMÉDIATE: Le lecteur doit comprendre ce qu'il va gagner en lisant le post
4. DIVERSITÉ DE FORMAT: Varier entre thread, carrousel, post unique, sondage, storytelling

RÈGLES ANTI-PATTERNS:
✗ Pas de titres vagues ("Les secrets du succès", "Comment réussir")
✗ Pas de sujets éculés sans angle nouveau
✗ Pas de formulations IA reconnaissables ("Dans le monde d'aujourd'hui...")
✗ Chaque idée doit provoquer une réaction: curiosité, surprise, ou désir d'agir

GÉNÈRE 5 idées de contenu pour la phase "${currentTheme.phase}".
ÉCRIS TOUT EN FRANÇAIS.
Adapte le style au tone "${settings.toneLabel}" demandé.
Chaque idée doit être COMPLÈTEMENT DIFFÉRENTE des autres et des générations précédentes.

FORMAT JSON EXACT:
[
  {
    "category": "Trending|Insights|Growth|Strategy|Tips|Tech|Business",
    "platform": "twitter|linkedin|medium", 
    "title": "TITRE ACCROCHEUR EN FRANÇAIS (max 60 caractères)",
    "desc": "Description EN FRANÇAIS avec VALEUR CONCRÈTE (max 150 caractères)",
    "status": "Scheduled|Review|Draft"
  }
]

IMPORTANT: Sois ULTRA-SPÉCIFIQUE. TOUT EN FRANÇAIS. Retourne UNIQUEMENT le JSON valide avec 5 objets.`
        : `You are an expert-level digital content strategist specializing in viral, high-value content creation. This is GENERATION ${currentCount}.

CONTEXT: ${dateStr}
CURRENT PHASE: ${currentTheme.phase}
SPECIFIC FOCUS: ${currentTheme.focus}
APPROACH ANGLE: ${currentTheme.angle}
WRITING TONE: ${settings.toneLabel}
CONTENT LENGTH: ${settings.contentLength}

GENERATION METHODOLOGY:

1. TEMPORAL RELEVANCE: Each idea must connect to CURRENT trends, not generic topics
2. SPECIFICITY: "How I increased my engagement rate by 340% in 30 days" > "How to improve engagement"
3. IMMEDIATE VALUE: The reader must understand what they gain from reading the post
4. FORMAT DIVERSITY: Vary between threads, carousels, single posts, polls, storytelling

ANTI-PATTERN RULES:
✗ No vague titles ("Secrets of success", "How to succeed")
✗ No overused topics without a fresh angle
✗ No AI-recognizable phrasing ("In today's fast-paced world...")
✗ Each idea must trigger a reaction: curiosity, surprise, or desire to act

GENERATE 5 content ideas for the "${currentTheme.phase}" phase.
WRITE EVERYTHING IN ENGLISH.
Adapt the style to the "${settings.toneLabel}" tone requested.
Each idea must be COMPLETELY DIFFERENT from others and from previous generations.

EXACT JSON FORMAT:
[
  {
    "category": "Trending|Insights|Growth|Strategy|Tips|Tech|Business",
    "platform": "twitter|linkedin|medium", 
    "title": "CATCHY ENGLISH TITLE (max 60 characters)",
    "desc": "Description IN ENGLISH with CONCRETE VALUE (max 150 characters)",
    "status": "Scheduled|Review|Draft"
  }
]

IMPORTANT: Be ULTRA-SPECIFIC. ALL IN ENGLISH. Return ONLY valid JSON with 5 objects.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AutoPoster - AI Ideas Generator"
        },
        body: JSON.stringify({
          model: getSettings().modelId,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: getSettings().temperature,
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
