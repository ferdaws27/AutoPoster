import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faChevronLeft, faChevronRight, faEdit, faTrash, faTimes, 
  faExclamationTriangle, faCheck, faDownload, faSync, faClock, faCalendarAlt,
  faFileLines, faShareNodes, faCalendar, faCheckCircle, faInfoCircle, faSpinner, faSave, faImage,
  faPaperPlane, faBookmark, faPen, faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { usePosts } from '../hooks/usePosts';
import useSettings from '../hooks/useSettings';
import useTranslation from '../i18n/useTranslation';
import toast from "react-hot-toast";
import { aiGenerate } from "../services/api";

export default function SchedulingPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { connectedPlatforms, timezone, maxPostsPerDay, platformTimes, autoPublish, smartScheduling, openRouterKey, modelId, toneLabel, contentLength, creativity, temperature, voiceProfile, language } = useSettings();
  const [viewMode, setViewMode] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: { Twitter: connectedPlatforms.twitter, LinkedIn: connectedPlatforms.linkedin, Medium: connectedPlatforms.medium },
    date: '',
    platformTimes: {
      Twitter: '',
      LinkedIn: '',
      Medium: '',
    },
  });
  const [editingPost, setEditingPost] = useState({
    content: '',
    platforms: { Twitter: false, LinkedIn: false, Medium: false },
    date: '',
    time: '',
  });
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [editSuggestedImages, setEditSuggestedImages] = useState([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [imageSearchPage, setImageSearchPage] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Use the centralized posts hook
  const { 
    posts, 
    loading, 
    error, 
    stats, 
    createPost, 
    updatePost, 
    deletePost, 
    duplicatePost,
    getPostsByDateRange,
    syncWithLocalStorage 
  } = usePosts();

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      setErrorMessage({
        title: '⚠️ Error Loading Posts',
        description: error
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [error]);

  // Generate days for current view
  const generateViewDays = () => {
    const days = [];
    
    if (viewMode === 'week') {
      // Week view - generate 7 days
      const startOfWeek = new Date(currentWeek);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push(date);
      }
    } else {
      // Day view - generate just current day
      days.push(new Date(currentWeek));
    }
    
    return days;
  };

  const viewDays = generateViewDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter posts for calendar display (exclude drafts)
  const calendarFilteredPosts = posts.filter(post => {
    // Exclude drafts from calendar view
    if (post.status === 'draft') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use scheduleDate for scheduled posts, createdAt for others
    const postDate = post.scheduleDate ? new Date(post.scheduleDate) : new Date(post.createdAt);
    postDate.setHours(0, 0, 0, 0);
    
    if (filterTab === 'all') return true;
    if (filterTab === 'today') {
      return postDate.toDateString() === today.toDateString();
    }
    if (filterTab === 'week') {
      // Start of current week (Monday)
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      // End of current week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      return postDate >= weekStart && postDate <= weekEnd;
    }
    return true;
  }).sort((a, b) => {
    // Sort by date/time (most recent first)
    const dateA = new Date(`${a.scheduleDate || a.createdAt} ${a.scheduleTime || '00:00'}`);
    const dateB = new Date(`${b.scheduleDate || b.createdAt} ${b.scheduleTime || '00:00'}`);
    return dateB - dateA;
  });

  // Filter posts for Upcoming Posts list (include drafts)
  const filteredPosts = posts.filter(post => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use scheduleDate for scheduled posts, createdAt for drafts and others
    const postDate = post.scheduleDate ? new Date(post.scheduleDate) : new Date(post.createdAt);
    postDate.setHours(0, 0, 0, 0);
    
    if (filterTab === 'all') return true;
    if (filterTab === 'today') {
      return postDate.toDateString() === today.toDateString();
    }
    if (filterTab === 'week') {
      // Start of current week (Monday)
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      // End of current week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      return postDate >= weekStart && postDate <= weekEnd;
    }
    return true;
  }).sort((a, b) => {
    // Sort by date/time (most recent first)
    const dateA = new Date(`${a.scheduleDate || a.createdAt} ${a.scheduleTime || '00:00'}`);
    const dateB = new Date(`${b.scheduleDate || b.createdAt} ${b.scheduleTime || '00:00'}`);
    return dateB - dateA;
  });

  // Get posts for specific day
  const getPostsForDay = (date) => {
    return calendarFilteredPosts.filter(post => {
      // Use scheduleDate for scheduled posts, createdAt for others
      const postDate = post.scheduleDate ? new Date(post.scheduleDate) : new Date(post.createdAt);
      postDate.setHours(0, 0, 0, 0);
      
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      return postDate.toDateString() === compareDate.toDateString();
    });
  };

  // Format date for display
  const formatDate = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date and time for display in posts
  const formatPostDateTime = (post) => {
    if (post.scheduleDate && post.scheduleTime) {
      const date = new Date(post.scheduleDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const postDate = new Date(post.scheduleDate);
      postDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((postDate - today) / (1000 * 60 * 60 * 24));
      
      let dateText = '';
      if (dayDiff === 0) {
        dateText = 'Today';
      } else if (dayDiff === 1) {
        dateText = 'Tomorrow';
      } else if (dayDiff === -1) {
        dateText = 'Yesterday';
      } else if (dayDiff > 0 && dayDiff <= 7) {
        dateText = postDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      } else {
        dateText = postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      return `${dateText}, ${formatTime(post.scheduleTime)}`;
    }
    return 'No date set';
  };

  // Search for images using SerpAPI via backend
  const searchImages = async (content, target = 'add') => {
    if (!content.trim()) return;
    setIsSearchingImages(true);
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

    // Increment page for regeneration
    const currentPage = target === 'add' ? imageSearchPage : imageSearchPage;
    const isRegenerate = (target === 'add' && suggestedImages.length > 0) || (target === 'edit' && editSuggestedImages.length > 0);
    const nextPage = isRegenerate ? currentPage + 1 : 0;
    setImageSearchPage(nextPage);

    try {
      // Step 1: Generate search keywords using AI
      let keywords = [content.split(" ").slice(0, 3).join(" ")];
      if (openRouterKey) {
        try {
          const promptRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "AutoPoster App",
            },
            body: JSON.stringify({
              model: modelId,
              messages: [{ role: "user", content: `Based on this post idea: "${content}"\nGenerate 3 different and varied image search queries (2-4 words each) to find relevant, high-quality photos. Make each query unique.\nReturn ONLY a valid JSON array like: ["query1", "query2", "query3"]` }],
              max_tokens: 100,
            }),
          });
          if (promptRes.ok) {
            const promptData = await promptRes.json();
            const raw = promptData.choices[0].message.content.trim();
            const match = raw.match(/\[[\s\S]*?\]/);
            if (match) keywords = JSON.parse(match[0]);
          }
        } catch (err) {
          console.warn("AI keyword generation failed:", err);
        }
      }

      // Step 2: Pick keyword based on page to get variety
      const keywordIndex = nextPage % keywords.length;
      const searchQuery = keywords[keywordIndex] || content;
      const res = await fetch(
        `${backendUrl}/api/images/search?q=${encodeURIComponent(searchQuery)}&num=6&page=${nextPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        console.error("Image search failed:", await res.text());
        return;
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

      if (target === 'edit') {
        setEditSuggestedImages(images);
      } else {
        setSuggestedImages(images);
      }
    } catch (err) {
      console.error("Image search error:", err);
    } finally {
      setIsSearchingImages(false);
    }
  };

  // Get selected image data from suggested images
  const getSelectedImageData = (images) => {
    const selected = images.find(img => img.selected);
    if (!selected) return null;
    return {
      url: selected.url,
      thumbnail: selected.thumbnail || selected.url,
      source: selected.source || '',
      keyword: selected.keyword || '',
    };
  };

  // Handle schedule post
  const handleSchedulePost = async () => {
    // Validate form
    if (!newPost.content.trim()) {
      setErrorMessage({
        title: '⚠️ Missing Content',
        description: 'Please enter post content'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    
    if (!newPost.date) {
      setErrorMessage({
        title: '⚠️ Missing Date',
        description: 'Please select a date'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const selectedPlatformsList = Object.keys(newPost.platforms).filter(p => newPost.platforms[p]);
    if (selectedPlatformsList.length === 0) {
      setErrorMessage({
        title: '⚠️ No Platform Selected',
        description: 'Please select at least one platform'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    // Check that each selected platform has a time
    for (const platform of selectedPlatformsList) {
      if (!newPost.platformTimes[platform]) {
        setErrorMessage({
          title: '⚠️ Missing Time',
          description: `Please select a time for ${platform}`
        });
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }
    }

    // Debug logging
    console.log('Scheduling post with date:', newPost.date, 'platformTimes:', newPost.platformTimes);
    console.log('Selected platforms:', selectedPlatformsList);

    try {
      setIsSaving(true);
      const imageData = getSelectedImageData(suggestedImages);
      // Create scheduled posts for each selected platform using the hook
      const scheduledPosts = await Promise.all(
        selectedPlatformsList.map(platform => 
          createPost({
            idea: newPost.content,
            content: newPost.content,
            platforms: { [platform]: true },
            selectedImages: imageData ? [imageData] : [],
            scheduleDate: newPost.date,
            scheduleTime: newPost.platformTimes[platform],
            platformTimes: newPost.platformTimes,
            status: 'scheduled'
          })
        )
      );

      console.log('Created posts:', scheduledPosts);

      // Update UI
      setShowAddModal(false);
      setSuggestedImages([]);
      setSuccessMessage({ title: 'Post scheduled successfully', description: 'Your content will be published as planned' });
      setShowSuccessToast(true);
      
      // Reset form with connected platforms from settings
      setNewPost({
        content: '',
        platforms: { Twitter: connectedPlatforms.twitter, LinkedIn: connectedPlatforms.linkedin, Medium: connectedPlatforms.medium },
        date: '',
        platformTimes: {
          Twitter: '',
          LinkedIn: '',
          Medium: '',
        },
      });

      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to schedule post:', error);
      setErrorMessage({
        title: '❌ Failed to Schedule',
        description: error.message || 'Could not create the post. Please try again.'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save as draft
  // Handle save draft
  const handleSaveDraft = async () => {
    // Validate form
    if (!newPost.content.trim()) {
      setErrorMessage({
        title: '⚠️ Missing Content',
        description: 'Please enter post content'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const selectedPlatformsList = Object.keys(newPost.platforms).filter(p => newPost.platforms[p]);
    if (selectedPlatformsList.length === 0) {
      setErrorMessage({
        title: '⚠️ No Platform Selected',
        description: 'Please select at least one platform'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    try {
      setIsSaving(true);
      const imageData = getSelectedImageData(suggestedImages);
      // Create draft posts for each selected platform using the hook
      const draftPosts = await Promise.all(
        selectedPlatformsList.map(platform => 
          createPost({
            name: `Draft - ${new Date().toLocaleDateString()}`,
            idea: newPost.content,
            content: newPost.content,
            variations: {},
            selectedImages: imageData ? [imageData] : [],
            publishTo: { [platform]: true },
            platforms: { [platform]: true },
            status: 'draft'
          })
        )
      );

      // Update UI
      setShowAddModal(false);
      setSuggestedImages([]);
      setSuccessMessage({ title: 'Draft saved successfully', description: 'Your draft has been saved for later' });
      setShowSuccessToast(true);
      
      // Reset form with connected platforms from settings
      setNewPost({
        content: '',
        platforms: { Twitter: connectedPlatforms.twitter, LinkedIn: connectedPlatforms.linkedin, Medium: connectedPlatforms.medium },
        date: '',
        time: '',
      });

      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setErrorMessage({
        title: '❌ Failed to Save Draft',
        description: error.message || 'Could not save the draft. Please try again.'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Regenerate post content with AI (platform rules + tone + voice)
  const handleRegenerateContent = async () => {
    if (!editingPost.content.trim()) {
      toast.error("Write some content first");
      return;
    }
    setIsRegenerating(true);
    try {
      const platforms = Object.keys(editingPost.platforms).filter(p => editingPost.platforms[p]);
      const platform = platforms[0] || "LinkedIn";

      const toneDescriptions = {
        professional: "formal language, structured sentences, business vocabulary, no slang, no emojis",
        friendly: "warm and approachable, light emojis allowed, conversational but informative",
        casual: "relaxed everyday language, emojis encouraged, short punchy sentences, humor",
      };

      const voiceBlock = voiceProfile ? `\nVOICE PROFILE TO MATCH (replicate this writing style closely):\n- Voice: "${voiceProfile.name}"\n- Tone: ${voiceProfile.tone}\n- Structure: ${voiceProfile.structure}\n- Sentence Style: ${voiceProfile.sentenceStyle}\n- Emoji Usage: ${voiceProfile.emojiUsage}\n- Hashtag Usage: ${voiceProfile.hashtagUsage}\n- Hook Style: ${voiceProfile.hookStyle}\n- CTA Style: ${voiceProfile.ctaStyle}\n- Unique Traits: ${(voiceProfile.uniqueTraits || []).join(", ")}${voiceProfile.samplePost ? `\n- Example of their writing: "${voiceProfile.samplePost}"` : ""}` : "";

      const systemMessage = `You are an elite social media content creator. Scroll-stopping, high-engagement content only.\n\nTONE: ${toneLabel}. ${toneDescriptions[toneLabel] || ""}\nLENGTH: ${contentLength}\nCREATIVITY: ${creativity}${voiceBlock}\n\nWrite like a real human — opinionated, specific, never AI-sounding. Output ONLY the post text.`;

      const platformPrompts = {
        Twitter: `Rewrite this as a high-impact Twitter post (STRICT max 280 characters).\n\nTWITTER RULES:\n- Scroll-stopping hook in first 5 words\n- Every word must earn its place — 280 chars = zero waste\n- Pattern: Short sentence. Even shorter. Punch line.\n- 2-3 relevant hashtags only if they add value\n- End with a provocative question OR bold CTA\n- NO generic filler, NO corporate speak`,
        LinkedIn: `Rewrite this as a LinkedIn post (100-200 words).\n\nLINKEDIN RULES:\n- Attention-grabbing first line (the "see more" preview)\n- 3-4 key insights with bullet points — specific and actionable\n- Use line breaks for readability — no wall of text\n- Balance insight with personality — professional but not boring\n- 3-4 relevant industry hashtags\n- End with a discussion question that sparks genuine engagement`,
        Medium: `Rewrite this as a Medium article preview (150-300 words).\n\nMEDIUM RULES:\n- SEO-friendly title that promises tangible value\n- 2-3 compelling introduction paragraphs\n- Section headings that are standalone insights\n- Editorial, essay-like voice — think published columnist\n- Close with a teaser that creates urgency to read more`,
      };

      const platformRule = platformPrompts[platform] || platformPrompts.LinkedIn;

      const result = await aiGenerate({
        prompt: `${platformRule}\n\nKeep the same core message.\n\nOriginal post:\n"""${editingPost.content}"""\n\nReturn ONLY the improved post text, nothing else.`,
        system: systemMessage,
        model: modelId,
        temperature,
        max_tokens: platform === "Twitter" ? 200 : 800,
        user_content: editingPost.content,
        language,
      });
      if (result) {
        setEditingPost(prev => ({ ...prev, content: result }));
        toast.success(`Regenerated for ${platform}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to regenerate");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle edit post
  const handleEditPost = (post) => {
    if (!post || post.status === 'posted') return; // Don't allow editing posted content
    
    setSelectedPost(post);
    setEditingPost({
      content: post.idea || post.content || '',
      platforms: post.platforms || { Twitter: false, LinkedIn: false, Medium: false },
      date: post.scheduleDate || '',
      time: post.scheduleTime || '',
      selectedImages: post.selectedImages || []
    });
    setEditSuggestedImages(post.selectedImages || []);
    setShowEditModal(true);
  };

  // Handle save edited post
  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    
    // Validate form
    if (!editingPost.content.trim()) {
      toast.error('Please enter post content');
      return;
    }

    const selectedPlatformsList = Object.keys(editingPost.platforms).filter(p => editingPost.platforms[p]);
    if (selectedPlatformsList.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving edited post:', {
        postId: selectedPost.id,
        editingPost
      });

      // Update post using the hook
      await updatePost(selectedPost.id, {
        idea: editingPost.content,
        content: editingPost.content,
        platforms: editingPost.platforms,
        selectedImages: editingPost.selectedImages || [],
        // Only set schedule info if not a draft
        scheduleDate: selectedPost.status === 'draft' ? null : editingPost.date,
        scheduleTime: selectedPost.status === 'draft' ? null : editingPost.time
      });

      // Update UI
      setShowEditModal(false);
      setSelectedPost(null);
      setEditSuggestedImages([]);
      setEditingPost({
        content: '',
        platforms: { Twitter: false, LinkedIn: false, Medium: false },
        date: '',
        time: '',
      });
      setSuccessMessage({ title: 'Post updated successfully', description: 'Your changes have been saved' });
      setShowSuccessToast(true);
      
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to update post:', error);
      const errorMessage = error?.message || 'Failed to update post. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  const calculateEngagement = (post) => {
    if (!post.engagement) return 0;
    return (post.engagement.likes || 0) + (post.engagement.shares || 0) + (post.engagement.comments || 0);
  };

  // Format engagement display
  const formatEngagement = (engagement) => {
    if (engagement >= 1000) {
      return `${(engagement / 1000).toFixed(1)}k engagements`;
    }
    return `${engagement} engagements`;
  };

  // Handle duplicate post
  const handleDuplicatePost = async (post) => {
    try {
      await duplicatePost(post.id);
      setSuccessMessage({ title: 'Post duplicated successfully', description: 'Your post has been duplicated' });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to duplicate post:', error);
      setErrorMessage({
        title: '❌ Failed to Duplicate',
        description: error.message || 'Could not duplicate post. Please try again.'
      });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!selectedPost) return;

    setIsDeleting(true);
    try {
      await deletePost(selectedPost.id);
      setShowDeleteModal(false);
      setSelectedPost(null);
      setSuccessMessage({ title: 'Post deleted successfully', description: 'Your post has been deleted' });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'week') {
      // Week navigation - move by 7 days
      newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      // Day navigation - move by 1 day
      newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentWeek(newDate);
  };

  // Navigate to post details
  const navigateToPost = (post) => {
    // Select the post in Upcoming Posts section
    setSelectedPost(post);
    
    // Scroll to the post in the Upcoming Posts panel
    setTimeout(() => {
      const postElement = document.querySelector(`[data-post-id="${post.id}"]`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        postElement.classList.add('ring-2', 'ring-cyan-400', 'ring-opacity-50');
        setTimeout(() => {
          postElement.classList.remove('ring-2', 'ring-cyan-400', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  };

  // Handle export calendar
  const handleExportCalendar = () => {
    // Get all posts with dates
    const postsWithDates = posts.filter(post => post.scheduleDate);
    
    if (postsWithDates.length === 0) {
      toast.error('No scheduled posts to export');
      return;
    }

    // Create calendar data
    const calendarEvents = postsWithDates.map(post => {
      const startDate = new Date(`${post.scheduleDate} ${post.scheduleTime || '12:00'}`);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // 1 hour event
      
      const platforms = post.platforms ? Object.keys(post.platforms).filter(p => post.platforms[p]).join(', ') : 'Unknown';
      
      return {
        summary: `${platforms}: ${post.idea || post.content || 'No content'}`.substring(0, 50),
        description: `Platform: ${platforms}\nContent: ${post.idea || post.content || 'No content'}\nStatus: ${post.status}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: 'AutoPoster App'
      };
    });

    // Create iCal format
    let icalContent = 'BEGIN:VCALENDAR\r\n';
    icalContent += 'VERSION:2.0\r\n';
    icalContent += 'PRODID:-//AutoPoster//Calendar Export//EN\r\n';
    icalContent += 'CALSCALE:GREGORIAN\r\n';
    
    calendarEvents.forEach(event => {
      icalContent += 'BEGIN:VEVENT\r\n';
      icalContent += `DTSTART:${formatDateForICal(event.start)}\r\n`;
      icalContent += `DTEND:${formatDateForICal(event.end)}\r\n`;
      icalContent += `SUMMARY:${event.summary}\r\n`;
      icalContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\r\n`;
      icalContent += `LOCATION:${event.location}\r\n`;
      icalContent += 'END:VEVENT\r\n';
    });
    
    icalContent += 'END:VCALENDAR\r\n';

    // Download file
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autoposter-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    setSuccessMessage({ 
      title: 'Calendar exported successfully', 
      description: `Exported ${calendarEvents.length} events to your calendar file` 
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Format date for iCal format
  const formatDateForICal = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('Z', '');
  };

  // Handle sync all
 const handleSyncAll = async () => {
  setIsSyncing(true);
  try {
    // Utiliser la fonction du hook au lieu de setPosts
    syncWithLocalStorage();

    await new Promise(resolve => setTimeout(resolve, 1000));

    setSuccessMessage({
      title: 'Sync completed successfully',
      description: `Synchronized ${posts.length} posts`
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  } catch (error) {
    console.error('Sync failed:', error);
    toast.error('Sync failed. Please try again.');
  } finally {
    setIsSyncing(false);
  }
};
  const platformColors = {
    Twitter: 'bg-white',
    LinkedIn: 'bg-blue-400', 
    Medium: 'bg-green-400'
  };

  const platformTextColors = {
    Twitter: 'text-white', 
    LinkedIn: 'text-blue-400',
    Medium: 'text-green-400'
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white p-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white mb-2">{t("scheduling.title")}</h1>
            <p className="text-gray-400">{t("scheduling.subtitle")}</p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* View Toggle */}
            <div className="flex items-center bg-black/30 rounded-2xl p-1">
              <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  viewMode === 'week' ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t("scheduling.weekView")}
              </button>
              <button 
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  viewMode === 'day' ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t("scheduling.dayView")}
              </button>
            </div>
            
            {/* Add Schedule Button */}
            <button 
              onClick={() => {
                setNewPost({
                  content: '',
                  platforms: { Twitter: connectedPlatforms.twitter, LinkedIn: connectedPlatforms.linkedin, Medium: connectedPlatforms.medium },
                  date: '',
                  platformTimes: {
                    Twitter: '',
                    LinkedIn: '',
                    Medium: '',
                  },
                });
                setSuggestedImages([]);
                setShowAddModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>{t("scheduling.schedulePost")}</span>
            </button>
          </div>
        </div>

        {/* Calendar and Posts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Upcoming Posts Panel */}
          <div className="col-span-1 order-2 lg:order-1">
            <div className="glass-effect rounded-3xl overflow-hidden max-h-[calc(100vh-12rem)] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                    <i className="fa-solid fa-calendar-days text-cyan-400 text-sm"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Upcoming Posts</h2>
                    <p className="text-xs text-gray-400">{filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex px-6 pb-4 gap-1.5">
                {['all', 'today', 'week'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      filterTab === tab 
                        ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/20' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Posts List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-400 text-sm">{t("common.loading")}</p>
                  </div>
                )}
                
                {!loading && filteredPosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 text-xl" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">
                      {posts.length === 0 ? t("scheduling.noPostsScheduled") : 'No posts match this filter'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {posts.length === 0 ? 'Create one to get started' : 'Try a different filter'}
                    </p>
                  </div>
                )}
                
                {filteredPosts.map((post, index) => {
                  const statusStyle = post.status === 'scheduled'
                    ? { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20', icon: 'fa-clock' }
                    : post.status === 'draft'
                    ? { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20', icon: 'fa-pen' }
                    : post.status === 'posted'
                    ? { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20', icon: 'fa-check' }
                    : { bg: 'bg-cyan-400/10', text: 'text-cyan-400', border: 'border-cyan-400/20', icon: 'fa-circle' };

                  return (
                    <div 
                      key={post.id}
                      data-post-id={post.id}
                      className="group post-item rounded-2xl p-4 hover:bg-white/[0.03] border border-transparent hover:border-gray-700/50 transition-all duration-200 cursor-pointer"
                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Post thumbnail or placeholder */}
                        {post.selectedImages && post.selectedImages.length > 0 ? (
                          <img 
                            className="w-11 h-11 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10" 
                            src={typeof post.selectedImages[0] === 'string' ? post.selectedImages[0] : (post.selectedImages[0].thumbnail || post.selectedImages[0].url)}
                            alt="" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gray-800/60 flex-shrink-0 ring-1 ring-white/10 flex items-center justify-center">
                            <i className="fa-solid fa-image text-gray-600 text-sm"></i>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-sm font-semibold text-gray-100 leading-snug ${expandedPostId === post.id ? '' : 'line-clamp-2'}`}>
                              {typeof post.idea === 'string' ? post.idea : typeof post.content === 'string' ? post.content : post.content?.title || post.idea?.title || 'No content'}
                            </p>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                              <i className={`fa-solid ${statusStyle.icon} text-[8px]`}></i>
                              {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Draft'}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{formatPostDateTime(post)}</span>

                          {/* Expanded content */}
                          {expandedPostId === post.id && post.content && post.idea && post.content !== post.idea && (
                            <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                              {post.content}
                            </p>
                          )}

                          {/* Platforms + Actions */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center gap-1.5">
                              {post.platforms && Object.keys(post.platforms).filter(p => post.platforms[p]).map(platform => (
                                <div
                                  key={platform}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center ring-1 ring-white/10 ${
                                    platform === 'Twitter' ? 'bg-black' : platform === 'LinkedIn' ? 'bg-blue-600' : 'bg-green-700'
                                  }`}
                                  title={platform}
                                >
                                  <i className={`fa-brands ${platform === 'Twitter' ? 'fa-x-twitter' : platform === 'LinkedIn' ? 'fa-linkedin-in' : 'fa-medium'} text-white text-[10px]`}></i>
                                </div>
                              ))}
                            </div>

                            {post.status === 'posted' ? (
                              <span className="text-emerald-400 text-xs font-medium">
                                {formatEngagement(calculateEngagement(post))}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPost(post);
                                  }}
                                  disabled={isSaving || post.status === 'posted'}
                                  title={post.status === 'posted' ? 'Cannot edit posted content' : 'Edit post'}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                    post.status === 'posted' 
                                      ? 'text-gray-600 cursor-not-allowed' 
                                      : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
                                  }`}
                                >
                                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPost(post);
                                    setShowDeleteModal(true);
                                  }}
                                  disabled={isDeleting || post.status === 'posted'}
                                  title={post.status === 'posted' ? 'Cannot delete posted content' : 'Delete post'}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                    post.status === 'posted' 
                                      ? 'text-gray-600 cursor-not-allowed' 
                                      : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
                                  }`}
                                >
                                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="col-span-1 lg:col-span-3 order-1 lg:order-2">
            <div className="glass-effect rounded-3xl overflow-hidden max-h-[calc(100vh-12rem)] flex flex-col">
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleNavigateWeek('prev')}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
                  </button>
                  <h2 className="text-xl font-semibold text-white tracking-tight">{formatDate(currentWeek)}</h2>
                  <button 
                    onClick={() => handleNavigateWeek('next')}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {/* Platform Legend */}
                  <div className="hidden md:flex items-center gap-4 mr-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                      <span className="text-gray-400 text-xs">X</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-sm"></div>
                      <span className="text-gray-400 text-xs">LinkedIn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
                      <span className="text-gray-400 text-xs">Medium</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setCurrentWeek(new Date())}
                    className="px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.08] text-xs font-medium transition-all"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mx-4 mb-4 rounded-2xl overflow-hidden border border-white/[0.04] flex-1 flex flex-col">
                
                {/* Day Headers */}
                <div className={`grid gap-px bg-white/[0.03] flex-shrink-0 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
                  {viewDays.map((day, index) => {
                    const isToday = day.toDateString() === today.toDateString();
                    return (
                      <div key={index} className={`bg-black/40 px-3 py-3 text-center ${isToday ? 'border-b-2 border-cyan-400' : 'border-b border-white/[0.04]'}`}>
                        <div className={`text-[10px] font-semibold tracking-wider mb-1 ${isToday ? 'text-cyan-400' : 'text-gray-500'}`}>
                          {viewMode === 'week' 
                            ? day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                            : day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()
                          }
                        </div>
                        <div className={`text-lg font-bold ${isToday ? 'text-cyan-400' : 'text-gray-200'}`}>
                          {day.getDate()}
                        </div>
                        {isToday && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mx-auto mt-1"></div>}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Cells */}
                <div className={`grid gap-px bg-white/[0.02] flex-1 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'} overflow-y-auto`}>
                {viewDays.map((day, index) => {
                  const dayPosts = getPostsForDay(day);
                  const isToday = day.toDateString() === today.toDateString();
                  
                  return (
                    <div key={index} className={`bg-black/20 p-2.5 relative ${viewMode === 'week' ? 'min-h-[140px]' : 'min-h-[300px]'} ${isToday ? 'bg-cyan-400/[0.03]' : ''}`}>
                      {dayPosts.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-700 text-xs">—</span>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {dayPosts.map((post, postIndex) => {
                          const activePlatform = post.platforms && Object.keys(post.platforms).find(p => post.platforms[p]);
                          const eventClass = activePlatform ? `${activePlatform.toLowerCase()}-event` : 'twitter-event';
                          
                          return (
                            <div 
                              key={post.id}
                              onClick={() => navigateToPost(post)}
                              className={`event-bar cursor-pointer ${eventClass} animate-slide-in`}
                              style={{ animationDelay: `${postIndex * 0.05}s` }}
                              title={post.idea || post.content || 'No content'}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-white text-sm font-semibold truncate">
                                  {post.idea || post.content || 'No content'}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {post.platforms && Object.keys(post.platforms).filter(p => post.platforms[p]).map(platform => (
                                    <div
                                      key={platform}
                                      className={`w-5 h-5 rounded flex items-center justify-center ${
                                        platform === 'Twitter' ? 'bg-black ring-1 ring-gray-600' : platform === 'LinkedIn' ? 'bg-blue-600' : 'bg-green-700'
                                      }`}
                                    >
                                      <i className={`fa-brands ${platform === 'Twitter' ? 'fa-x-twitter' : platform === 'LinkedIn' ? 'fa-linkedin-in' : 'fa-medium'} text-white text-[9px]`}></i>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {post.scheduleTime && (
                                <div className="text-gray-300 text-xs mt-1">
                                  <i className="fa-regular fa-clock mr-1 text-[10px]"></i>
                                  {formatTime(post.scheduleTime)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between px-6 pb-5 pt-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportCalendar}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.08] text-xs font-medium transition-all"
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-xs" />
                    Export
                  </button>
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSyncing 
                        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 cursor-not-allowed' 
                        : 'bg-white/[0.04] border border-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={faSync} 
                      className={`text-xs ${isSyncing ? 'animate-spin' : ''}`} 
                    />
                    {isSyncing ? 'Syncing...' : 'Sync'}
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="fa-regular fa-clock text-[10px]"></i>
                  <span>Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card-bg rounded-3xl p-8 border border-gray-700 glow-border w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Schedule New Post</h2>
                  <p className="text-gray-400 text-sm">Compose and schedule your content</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPost({ content: '', platforms: { Twitter: connectedPlatforms.twitter, LinkedIn: connectedPlatforms.linkedin, Medium: connectedPlatforms.medium }, date: '', platformTimes: { Twitter: '', LinkedIn: '', Medium: '' } });
                    setSuggestedImages([]);
                  }}
                  className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {/* Content Section */}
                <div className="relative">
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <FontAwesomeIcon icon={faFileLines} className="mr-2" />Content
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full h-40 bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="Write your post content here..."
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <div className="absolute bottom-4 right-4">
                      <span className="text-gray-500 text-sm">
                        {newPost.content.length} characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platforms Section */}
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <FontAwesomeIcon icon={faShareNodes} className="mr-2" />Publish To
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Twitter', icon: 'fa-x-twitter', color: 'text-white' },
                      { name: 'LinkedIn', icon: 'fa-linkedin-in', color: 'text-blue-400' },
                      { name: 'Medium', icon: 'fa-medium', color: 'text-green-400' }
                    ].map(platform => (
                      <label
                        key={platform.name}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          newPost.platforms[platform.name]
                            ? 'bg-cyan-400/10 border-cyan-400/50'
                            : 'bg-gray-800/30 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newPost.platforms[platform.name] || false}
                          onChange={(e) => setNewPost(prev => ({
                            ...prev,
                            platforms: {
                              ...prev.platforms,
                              [platform.name]: e.target.checked
                            }
                          }))}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center space-y-2">
                          <i className={`fa-brands ${platform.icon} text-2xl ${platform.color}`}></i>
                          <span className="text-sm font-medium text-white">{platform.name}</span>
                          {newPost.platforms[platform.name] && (
                            <div className="absolute top-2 right-2">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-cyan-400 text-xs" />
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scheduling Section */}
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />Schedule
                  </label>
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        value={newPost.date}
                        onChange={(e) => setNewPost(prev => ({ ...prev, date: e.target.value }))}
                      />
                      <FontAwesomeIcon icon={faCalendar} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Time selectors for each platform */}
                  <div className="space-y-3">
                    {["Twitter", "LinkedIn", "Medium"].map((platform) => {
                      if (!newPost.platforms[platform]) return null;
                      
                      const platConfig = {
                        Twitter: { key: "twitter", icon: "fa-brands fa-x-twitter", color: "text-white", bg: "bg-gray-700/50" },
                        LinkedIn: { key: "linkedin", icon: "fa-brands fa-linkedin-in", color: "text-blue-400", bg: "bg-blue-400/10" },
                        Medium: { key: "medium", icon: "fa-brands fa-medium", color: "text-green-400", bg: "bg-green-400/10" },
                      };
                      const cfg = platConfig[platform];
                      const times = (platformTimes?.[cfg.key] || []).filter(t => t && t.length >= 4);
                      
                      return (
                        <div key={platform} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${cfg.bg}`}>
                              <i className={`${cfg.icon} ${cfg.color} text-xs`} />
                              <span className={`${cfg.color} text-xs font-medium`}>{platform}</span>
                            </div>
                            <input
                              type="time"
                              value={newPost.platformTimes[platform]}
                              onChange={(e) => setNewPost(prev => ({ ...prev, platformTimes: { ...prev.platformTimes, [platform]: e.target.value } }))}
                              className="flex-1 bg-gray-800/50 border border-gray-600 rounded-xl px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
                            />
                          </div>
                          {times.length > 0 && (
                            <div className="ml-20 flex items-center gap-2 flex-wrap">
                              <span className="text-gray-500 text-xs">Optimal:</span>
                              {times.map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setNewPost(prev => ({ ...prev, platformTimes: { ...prev.platformTimes, [platform]: t } }))}
                                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    newPost.platformTimes[platform] === t
                                      ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                                      : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {newPost.date && Object.keys(newPost.platforms).filter(p => newPost.platforms[p]).length > 0 && (
                    <div className="mt-3 p-3 bg-green-400/10 border border-green-400/30 rounded-xl">
                      <p className="text-green-400 text-sm">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        Scheduled for {new Date(newPost.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Image Suggestions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-300 font-medium">
                      <FontAwesomeIcon icon={faImage} className="mr-2" />
                      AI Image Suggestions
                    </label>
                    <button 
                      onClick={() => searchImages(newPost.content, 'add')}
                      disabled={isSearchingImages || !newPost.content.trim()}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {isSearchingImages ? (
                        <><FontAwesomeIcon icon={faSpinner} spin className="mr-1" /> Searching...</>
                      ) : (
                        <>{suggestedImages.length > 0 ? 'Regenerate' : 'Find Images'}</>
                      )}
                    </button>
                  </div>
                  {suggestedImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {suggestedImages.map((image, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            setSuggestedImages(prev => prev.map((img, i) => ({ ...img, selected: i === index })));
                          }}
                          className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            image.selected ? 'border-cyan-400 ring-1 ring-cyan-400/30' : 'border-transparent hover:border-gray-500'
                          }`}
                        >
                          <img 
                            className="w-full h-24 rounded-xl object-cover bg-gray-800" 
                            src={image.thumbnail || image.url}
                            alt={image.description || `Image ${index + 1}`}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          {image.selected && (
                            <div className="absolute top-1 right-1 bg-cyan-400 text-black rounded-full w-5 h-5 flex items-center justify-center">
                              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheck} className="text-white text-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-black/20 rounded-xl border border-dashed border-gray-600">
                      <FontAwesomeIcon icon={faImage} className="text-gray-500 text-2xl mb-2" />
                      <p className="text-gray-500 text-sm">Write your content then click "Find Images"</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    Post will be scheduled automatically
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      className="px-6 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all flex items-center space-x-2"
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      <span>Save Draft</span>
                    </button>
                    <button 
                      className="px-6 py-3 rounded-xl gradient-accent text-white hover:shadow-lg hover:shadow-cyan-400/25 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSchedulePost}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>Schedule Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card-bg rounded-3xl p-8 border border-gray-700 glow-border w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Edit Post</h2>
                  <p className="text-gray-400 text-sm">Modify your content and scheduling preferences</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {/* Content Section */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-cyan-400">
                      <FontAwesomeIcon icon={faFileLines} className="mr-2" />Content
                    </label>
                    <button
                      onClick={handleRegenerateContent}
                      disabled={isRegenerating}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faSync} className={isRegenerating ? 'animate-spin' : ''} />
                      {isRegenerating ? 'Generating...' : 'AI Rewrite'}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full h-40 bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="Write your post content here..."
                      value={editingPost.content}
                      onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <div className="absolute bottom-4 right-4">
                      <span className="text-gray-500 text-sm">
                        {editingPost.content.length} characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attached Images Preview */}
                {editingPost.selectedImages?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-3">
                      <FontAwesomeIcon icon={faImage} className="mr-2" />Attached Images ({editingPost.selectedImages.length})
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {editingPost.selectedImages.map((img, i) => {
                        const url = typeof img === 'string' ? img : (img.thumbnail || img.url);
                        return (
                          <div key={i} className="relative group/img">
                            <img src={url} alt="" className="h-20 w-28 rounded-xl object-cover border border-gray-600" />
                            <button
                              onClick={() => setEditingPost(prev => ({
                                ...prev,
                                selectedImages: prev.selectedImages.filter((_, idx) => idx !== i)
                              }))}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Platforms Section */}
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <FontAwesomeIcon icon={faShareNodes} className="mr-2" />Publish To
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Twitter', icon: 'fa-x-twitter', color: 'text-white' },
                      { name: 'LinkedIn', icon: 'fa-linkedin-in', color: 'text-blue-400' },
                      { name: 'Medium', icon: 'fa-medium', color: 'text-green-400' }
                    ].map(platform => (
                      <label
                        key={platform.name}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          editingPost.platforms[platform.name]
                            ? 'bg-cyan-400/10 border-cyan-400/50'
                            : 'bg-gray-800/30 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editingPost.platforms[platform.name] || false}
                          onChange={(e) => setEditingPost(prev => ({
                            ...prev,
                            platforms: {
                              ...prev.platforms,
                              [platform.name]: e.target.checked
                            }
                          }))}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center space-y-2">
                          <i className={`fa-brands ${platform.icon} text-2xl ${platform.color}`}></i>
                          <span className="text-sm font-medium text-white">{platform.name}</span>
                          {editingPost.platforms[platform.name] && (
                            <div className="absolute top-2 right-2">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-cyan-400 text-xs" />
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* AI Image Suggestions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-300 font-medium">
                      <FontAwesomeIcon icon={faImage} className="mr-2" />
                      AI Image Suggestions
                    </label>
                    <button 
                      onClick={() => searchImages(editingPost.content, 'edit')}
                      disabled={isSearchingImages || !editingPost.content.trim()}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {isSearchingImages ? (
                        <><FontAwesomeIcon icon={faSpinner} spin className="mr-1" /> Searching...</>
                      ) : (
                        <>{editSuggestedImages.length > 0 ? 'Regenerate' : 'Find Images'}</>
                      )}
                    </button>
                  </div>
                  {editSuggestedImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {editSuggestedImages.map((image, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            setEditSuggestedImages(prev => prev.map((img, i) => ({ ...img, selected: i === index })));
                            // Also add to editingPost.selectedImages
                            const imgData = { url: image.url, thumbnail: image.thumbnail || image.url, source: image.source || '', keyword: image.keyword || '' };
                            setEditingPost(prev => {
                              const imgs = prev.selectedImages || [];
                              const exists = imgs.some(im => (typeof im === 'string' ? im : im.url) === imgData.url);
                              if (exists) {
                                return { ...prev, selectedImages: imgs.filter(im => (typeof im === 'string' ? im : im.url) !== imgData.url) };
                              }
                              return { ...prev, selectedImages: [...imgs, imgData] };
                            });
                          }}
                          className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            image.selected ? 'border-cyan-400 ring-1 ring-cyan-400/30' : 'border-transparent hover:border-gray-500'
                          }`}
                        >
                          <img 
                            className="w-full h-24 rounded-xl object-cover bg-gray-800" 
                            src={image.thumbnail || image.url}
                            alt={image.description || `Image ${index + 1}`}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          {image.selected && (
                            <div className="absolute top-1 right-1 bg-cyan-400 text-black rounded-full w-5 h-5 flex items-center justify-center">
                              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheck} className="text-white text-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-black/20 rounded-xl border border-dashed border-gray-600">
                      <FontAwesomeIcon icon={faImage} className="text-gray-500 text-2xl mb-2" />
                      <p className="text-gray-500 text-sm">Click "Find Images" to search for relevant images</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    Changes will be saved immediately
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      className="px-6 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all flex items-center space-x-2"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedPost(null);
                        setEditSuggestedImages([]);
                        setEditingPost({
                          content: '',
                          platforms: { Twitter: false, LinkedIn: false, Medium: false },
                          date: '',
                          time: '',
                        });
                      }}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      <span>Cancel</span>
                    </button>
                    <button 
                      className="px-6 py-3 rounded-xl gradient-accent text-white hover:shadow-lg hover:shadow-cyan-400/25 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-md w-full border border-red-400/30">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-400/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Post</h3>
                <p className="text-gray-400 mb-6">Are you sure you want to delete this scheduled post? This action cannot be undone.</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPost(null);
                    }}
                    disabled={isDeleting}
                    className="flex-1 p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="flex-1 p-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-8 right-8 z-60 transform transition-transform duration-300">
            <div className="glass-effect rounded-2xl p-4 border border-green-400/30 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-green-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="text-green-400" />
              </div>
              <div>
                <div className="text-white font-medium text-sm">
                  {successMessage.title}
                </div>
                <div className="text-gray-400 text-xs">
                  {successMessage.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {showErrorToast && (
          <div className="fixed top-8 right-8 z-60 transform transition-transform duration-300">
            <div className="glass-effect rounded-2xl p-4 border border-red-400/30 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-red-400/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
              </div>
              <div>
                <div className="text-white font-medium text-sm">
                  {errorMessage.title}
                </div>
                <div className="text-gray-400 text-xs">
                  {errorMessage.description}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}