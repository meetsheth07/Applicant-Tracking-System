import { useState, useEffect, useCallback } from 'react';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import {
  Briefcase,
  Plus,
  Users,
  FileText,
  ExternalLink,
  Loader2,
  Copy,
  CheckCircle2,
  X,
  AlertCircle,
  Trash2,
  ClipboardCheck,
  ArrowDownCircle,
  Trophy,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COLUMNS = [
  { id: 'Applied', label: 'Applied', icon: ArrowDownCircle, colorClass: 'bg-indigo-500' },
  { id: 'Interviewing', label: 'Interviewing', icon: ClipboardCheck, colorClass: 'bg-amber-500' },
  { id: 'Hired', label: 'Hired', icon: Trophy, colorClass: 'bg-emerald-500' },
];

function Dashboard() {
  const { getToken } = useAuth();

  // State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Create job modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Copy link feedback
  const [copiedJobId, setCopiedJobId] = useState(null);

  // AI Summary state
  const [selectedCandidateForAI, setSelectedCandidateForAI] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Error state
  const [error, setError] = useState('');

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to connect to backend.');
    } finally {
      setLoadingJobs(false);
    }
  }, [getToken]);

  // Auto-select first job
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Fetch candidates for selected job
  const fetchCandidates = useCallback(async () => {
    if (!selectedJobId) return;
    setLoadingCandidates(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/jobs/${selectedJobId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoadingCandidates(false);
    }
  }, [getToken, selectedJobId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const token = await getToken();
      await axios.post(
        `${API_URL}/api/jobs`,
        { title: newTitle, description: newDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setNewDesc('');
      setShowCreateModal(false);
      fetchJobs();
    } catch (err) {
      console.error('Failed to create job:', err);
      const msg = err.response?.data?.error || 'Failed to create job. Is the backend running?';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job and all its candidates?')) return;
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selectedJobId === id) setSelectedJobId(null);
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic update
    const newCandidates = Array.from(candidates);
    const draggedCandidate = newCandidates.find((c) => c._id === draggableId);
    if (draggedCandidate) {
      draggedCandidate.status = destination.droppableId;
      setCandidates(newCandidates);
    }

    try {
      const token = await getToken();
      await axios.put(
        `${API_URL}/api/candidates/${draggableId}/status`,
        { status: destination.droppableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update candidate status:', err);
      fetchCandidates(); // Revert on failure
    }
  };

  const fetchAISummary = async (candidate) => {
    setSelectedCandidateForAI(candidate);
    setLoadingAI(true);
    setAiSummary('');
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/candidates/${candidate._id}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiSummary(res.data.summary);
    } catch (err) {
      setAiSummary('Failed to generate AI summary. Please ensure the backend is running and Gemini API key is valid.');
    } finally {
      setLoadingAI(false);
    }
  };

  const copyApplyLink = (id) => {
    const link = `${window.location.origin}/apply/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedJobId(id);
    setTimeout(() => setCopiedJobId(null), 2000);
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);
  const getCandidatesByStatus = (status) => candidates.filter((c) => c.status === status);

  if (loadingJobs) {
    return (
      <div className="h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 glass-card border-y-0 border-l-0 flex flex-col z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="text-white w-6 h-6" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HireFlow</span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Job Listing
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
            Active Job Listings
          </h3>
          <div className="space-y-1">
            {jobs.map((job) => (
              <button
                key={job._id}
                onClick={() => setSelectedJobId(job._id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  selectedJobId === job._id
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className={`w-4 h-4 ${selectedJobId === job._id ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <span className="font-medium text-sm truncate max-w-[140px]">{job.title}</span>
                  </div>
                  {selectedJobId === job._id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-gray-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserButton />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">HR Panel</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#030712] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl animate-shake">
            <div className="mx-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-red-500 text-sm backdrop-blur-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {selectedJob ? (
          <>
            {/* Header */}
            <header className="relative z-10 px-8 py-8 border-b border-white/5 backdrop-blur-md bg-[#030712]/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{selectedJob.title}</h1>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-1 max-w-2xl">{selectedJob.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyApplyLink(selectedJob._id)}
                  className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
                >
                  {copiedJobId === selectedJob._id ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Apply Link</>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteJob(selectedJob._id)}
                  className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto p-8 relative z-10">
              {loadingCandidates ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                  <p className="text-gray-400 font-medium">Loading candidate pipeline...</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="flex gap-8 h-full min-w-max pb-4">
                    {COLUMNS.map((col) => {
                      const colCandidates = getCandidatesByStatus(col.id);
                      return (
                        <div key={col.id} className="w-96 flex flex-col">
                          <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${col.colorClass} shadow-lg`} />
                              <h3 className="font-bold text-gray-200 tracking-tight">{col.label}</h3>
                              <span className="px-2 py-0.5 rounded-lg bg-white/5 text-gray-500 text-xs font-mono">
                                {colCandidates.length}
                              </span>
                            </div>
                          </div>

                          <Droppable droppableId={col.id}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`flex-1 rounded-2xl border border-dashed transition-all duration-300 p-3 min-h-[500px] ${
                                  snapshot.isDraggingOver
                                    ? 'bg-purple-600/5 border-purple-500/30'
                                    : 'bg-gray-900/10 border-white/5'
                                }`}
                              >
                                {colCandidates.map((candidate, index) => (
                                  <Draggable
                                    key={candidate._id}
                                    draggableId={candidate._id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`candidate-card ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50' : ''}`}
                                      >
                                        <div className="flex items-start justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                              {candidate.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <p className="font-semibold text-sm text-white">{candidate.name}</p>
                                              <p className="text-[10px] text-gray-500 font-medium truncate w-32">{candidate.email}</p>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                          <span className="text-[10px] font-medium text-gray-500">
                                            {new Date(candidate.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                          </span>
                                          <div className="flex items-center gap-3">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                fetchAISummary(candidate);
                                              }}
                                              className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-400 transition-colors group/ai"
                                              title="AI Summary"
                                            >
                                              <Sparkles className="w-3.5 h-3.5 group-hover/ai:scale-110 transition-transform" />
                                            </button>
                                            <a
                                              href={`${API_URL}${candidate.resumePath}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-cyan-400 transition-colors group/resume"
                                              onClick={(e) => e.stopPropagation()}
                                              title="View Resume"
                                            >
                                              <FileText className="w-3.5 h-3.5 group-hover/resume:scale-110 transition-transform" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {colCandidates.length === 0 && !snapshot.isDraggingOver && (
                                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                      <col.icon className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500">No candidates in {col.label}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </div>
                </DragDropContext>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
              <Briefcase className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Select a Job Listing</h2>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Choose a job from the sidebar to view your candidate pipeline or create a new listing to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-8 btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Listing
            </button>
          </div>
        )}
      </main>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Job Listing</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-400 mb-2" htmlFor="job-title">
                  Job Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-400 mb-2" htmlFor="job-desc">
                  Description
                </label>
                <textarea
                  id="job-desc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                  placeholder="Describe the role, requirements, and what makes it exciting..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Create Job
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {selectedCandidateForAI && (
        <div className="fixed inset-0 z-[60] modal-overlay flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Candidate Analysis</h2>
                  <p className="text-sm text-gray-500">{selectedCandidateForAI.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateForAI(null)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {loadingAI ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                <p className="text-white font-medium">Gemini is analyzing the resume...</p>
                <p className="text-gray-500 text-sm mt-1">This takes a few seconds.</p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="bg-white/5 rounded-xl p-6 border border-white/5 whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">
                  {aiSummary}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedCandidateForAI(null)}
                className="btn-secondary px-8"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
