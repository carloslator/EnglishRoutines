import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VocabularyModule } from './components/VocabularyModule';
import { ConversationModule } from './components/ConversationModule';
import { GrammarModule } from './components/GrammarModule';
import { FinalActivityModule } from './components/FinalActivityModule';
import { UserStats, RoutineActivity } from './types';
import { INITIAL_USER_ROUTINE } from './data';
import { Trophy, HelpCircle, GraduationCap, Github, Laptop } from 'lucide-react';

const LOCAL_STORAGE_STATS_KEY = 'esl_lab_user_stats';
const LOCAL_STORAGE_ROUTINE_KEY = 'esl_lab_user_routine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Initialize statistics with values from LocalStorage if they exist
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse local storage stats', e);
    }
    return {
      vocabCompleted: false,
      vocabGapScore: 0,
      vocabAnswersState: {},
      dialogueCompleted: false,
      dialogueScore: 0,
      dialogueAnswersState: {},
      grammarCompleted: false,
      grammarScrambleScore: 0,
      grammarAnswersState: {},
      errorsCompleted: false,
      errorsScore: 0,
      errorsAnswersState: {},
      activeStudyTime: 0,
      stars: 15, // introductory stars
      avatar: '👨‍🎓',
      userName: 'Student'
    };
  });

  // Initialize custom schedule
  const [userRoutine, setUserRoutine] = useState<RoutineActivity[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ROUTINE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse local storage routine', e);
    }
    return [];
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ROUTINE_KEY, JSON.stringify(userRoutine));
  }, [userRoutine]);

  // Active study duration timer (ticks once per second)
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeStudyTime: prev.activeStudyTime + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Erase and restart scoring progress
  const handleResetAllProgress = () => {
    if (confirm('Are you sure you want to reset all your scores and stars to start over?')) {
      setStats({
        vocabCompleted: false,
        vocabGapScore: 0,
        vocabAnswersState: {},
        dialogueCompleted: false,
        dialogueScore: 0,
        dialogueAnswersState: {},
        grammarCompleted: false,
        grammarScrambleScore: 0,
        grammarAnswersState: {},
        errorsCompleted: false,
        errorsScore: 0,
        errorsAnswersState: {},
        activeStudyTime: 0,
        stars: 15,
        avatar: '👨‍🎓',
        userName: 'Student'
      });
      setUserRoutine([]);
      setActiveTab('dashboard');
    }
  };

  // Switch to next tab upon module completions
  const handleNextModuleAdvance = (nextPart: string) => {
    setActiveTab(nextPart);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Structural Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Primary Workspace container */}
      <main className="flex-1 flex flex-col pt-16 md:pt-0 overflow-x-hidden min-h-screen">
        
        {/* Dynamic Context Header */}
        <header className="bg-white border-b border-slate-200 h-16 py-4 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div className="leading-tight">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                Classroom Portal
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 font-sans">
                {activeTab === 'dashboard' && 'Class Analytics Central'}
                {activeTab === 'vocabulary' && 'Unit 1: Habits Vocabulary'}
                {activeTab === 'dialogue' && 'Unit 2: Speaking Roleplay Workspace'}
                {activeTab === 'grammar' && 'Unit 3: Affirmative vs Negative present simple'}
                {activeTab === 'final-activity' && 'Unit 4: Slide 17 Error Spotter'}
              </span>
            </div>
          </div>

          {/* Quick Header Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50/70 rounded-full border border-indigo-100">
              <Trophy size={13} className="text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 font-mono">{stats.stars} Stars</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-500 font-semibold border border-slate-200">
              <Laptop size={12} />
              <span>Offline Auto-Save</span>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace panel wrap */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* Tabs switch routing */}
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              setStats={setStats}
              userRoutine={userRoutine}
              setUserRoutine={setUserRoutine}
              resetUserProgress={handleResetAllProgress}
            />
          )}

          {activeTab === 'vocabulary' && (
            <VocabularyModule
              stats={stats}
              setStats={setStats}
              onAdvance={() => handleNextModuleAdvance('dialogue')}
            />
          )}

          {activeTab === 'dialogue' && (
            <ConversationModule
              stats={stats}
              setStats={setStats}
              onAdvance={() => handleNextModuleAdvance('grammar')}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarModule
              stats={stats}
              setStats={setStats}
              onAdvance={() => handleNextModuleAdvance('final-activity')}
            />
          )}

          {activeTab === 'final-activity' && (
            <FinalActivityModule
              stats={stats}
              setStats={setStats}
              onAdvanceToDashboard={() => handleNextModuleAdvance('dashboard')}
            />
          )}

        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center shrink-0">
          <p className="text-[11px] text-slate-400 font-sans tracking-wide">
            Designed for interactive classrooms & ESL home learning • Inspired by the Twinkl Twinkl primary series • Powered by D3.js & React
          </p>
        </footer>

      </main>

    </div>
  );
}
