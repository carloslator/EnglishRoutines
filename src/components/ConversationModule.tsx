import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  UserCheck,
  User,
  CheckCircle2,
  Info,
  MessageSquare
} from 'lucide-react';
import { UserStats } from '../types';
import { DIALOGUE_CHATS } from '../data';

interface ConversationModuleProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAdvance: () => void;
}

export const ConversationModule: React.FC<ConversationModuleProps> = ({
  stats,
  setStats,
  onAdvance
}) => {
  // Modes: 'listen' | 'roleplay'
  const [activeMode, setActiveMode] = useState<'listen' | 'roleplay'>('listen');
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);
  
  // Roleplay configuration states
  const [roleplayCharacter, setRoleplayCharacter] = useState<'Rohan' | 'Maya' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [roleplayAnswers, setRoleplayAnswers] = useState<Record<string, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Define Rohan and Mayas TTS settings
  const speakBubble = (text: string, idx: number, character: 'Rohan' | 'Maya') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      // Adjust pitch/rate slightly per character for realistic roleplay
      if (character === 'Maya') {
        utterance.pitch = 1.3;
        utterance.rate = 1.0;
      } else {
        utterance.pitch = 0.95;
        utterance.rate = 0.95;
      }

      utterance.onstart = () => setActiveSpeechIdx(idx);
      utterance.onend = () => setActiveSpeechIdx(null);
      utterance.onerror = () => setActiveSpeechIdx(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Gap solutions specifically corresponding to Slide 10 blanks
  const roleplayGaps = {
    Rohan: [
      {
        nodeId: 'd2',
        prompt: "In the mornings I _________ and __________, and I _________ too.",
        gaps: ['cook breakfast', 'brush my teeth', 'go jogging'],
        options: ['cook breakfast', 'brush my teeth', 'go jogging', 'study', 'watch TV']
      },
      {
        nodeId: 'd5',
        prompt: "Oh, I sleep quite early! I like to _________",
        gaps: ['wake up before 6am'],
        options: ['wake up before 6am', 'sleep quite late', 'study in the mornings']
      }
    ],
    Maya: [
      {
        nodeId: 'd1',
        prompt: "So Rohan, what do you _________?",
        gaps: ['do every day'],
        options: ['do every day', 'cook for dinner', 'study at nights']
      },
      {
        nodeId: 'd4',
        prompt: "I _________ in the mornings, and in the afternoon I _________.",
        gaps: ['study', 'read a book or watch TV'],
        options: ['study', 'read a book or watch TV', 'go to work', 'cook breakfast']
      }
    ]
  };

  const handleStartRoleplay = (char: 'Rohan' | 'Maya') => {
    setRoleplayCharacter(char);
    setCurrentStep(0);
    setRoleplayAnswers({});
    setQuizFinished(false);
    setActiveMode('roleplay');
  };

  const handleSelectRoleplayAns = (gapIdx: number, val: string) => {
    if (!roleplayCharacter) return;
    const currentQuestionSet = roleplayGaps[roleplayCharacter];
    const node = currentQuestionSet[currentStep];
    
    setRoleplayAnswers(prev => ({
      ...prev,
      [`${node.nodeId}_${gapIdx}`]: val
    }));
  };

  const handleNextStep = () => {
    if (!roleplayCharacter) return;
    const currentQuestionSet = roleplayGaps[roleplayCharacter];
    
    if (currentStep < currentQuestionSet.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished roleplay checking answers!
      let score = 0;
      let totalGapsCount = 0;

      currentQuestionSet.forEach(node => {
        node.gaps.forEach((gVal, gIdx) => {
          totalGapsCount++;
          if (roleplayAnswers[`${node.nodeId}_${gIdx}`] === gVal) {
            score++;
          }
        });
      });

      // Normalize score to 4
      const normalizedScore = Math.round((score / totalGapsCount) * 4);

      setStats(prev => ({
        ...prev,
        dialogueCompleted: true,
        dialogueScore: normalizedScore,
        stars: prev.stars + (normalizedScore * 10) // 10 stars per score
      }));

      setQuizFinished(true);
    }
  };

  const handleResetRoleplay = () => {
    setRoleplayAnswers({});
    setCurrentStep(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6" id="dialogue-tab-panel">
      
      {/* Module Title */}
      <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-indigo-600 fill-indigo-500/10" size={20} />
              Interactive Conversational Practice Lab
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Read and listen to Rohan and Maya's dialogue. Study how they construct negative and affirmative Present Simple verbs.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveMode('listen')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all focus:outline-none ${
                activeMode === 'listen' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Listen & Learn
            </button>
            <button
              onClick={() => handleStartRoleplay(roleplayCharacter || 'Rohan')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all focus:outline-none ${
                activeMode === 'roleplay' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Interactive Roleplay
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: Listen & Learn Dialog list */}
      {activeMode === 'listen' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main thread (8 columns) */}
          <div className="md:col-span-8 bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conversational Thread</span>
              <span className="text-xs text-slate-500 font-medium">Click Speech Bubble to speak</span>
            </div>

            <div className="space-y-4 pt-2">
              {DIALOGUE_CHATS.map((chat, idx) => {
                const isMaya = chat.character === 'Maya';
                return (
                  <div
                    key={chat.id}
                    className={`flex gap-3 max-w-[85%] ${isMaya ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
                  >
                    {/* Speaker Avatar Icon */}
                    <div className={`p-2.5 rounded-xl shrink-0 font-bold text-center ${isMaya ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isMaya ? '👩' : '👨'}
                    </div>

                    {/* Speech Bubble Container */}
                    <div
                      onClick={() => speakBubble(chat.text, idx, chat.character)}
                      className={`relative p-3.5 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                        activeSpeechIdx === idx
                          ? 'border-2 border-indigo-600 shadow ring-4 ring-indigo-50'
                          : 'border border-slate-205'
                      } ${
                        isMaya
                          ? 'bg-purple-50/50 border-purple-150 text-slate-800'
                          : 'bg-blue-50/50 border-blue-150 text-slate-800'
                      }`}
                    >
                      {/* Character Label */}
                      <span className={`text-[10px] font-bold block mb-1 ${isMaya ? 'text-purple-700' : 'text-blue-700'}`}>
                        {chat.character}
                      </span>
                      {/* Dialogue body */}
                      <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {chat.text}
                      </p>
                      
                      {/* Explanation toggle */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 italic block leading-tight">
                          💡 {chat.translationExplain}
                        </span>
                        <Volume2 size={13} className={activeSpeechIdx === idx ? 'text-indigo-600 animate-pulse' : 'text-slate-400'} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grammar & Comprehension insights panel (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 shadow-sm border border-slate-800">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                Visual Glossary
              </span>
              <h3 className="font-bold text-base text-white">
                Rohan vs Maya Schedules
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Based on the dialogue on the left, let's analyze their routines:
              </p>
              
              <ul className="space-y-3 mt-4 text-xs font-semibold">
                <li className="bg-slate-800/50 border border-slate-800 p-2.5 rounded-lg space-y-1">
                  <span className="text-blue-400">Rohan (Active Commuter):</span>
                  <p className="text-[11px] font-medium text-slate-300">
                     Cooks breakfast, brushes teeth, and jogs in the morning. Commutes to work. Bedtime is early (wakes before 6 AM).
                  </p>
                </li>
                <li className="bg-slate-800/50 border border-slate-800 p-2.5 rounded-lg space-y-1">
                  <span className="text-purple-400">Maya (Late Student):</span>
                  <p className="text-[11px] font-medium text-slate-300">
                     Doesn't go to work. Studies mornings, reads/watches TV afternoons. Bedtime is quite late.
                  </p>
                </li>
              </ul>
            </div>

            {/* Prompt for practice */}
            <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 space-y-3.5 shadow-sm">
              <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1">
                <UserCheck size={14} /> Ready to test speaking ears?
              </h4>
              <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                Switch to the Interactive Roleplay workspace, select Rohan or Maya, and reconstruct the conversation script.
              </p>
              <button
                onClick={() => handleStartRoleplay('Rohan')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-transform focus:outline-none"
              >
                Launch Dialogue Puzzle
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Mode B: Roleplay Workspace */}
      {activeMode === 'roleplay' && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          
          {/* Character selection bar */}
          <div className="flex flex-wrap items-center justify-between border-b pb-4 mb-5 gap-3">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1">
                Roleplay Character Choice
              </p>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Identify Your Speaking Role
              </h3>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleStartRoleplay('Rohan')}
                className={`py-2 px-4 text-xs font-black rounded-lg border flex items-center gap-1.5 focus:outline-none transition-colors ${
                  roleplayCharacter === 'Rohan'
                    ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>👨 Rohan (Early Bed)</span>
              </button>
              <button
                onClick={() => handleStartRoleplay('Maya')}
                className={`py-2 px-4 text-xs font-black rounded-lg border flex items-center gap-1.5 focus:outline-none transition-colors ${
                  roleplayCharacter === 'Maya'
                    ? 'bg-purple-100 border-purple-400 text-purple-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>👩 Maya (Late Student)</span>
              </button>
            </div>
          </div>

          {/* Active Quiz Workspace */}
          {roleplayCharacter && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left col: Conversational simulation bubble visual (7 columns) */}
              <div className="md:col-span-7 bg-slate-50 border border-slate-205 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Conversation Builder ({currentStep + 1} of {roleplayGaps[roleplayCharacter].length} Steps)
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                      You are playing {roleplayCharacter}
                    </span>
                  </div>

                  {/* Active prompt question card */}
                  <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-xl">{roleplayCharacter === 'Rohan' ? '👨' : '👩'}</span>
                      <span className="text-xs font-semibold uppercase text-slate-500">Your Sentence:</span>
                    </div>

                    <div className="space-y-3">
                      {roleplayGaps[roleplayCharacter].map((node, stepIdx) => {
                        // Only draw bubbles up to current step
                        if (stepIdx > currentStep) return null;

                        const isFinishedStep = stepIdx < currentStep || quizFinished;

                        return (
                          <div
                            key={node.nodeId}
                            className={`p-3.5 rounded-xl border ${
                              isFinishedStep ? 'bg-slate-50/50 border-slate-200/80 text-slate-500' : 'bg-indigo-50/20 border-indigo-100 text-slate-800'
                            }`}
                          >
                            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                              {/* Draw sentence, swapping out blanks */}
                              {node.prompt.split('_________').map((part, pIdx) => (
                                <React.Fragment key={pIdx}>
                                  {part}
                                  {pIdx < node.gaps.length && (
                                    <span className={`inline-block px-2.5 py-1 mx-1.5 rounded-lg border font-bold text-xs ${
                                      isFinishedStep
                                        ? roleplayAnswers[`${node.nodeId}_${pIdx}`] === node.gaps[pIdx]
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                          : 'bg-red-50 border-red-200 text-red-700 font-bold'
                                        : 'bg-white text-indigo-600 border-indigo-200 shadow-sm'
                                    }`}>
                                      {roleplayAnswers[`${node.nodeId}_${pIdx}`] || 'Tap Option Below'}
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </p>

                            {/* Self speaking support */}
                            {isFinishedStep && (
                              <button
                                onClick={() => speakBubble(node.gaps.join('. '), stepIdx, roleplayCharacter)}
                                className="text-[10px] text-slate-500 font-bold flex items-center gap-1 border bg-white px-2 py-0.5 rounded mt-2 hover:bg-slate-100"
                              >
                                <Volume2 size={11} /> Practice Line
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Question Option Selection block */}
                {!quizFinished ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
                      Select Words for Sub-gaps (Tap Options sequentially):
                    </label>

                    {/* Generate separate gap-selector elements */}
                    <div className="space-y-3">
                      {roleplayGaps[roleplayCharacter][currentStep].gaps.map((gpVal, gpIdx) => {
                        const filled = roleplayAnswers[`${roleplayGaps[roleplayCharacter][currentStep].nodeId}_${gpIdx}`];
                        return (
                          <div key={gpIdx} className="bg-white border rounded-xl p-3 shadow-inner">
                            <span className="text-[9px] font-black text-slate-400 block mb-1">Gap {gpIdx + 1}: {filled ? '✅ Filled' : '⏳ Empty'}</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {roleplayGaps[roleplayCharacter][currentStep].options.map(opt => {
                                const selected = filled === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSelectRoleplayAns(gpIdx, opt)}
                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none ${
                                      selected
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4 flex justify-end">
                      <button
                        onClick={handleNextStep}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-5 rounded-lg focus:outline-none flex items-center gap-1 shadow-sm"
                      >
                        {currentStep < roleplayGaps[roleplayCharacter].length - 1 ? 'Next Step' : 'Grade Conversation'}
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // finished roleplay scoresheet
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mt-4">
                    <span className="text-4xl">🎉</span>
                    <h4 className="font-sans font-semibold text-sm text-emerald-800 mt-2">Dialogue Builder Finished!</h4>
                    <p className="text-xs text-emerald-600 font-medium leading-relaxed mt-1">
                      You successfully roleplayed as {roleplayCharacter} and earned <strong className="text-indigo-600">{stats.dialogueScore * 10} Stars</strong>!
                    </p>
                    <div className="flex gap-2 justify-center mt-4">
                      <button
                        onClick={handleResetRoleplay}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg focus:outline-none"
                      >
                        Reset Roleplay
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Right col: Character instructions (5 columns) */}
              <div className="md:col-span-5 space-y-4">
                
                <div className="bg-white border rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                    <Info size={14} className="text-blue-500" />
                    How to construct routines
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span><strong>Affirmative Form:</strong> I cook, I read. Use plain base infinitis directly behind pronouns.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span><strong>Negative Form:</strong> I don't study, I don't go to work. Sits between pronouns and action verbs.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white border border-slate-800 rounded-xl p-4 shadow-sm text-center">
                  <Award size={28} className="text-indigo-400 mx-auto stroke-[1.5]" />
                  <h4 className="font-bold text-xs mt-2 text-white">Interactive Complete Bonus</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">
                    Complete all blank entries on either Rohan or Maya to earn up to 40 valuable Stars!
                  </p>
                </div>

                {stats.dialogueCompleted && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600 leading-none">Your Grading</p>
                      <span className="text-xs font-bold text-slate-800">Completed & Saved!</span>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onAdvance}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 rounded-lg focus:outline-none flex items-center justify-center gap-1"
                  >
                    Go to Grammar Rules <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
