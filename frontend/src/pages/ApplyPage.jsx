import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowLeft,
  Loader2,
  X,
  Zap
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/jobs/${jobId}`);
        setJob(res.data);
      } catch {
        setError('Job listing not found or no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type === 'application/pdf') {
        setFile(dropped);
        setError('');
      } else {
        setError('Only PDF files are accepted.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].type === 'application/pdf') {
        setFile(e.target.files[0]);
        setError('');
      } else {
        setError('Only PDF files are accepted.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !file) {
      setError('Please fill in all fields and upload your resume.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('resume', file);

    try {
      await axios.post(`${API_URL}/api/apply/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Careers
          </Link>
          <div className="flex items-center gap-2 opacity-50">
            <Zap className="text-purple-600 w-4 h-4" fill="currentColor" />
            <span className="font-bold text-xs tracking-tight">HireFlow</span>
          </div>
        </div>

        {success ? (
          <div className="glass-card p-12 rounded-3xl text-center animate-fade-in shadow-2xl shadow-emerald-500/10 border-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Application Sent!</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Thank you for applying for the <span className="text-white font-semibold">{job?.title}</span> position. 
              Our team will review your profile and get back to you soon.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Apply for another role
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Apply for Position</h1>
              </div>
              <h2 className="text-purple-400 font-semibold text-lg">{job?.title}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Resume (PDF)</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 p-8 text-center ${
                      dragActive 
                        ? 'border-purple-500 bg-purple-500/5' 
                        : file 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-white font-medium mb-1 truncate max-w-[200px]">{file.name}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-white font-medium mb-1">Click or drag resume</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">PDF only (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplyPage;
