import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Info,
  Bug,
  Trophy,
  Check
} from 'lucide-react';
import { UserStats } from '../types';
import { ERROR_SENTENCES } from '../data';

interface FinalActivityModuleProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAdvanceToDashboard: () => void;
}

export const FinalActivityModule: React.FC<FinalActivityModuleProps> = ({
  stats,
  setStats,
  onAdvanceToDashboard
}) => {
  // Steps inside Module 4
  const [activeSubStep, setActiveSubStep] = useState<'spotter' | 'compQuiz' | 'graduation'>('spotter');
  
  // SPOTTER GAME STATES
  const [currentSpotterIdx, setCurrentSpotterIdx] = useState(0);
  const [userCorrection, setUserCorrection] = useState('');
  const [spotterCompleted, setSpotterCompleted] = useState<Record<number, boolean>>({});
  const [savedCorrections, setSavedCorrections] = useState<Record<number, string>>({});
  const [spotterFeedbacks, setSpotterFeedbacks] = useState<{
    submitted: boolean;
    correct: boolean;
  } | null>(null);

  // COMPREHENSIVE FINAL EXAM QUIZ STATES
  const [compQuizAnswers, setCompQuizAnswers] = useState<Record<number, string>>({});
  const [compQuizSubmitted, setCompQuizSubmitted] = useState(false);
  const [compQuizScore, setCompQuizScore] = useState(0);

  const activeError = ERROR_SENTENCES[currentSpotterIdx];

  // Comprehensive Exam Questions
  const EXAM_QUESTIONS = [
    {
      id: 1,
      question: "Which of the following is the CORRECT third-person singular (He/She) form?",
      options: ["He study every morning.", "He watches TV at the weekend.", "He brush his teeth twice a day.", "He don't watch TV."],
      answer: "He watches TV at the weekend.",
      explanation: "For He/She/It routines, we add an 's' or 'es' to the base verb. 'study' becomes 'studies' and 'brush' becomes 'brushes'."
    },
    {
      id: 2,
      question: "What is the correct negative sentence structure for Present Simple?",
      options: ["I read don't at the weekend.", "I don't study at night.", "I study don't every day.", "I not go to work."],
      answer: "I don't study at night.",
      explanation: "'don't' must sit right before the primary action verb (Noun + don't + Verb)."
    },
    {
      id: 3,
      question: "Where do frequency/time expressions (like 'every day', 'at the weekend') normally sit in a sentence?",
      options: ["At the very beginning of the sentence only.", "At the very end of the sentence.", "Directly between the subject and the verb.", "After the negative don't only."],
      answer: "At the very end of the sentence.",
      explanation: "Expressions like 'every day' or 'at the weekend' normally sit at the end of the sentence: 'I study every day.'"
    },
    {
      id: 4,
      question: "Spot the mistake in: 'I brush my teeth every day.'",
      options: ["The sentence is correct!", "Missing action verb.", "Missing the word 'don't'.", "The verb needs an 's' at the end."],
      answer: "The sentence is correct!",
      explanation: "This is a perfect affirmative routine sentence. No additions are needed."
    }
  ];

  // Grade user spotter typing
  const handleCheckSpotter = () => {
    if (!userCorrection.trim()) return;

    // Normalize comparison string (remove quotes, brackets, spacings, lowercase)
    const normalize = (s: string) => 
      s.toLowerCase()
       .replace(/’/g, "'")
       .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
       .replace(/\s+/g, " ")
       .trim();

    const isMatch = normalize(userCorrection) === normalize(activeError.correct);

    setSpotterFeedbacks({
      submitted: true,
      correct: isMatch
    });

    setSpotterCompleted(prev => ({ ...prev, [activeError.id]: isMatch }));
    setSavedCorrections(prev => ({ ...prev, [activeError.id]: userCorrection }));
  };

  // Next Spotter item
  const handleNextSpotter = () => {
    const nextIdx = currentSpotterIdx + 1;
    if (nextIdx < ERROR_SENTENCES.length) {
      setCurrentSpotterIdx(nextIdx);
      setUserCorrection('');
      setSpotterFeedbacks(null);
    } else {
      // Finished mistakes inspect! Calculate final score
      let scoreSum = 0;
      ERROR_SENTENCES.forEach(err => {
        if (spotterCompleted[err.id] || (err.id === activeError.id && spotterFeedbacks?.correct)) {
          scoreSum++;
        }
      });

      setStats(prev => ({
        ...prev,
        errorsCompleted: true,
        errorsScore: scoreSum,
        errorsAnswersState: savedCorrections,
        stars: prev.stars + (scoreSum * 20) // 20 stars per corrected error
      }));

      // Switch to graduation quiz!
      setActiveSubStep('compQuiz');
    }
  };

  // Submit Final review questions
  const handleSubmitFinalExam = () => {
    let score = 0;
    EXAM_QUESTIONS.forEach(q => {
      if (compQuizAnswers[q.id] === q.answer) {
        score++;
      }
    });

    setCompQuizScore(score);
    setCompQuizSubmitted(true);

    // Multi bonus reward
    setStats(prev => ({
      ...prev,
      stars: prev.stars + (score * 15)
    }));
  };

  const handleResetExam = () => {
    setCompQuizAnswers({});
    setCompQuizSubmitted(false);
    setCompQuizScore(0);
  };

  return (
    <div className="space-y-6" id="final-activity-panel">
      
      {/* Quiz Progress header */}
      <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bug className="text-indigo-600" size={20} />
              Module 4: Error Spotter & Graduation Exam
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Can you spot the syntax mistakes Rohan and Maya made? Test yourself and draft corrected formulas.
            </p>
          </div>

          {/* Sub menu checklist indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold font-sans bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className={`px-2.5 py-1 rounded-md transition-colors ${activeSubStep === 'spotter' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              1. Slide 17 Error Spotter
            </span>
            <span className={`px-2.5 py-1 rounded-md transition-colors ${activeSubStep === 'compQuiz' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              2. Comprehensive Review
            </span>
            <span className={`px-2.5 py-1 rounded-md transition-colors ${activeSubStep === 'graduation' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              🎓 Diploma Room
            </span>
          </div>
        </div>
      </div>

      {/* Sub-step A: Sliode 17 Mistake Spotter Game */}
      {activeSubStep === 'spotter' && (
        <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm space-y-6">
          
          <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60">
            <p className="text-xs text-indigo-900 font-medium max-w-xl">
               Below is the actual evaluation puzzle from <strong>Page 17</strong> of your lesson notes. Inspect characters’ text errors, re-type the exact corrected phrase, and hit Grade.
            </p>
            <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded font-bold font-mono shrink-0">
              Scenarios {currentSpotterIdx + 1} of {ERROR_SENTENCES.length}
            </span>
          </div>

          {/* Incorrect phrase display card */}
          <div className="bg-slate-50 border-2 border-red-100 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase py-0.5 px-2 bg-red-100 text-red-600 rounded">
               Contains 1 Grammar Error
            </span>
            <span className="text-4xl block mt-1">⚠️</span>
            <p className="text-base sm:text-lg font-black text-slate-800 line-through tracking-tight mt-1">
              "{activeError.incorrect}"
            </p>
          </div>

          {/* User Input Correction area */}
          <div className="space-y-3.5 max-w-2xl mx-auto">
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Draft Your Correct Revision Below
                </label>
                <button
                  onClick={() => setUserCorrection(activeError.correct)}
                  className="text-[9px] text-slate-400 hover:text-indigo-600 transition-colors font-bold underline cursor-pointer"
                >
                  Quick Reveal Correct
                </button>
              </div>

              <input
                type="text"
                disabled={spotterFeedbacks?.submitted}
                value={userCorrection}
                onChange={(e) => setUserCorrection(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 rounded-xl focus:outline-none font-bold"
                placeholder="Type the corrected sentence here... (e.g., I brush my teeth...)"
              />
            </div>

            {spotterFeedbacks?.submitted && (
              <div className={`p-4 rounded-xl border ${
                spotterFeedbacks.correct
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                  : 'bg-red-50 border-red-250 text-red-800'
              } space-y-2.5 shadow-sm`}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {spotterFeedbacks.correct ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {spotterFeedbacks.correct ? 'Spot On Correction!' : 'Sentence Order Miss!'}
                    </h4>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      {activeError.explanation}
                    </p>
                  </div>
                </div>

                <div className="bg-white/40 p-2.5 rounded-lg text-xs leading-normal font-semibold">
                  📖 <strong>Target Syntax:</strong> "{activeError.correct}"
                </div>
              </div>
            )}

            {/* Hint toggles */}
            <div className="flex gap-1.5 text-[11px] text-slate-500 italic pb-1">
              <span className="font-bold text-indigo-600 whitespace-nowrap">💡 Hint:</span>
              <span>{activeError.hint}</span>
            </div>

            <div className="pt-3 border-t border-slate-105 flex justify-end gap-2">
              {!spotterFeedbacks?.submitted ? (
                <button
                  type="button"
                  onClick={handleCheckSpotter}
                  disabled={!userCorrection.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs px-5 py-2.5 rounded-lg shadow disabled:opacity-50 focus:outline-none"
                >
                  Grade Correction
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextSpotter}
                  className="bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs px-5 py-2.5 rounded-lg shadow-md focus:outline-none"
                >
                  {currentSpotterIdx < ERROR_SENTENCES.length - 1 ? 'Next Incorrect Sentence' : 'Finish Spotters & Start Quiz'}
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Sub-step B: Dynamic Comprehensive Final Review Quiz */}
      {activeSubStep === 'compQuiz' && (
        <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm space-y-6">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                ESL Comprehensive Present Simple Quiz
              </h3>
              <p className="text-xs text-slate-500">
                Sum up rules from all four units of the attached Twinkl lesson.
              </p>
            </div>
            {compQuizSubmitted && (
              <span className="bg-slate-100 text-slate-800 border px-3 py-1 rounded-full text-xs font-bold leading-normal">
                Exam Grade: {compQuizScore} / 4 Correct
              </span>
            )}
          </div>

          <div className="space-y-5">
            {EXAM_QUESTIONS.map((q, idx) => {
              const userSelected = compQuizAnswers[q.id];
              return (
                <div key={q.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent">
                    <span className="text-indigo-600 font-mono mr-1">{idx + 1}.</span> {q.question}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                       const isChosen = userSelected === opt;
                       const isCorrectAnswer = opt === q.answer;

                       let btnStyle = "bg-white border-slate-200 hover:bg-slate-50 text-slate-700";
                       if (isChosen) {
                         btnStyle = "bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-100";
                       }
                       if (compQuizSubmitted) {
                         if (isCorrectAnswer) {
                           btnStyle = "bg-emerald-500 border-emerald-500 text-white";
                         } else if (isChosen) {
                           btnStyle = "bg-red-500 border-red-500 text-white";
                         } else {
                           btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                         }
                       }

                       return (
                         <button
                           key={opt}
                           type="button"
                           disabled={compQuizSubmitted}
                           onClick={() => setCompQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                           className={`p-3 text-left text-xs font-semibold rounded-lg border transition-all flex items-center justify-between focus:outline-none ${btnStyle}`}
                         >
                           <span>{opt}</span>
                           {compQuizSubmitted && isCorrectAnswer && (
                             <Check size={14} className="stroke-[3] shrink-0 ml-1.5 text-white" />
                           )}
                         </button>
                       );
                    })}
                  </div>

                  {compQuizSubmitted && (
                    <div className="p-2.5 bg-white rounded-lg text-xs leading-normal text-slate-600 font-medium">
                      💡 <strong>Comprehension Insight:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2.5 justify-between items-center text-xs">
            <p className="text-slate-500 max-w-sm">
              Answer all four comprehensive queries then click "Finalize Graduation Audit" to unlock your ESL companion diploma.
            </p>

            <div className="flex gap-2">
              {compQuizSubmitted && (
                <button
                  onClick={handleResetExam}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg focus:outline-none"
                >
                  Reset Exam
                </button>
              )}

              {!compQuizSubmitted ? (
                <button
                  onClick={handleSubmitFinalExam}
                  disabled={Object.keys(compQuizAnswers).length < EXAM_QUESTIONS.length}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg shadow-md disabled:opacity-50 focus:outline-none"
                >
                  Finalize Graduation Audit
                </button>
              ) : (
                <button
                  onClick={() => setActiveSubStep('graduation')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center gap-1 focus:outline-none"
                >
                  View My Diploma Room <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-step C: Interactive diploma celebration component */}
      {activeSubStep === 'graduation' && (
        <div className="bg-white rounded-xl border border-slate-205 p-8 shadow-md text-center max-w-2xl mx-auto space-y-6">
          <span className="text-6xl animate-bounce inline-block">🎓</span>
          
          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-slate-800 text-xl tracking-tight leading-none uppercase">
               Diploma of Achievement
            </h3>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
              Interactive ESL Routine Lab
            </p>
          </div>

          <div className="border-y-2 border-dashed border-indigo-200/80 p-6 space-y-4 max-w-md mx-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              This digital badge certifies that
            </p>
            <p className="text-lg font-extrabold text-indigo-600 underline decoration-wavy py-1 italic">
              {stats.userName || 'Student'}
            </p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              has successfully completed all four structural interactive units of 
              <strong className="text-slate-800 block mt-1 font-bold animate-fade-in">ESL present simple: My Routines</strong> 
              and compiled and validated custom interactive comparative D3 timetables natively.
            </p>
          </div>

          {/* Quick Score Metrics recap */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-lg font-black text-slate-800">{stats.stars}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Trophy Stars Earned</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center shadow-sm">
              <span className="block text-lg font-black text-emerald-600">100% Verified</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Audit Approval Code</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setActiveSubStep('spotter');
                setCurrentSpotterIdx(0);
                setUserCorrection('');
                setSpotterFeedbacks(null);
                setCompQuizAnswers({});
                setCompQuizSubmitted(false);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-5 rounded-lg focus:outline-none"
            >
              Restart Module
            </button>
            <button
              onClick={onAdvanceToDashboard}
              className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2 px-6 rounded-lg shadow-md focus:outline-none"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
