import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faChevronLeft, faChevronRight, faEdit, faTrash, faTimes, 
  faExclamationTriangle, faCheck, faDownload, faSync, faClock, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedin, faMedium, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { usePosts } from '../hooks/usePosts';

export default function SchedulingPage() {
  const navigate = useNavigate();
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
  const [filterTab, setFilterTab] = useState('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: { Twitter: false, LinkedIn: true, Medium: false },
    date: '',
    time: '',
    selectedImage: 0
  });
  const [editingPost, setEditingPost] = useState({
    content: '',
    platforms: { Twitter: false, LinkedIn: false, Medium: false },
    date: '',
    time: '',
    selectedImage: 0
  });

  // Use the centralized posts hook
  const { 
    posts, 
    loading, 
    error, 
    stats, 
    createPost, 
    updatePost, 
    deletePost, 
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

  // Filter posts based on selected tab
  const filteredPosts = posts.filter(post => {
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

  // Get posts for specific day
  const getPostsForDay = (date) => {
    return filteredPosts.filter(post => {
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
    
    if (!newPost.date || !newPost.time) {
      setErrorMessage({
        title: '⚠️ Missing Schedule',
        description: 'Please select both date and time'
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

    // Debug logging
    console.log('Scheduling post with date:', newPost.date, 'time:', newPost.time);
    console.log('Selected platforms:', selectedPlatformsList);

    try {
      setIsSaving(true);
      // Create scheduled posts for each selected platform using the hook
      const scheduledPosts = await Promise.all(
        selectedPlatformsList.map(platform => 
          createPost({
            idea: newPost.content,
            content: newPost.content,
            platforms: { [platform]: true },
            selectedImages: newPost.selectedImage,
            scheduleDate: newPost.date,
            scheduleTime: newPost.time,
            status: 'scheduled'
          })
        )
      );

      console.log('Created posts:', scheduledPosts);

      // Update UI
      setShowAddModal(false);
      setSuccessMessage({ title: 'Post scheduled successfully', description: 'Your content will be published as planned' });
      setShowSuccessToast(true);
      
      // Reset form
      setNewPost({
        content: '',
        platforms: { Twitter: false, LinkedIn: true, Medium: false },
        date: '',
        time: '',
        selectedImage: 0
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
      // Create draft posts for each selected platform using the hook
      const draftPosts = await Promise.all(
        selectedPlatformsList.map(platform => 
          createPost({
            name: `Draft - ${new Date().toLocaleDateString()}`,
            idea: newPost.content,
            content: newPost.content,
            variations: {},
            selectedImages: {},
            publishTo: { [platform]: true },
            platforms: { [platform]: true },
            status: 'draft'
          })
        )
      );

      // Update UI
      setShowAddModal(false);
      setSuccessMessage({ title: 'Draft saved successfully', description: 'Your draft has been saved for later' });
      setShowSuccessToast(true);
      
      // Reset form
      setNewPost({
        content: '',
        platforms: { Twitter: false, LinkedIn: true, Medium: false },
        date: '',
        time: '',
        selectedImage: 0
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

  // Handle edit post
  const handleEditPost = (post) => {
    if (!post || post.status === 'posted') return; // Don't allow editing posted content
    
    setSelectedPost(post);
    setEditingPost({
      content: post.idea || post.content || '',
      platforms: post.platforms || { Twitter: false, LinkedIn: false, Medium: false },
      date: post.scheduleDate || '',
      time: post.scheduleTime || '',
      selectedImage: post.selectedImages || 0
    });
    setShowEditModal(true);
  };

  // Handle save edited post
  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    
    // Validate form
    if (!editingPost.content.trim()) {
      alert('Please enter post content');
      return;
    }

    const selectedPlatformsList = Object.keys(editingPost.platforms).filter(p => editingPost.platforms[p]);
    if (selectedPlatformsList.length === 0) {
      alert('Please select at least one platform');
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
        selectedImages: editingPost.selectedImage,
        scheduleDate: editingPost.date,
        scheduleTime: editingPost.time
      });

      // Update UI
      setShowEditModal(false);
      setSelectedPost(null);
      setEditingPost({
        content: '',
        platforms: { Twitter: false, LinkedIn: false, Medium: false },
        date: '',
        time: '',
        selectedImage: 0
      });
      setSuccessMessage({ title: 'Post updated successfully', description: 'Your changes have been saved' });
      setShowSuccessToast(true);
      
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to update post:', error);
      const errorMessage = error?.message || 'Failed to update post. Please try again.';
      alert(errorMessage);
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
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle navigate view
  const navigateView = (direction) => {
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

  // Handle export calendar
  const handleExportCalendar = () => {
    // Get all posts with dates
    const postsWithDates = posts.filter(post => post.scheduleDate);
    
    if (postsWithDates.length === 0) {
      alert('No scheduled posts to export');
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
    alert('Sync failed. Please try again.');
  } finally {
    setIsSyncing(false);
  }
};
  const platformColors = {
    Twitter: 'bg-blue-400',
    LinkedIn: 'bg-violet-400', 
    Medium: 'bg-teal-400'
  };

  const platformTextColors = {
    Twitter: 'text-blue-400',
    LinkedIn: 'text-violet-400',
    Medium: 'text-teal-400'
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="gradient-bg min-h-screen text-white p-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Content Scheduler</h1>
            <p className="text-gray-400">Plan and schedule your content across all platforms</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-black/30 rounded-2xl p-1">
              <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  viewMode === 'week' ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  viewMode === 'day' ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Day
              </button>
            </div>
            
            {/* Add Schedule Button */}
            <button 
              onClick={() => {
                console.log('Add Schedule clicked, showing modal');
                setShowAddModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Schedule</span>
            </button>
          </div>
        </div>

        {/* Calendar and Posts Layout */}
        <div className="grid grid-cols-4 gap-8">
          
          {/* Upcoming Posts Panel */}
          <div className="col-span-1">
            <div className="glass-effect rounded-3xl p-6 h-[800px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-6">Upcoming Posts</h2>
              
              {/* Filter Tabs */}
              <div className="flex space-x-2 mb-6">
                {['all', 'today', 'week'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      filterTab === tab 
                        ? 'bg-cyan-400/20 text-cyan-400' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-400 text-sm">Loading your posts...</p>
                  </div>
                )}
                
                {!loading && filteredPosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 text-3xl mb-3" />
                    <p className="text-gray-400 text-sm">
                      {posts.length === 0 ? 'No posts yet. Create one to get started!' : 'No posts match this filter'}
                    </p>
                  </div>
                )}
                
                {filteredPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="post-item bg-black/30 rounded-2xl p-4 border border-gray-700/50 hover:border-cyan-400/30 transition-all cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex items-start space-x-3">
                      <img 
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0" 
                        src={`https://picsum.photos/100/100?random=${post.id}`}
                        alt="Post preview" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            post.status === 'scheduled' ? 'status-scheduled' :
                            post.status === 'draft' ? 'status-draft' :
                            'status-posted'
                          }`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatPostDateTime(post)}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                          {post.idea || post.content || 'No content'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {post.platforms && Object.keys(post.platforms).filter(p => post.platforms[p]).map(platform => (
                              <FontAwesomeIcon 
                                key={platform}
                                icon={platform === 'Twitter' ? faTwitter : platform === 'LinkedIn' ? faLinkedin : faMedium}
                                className={`${platformTextColors[platform]} text-xs`}
                              />
                            ))}
                          </div>
                          {post.status === 'posted' ? (
                            <span className="text-green-400 text-xs">
                              {formatEngagement(calculateEngagement(post))}
                            </span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPost(post);
                                }}
                                disabled={isSaving || post.status === 'posted'}
                                title={post.status === 'posted' ? 'Cannot edit posted content' : 'Edit post'}
                                className={`transition-all duration-200 ${
                                  post.status === 'posted' 
                                    ? 'text-gray-600 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-cyan-400 hover:scale-110 active:scale-95'
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
                                className={`transition-all duration-200 ${
                                  post.status === 'posted' 
                                    ? 'text-gray-600 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-red-400 hover:scale-110 active:scale-95'
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
                ))}
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="col-span-3">
            <div className="glass-effect rounded-3xl p-6 h-[800px]">
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => navigateView('prev')}
                    className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <h2 className="text-2xl font-bold text-white">{formatDate(currentWeek)}</h2>
                  <button 
                    onClick={() => navigateView('next')}
                    className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Platform Legend */}
                  <div className="flex items-center space-x-4 text-sm">
                    {Object.keys(platformColors).map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${platformColors[platform]} rounded`}></div>
                        <span className="text-gray-300">{platform}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentWeek(new Date())}
                    className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className={`grid gap-px bg-gray-700/20 rounded-2xl overflow-hidden ${
                viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'
              }`}>
                
                {/* Day Headers */}
                {viewDays.map((day, index) => {
                  const isToday = day.toDateString() === today.toDateString();
                  return (
                    <div key={index} className={`bg-black/20 p-4 text-center ${isToday ? 'border-2 border-cyan-400/30 rounded-lg' : ''}`}>
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {viewMode === 'week' 
                          ? day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                          : day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()
                        }
                        {isToday && <span className="ml-1">TODAY</span>}
                      </div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-cyan-400' : 'text-white'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}

                {/* Calendar Cells */}
                {viewDays.map((day, index) => {
                  const dayPosts = getPostsForDay(day);
                  const isToday = day.toDateString() === today.toDateString();
                  
                  return (
                    <div key={index} className={`bg-black/10 p-3 relative ${viewMode === 'week' ? 'min-h-[120px]' : 'min-h-[400px]'} ${isToday ? 'border-2 border-cyan-400/20 rounded-lg' : ''}`}>
                      {/* Events for this day */}
                      <div className="space-y-2">
                        {dayPosts.map((post, postIndex) => (
                          <div 
                            key={post.id}
                            className={`event-bar ${post.platforms && Object.keys(post.platforms).find(p => post.platforms[p]) ? `${Object.keys(post.platforms).find(p => post.platforms[p])?.toLowerCase()}-event` : 'twitter-event'} animate-slide-in`}
                            style={{ animationDelay: `${postIndex * 0.1}s` }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white text-xs font-medium truncate">
                                {(post.idea || post.content || '').substring(0, 15)}...
                              </span>
                              <div className="flex space-x-1">
                                {post.platforms && Object.keys(post.platforms).filter(p => post.platforms[p]).map(platform => (
                                  <FontAwesomeIcon 
                                    key={platform}
                                    icon={platform === 'Twitter' ? faTwitter : platform === 'LinkedIn' ? faLinkedin : faMedium}
                                    className={`${platformTextColors[platform]} text-xs`}
                                  />
                                ))}
                              </div>
                            </div>
                            {post.scheduleTime && (
                              <div className="text-gray-300 text-xs">{formatTime(post.scheduleTime)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleExportCalendar}
                    className="flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-sm" />
                    <span className="text-sm">Export Calendar</span>
                  </button>
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                      isSyncing 
                        ? 'bg-cyan-400/20 text-cyan-400 cursor-not-allowed' 
                        : 'bg-black/30 text-gray-300 hover:text-white'
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={faSync} 
                      className={`text-sm ${isSyncing ? 'animate-spin' : ''}`} 
                    />
                    <span className="text-sm">{isSyncing ? 'Syncing...' : 'Sync All'}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Last updated: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30 relative overflow-hidden">
              <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Schedule New Post</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3">Post Content</label>
                  <textarea 
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-32 bg-black/30 rounded-2xl p-4 text-white placeholder-gray-500 border border-gray-600 focus:border-cyan-400 transition-colors resize-none" 
                    placeholder="What's on your mind? Write your post here..."
                  />
                </div>

                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3">Select Platforms</label>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.keys(newPost.platforms).map(platform => (
                      <label key={platform} className="flex items-center space-x-3 p-4 rounded-2xl border border-gray-600 hover:border-cyan-400 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newPost.platforms[platform]}
                          onChange={(e) => setNewPost(prev => ({
                            ...prev,
                            platforms: { ...prev.platforms, [platform]: e.target.checked }
                          }))}
                          className="w-5 h-5 rounded bg-black/30 border-gray-600 text-cyan-400 focus:ring-cyan-400 focus:ring-2" 
                        />
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon 
                            icon={platform === 'Twitter' ? faXTwitter : platform === 'LinkedIn' ? faLinkedin : faMedium}
                            className={platformTextColors[platform]}
                          />
                          <span className="text-white">{platform}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Date</label>
                    <input 
                      type="date" 
                      value={newPost.date}
                      onChange={(e) => setNewPost(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-black/30 rounded-2xl p-4 text-white border border-gray-600 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Time</label>
                    <input 
                      type="time" 
                      value={newPost.time}
                      onChange={(e) => setNewPost(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-black/30 rounded-2xl p-4 text-white border border-gray-600 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* AI Image Suggestions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-300 font-medium">AI Image Suggestions</label>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                      Generate New
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(index => (
                      <div 
                        key={index}
                        onClick={() => setNewPost(prev => ({ ...prev, selectedImage: index }))}
                        className={`relative group cursor-pointer ${
                          newPost.selectedImage === index ? 'ring-2 ring-cyan-400' : ''
                        }`}
                      >
                        <img 
                          className="w-full h-24 rounded-xl object-cover" 
                          src={`https://picsum.photos/200/150?random=${index + 100}`}
                          alt={`Image suggestion ${index + 1}`}
                        />
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {newPost.selectedImage === index && (
                            <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button 
                    onClick={handleSaveDraft}
                    className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                  >
                    Save as Draft
                  </button>
                  <button 
                    onClick={handleSchedulePost}
                    className="flex-1 p-4 rounded-2xl gradient-accent text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Schedule Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30 relative overflow-hidden">
              <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Post</h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3">Post Content</label>
                  <textarea 
                    value={editingPost.content}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-32 bg-black/30 rounded-2xl p-4 text-white placeholder-gray-500 border border-gray-600 focus:border-cyan-400 transition-colors resize-none" 
                    placeholder="What's on your mind? Write your post here..."
                  />
                </div>

                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3">Select Platforms</label>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.keys(editingPost.platforms).map(platform => (
                      <label key={platform} className="flex items-center space-x-3 p-4 rounded-2xl border border-gray-600 hover:border-cyan-400 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={editingPost.platforms[platform]}
                          onChange={(e) => setEditingPost(prev => ({
                            ...prev,
                            platforms: { ...prev.platforms, [platform]: e.target.checked }
                          }))}
                          className="w-5 h-5 rounded bg-black/30 border-gray-600 text-cyan-400 focus:ring-cyan-400 focus:ring-2" 
                        />
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon 
                            icon={platform === 'Twitter' ? faXTwitter : platform === 'LinkedIn' ? faLinkedin : faMedium}
                            className={platformTextColors[platform]}
                          />
                          <span className="text-white">{platform}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Date</label>
                    <input 
                      type="date" 
                      value={editingPost.date}
                      onChange={(e) => setEditingPost(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-black/30 rounded-2xl p-4 text-white border border-gray-600 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Time</label>
                    <input 
                      type="time" 
                      value={editingPost.time}
                      onChange={(e) => setEditingPost(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-black/30 rounded-2xl p-4 text-white border border-gray-600 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* AI Image Suggestions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-300 font-medium">AI Image Suggestions</label>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                      Generate New
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(index => (
                      <div 
                        key={index}
                        onClick={() => setEditingPost(prev => ({ ...prev, selectedImage: index }))}
                        className={`relative group cursor-pointer ${
                          editingPost.selectedImage === index ? 'ring-2 ring-cyan-400' : ''
                        }`}
                      >
                        <img 
                          className="w-full h-24 rounded-xl object-cover" 
                          src={`https://picsum.photos/200/150?random=${index + 200}`}
                          alt={`Image suggestion ${index + 1}`}
                        />
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {editingPost.selectedImage === index && (
                            <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPost(null);
                      setEditingPost({
                        content: '',
                        platforms: { Twitter: false, LinkedIn: false, Medium: false },
                        date: '',
                        time: '',
                        selectedImage: 0
                      });
                    }}
                    disabled={isSaving}
                    className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex-1 p-4 rounded-2xl gradient-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
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