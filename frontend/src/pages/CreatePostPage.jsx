import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";
import toast from "react-hot-toast";
import { aiGenerate, validateInputMeaningfulness } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faRotateRight,
  faEdit,
  faImage,
  faPalette,
  faComments,
  faSave,
  faClock,
  faRobot,
  faFileText,
  faCalendar,
  faCheckCircle,
  faHeart,
  faThumbsUp,
  faEye,
  faSpinner,
  faTimes,
  faCheck,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

export default function CreatePostPage() {
  const { createPost, publishPost, posts, stats: hookStats } = usePosts();
  const { modelId, toneLabel, temperature, connectedPlatforms, openRouterKey, voiceProfile, contentLength, creativity, language, platformTimes } = useSettings();
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const ideaRef = useRef(null);

  // If navigated from Train from Files with a temporary voice, use it instead of saved voice
  const activeVoice = location.state?.tempVoice || voiceProfile;

  const [charCount, setCharCount] = useState(0);
  const [publishTo, setPublishTo] = useState({
    Twitter: connectedPlatforms.twitter,
    LinkedIn: connectedPlatforms.linkedin,
    Medium: connectedPlatforms.medium,
  });
  const [variations, setVariations] = useState({});
  const [loading, setLoading] = useState(false);
  const [hookInfo, setHookInfo] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState(() => {
    // Pre-fill with first optimal posting time from settings
    const times = platformTimes?.linkedin || platformTimes?.twitter || platformTimes?.medium || [];
    const firstValid = times.find((t) => t && t.length >= 4);
    return firstValid || "";
  });
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      type: "suggestion",
      icon: "",
      title: "Suggestion",
      content:
        "Your content performs 35% better when posted between 2-4 PM on weekdays.",
    },
    {
      type: "optimization",
      icon: "",
      title: "Optimization",
      content: "Adding relevant hashtags could increase reach by ~20%.",
    },
    {
      type: "insight",
      icon: "",
      title: "Insight",
      content: "Similar content generated 2.3x more engagement with images.",
    },
  ]);
  const [generationCount, setGenerationCount] = useState(0);

  const calculateStats = () => {
    const drafts = posts.filter((p) => p.status === "draft").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const published = posts.filter((p) => p.status === "posted").length;

    // Calculate engagement
    let totalEngagement = 0;
    posts.forEach((post) => {
      if (post.engagement) {
        totalEngagement +=
          (post.engagement.likes || 0) +
          (post.engagement.shares || 0) +
          (post.engagement.comments || 0);
      }
    });

    let engagementDisplay = "0";
    if (totalEngagement >= 1000) {
      engagementDisplay = (totalEngagement / 1000).toFixed(1) + "k";
    } else if (totalEngagement > 0) {
      engagementDisplay = totalEngagement.toString();
    }

    // Calculate published this month
    const publishedThisMonthCount = posts.filter((post) => {
      if (post.status !== "posted") return false;
      const postDate = new Date(post.createdAt);
      const now = new Date();
      return (
        postDate.getMonth() === now.getMonth() &&
        postDate.getFullYear() === now.getFullYear()
      );
    }).length;

    // Get next scheduled post
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");
    const nextScheduledPost = scheduledPosts.length > 0
      ? scheduledPosts.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate))[0]
      : null;

    // Get next scheduled date
    const nextScheduledDate = nextScheduledPost && nextScheduledPost.scheduleDate
      ? new Date(nextScheduledPost.scheduleDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;

    return {
      drafts,
      scheduled,
      published,
      engagement: engagementDisplay,
      draftsTrend: drafts > 0 ? `${drafts} recent` : "No recent drafts",
      scheduledNext: nextScheduledDate || "No scheduled",
      publishedThisMonth: publishedThisMonthCount > 0
        ? `${publishedThisMonthCount} this month`
        : "None yet",
      engagementTrend: totalEngagement > 0 ? "Tracking active" : "No data yet",
    };
  };

  const [stats, setStats] = useState(calculateStats());

  // Update stats when posts change
  useEffect(() => {
    setStats(calculateStats());
  }, [posts]);

  // Récupérer le hook depuis localStorage
  useEffect(() => {
    const storedHook = localStorage.getItem("selectedHook");
    if (storedHook) {
      try {
        const hookData = JSON.parse(storedHook);
        setHookInfo(hookData);
        
        // Pré-remplir le textarea avec le hook
        if (ideaRef.current && hookData.text) {
          ideaRef.current.value = hookData.text;
          setCharCount(hookData.text.length);
          
          // Configurer les plateformes selon le hook
          const platformMap = {
            'twitter': 'Twitter',
            'linkedin': 'LinkedIn', 
            'medium': 'Medium'
          };
          
          const hookPlatform = platformMap[hookData.platform];
          if (hookPlatform) {
            setPublishTo({
              Twitter: hookPlatform === 'Twitter',
              LinkedIn: hookPlatform === 'LinkedIn',
              Medium: hookPlatform === 'Medium',
            });
          }
        }
        
        // Nettoyer localStorage après utilisation
        localStorage.removeItem('selectedHook');
      } catch (error) {
        console.error('Erreur lors de la récupération du hook:', error);
      }
    }
  }, []);

  // Récupérer les données de tendance depuis Trendradar
  useEffect(() => {
    const storedTrend = localStorage.getItem("selectedTrend");
    console.log('Checking localStorage for selectedTrend:', storedTrend);
    
    if (storedTrend) {
      try {
        const trendData = JSON.parse(storedTrend);
        console.log('Trend data received from Trendradar:', trendData);
        
        // Pré-remplir le textarea avec SEULEMENT le contenu de la tendance
        if (ideaRef.current && trendData.name) {
          // Prendre uniquement le nom/titre comme contenu
          let preFilledContent = trendData.name;
          
          // NE PAS ajouter de métadonnées, juste le contenu principal
          console.log('Setting content ONLY (no metadata):', preFilledContent);
          ideaRef.current.value = preFilledContent;
          setCharCount(preFilledContent.length);
          
          // Configurer les plateformes selon la source
          if (trendData.source) {
            let platformConfig = { Twitter: true, LinkedIn: true, Medium: true };
            
            // Configuration spécifique selon la source
            if (trendData.source.includes('Twitter')) {
              platformConfig = { Twitter: true, LinkedIn: false, Medium: false };
            } else if (trendData.source.includes('LinkedIn')) {
              platformConfig = { Twitter: false, LinkedIn: true, Medium: false };
            } else if (trendData.source.includes('Medium')) {
              platformConfig = { Twitter: false, LinkedIn: false, Medium: true };
            } else if (trendData.source.includes('Power Keywords')) {
              platformConfig = { Twitter: true, LinkedIn: true, Medium: true };
            } else if (trendData.source.includes('News')) {
              platformConfig = { Twitter: true, LinkedIn: true, Medium: false };
            }
            
            console.log('Setting platform config:', platformConfig);
            setPublishTo(platformConfig);
          }
          
          // Pas d'alerte - chargement silencieux du contenu
        }
        
        // Nettoyer localStorage après utilisation
        localStorage.removeItem('selectedTrend');
      } catch (error) {
        console.error('Erreur lors de la récupération de la tendance:', error);
        toast.error('Error loading trend data. Please try again.');
      }
    } else {
      console.log('No trend data found in localStorage');
    }
  }, []);

  useEffect(() => {
    const textarea = ideaRef.current;
    if (!textarea) return;

    const handler = () => setCharCount(textarea.value.length);
    textarea.addEventListener("input", handler);

    return () => textarea.removeEventListener("input", handler);
  }, []);

  // Récupérer les paramètres URL pour pré-remplir le contenu
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const content = params.get('content');
    const description = params.get('description');
    
    if (content || description) {
      const textarea = ideaRef.current;
      if (textarea) {
        const fullContent = content && description ? `${content}\n\n${description}` : content || description || '';
        textarea.value = fullContent;
        setCharCount(fullContent.length);
      }
    }
  }, []);

  const togglePublish = (platform) => {
    setPublishTo((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const generateText = async () => {
    let idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter((p) => publishTo[p]);

    if (!idea) {
      setLoading(true);
      const generatedIdea = await generateAIidea();
      if (!generatedIdea) {
        setLoading(false);
        toast.error("Failed to generate AI idea. Please try again.");
        return;
      }
      idea = generatedIdea;
      ideaRef.current.value = idea;
      setCharCount(idea.length);
    }

    // ✅ Validate that the input is meaningful before generation
    const validation = validateInputMeaningfulness(idea);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    if (platforms.length === 0) {
      setLoading(false);
      return toast.error("Select at least one platform");
    }

    setLoading(true);
    const newVariations = {};
    const currentCount = generationCount + 1;

    const toneDescriptions = {
      professional: "formal language, structured sentences, business vocabulary, no slang, no emojis, data-driven insights",
      friendly: "warm and approachable language, light emojis allowed, conversational but informative, encouraging tone",
      casual: "relaxed everyday language, emojis encouraged, short punchy sentences, speak like talking to a friend, use humor",
    };

    const lengthInstructions = {
      "Short (50–100 words)": "STRICT LIMIT: 50-100 words maximum. Be concise. Cut any filler.",
      "Medium (100–200 words)": "Target 100-200 words. Balanced detail.",
      "Long (200+ words)": "Write 200+ words. Go in-depth with details.",
      "Auto-adjust": "Adjust length naturally to fit the platform.",
    };

    const systemMessage = `You are an elite social media content creator. You write scroll-stopping, high-engagement content.

TONE: ${toneLabel}. ${toneDescriptions[toneLabel] || ""}
LENGTH: ${lengthInstructions[contentLength] || contentLength}
CREATIVITY: ${creativity}
${activeVoice ? `
VOICE TO MATCH: "${activeVoice.name}" — Tone: ${activeVoice.tone}, Structure: ${activeVoice.structure}, Hook: ${activeVoice.hookStyle}, CTA: ${activeVoice.ctaStyle}, Emoji: ${activeVoice.emojiUsage}, Traits: ${(activeVoice.uniqueTraits || []).join(", ")}${activeVoice.samplePost ? `
Example: "${activeVoice.samplePost}"` : ""}` : ""}

Write like a real human — opinionated, specific, never sound like AI. Follow the platform rules from the user message exactly. Output ONLY the post.`;
    const isShort = contentLength.toLowerCase().includes("short");
    const isLong = contentLength.toLowerCase().includes("long");

    try {
      const platformPrompts = platforms.map(platform => {
        let userPrompt = "";

        if (platform === "Twitter") {
          userPrompt = `Write a high-impact Twitter post (STRICT max 280 characters) about: ${idea}.

STRUCTURE:
- Open with a scroll-stopping hook (first 5 words are everything)
- ${isShort ? "1-2" : "2-3"} sharp key points using rhythm and punch
- 2-3 relevant hashtags (only if they add discovery value)
- End with a provocative question OR bold CTA
- Use line breaks for visual rhythm when impactful

TWITTER-NATIVE RULES:
- Every word must earn its place — 280 chars means zero waste
- Use specificity over vagueness ("3 tactics" not "some tips")
- Pattern: Short sentence. Even shorter. Punch line.
- NO generic filler, NO "In this thread", NO corporate speak

Generation attempt ${currentCount} — write something COMPLETELY DIFFERENT from typical AI output.`;
        } else if (platform === "LinkedIn") {
          userPrompt = isShort
            ? `Write a SHORT LinkedIn post (50-100 words STRICT) about: ${idea}.

STRUCTURE:
- Bold, standalone headline that works as the "see more" preview
- 2-3 concise bullet points with real value
- 2-3 hashtags
- End with a short, genuine question (not "Agree?")

LINKEDIN-NATIVE RULES:
- First line IS the headline — make it impossible to not click "see more"
- No filler, no padding, no "In today's world..."
- Every line must deliver value or insight
- Professional but human — write like a respected peer, not a textbook

Generation attempt ${currentCount}, make it unique and fresh.`
            : isLong
            ? `Write a detailed LinkedIn post (200+ words) about: ${idea}.

STRUCTURE:
- Strong opening line that works as the "see more" preview (bold, specific, curiosity-driven)
- Personal context or "why this matters" bridge (1-2 sentences)
- 4-5 key insights with bullet points — each point must be specific and actionable
- Deep business context: implications, trends, or lessons learned
- 3-4 relevant industry hashtags
- Close with a thought-provoking discussion question that invites genuine responses

LINKEDIN-NATIVE RULES:
- Use strategic line breaks every 1-2 sentences for readability
- Write like a thought leader sharing hard-won wisdom, not a motivational poster
- Include specific examples, numbers, or frameworks when possible
- Tone: authoritative yet approachable — the reader should feel like they learned something

Generation attempt ${currentCount}, provide a completely fresh perspective.`
            : `Write a LinkedIn post (100-200 words) about: ${idea}.

STRUCTURE:
- Attention-grabbing headline that works as the "see more" preview
- 3-4 key insights with bullet points — specific and actionable
- Business context and real-world implications
- 3-4 relevant industry hashtags
- End with a discussion question that sparks genuine engagement

LINKEDIN-NATIVE RULES:
- Use line breaks for readability — no wall of text
- Balance insight with personality — professional but not boring
- Include at least one specific example, number, or framework
- Write like sharing a valuable lesson with your professional network

Generation attempt ${currentCount}, provide a fresh perspective.`;
        } else if (platform === "Medium") {
          userPrompt = isShort
            ? `Create a compelling Medium article teaser (50-100 words) about: ${idea}.

STRUCTURE:
- Catchy, SEO-friendly title that promises specific value
- 1 punchy opening paragraph that hooks the reader
- 2-3 key takeaways as sharp bullet points
- Close with a curiosity hook that makes them want the full article

MEDIUM-NATIVE RULES:
- Write like a published journalist, not a social media poster
- Title should work both for SEO and for shareability
- Every sentence must make the reader want the next one

Generation attempt ${currentCount}, offer a completely unique angle.`
            : `Create a Medium article preview about: ${idea}.

STRUCTURE:
- SEO-friendly title that promises specific, tangible value
- ${isLong ? "3-4" : "2-3"} compelling introduction paragraphs that set up the problem and promise a solution
- 2-3 section headings with meaty insights under each
- Key takeaways as clear, actionable bullet points
- Close with a teaser that creates urgency to read the full article

MEDIUM-NATIVE RULES:
- Write in an editorial, essay-like voice — think published columnist
- Open with a scene, statistic, or provocative question
- Each section heading should be a standalone insight
- Use transitions that pull the reader forward
- Balance depth with accessibility — smart but not academic

Generation attempt ${currentCount}, offer a completely unique angle.`;
        }

        return { platform, userPrompt };
      });

      // Run ALL platform generations in PARALLEL
      const results = await Promise.allSettled(
        platformPrompts.map(({ platform, userPrompt }) =>
          aiGenerate({
            prompt: userPrompt,
            system: systemMessage,
            model: modelId,
            max_tokens: platform === "Twitter" ? 200 : 800,
            temperature,
            user_content: idea,
          }).then(content => ({ platform, content: content || "" }))
            .catch(err => {
              console.warn(`API failed for ${platform}, using fallback`, err);
              return { platform, content: generateAlternativeMockContent(platform, idea) };
            })
        )
      );

      results.forEach(result => {
        if (result.status === "fulfilled") {
          newVariations[result.value.platform] = result.value.content;
        }
      });

      setVariations(newVariations);
      setGenerationCount(currentCount);
    } catch (err) {
      console.error(err);
      toast.error("Some API calls failed while generating text.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIidea = async () => {
    try {
      const prompt =
        "Generate one unique, specific, and trending social media content idea that would stop someone from scrolling. The idea should be timely, opinionated, or surprising — not generic. Detect the user's browser language and write the idea in that language. Return ONLY the idea as a short phrase (3-8 words), no explanation.";

      return await aiGenerate({
        prompt,
        model: modelId,
        max_tokens: 50,
        user_content: "",
      });
    } catch (err) {
      console.error("Error generating AI idea:", err);
      return null;
    }
  };

  const planImages = async () => {
    const idea = ideaRef.current.value.trim();
    const platforms = Object.keys(publishTo).filter((p) => publishTo[p]);

    if (!idea) return toast.error("Enter your idea first");
    if (platforms.length === 0) return toast.error("Select at least one platform");

    setLoading(true);
    const apiKey = openRouterKey;
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

    try {
      // Step 1: Use AI to generate smart search keywords per platform
      let keywords = [idea.split(" ").slice(0, 3).join(" ")];

      if (apiKey) {
        try {
          const promptRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "AutoPoster App",
            },
            body: JSON.stringify({
              model: modelId,
              messages: [{
                role: "user",
                content: `Based on this post idea: "${idea}"
Generate 3 short image search queries (2-4 words each) to find relevant, high-quality photos.
Return ONLY a valid JSON array like: ["query1", "query2", "query3"]`,
              }],
              max_tokens: 100,
            }),
          });

          if (promptRes.ok) {
            const promptData = await promptRes.json();
            const raw = promptData.choices[0].message.content.trim();
            const match = raw.match(/\[[\s\S]*?\]/);
            if (match) {
              keywords = JSON.parse(match[0]);
            }
          }
        } catch (err) {
          console.warn("AI keyword generation failed, using idea directly:", err);
        }
      }

      // Step 2: Fetch images from SerpAPI via backend proxy for each platform
      const imagePromises = platforms.map(async (platform) => {
        try {
          let searchQuery = keywords[0] || idea;
          if (platform === "LinkedIn") {
            searchQuery = (keywords[1] || keywords[0]) + " professional";
          } else if (platform === "Medium") {
            searchQuery = keywords[2] || keywords[1] || keywords[0];
          }

          const res = await fetch(
            `${backendUrl}/api/images/search?q=${encodeURIComponent(searchQuery)}&num=6`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error(`Image search error for ${platform}:`, errData);
            return { platform, images: [] };
          }

          const data = await res.json();
          const images = (data.images || []).map((item, idx) => ({
            url: item.original || item.url,
            thumbnail: item.thumbnail || item.url,
            description: item.title || searchQuery,
            width: item.width,
            height: item.height,
            selected: idx === 0,
            keyword: searchQuery,
            source: item.source,
          }));

          return { platform, images };
        } catch (err) {
          console.error(`Error fetching images for ${platform}:`, err);
          return { platform, images: [] };
        }
      });

      const results = await Promise.all(imagePromises);
      const newImages = {};
      let totalImages = 0;
      results.forEach(({ platform, images }) => {
        newImages[platform] = images;
        totalImages += images.length;
      });

      setSelectedImages(newImages);

      if (totalImages === 0) {
        toast.error("No images found. Try a different idea.");
      }
    } catch (err) {
      console.error("Plan images error:", err);
      toast.error("Error searching for images: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerateContent = async (platform) => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return toast.error("Enter your idea first");

    setLoading(true);

    try {
      const toneDescriptions = {
        professional: "formal language, structured sentences, business vocabulary, no slang, no emojis, data-driven insights",
        friendly: "warm and approachable language, light emojis allowed, conversational but informative, encouraging tone",
        casual: "relaxed everyday language, emojis encouraged, short punchy sentences, speak like talking to a friend, use humor",
      };

      const lengthInstructions = {
        "Short (50–100 words)": "STRICT LIMIT: 50-100 words maximum. Be concise. Cut any filler.",
        "Medium (100–200 words)": "Target 100-200 words. Balanced detail.",
        "Long (200+ words)": "Write 200+ words. Go in-depth with details.",
        "Auto-adjust": "Adjust length naturally to fit the platform.",
      };

      const systemMessage = `You are an elite social media content creator. Write scroll-stopping content.

VOICE & TONE: Write in a ${toneLabel} tone. ${toneDescriptions[toneLabel] || ""}
CONTENT LENGTH: ${lengthInstructions[contentLength] || contentLength}
CREATIVITY LEVEL: ${creativity}
${activeVoice ? `VOICE PROFILE: ${activeVoice.name} — Tone: ${activeVoice.tone}, Structure: ${activeVoice.structure}, Sentence Style: ${activeVoice.sentenceStyle}, Hook: ${activeVoice.hookStyle}, CTA: ${activeVoice.ctaStyle}, Themes: ${(activeVoice.contentThemes || []).join(", ")}, Traits: ${(activeVoice.uniqueTraits || []).join(", ")}${activeVoice.samplePost ? `, Example: "${activeVoice.samplePost}"` : ""}` : ""}

Detect the language of the topic and write ALL content in THAT SAME LANGUAGE.`;

      let userPrompt = "";
      if (platform === "Twitter") {
        userPrompt = `Create a completely different Twitter post (STRICT max 280 characters) about: ${idea}.\n\nTWITTER RULES:\n- Scroll-stopping hook in first 5 words\n- Every word must earn its place — 280 chars = zero waste\n- 2-3 relevant hashtags only if they add value\n- End with a provocative question OR bold CTA\n- NO generic filler, NO corporate speak\n\nWrite something fresh and unique.`;
      } else if (platform === "LinkedIn") {
        userPrompt = `Write a fresh LinkedIn post (100-200 words) about: ${idea}.\n\nLINKEDIN RULES:\n- Attention-grabbing first line (the "see more" preview)\n- 3-4 key insights with bullet points — specific and actionable\n- Line breaks for readability\n- 3-4 relevant industry hashtags\n- End with a discussion question that sparks genuine engagement`;
      } else {
        userPrompt = `Create a unique Medium article preview (150-300 words) about: ${idea}.\n\nMEDIUM RULES:\n- SEO-friendly title that promises tangible value\n- 2-3 compelling introduction paragraphs\n- Section headings that are standalone insights\n- Editorial, essay-like voice\n- Close with a teaser that creates urgency to read more`;
      }

      try {
        const newContent = await aiGenerate({
          prompt: userPrompt,
          system: systemMessage,
          model: modelId,
          max_tokens: platform === "Twitter" ? 200 : 800,
          temperature,
          user_content: idea,
        });

        setVariations((prev) => ({
          ...prev,
          [platform]: newContent,
        }));

        setGenerationCount((prev) => prev + 1);
      } catch (fetchError) {
        console.warn("Fallback regenerate used:", fetchError);
        const fallbackContent = generateAlternativeMockContent(platform, idea);
        setVariations((prev) => ({
          ...prev,
          [platform]: fallbackContent,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error regenerating content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAlternativeMockContent = (platform, idea) => {
    const alternativeContent = {
      Twitter: `🔥 ${idea} is changing everything!\n\n#Innovation #Future`,
      LinkedIn: `Why ${idea} Matters Now More Than Ever.\n\n#Leadership #Strategy`,
      Medium: `# Beyond the Hype: Real ${idea} Applications`,
    };

    return (
      alternativeContent[platform] ||
      `Alternative perspective on ${idea} for ${platform}.`
    );
  };

  const enhanceContent = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return toast.error("Enter your idea first");

    setLoading(true);

    try {
      const prompt = `Enhance and improve this idea: "${idea}".${activeVoice ? `\nApply this voice style — Tone: ${activeVoice.tone}, Structure: ${activeVoice.structure}, Sentence Style: ${activeVoice.sentenceStyle}, Hook: ${activeVoice.hookStyle}, Emoji: ${activeVoice.emojiUsage}, Traits: ${(activeVoice.uniqueTraits || []).join(', ')}` : ''}`;

      const enhancedIdea = await aiGenerate({
        prompt,
        model: modelId,
        max_tokens: 150,
        user_content: idea,
      });

      ideaRef.current.value = enhancedIdea;
      setCharCount(enhancedIdea.length);
    } catch (err) {
      console.error(err);
      toast.error("Error enhancing content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

const saveDraft = async () => {
  const idea = ideaRef.current.value.trim();

  if (!idea) return toast.error("Please enter an idea before saving");
  if (!draftName.trim()) return toast.error("Please enter a draft name");

  try {
    // Créer un post pour chaque plateforme sélectionnée avec son contenu généré
    const selectedPlatforms = Object.keys(publishTo).filter(platform => publishTo[platform]);
    
    for (const platform of selectedPlatforms) {
      const platformContent = variations[platform] || idea; // Utiliser le contenu généré ou l'idée originale
      
      // Get the selected image for this platform
      const platformImages = selectedImages[platform] || [];
      const selectedImg = platformImages.find(img => img.selected);
      const imageData = selectedImg ? {
        url: selectedImg.url,
        thumbnail: selectedImg.thumbnail || selectedImg.url,
        source: selectedImg.source || '',
        keyword: selectedImg.keyword || '',
      } : null;

      await createPost({
        idea,
        content: platformContent,
        platforms: { [platform]: true },
        status: "draft",
        engagement: {},
        selectedImages: imageData ? [imageData] : [],
      });
    }

    toast.success(`Draft saved successfully for ${selectedPlatforms.length} platform(s)!`);
    setShowSaveDraftModal(false);
    setDraftName("");
  } catch (err) {
    console.error("SAVE DRAFT ERROR:", err);
    toast.error(err.message);
  }
};

  const schedulePosts = async () => {
    const idea = ideaRef.current.value.trim();

    if (!idea) return toast.error("Please enter an idea first");
    if (!scheduleDate || !scheduleTime)
      return toast.error("Please select both date and time");

    const scheduledPlatforms = Object.keys(publishTo).filter(
      (p) => publishTo[p]
    );

    if (scheduledPlatforms.length === 0) {
      return toast.error("Please select at least one platform to schedule");
    }

    try {
      // Créer un post pour chaque plateforme sélectionnée avec son contenu généré
      for (const platform of scheduledPlatforms) {
        const platformContent = variations[platform] || idea; // Utiliser le contenu généré ou l'idée originale
        
        // Get the selected image for this platform
        const platformImages = selectedImages[platform] || [];
        const selectedImg = platformImages.find(img => img.selected);
        const imageData = selectedImg ? {
          url: selectedImg.url,
          thumbnail: selectedImg.thumbnail || selectedImg.url,
          source: selectedImg.source || '',
          keyword: selectedImg.keyword || '',
        } : null;

        await createPost({
          idea,
          content: platformContent,
          platforms: { [platform]: true },
          status: "scheduled",
          scheduleDate: scheduleDate,
          scheduleTime: scheduleTime,
          engagement: {},
          selectedImages: imageData ? [imageData] : [],
        });
      }

      toast.success(`Post scheduled successfully for ${scheduledPlatforms.length} platform(s)!`);
      setShowScheduleModal(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (err) {
      console.error("SCHEDULE ERROR:", err);
      toast.error(err.message);
    }
  };

  const publishNow = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return toast.error("Please enter an idea first");

    const selectedPlatforms = Object.keys(publishTo).filter((p) => publishTo[p]);
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform");

    // Check that content has been generated
    const hasContent = selectedPlatforms.some((p) => variations[p]);
    if (!hasContent) return toast.error("Please generate content first before publishing");

    setLoading(true);
    try {
      for (const platform of selectedPlatforms) {
        const platformContent = variations[platform] || idea;

        const platformImages = selectedImages[platform] || [];
        const selectedImg = platformImages.find((img) => img.selected);
        const imageData = selectedImg
          ? {
              url: selectedImg.url,
              thumbnail: selectedImg.thumbnail || selectedImg.url,
              source: selectedImg.source || "",
              keyword: selectedImg.keyword || "",
            }
          : null;

        // 1) Create the post as draft first
        const newPost = await createPost({
          idea,
          content: platformContent,
          platforms: { [platform]: true },
          status: "draft",
          engagement: {},
          selectedImages: imageData ? [imageData] : [],
        });

        // 2) Publish it to LinkedIn
        if (platform === "LinkedIn" && newPost?.id) {
          try {
            await publishPost(newPost.id);
          } catch (pubErr) {
            toast.error(`Failed to publish to LinkedIn: ${pubErr.message}`);
            continue;
          }
        }
      }
      toast.success(`Published successfully to ${selectedPlatforms.join(", ")}!`);
    } catch (err) {
      console.error("PUBLISH ERROR:", err);
      toast.error("Error publishing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMoreTips = async () => {
    const idea = ideaRef.current.value.trim();
    if (!idea) return toast.error("Enter your idea first");

    setLoading(true);

    try {
      const prompt = `Based on this content idea: "${idea}", provide 3 actionable suggestions as JSON.${voiceProfile ? `\nConsider this voice profile — Tone: ${voiceProfile.tone}, Structure: ${voiceProfile.structure}, Hook: ${voiceProfile.hookStyle}, Patterns: ${(voiceProfile.writingPatterns || []).join(', ')}` : ''}`;

      const content = await aiGenerate({
        prompt,
        model: modelId,
        max_tokens: 250,
        user_content: idea,
        language,
      });

      const parsed = JSON.parse(content);
      setAiSuggestions(parsed);
    } catch (err) {
      console.error(err);
      setAiSuggestions([
        {
          type: "suggestion",
          icon: "⏰",
          title: "Timing",
          content: "Post during peak engagement hours for your audience",
        },
        {
          type: "optimization",
          icon: "📱",
          title: "Mobile",
          content: "Ensure content looks great on mobile devices",
        },
        {
          type: "insight",
          icon: "🎯",
          title: "Targeting",
          content: "Use relevant hashtags and mentions to increase reach",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white">
        <div className="p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t("create.title")}
              </h1>
              <p className="text-gray-400">
                {t("create.subtitle")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAiAssistant(true)}
                className="px-4 py-2 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                {t("create.aiAssist")}
              </button>
            </div>
          </div>

          {/* Temp voice banner when navigated from Train from Files */}
          {location.state?.tempVoice && (
            <div className="mt-4 flex items-center justify-between p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-wand-magic-sparkles text-cyan-400"></i>
                <span className="text-cyan-300 text-sm font-medium">
                  Using analyzed voice: <span className="text-white">{location.state.tempVoice.tone}</span> — {location.state.tempVoice.sentenceStyle}
                </span>
              </div>
              <button
                onClick={() => navigate("/dashboard/CreatePostPage", { replace: true })}
                className="text-gray-400 hover:text-white text-xs border border-gray-600 px-3 py-1 rounded-lg"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="p-8 pb-0">
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 font-medium">{t("create.publishTo")}</span>
            {["Twitter", "LinkedIn", "Medium"].map((platform) => (
              <label key={platform} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishTo[platform]}
                  onChange={() => togglePublish(platform)}
                  className="sr-only"
                />
                <div className="relative">
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      publishTo[platform] ? "bg-cyan-400" : "bg-gray-700"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                      publishTo[platform] ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>
                <div className="ml-3 flex items-center">
                  <i
                    className={`fa-brands ${platform === "Twitter" ? "fa-x-twitter" : platform === "LinkedIn" ? "fa-linkedin-in" : "fa-medium"} mr-2 ${
                      platform === "Twitter"
                        ? "text-white"
                        : platform === "LinkedIn"
                        ? "text-blue-400"
                        : "text-green-400"
                    }`}
                  ></i>
                  <span className="text-white font-medium">{platform}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="card-bg rounded-3xl p-8 border border-gray-700 glow-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{t("create.yourIdea")}</h2>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">
                  {t("create.aiOptimize")}
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={ideaRef}
                className="w-full h-48 bg-gray-800/50 border border-gray-600 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder={t("create.placeholder")}
              ></textarea>
              <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                <span className="text-gray-500 text-sm">
                  <span id="char-count">{charCount}</span> {t("create.characters")}
                </span>
                <button
                  onClick={enhanceContent}
                  className="px-4 py-2 rounded-xl bg-violet-400/20 text-violet-400 hover:bg-violet-400/30 transition-colors"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                  {t("create.aiEnhance")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {["Twitter", "LinkedIn", "Medium"].map((platform) => (
              <div
                key={platform}
                className={`platform-column ${
                  publishTo[platform] ? "active" : "opacity-50"
                }`}
              >
                <div className="card-bg rounded-3xl p-6 border border-gray-700 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <i
                        className={`fa-brands ${platform === "Twitter" ? "fa-x-twitter" : platform === "LinkedIn" ? "fa-linkedin-in" : "fa-medium"} mr-3 ${
                          platform === "Twitter"
                            ? "text-white"
                            : platform === "LinkedIn"
                            ? "text-blue-400"
                            : "text-green-400"
                        }`}
                      ></i>
                      <h3 className="text-lg font-semibold text-white">
                        {platform}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => regenerateContent(platform)}
                        className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                      >
                        <FontAwesomeIcon icon={faRotateRight} className="text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          const textarea = document.querySelector(
                            `#${platform.toLowerCase()}-textarea`
                          );
                          if (textarea) {
                            textarea.focus();
                            textarea.select();
                          }
                        }}
                        className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Hook Display - Show at top of each card after generation */}
                    {hookInfo && variations[platform] && (
                      <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-2xl p-4 border border-violet-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <i className="fa-solid fa-bolt text-violet-400"></i>
                            <span className="text-violet-300 text-sm font-semibold">Hook Used</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            Score: {hookInfo.score}% | {hookInfo.platform}
                          </span>
                        </div>
                        <p className="text-white text-sm italic">"{hookInfo.text}"</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-600">
                      <textarea
                        id={`${platform.toLowerCase()}-textarea`}
                        className="w-full bg-gray-800/50 rounded-2xl p-4 text-gray-300 text-sm resize-none focus:border-cyan-400 focus:outline-none"
                        value={variations[platform] || ""}
                        onChange={(e) =>
                          setVariations((prev) => ({
                            ...prev,
                            [platform]: e.target.value,
                          }))
                        }
                        placeholder={`Your ${platform} content will appear here...`}
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            platform === "Twitter"
                              ? "text-cyan-400"
                              : platform === "LinkedIn"
                              ? "text-blue-400"
                              : "text-green-400"
                          }`}
                        >
                          {variations[platform]
                            ? platform === "Twitter"
                              ? `${variations[platform].length}/280`
                              : platform === "LinkedIn"
                              ? `${variations[platform].length} characters`
                              : `${variations[platform].split(" ").length} words`
                            : platform === "Twitter"
                            ? "0/280"
                            : platform === "LinkedIn"
                            ? "0 characters"
                            : "0 words"}
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500 text-xs">
                          <FontAwesomeIcon
                            icon={
                              platform === "Twitter"
                                ? faHeart
                                : platform === "LinkedIn"
                                ? faThumbsUp
                                : faEye
                            }
                          />
                          <span>
                            Est.{" "}
                            {platform === "Twitter"
                              ? "45 likes"
                              : platform === "LinkedIn"
                              ? "120 reactions"
                              : "8 min read"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm flex items-center">
                        <FontAwesomeIcon
                          icon={faImage}
                          className={`mr-2 ${
                            platform === "Twitter"
                              ? "text-cyan-400"
                              : platform === "LinkedIn"
                              ? "text-blue-400"
                              : "text-green-400"
                          }`}
                        />
                        {t("create.suggestedImages")}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {(selectedImages[platform] || []).map((image, index) => (
                          <div
                            key={index}
                            className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                              image.selected ? "border-cyan-400 ring-1 ring-cyan-400/30" : "border-transparent hover:border-gray-500"
                            }`}
                            onClick={() => {
                              const newImages = { ...selectedImages };
                              newImages[platform] = newImages[platform].map(
                                (img, i) => ({
                                  ...img,
                                  selected: i === index,
                                })
                              );
                              setSelectedImages(newImages);
                            }}
                          >
                            <div className="relative">
                              <img
                                className="w-full h-24 rounded-lg object-cover bg-gray-800"
                                src={image.thumbnail || image.url}
                                alt={image.description}
                                loading="lazy"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="text-white text-lg"
                                />
                              </div>
                              {image.selected && (
                                <div className="absolute top-1 right-1 bg-cyan-400 text-black rounded-full w-5 h-5 flex items-center justify-center">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-[10px]"
                                  />
                                </div>
                              )}
                            </div>
                            <div
                              className="mt-1 text-[10px] text-gray-500 line-clamp-1"
                              title={image.description}
                            >
                              {image.source || image.keyword}
                            </div>
                          </div>
                        ))}
                        {(!selectedImages[platform] ||
                          selectedImages[platform].length === 0) && (
                          <div className="col-span-3 text-gray-500 text-sm text-center py-4">
                            {t("create.clickPlanImages")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={planImages}
              className="flex items-center px-6 py-3 rounded-2xl bg-violet-400/20 border border-violet-400/30 text-violet-400 hover:bg-violet-400/30 transition-all"
            >
              <FontAwesomeIcon icon={faPalette} className="mr-2" />
              {t("create.planImages")}
            </button>

            <button
              onClick={generateText}
              className="flex items-center px-6 py-3 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
            >
              <FontAwesomeIcon icon={faComments} className="mr-2" />
              {t("create.generateText")}
            </button>

            <button
              onClick={() => setShowSaveDraftModal(true)}
              className="flex items-center px-6 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {t("create.saveDraft")}
            </button>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center px-6 py-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/30 transition-all"
            >
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              {t("create.schedule")}
            </button>

            <button
              onClick={publishNow}
              disabled={loading}
              className="flex items-center px-6 py-3 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              Publish Now
            </button>
          </div>
        </div>

        {showAiAssistant && (
          <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-80 z-30 hidden xl:block">
            <div className="card-bg rounded-3xl p-6 border border-gray-700 glow-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faRobot} className="text-white" />
                  </div>
                  <h3 className="text-white font-semibold">{t("create.aiAssistant")}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {loading && (
                    <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 animate-spin" />
                  )}
                  <button
                    onClick={() => setShowAiAssistant(false)}
                    className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="p-4 bg-gray-800/50 rounded-2xl text-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-cyan-400 animate-spin text-xl mb-2"
                    />
                    <p className="text-gray-400 text-sm">
                      {t("create.generatingAiSuggestions")}
                    </p>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-2xl">
                      <div
                        className={`text-sm font-medium mb-2 ${
                          suggestion.type === "suggestion"
                            ? "text-cyan-400"
                            : suggestion.type === "optimization"
                            ? "text-violet-400"
                            : "text-green-400"
                        }`}
                      >
                        {suggestion.icon} {suggestion.title}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {suggestion.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-800/50 rounded-2xl text-center">
                    <p className="text-gray-400 text-sm">
                      {t("create.enterIdeaForTips")}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={getMoreTips}
                disabled={loading}
                className="w-full mt-4 p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
                {t("create.getMoreTips")}
              </button>
            </div>
          </div>
        )}

        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              onClick={() => navigate("/dashboard/PostsLibrary?filter=draft")}
              className="card-bg rounded-2xl p-6 border border-gray-700 cursor-pointer hover:border-green-400/50 hover:bg-green-400/5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("create.drafts")}</span>
                <FontAwesomeIcon icon={faFileText} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.drafts}</div>
              <div className="text-green-400 text-xs">{stats.draftsTrend}</div>
            </div>

            <div
              onClick={() => navigate("/dashboard/scheduling")}
              className="card-bg rounded-2xl p-6 border border-gray-700 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("create.scheduledLabel")}</span>
                <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.scheduled}</div>
              <div className="text-cyan-400 text-xs">{stats.scheduledNext}</div>
            </div>

            <div
              onClick={() => navigate("/dashboard/PostsLibrary?filter=posted")}
              className="card-bg rounded-2xl p-6 border border-gray-700 cursor-pointer hover:border-violet-400/50 hover:bg-violet-400/5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("create.published")}</span>
                <FontAwesomeIcon icon={faCheckCircle} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.published}</div>
              <div className="text-violet-400 text-xs">
                {stats.publishedThisMonth}
              </div>
            </div>

            <div
              onClick={() => navigate("/dashboard/analytics")}
              className="card-bg rounded-2xl p-6 border border-gray-700 cursor-pointer hover:border-green-400/50 hover:bg-green-400/5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t("create.engagementLabel")}</span>
                <FontAwesomeIcon icon={faHeart} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.engagement}
              </div>
              <div className="text-green-400 text-xs">
                {stats.engagementTrend}
              </div>
            </div>
          </div>
        </div>

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-2xl w-full border border-gray-700 relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{t("create.schedulePosts")}</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-medium mb-2">{t("create.date")}</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-gray-800 border border-gray-600 text-white focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">{t("create.time")}</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-gray-800 border border-gray-600 text-white focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
                  />
                  {/* Optimal times by platform */}
                  {(() => {
                    const platConfig = {
                      Twitter: { key: "twitter", icon: "fa-brands fa-x-twitter", color: "text-white", bg: "bg-gray-700/50" },
                      LinkedIn: { key: "linkedin", icon: "fa-brands fa-linkedin-in", color: "text-blue-400", bg: "bg-blue-400/10" },
                      Medium: { key: "medium", icon: "fa-brands fa-medium", color: "text-green-400", bg: "bg-green-400/10" },
                    };
                    const groups = Object.entries(publishTo).filter(([, v]) => v).map(([name]) => {
                      const cfg = platConfig[name];
                      if (!cfg) return null;
                      const times = (platformTimes?.[cfg.key] || []).filter(t => t && t.length >= 4);
                      if (times.length === 0) return null;
                      return { name, ...cfg, times };
                    }).filter(Boolean);
                    if (groups.length === 0) return null;
                    return (
                      <div className="mt-3 space-y-2">
                        <span className="text-gray-500 text-xs">Optimal times:</span>
                        {groups.map(g => (
                          <div key={g.key} className="flex items-center gap-2 flex-wrap">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${g.bg}`}>
                              <i className={`${g.icon} ${g.color} text-xs`} />
                              <span className={`${g.color} text-xs font-medium`}>{g.name}</span>
                            </div>
                            {g.times.map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setScheduleTime(t)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  scheduleTime === t
                                    ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                                    : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  {t("create.platformsLabel")}
                </label>
                <div className="flex space-x-4">
                  {["Twitter", "LinkedIn", "Medium"].map((platform) => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={publishTo[platform]}
                        onChange={() => togglePublish(platform)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          publishTo[platform]
                            ? platform === "Twitter"
                              ? "bg-cyan-400 border-cyan-400"
                              : platform === "LinkedIn"
                              ? "bg-blue-400 border-blue-400"
                              : "bg-green-400 border-green-400"
                            : "bg-gray-600 border-gray-600"
                        }`}
                      >
                        {publishTo[platform] && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className={`text-xs ${
                              platform === "Twitter" || platform === "Medium"
                                ? "text-black"
                                : "text-white"
                            }`}
                          />
                        )}
                      </div>
                      <span className="ml-2 text-white">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={schedulePosts}
                  className="flex-1 p-4 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
                >
                  {t("create.schedulePosts")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveDraftModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="card-bg rounded-3xl p-8 max-w-lg w-full border border-gray-700 relative">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faSave} className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t("create.saveDraftTitle")}</h2>
                <p className="text-gray-400">
                  {t("create.saveDraftSubtitle")}
                </p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder={t("create.draftNamePlaceholder")}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSaveDraftModal(false)}
                  className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDraft}
                  className="flex-1 p-4 rounded-2xl gradient-accent text-white hover:opacity-90 transition-opacity"
                >
                  {t("create.saveDraft")}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-white mb-8">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            {t("create.generating")}
          </div>
        )}
      </div>
    </div>
  );
}
