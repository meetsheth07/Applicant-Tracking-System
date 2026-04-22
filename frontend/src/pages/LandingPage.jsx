import React from 'react';
import { SignInButton, useUser } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Zap, 
  Shield, 
  LayoutDashboard, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="text-white w-6 h-6" fill="white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Hire<span className="text-purple-500">Flow</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-link text-sm font-medium">Features</a>
          <a href="#" className="nav-link text-sm font-medium">Pricing</a>
          <SignInButton mode="modal">
            <button className="btn-primary flex items-center gap-2 group">
              Get Started 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300 uppercase tracking-widest">Next-Gen Applicant Tracking</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-none">
            Hire smarter, not <br />
            <span className="gradient-text">harder.</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The premium ATS for small businesses. Manage candidates, automate workflows, 
            and build your dream team with our sleek Kanban-style dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <SignInButton mode="modal">
              <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Launch Your Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </SignInButton>
            <button className="btn-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Image Mockup */}
        <div className="mt-24 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="glass-card rounded-3xl overflow-hidden border-white/10 shadow-2xl p-4 bg-gray-900/50">
             <div className="bg-[#030712] rounded-2xl aspect-video flex items-center justify-center border border-white/5">
                <LayoutDashboard className="w-20 h-20 text-gray-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-gray-500 font-medium tracking-widest uppercase text-sm">Dashboard Preview</p>
                </div>
             </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: LayoutDashboard,
              title: "Kanban Pipeline",
              desc: "Drag-and-drop candidates through custom stages with zero friction.",
              color: "text-purple-400"
            },
            {
              icon: Zap,
              title: "Instant Setup",
              desc: "Go live in 2 minutes. No training required for you or your team.",
              color: "text-cyan-400"
            },
            {
              icon: Shield,
              title: "Secure & Fast",
              desc: "Enterprise-grade security for your candidate data and resumes.",
              color: "text-indigo-400"
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl glass-hover">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030712]/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-purple-600 w-5 h-5" fill="currentColor" />
            <span className="font-bold tracking-tight">HireFlow</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 HireFlow Systems. All rights reserved.
          </p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
