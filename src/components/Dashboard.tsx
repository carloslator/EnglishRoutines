import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Plus,
  Trash2,
  ListRestart,
  Sparkles,
  Zap,
  Info,
  Sliders,
  Play,
  Volume2
} from 'lucide-react';
import { RoutineActivity, UserStats } from '../types';
import { D3ScheduleSwimlane, D3DonutDistribution, D3ProgressColumnChart } from './D3Charts';
import { ROHAN_ROUTINE, MAYA_ROUTINE } from '../data';

interface DashboardProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  userRoutine: RoutineActivity[];
  setUserRoutine: React.Dispatch<React.SetStateAction<RoutineActivity[]>>;
  resetUserProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  setStats,
  userRoutine,
  setUserRoutine,
  resetUserProgress
}) => {
  // Local state for the profile setup modal
  const [showNamePrompt, setShowNamePrompt] = useState(stats.userName === 'Student');
  const [tempName, setTempName] = useState(stats.userName === 'Student' ? '' : stats.userName);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar || '👨‍🎓');

  const handleSaveProfile = () => {
    if (!tempName.trim()) return;
    setStats(prev => ({
      ...prev,
      userName: tempName.trim(),
      avatar: selectedAvatar,
      stars: prev.userName === 'Student' ? prev.stars + 10 : prev.stars
    }));
    setShowNamePrompt(false);
  };

  // Local state for the routine planner form
  const [newPhrase, setNewPhrase] = useState('study');
  const [newCategory, setNewCategory] = useState<'health' | 'leisure' | 'work' | 'study' | 'sleep' | 'other'>('study');
  const [newStart, setNewStart] = useState<number>(8);
  const [newDuration, setNewDuration] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggested starter routine phrases
  const SUGGESTED_VERBS = [
    { phrase: 'study', category: 'study' },
    { phrase: 'brush my teeth', category: 'health' },
    { phrase: 'go jogging', category: 'health' },
    { phrase: 'go to work', category: 'work' },
    { phrase: 'cook', category: 'leisure' },
    { phrase: 'watch TV', category: 'leisure' },
    { phrase: 'sleep', category: 'sleep' },
    { phrase: 'read', category: 'leisure' }
  ];

  // TTS Pronunciation for Routine helper
  const handlePronounce = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = `I ${phrase} every day.`;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVerbSelection = (verb: { phrase: string; category: string }) => {
    setNewPhrase(verb.phrase);
    setNewCategory(verb.category as any);
  };

  // Add customized routine activity item
  const handleAddNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Guard checks
    if (!newPhrase.trim()) {
      setErrorMsg('Please enter a valid habit phrase.');
      return;
    }

    if (newStart < 0 || newStart >= 24) {
      setErrorMsg('Starting time must sit between 0 and 23.5.');
      return;
    }

    if (newDuration <= 0 || newStart + newDuration > 24) {
      setErrorMsg('Duration must be positive, and cannot exceed midnight (24:00 total).');
      return;
    }

    // Check for logical overlap with existing user routine items
    const overlaps = userRoutine.some(act => {
      const actEnd = act.startTime + act.duration;
      const targetEnd = newStart + newDuration;
      // Overlap formula: Math.max(start1, start2) < Math.min(end1, end2)
      return Math.max(act.startTime, newStart) < Math.min(actEnd, targetEnd);
    });

    if (overlaps) {
      setErrorMsg('Clock Overlap! This time slot conflicts with an existing habit in your routine.');
      return;
    }

    // Insert
    const newAct: RoutineActivity = {
      id: `custom_${Date.now()}`,
      phrase: newPhrase.trim(),
      startTime: newStart,
      duration: newDuration,
      category: newCategory
    };

    const updated = [...userRoutine, newAct].sort((a, b) => a.startTime - b.startTime);
    setUserRoutine(updated);
    
    // Reward points for editing own schedule
    setStats(prev => ({
      ...prev,
      stars: prev.stars + 5
    }));

    // Reset fields to defaults
    setNewPhrase('study');
    setNewStart(12);
    setNewDuration(1);
  };

  // Delete activity element
  const handleDeleteActivity = (id: string) => {
    const updated = userRoutine.filter(act => act.id !== id);
    setUserRoutine(updated);
  };

  // Prepopulate standard routine template
  const handleUseTemplate = (type: 'busy' | 'relaxed') => {
    if (type === 'busy') {
      setUserRoutine([
        { id: 'tb1', phrase: 'sleep', startTime: 0, duration: 6, category: 'sleep' },
        { id: 'tb2', phrase: 'go jogging', startTime: 6, duration: 1, category: 'health' },
        { id: 'tb3', phrase: 'brush my teeth', startTime: 7, duration: 0.5, category: 'health' },
        { id: 'tb4', phrase: 'cook', startTime: 7.5, duration: 0.5, category: 'leisure' },
        { id: 'tb5', phrase: 'go to work', startTime: 8.5, duration: 8.5, category: 'work' },
        { id: 'tb6', phrase: 'study', startTime: 17.5, duration: 2, category: 'study' },
        { id: 'tb7', phrase: 'read', startTime: 19.5, duration: 1.5, category: 'leisure' },
        { id: 'tb8', phrase: 'watch TV', startTime: 21, duration: 1, category: 'leisure' },
        { id: 'tb9', phrase: 'sleep', startTime: 22, duration: 2, category: 'sleep' }
      ]);
    } else {
      setUserRoutine([
        { id: 'tr1', phrase: 'sleep', startTime: 0, duration: 8.5, category: 'sleep' },
        { id: 'tr2', phrase: 'brush my teeth', startTime: 8.5, duration: 0.5, category: 'health' },
        { id: 'tr3', phrase: 'read', startTime: 10, duration: 2, category: 'leisure' },
        { id: 'tr4', phrase: 'cook', startTime: 12, duration: 1.5, category: 'leisure' },
        { id: 'tr5', phrase: 'study', startTime: 14, duration: 3, category: 'study' },
        { id: 'tr6', phrase: 'watch TV', startTime: 17, duration: 3, category: 'leisure' },
        { id: 'tr7', phrase: 'sleep', startTime: 20, duration: 4, category: 'sleep' }
      ]);
    }
    setStats(prev => ({ ...prev, stars: prev.stars + 10 }));
  };

  // Compute active trophy listings based on states
  const achievements = [
    {
      id: 'ach_vocab',
      title: 'Vocabulary Guru',
      description: 'Answered all blank vocabulary routine fills.',
      unlocked: stats.vocabCompleted,
      emoji: '🤓',
      hint: 'Complete Vocabulary Module with score 8/8.'
    },
    {
      id: 'ach_roleplay',
      title: 'Conversation Partner',
      description: 'Completed the present simple gap roleplay.',
      unlocked: stats.dialogueCompleted,
      emoji: '🎙️',
      hint: 'Conduct Rohan and Maya Dialogue Builder roleplay.'
    },
    {
      id: 'ach_syntax',
      title: 'Grammar Architect',
      description: 'Unscrambled routine present simple expressions.',
      unlocked: stats.grammarCompleted,
      emoji: '🧩',
      hint: 'Solve all Word Scramble exercises.'
    },
    {
      id: 'ach_perfect',
      title: 'Mistake Inspector',
      description: 'Successfully spotted and corrected spelling errors.',
      unlocked: stats.errorsCompleted,
      emoji: '🔍',
      hint: 'Fix all sentences in the Error Spotter final task.'
    },
    {
      id: 'ach_star',
      title: 'Star Collector',
      description: 'Acquired 100 learning stars across labs.',
      unlocked: stats.stars >= 100,
      emoji: '👑',
      hint: 'Earn 100 cumulative Stars (current: ' + stats.stars + ')'
    }
  ];

  return (
    <div className="space-y-6" id="dashboard-tab-panel">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden border border-slate-800/20">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Trophy size={140} className="stroke-[1] text-indigo-300" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider mb-3">
            <Sparkles size={11} className="text-yellow-300 fill-yellow-300" />
            Interactive ESL Lab Dashboard
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
            Present Simple & Habits
          </h2>
          <p className="text-sm mt-1.5 text-indigo-100/90 leading-relaxed">
            Welcome to your digital study desk! Convert English routine concepts into live visualizations, construct templates, study dialogues, and test your grammar.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1 font-mono text-xs bg-slate-950/30 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-indigo-200">Active Study Segment: </span>
              <span className="font-bold text-white">Present Simple</span>
            </div>
            <button
              onClick={resetUserProgress}
              className="text-xs bg-white/10 hover:bg-white/20 text-white transition-all px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 focus:outline-none font-medium"
            >
              <ListRestart size={13} />
              Reset My Scores
            </button>

            {stats.userName === 'Student' ? (
              <button
                onClick={() => {
                  setTempName('');
                  setShowNamePrompt(true);
                }}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 border-none"
              >
                <span>✏️ Set My Name (+10 Stars)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setTempName(stats.userName);
                  setShowNamePrompt(true);
                }}
                className="text-xs bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition-all px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 focus:outline-none"
              >
                <span>👤 Change Name ({stats.userName})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: D3 Schedule Comparative swimlane */}
      <div className="grid grid-cols-1 gap-6">
        <D3ScheduleSwimlane
          userRoutine={userRoutine}
          rohanRoutine={ROHAN_ROUTINE}
          mayaRoutine={MAYA_ROUTINE}
        />
      </div>

      {/* Segment: Custom Schedule Builder & D3 Donut side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Planner Card (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-205 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sliders size={16} className="text-indigo-600" />
                  Your Customized Habits Planner
                </h3>
                <p className="text-xs text-slate-500">
                  Compose present simple routine sentences by building your hourly schedule below.
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleUseTemplate('busy')}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors focus:outline-none"
                >
                  Busy Day Template
                </button>
                <button
                  onClick={() => handleUseTemplate('relaxed')}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors focus:outline-none"
                >
                  Chill Template
                </button>
              </div>
            </div>

            {/* Quick Suggested Verb selection pills */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select a Daily Habit (with Speech Synthesis):</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_VERBS.map((v, i) => (
                  <div key={i} className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleVerbSelection(v)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all font-semibold ${
                        newPhrase === v.phrase
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {v.phrase}
                    </button>
                    <button
                      type="button"
                      title="Audio Pronunciation"
                      onClick={() => handlePronounce(v.phrase)}
                      className="p-1 rounded bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Volume2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Builder */}
            <form onSubmit={handleAddNewActivity} className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
              
              {/* Overlapping error popup inside form */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-2.5 rounded-lg border border-red-200 text-xs flex items-start gap-1.5 font-medium leading-tight">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Custom Phrase Verb Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Habit Verb (Present Simple)
                  </label>
                  <input
                    type="text"
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value.toLowerCase())}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="e.g., eat lunch, study coding"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Category Type
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="sleep">😴 Sleep</option>
                    <option value="health">🧼 Health & Care</option>
                    <option value="study">📚 Studying</option>
                    <option value="work">💼 Working</option>
                    <option value="leisure">🍕 Leisure & Cook</option>
                    <option value="other">⚙️ Other</option>
                  </select>
                </div>

                {/* Start Hour Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Start Time
                    </label>
                    <span className="text-xs font-bold font-mono text-slate-700 bg-white border px-1.5 py-0.5 rounded leading-none">
                      {String(Math.floor(newStart)).padStart(2, '0')}:{newStart % 1 !== 0 ? '30' : '00'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="0.5"
                    value={newStart}
                    onChange={(e) => setNewStart(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5 px-0.5">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:00</span>
                  </div>
                </div>

                {/* Duration Picker Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Duration
                    </label>
                    <span className="text-xs font-bold font-mono text-slate-700 bg-white border px-1.5 py-0.5 rounded leading-none">
                      {newDuration} {newDuration === 1 ? 'Hour' : 'Hours'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5 px-0.5">
                    <span>30m</span>
                    <span>6h</span>
                    <span>12h</span>
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center pt-1">
                <p className="text-[10px] text-slate-400 font-medium italic block pr-4">
                  Constructs: <code className="text-indigo-600 bg-white px-1 py-0.5 rounded border border-slate-200">I {newPhrase || '___'} at {Math.floor(newStart)}:00 every day</code>
                </p>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-sm focus:outline-none transition-colors shrink-0"
                >
                  <Plus size={14} /> Add Habit
                </button>
              </div>
            </form>
          </div>

          {/* List of current customized schedule tasks */}
          <div className="mt-5 border-t border-slate-100 pt-4 max-h-48 overflow-y-auto">
            <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
              Your Day Planner Chronology ({userRoutine.length} actions)
            </h4>
            
            {userRoutine.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
                Your routine is currently blank. Select templates to start!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userRoutine.map(act => {
                  const end = act.startTime + act.duration;
                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-1 border border-slate-100 bg-white hover:bg-slate-50 p-2.5 rounded-lg shadow-sm transition-colors group"
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded leading-none shrink-0 border border-slate-200">
                            {String(Math.floor(act.startTime)).padStart(2, '0')}
                            :{act.startTime % 1 !== 0 ? '30' : '00'}
                          </span>
                          <span className="text-xs font-bold text-slate-800 capitalize truncate">I {act.phrase}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-sans mt-1">
                          Category: <span className="font-semibold text-slate-500">{act.category}</span> • Duration: {act.duration}h
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100/50 transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Donut Allocation Card (5 columns) */}
        <div className="lg:col-span-5">
          <D3DonutDistribution userRoutine={userRoutine} />
        </div>

      </div>

      {/* Stats scorecard bar and Achievements trophies block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Achievements list (8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-205 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1 bg-white">
            <Trophy size={16} className="text-indigo-600" />
            Trophy Room & Learning Milestones
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Earn stars by unlocking study achievements in lesson modules.
          </p>

          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all ${
                  ach.unlocked
                    ? 'bg-indigo-50/30 border-indigo-100 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-65'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl p-2.5 rounded-xl ${ach.unlocked ? 'bg-indigo-100/40 text-indigo-900' : 'bg-slate-200/40 text-slate-300'}`}>
                    {ach.unlocked ? ach.emoji : '🔒'}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${ach.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                      {ach.title}
                    </h4>
                    <p className={`text-[11px] leading-tight mt-0.5 ${ach.unlocked ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      {ach.unlocked ? ach.description : ach.hint}
                    </p>
                  </div>
                </div>
                {ach.unlocked ? (
                  <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <Zap size={11} className="fill-indigo-500 text-indigo-500 stroke-none" /> Unlocked
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 italic shrink-0">Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* score matrix bar (5 cols) */}
        <div className="lg:col-span-5">
          <D3ProgressColumnChart stats={stats} />
        </div>

      </div>

      {/* Profile Name Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-205 shadow-xl space-y-6 animate-fade-in text-slate-800">
            <div className="text-center space-y-2">
              <span className="text-4xl">👋</span>
              <h3 className="text-xl font-bold text-slate-800">Welcome to ESL Routine Lab!</h3>
              <p className="text-xs text-slate-500">
                Please tell us your name so we can personalize your learning board and print your Graduation Certificate.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Name (or Nickname)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jane"
                  className="w-full text-xs sm:text-sm px-4 py-3 bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 rounded-xl focus:outline-none font-bold placeholder:font-normal"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveProfile();
                  }}
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Choose your study avatar
                </label>
                <div className="flex justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  {['👨‍🎓', '👩‍🎓', '🚀', '🌟', '🐼', '🦊', '🦉'].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-2xl p-1.5 rounded-lg transition-all hover:scale-110 ${
                        selectedAvatar === emoji
                          ? 'bg-indigo-100 border border-indigo-250 scale-105'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStats(prev => ({ ...prev, userName: 'Student' }));
                  setShowNamePrompt(false);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-all"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={!tempName.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/10"
              >
                Let’s Begin!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
