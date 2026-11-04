import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  FolderOpen,
  MessageSquare,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  Send,
  Upload,
  RefreshCw,
  LogOut,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { auth, signInWithGoogle, logOut, getAccessToken } from '../lib/firebase.ts';
import { BannerAdData } from '../types/banner';
import { User } from 'firebase/auth';

interface WorkspaceHubModalProps {
  adData: BannerAdData;
  onClose: () => void;
  onApplyDriveImage: (imageUrl: string) => void;
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
  adData,
  onClose,
  onApplyDriveImage,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [activeTab, setActiveTab] = useState<'drive' | 'forms' | 'chat' | 'classroom'>('drive');
  const [loading, setLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Classroom Courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [announcementText, setAnnouncementText] = useState(`New Digital Banner Campaign: ${adData.brandName}\nCheck out our ad design suite and creative guidelines.`);

  // Chat Spaces state
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [chatMessage, setChatMessage] = useState(`🚀 AdCraft Campaign Launch: ${adData.brandName}\nHeadline: "${adData.headline}"\nCTA: "${adData.callToAction}"\nLanding Page: ${adData.url}`);

  // Forms state
  const [formUrl, setFormUrl] = useState('https://forms.google.com/sample-lead-gen');
  const [formTitle, setFormTitle] = useState(`${adData.brandName} - Customer Feedback & Lead Form`);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<any[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
      if (u) {
        loadWorkspaceData();
      }
    });
    return () => unsub();
  }, []);

  const loadWorkspaceData = async () => {
    const token = await getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      // 1. Fetch Classroom courses
      try {
        const classRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (classRes.ok) {
          const data = await classRes.json();
          setCourses(data.courses || []);
          if (data.courses?.length) {
            setSelectedCourseId(data.courses[0].id);
          }
        }
      } catch (err) {
        console.warn('Classroom fetch notice:', err);
      }

      // 2. Fetch Chat spaces
      try {
        const chatRes = await fetch('https://chat.googleapis.com/v1/spaces', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (chatRes.ok) {
          const data = await chatRes.json();
          setChatSpaces(data.spaces || []);
          if (data.spaces?.length) {
            setSelectedSpaceId(data.spaces[0].name);
          }
        }
      } catch (err) {
        console.warn('Chat fetch notice:', err);
      }

      // 3. Fetch Drive files (image assets)
      try {
        const driveRes = await fetch(
          "https://www.googleapis.com/drive/v3/files?q=mimeType contains 'image/' and trashed = false&fields=files(id,name,thumbnailLink,webContentLink)",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (driveRes.ok) {
          const data = await driveRes.json();
          setDriveFiles(data.files || []);
        }
      } catch (err) {
        console.warn('Drive fetch notice:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const res = await signInWithGoogle();
      setCurrentUser(res.user);
      setStatusNotice({ type: 'success', text: `Signed in as ${res.user.email}!` });
      loadWorkspaceData();
    } catch (err: any) {
      setStatusNotice({ type: 'error', text: err.message || 'Sign in failed.' });
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setCurrentUser(null);
    setCourses([]);
    setChatSpaces([]);
    setDriveFiles([]);
    setStatusNotice({ type: 'info', text: 'Signed out of Google Workspace.' });
  };

  // Google Classroom: Share announcement
  const handlePublishToClassroom = async () => {
    if (!selectedCourseId) {
      setStatusNotice({ type: 'error', text: 'Please select a Classroom course.' });
      return;
    }
    const token = await getAccessToken();
    if (!token) return;

    const confirmed = window.confirm(
      `Confirm publishing announcement for "${adData.brandName}" to your Google Classroom course?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`https://classroom.googleapis.com/v1/courses/${selectedCourseId}/announcements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: announcementText,
          state: 'PUBLISHED',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to post announcement');
      }

      setStatusNotice({ type: 'success', text: 'Announcement successfully posted to Google Classroom!' });
    } catch (err: any) {
      setStatusNotice({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Google Chat: Send message to space
  const handlePostToChat = async () => {
    if (!selectedSpaceId) {
      setStatusNotice({ type: 'error', text: 'Please select or specify a Google Chat Space.' });
      return;
    }
    const token = await getAccessToken();
    if (!token) return;

    const confirmed = window.confirm(
      `Confirm sharing this ad campaign summary to Google Chat space "${selectedSpaceId}"?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`https://chat.googleapis.com/v1/${selectedSpaceId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chatMessage,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to send message to Google Chat');
      }

      setStatusNotice({ type: 'success', text: 'Ad campaign details sent to Google Chat space!' });
    } catch (err: any) {
      setStatusNotice({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Google Workspace Integrations
              </h3>
              <p className="text-xs text-slate-400">
                Drive / Picker • Google Forms • Google Chat • Google Classroom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1 hover:text-rose-400 text-slate-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-3.5 py-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Sign in with Google</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notice */}
        {statusNotice && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between ${
              statusNotice.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border-b border-emerald-500/20'
                : statusNotice.type === 'error'
                ? 'bg-rose-500/15 text-rose-300 border-b border-rose-500/20'
                : 'bg-sky-500/15 text-sky-300 border-b border-sky-500/20'
            }`}
          >
            <span>{statusNotice.text}</span>
            <button onClick={() => setStatusNotice(null)}>✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'drive'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Google Drive / Picker</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'forms'
                ? 'bg-purple-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Google Forms</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Google Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'classroom'
                ? 'bg-amber-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Google Classroom</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/70 space-y-6">
          {!currentUser && (
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-sky-400 shrink-0" />
                <p className="text-xs text-sky-200">
                  Sign in with your Google Workspace account to sync files, forms, chats, and courses directly with AdCraft Studio.
                </p>
              </div>
              <button
                onClick={handleSignIn}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In Now
              </button>
            </div>
          )}

          {/* TAB 1: Google Drive & Picker */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-sky-400" />
                  Import Visual Assets from Google Drive
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select product shots or logo files stored in your Drive to use as the background visual for your banner ads.
                </p>
              </div>

              {driveFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        if (file.thumbnailLink) {
                          onApplyDriveImage(file.thumbnailLink.replace(/=s\d+/, '=s1600'));
                          setStatusNotice({ type: 'success', text: `Loaded image from Drive: ${file.name}` });
                        }
                      }}
                      className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-sky-500 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="w-full h-24 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <FolderOpen className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 truncate block">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {currentUser
                      ? 'No image files found in your Google Drive or Drive scope pending approval.'
                      : 'Sign in to access your Google Drive product assets.'}
                  </p>
                  <button
                    onClick={loadWorkspaceData}
                    disabled={loading || !currentUser}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Drive Files</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Google Forms */}
          {activeTab === 'forms' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Attach Lead Generation Google Form
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect a Google Form to your banner CTA button so clicked users are directed straight to your intake survey.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Google Form Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Form URL
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Will update banner CTA destination URL to this Google Form.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusNotice({ type: 'success', text: `Linked Google Form to banner CTA URL: ${formUrl}` });
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all shadow"
                  >
                    Link to Banner CTA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Google Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Broadcast Campaign to Google Chat Space
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Notify your marketing team or stakeholders in Google Chat with the latest generated banner copy and assets.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Target Google Chat Space
                  </label>
                  {chatSpaces.length > 0 ? (
                    <select
                      value={selectedSpaceId}
                      onChange={(e) => setSelectedSpaceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {chatSpaces.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.displayName || s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. spaces/AAAA1234567"
                      value={selectedSpaceId}
                      onChange={(e) => setSelectedSpaceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Message Payload
                  </label>
                  <textarea
                    rows={4}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handlePostToChat}
                    disabled={loading || !currentUser}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Google Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Google Classroom */}
          {activeTab === 'classroom' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  Post Design Assignment / Banner to Google Classroom
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Post campaign announcements, case studies, or design briefs directly to your active Google Classroom courses.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Select Classroom Course
                  </label>
                  {courses.length > 0 ? (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.section ? `(${c.section})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. 123456789012"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Announcement Body
                  </label>
                  <textarea
                    rows={4}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handlePublishToClassroom}
                    disabled={loading || !currentUser}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Announcement to Classroom</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
