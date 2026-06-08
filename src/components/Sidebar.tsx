import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Sparkles,
  Clock,
  Menu,
  X,
  Languages,
  BadgeAlert,
  Award,
  AlertCircle
} from 'lucide-react';
import { UserStats } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: UserStats;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  sidebarOpen,
  setSidebarOpen
}) => {
  // Navigation tabs configuration
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard & Analytics', icon: LayoutDashboard, desc: 'Your progress & schedule builder' },
    { id: 'vocabulary', name: '1. Vocabulary Lab', icon: BookOpen, desc: '8 daily routine verbs & gap fills' },
    { id: 'dialogue', name: '2. Interactive Dialogue', icon: MessageSquare, desc: 'Rohan & Maya roleplay session' },
    { id: 'grammar', name: '3. Present Simple', icon: Languages, desc: 'Formula drills & scramble solver' },
    { id: 'final-activity', name: '4. Error Spotter', icon: BadgeAlert, desc: 'Identify syntax errors' }
  ];

  // Calculate high-level module completion checklist
  const getCompletionPercentage = () => {
    let completedCount = 0;
    if (stats.vocabCompleted) completedCount++;
    if (stats.dialogueCompleted) completedCount++;
    if (stats.grammarCompleted) completedCount++;
    if (stats.errorsCompleted) completedCount++;
    return Math.round((completedCount / 4) * 100);
  };

  const pct = getCompletionPercentage();

  // Convert study time in seconds to mm:ss format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 h-16 fixed top-0 left-0 right-0 z-40 shadow-sm border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 text-white p-1.5 rounded font-extrabold text-xs tracking-widest shadow-sm">
            LEARNOS
          </div>
          <span className="font-extrabold tracking-tight font-sans text-sm">ESL ROUTINE</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg focus:outline-none transition-colors"
          id="mobile-menu-toggle"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between border-r border-slate-800 z-30 transition-transform duration-300 transform md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto py-6 px-4">
          
          {/* Brand/Title */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight leading-none text-white">LearnOS</h1>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-1">Esl Learning Portal</span>
            </div>
          </div>

          {/* Mini User Profile Card */}
          <div 
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false);
            }}
            className="bg-slate-800/45 border border-slate-800/80 rounded-xl p-4 mb-6 hover:bg-slate-850 transition-all cursor-pointer group"
            title="Click to customize profile name & avatar!"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl bg-slate-800 p-2 rounded-xl text-center shadow-inner group-hover:scale-110 transition-transform">
                {stats.avatar || '👨‍🎓'}
              </span>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-white truncate group-hover:text-indigo-400 transition-colors">
                  {stats.userName || 'English Learner'} ✏️
                </p>
                <p className="text-[10px] font-semibold text-slate-500 font-sans tracking-wide">Esl Student</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/60 text-center">
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                <div className="flex items-center justify-center gap-1 text-yellow-400">
                  <Sparkles size={12} />
                  <span className="text-xs font-bold">{stats.stars}</span>
                </div>
                <p className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5">Stars Earned</p>
              </div>
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                <div className="flex items-center justify-center gap-1 text-indigo-400">
                  <Clock size={12} />
                  <span className="text-xs font-bold font-mono">{formatTime(stats.activeStudyTime)}</span>
                </div>
                <p className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5">Active Time</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">
              Course Syllabus
            </p>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              // Custom completion tag
              let isDone = false;
              if (item.id === 'vocabulary') isDone = stats.vocabCompleted;
              if (item.id === 'dialogue') isDone = stats.dialogueCompleted;
              if (item.id === 'grammar') isDone = stats.grammarCompleted;
              if (item.id === 'final-activity') isDone = stats.errorsCompleted;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false); // Close drawer on selection
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                  id={`nav-tab-${item.id}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'} />
                    <div className="leading-tight">
                      <p className="text-xs font-bold">{item.name}</p>
                      <p className={`text-[10px] truncate max-w-[155px] ${isActive ? 'text-indigo-300/80' : 'text-slate-500 group-hover:text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  {isDone && item.id !== 'dashboard' && (
                    <Award size={14} className="text-emerald-400 filter drop-shadow" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Progress Thermometer Section */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/50">
          <div className="flex justify-between items-center mb-1.5 text-xs text-slate-400 px-1">
            <span className="font-semibold text-[11px] text-slate-400">Total Course Complete</span>
            <span className="font-black text-indigo-400">{pct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <div className="flex gap-2 mt-4 px-1.5 py-1.5 rounded bg-slate-800/20 border border-slate-850 text-[9px] text-slate-500 align-middle">
            <AlertCircle size={10} className="text-slate-400 shrink-0 mt-0.5" />
            <span>Progress automatically auto-saves to your local browser storage.</span>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile Overlay Background */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-25 md:hidden backdrop-blur-sm"
        ></div>
      )}
    </>
  );
};
