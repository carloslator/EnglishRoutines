import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Check,
  ChevronRight,
  Sparkles,
  Trophy,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { VocabularyItem, UserStats } from '../types';
import { VOCABULARY_ITEMS, VOCABULARY_GAP_QUESTIONS } from '../data';

interface VocabularyModuleProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAdvance: () => void;
}

export const VocabularyModule: React.FC<VocabularyModuleProps> = ({
  stats,
  setStats,
  onAdvance
}) => {
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(stats.vocabAnswersState || {});
  const [showResults, setShowResults] = useState(stats.vocabCompleted);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Trigger TTS
  const playSpeech = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onstart = () => setActiveSpeech(id);
      utterance.onend = () => setActiveSpeech(null);
      utterance.onerror = () => setActiveSpeech(null);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis API is not supported in your browser.');
    }
  };

  // Option selection
  const handleSelectOption = (questionId: number, word: string) => {
    if (stats.vocabCompleted) return; // locked once finalized
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: word
    }));
  };

  // Check overall answers
  const handleSubmitQuiz = () => {
    // Audit if all gaps are addressed
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < VOCABULARY_GAP_QUESTIONS.length) {
      setErrorStatus(`Please answer all ${VOCABULARY_GAP_QUESTIONS.length} vocabulary gap questions before finalizing!`);
      return;
    }

    setErrorStatus(null);
    let correctCount = 0;

    VOCABULARY_GAP_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    // Score computation
    const newStars = correctCount * 5; // 5 stars per correct answer
    
    setStats(prev => ({
      ...prev,
      vocabCompleted: true,
      vocabGapScore: correctCount,
      vocabAnswersState: selectedAnswers,
      stars: prev.stars + newStars
    }));

    setShowResults(true);
  };

  // Reset quiz inside vocabulary
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setStats(prev => ({
      ...prev,
      vocabCompleted: false,
      vocabGapScore: 0,
      vocabAnswersState: {}
    }));
  };

  return (
    <div className="space-y-6" id="vocabulary-tab-panel">
      
      {/* Intro slide card matching Page 4 of PDF */}
      <div className="bg-white rounded-xl border border-slate-205 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-indigo-600 shrink-0" size={20} />
          What is a Routine?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-3 align-middle">
          <div className="md:col-span-8 space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A <span className="font-bold text-indigo-600">routine</span> is something you do often. It can be a thing you do every day, every week, every month, or even every year. Present Simple is our primary tool to outline routines in English.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Examples Include:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-1.5 bg-white border border-slate-100 p-1.5 rounded-md">
                  <span className="text-base">🪥</span> brush your teeth
                </li>
                <li className="flex items-center gap-1.5 bg-white border border-slate-100 p-1.5 rounded-md">
                  <span className="text-base">🧼</span> clean the kitchen
                </li>
                <li className="flex items-center gap-1.5 bg-white border border-slate-100 p-1.5 rounded-md">
                  <span className="text-base">💼</span> go to work
                </li>
              </ul>
            </div>
          </div>
          <div className="md:col-span-4 bg-indigo-50/50 rounded-xl p-4 flex flex-col justify-center items-center text-center border border-indigo-100/60">
            <span className="text-4xl animate-bounce">⏱️</span>
            <p className="text-xs font-bold text-indigo-950 mt-2">Active Challenge</p>
            <p className="text-[11px] text-indigo-800 font-medium leading-normal mt-1">
              Read the vocabulary flashcards below, practice pronunciation, then complete the gaps puzzle!
            </p>
          </div>
        </div>
      </div>

      {/* Vocabulary Cards Deck matching Page 6 and 7 */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              Routines Vocabulary Desk
            </h3>
            <p className="text-xs text-slate-500">
              Browse the 8 routine phrases. Click the sound waves to hear native accents.
            </p>
          </div>
          <span className="text-[10px] bg-slate-100 border px-3 py-1 rounded-full text-slate-600 font-bold">
            8 Target Verbs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VOCABULARY_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-205 overflow-hidden shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              {/* Card visual banner */}
              <div
                className="h-20 flex items-center justify-center text-4xl relative"
                style={{ backgroundColor: item.imagePlaceholderColor }}
              >
                <span className="scale-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {idx === 0 ? '🪥' : idx === 1 ? '📺' : idx === 2 ? '🏃‍♀️' : idx === 3 ? '📚' : idx === 4 ? '💼' : idx === 5 ? '🍳' : idx === 6 ? '🛌' : '📖'}
                </span>
                <span className="absolute top-2 right-2 text-[9px] font-bold uppercase py-0.5 px-1.5 rounded bg-white/70 text-slate-700 select-none">
                  {item.category}
                </span>
              </div>

              {/* Card Contents */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800 capitalize leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.phrase}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1.5">
                    {item.translationExplain}
                  </p>
                  <p className="text-[11px] text-slate-600 italic font-medium leading-normal mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100/60">
                    "{item.example}"
                  </p>
                </div>

                {/* Pronunciation audio guide */}
                <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-medium">Practice speaking:</span>
                  <button
                    onClick={() => playSpeech(`I ${item.phrase} every day.`, item.phrase)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all focus:outline-none ${
                      activeSpeech === item.phrase
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {activeSpeech === item.phrase ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    Listen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUIZ SECTION matching Slide 7 */}
      <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Trophy size={16} className="text-indigo-600" />
              Vocabulary Challenge Desk: Gap Fills
            </h3>
            <p className="text-xs text-slate-500">
              Pick the correct vocabulary word to finalize each context sentence.
            </p>
          </div>
          {stats.vocabCompleted && (
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100/50">
              Score: {stats.vocabGapScore} / 8 Correct
            </div>
          )}
        </div>

        {errorStatus && (
          <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs leading-normal font-semibold border border-red-200/50 mb-4 flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Gap fill sentences */}
        <div className="space-y-4">
          {VOCABULARY_GAP_QUESTIONS.map((q, idx) => {
            const currentSelected = selectedAnswers[q.id];
            const isCorrect = currentSelected === q.correctAnswer;
            
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  showResults
                    ? isCorrect
                      ? 'bg-emerald-50/50 border-emerald-100/60'
                      : 'bg-red-50/50 border-red-100/60'
                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="font-sans text-xs sm:text-sm font-semibold text-slate-800 mb-2.5">
                  <span className="text-slate-400 font-mono mr-1.5">{idx + 1}.</span>
                  {/* Swap ____ in text for selected word or underscores */}
                  <span>
                    {q.sentence.split('____________')[0]}
                    <span className={`px-2.5 py-1 mx-1.5 rounded-lg border font-bold text-xs ${
                      showResults
                        ? isCorrect
                          ? 'bg-emerald-100/50 border-emerald-300 text-emerald-700'
                          : 'bg-red-100/50 border-red-200 text-red-700'
                        : currentSelected
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {currentSelected || '_______'}
                    </span>
                    {q.sentence.split('____________')[1]}
                  </span>
                </div>

                {/* Answer Options Row */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {q.options.map(opt => {
                    const isPicked = currentSelected === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={showResults}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all focus:outline-none ${
                          isPicked
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 disabled:opacity-60'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation text on check show */}
                {showResults && !isCorrect && (
                  <div className="text-xs text-red-650 mt-2 font-medium flex items-center gap-1">
                    <HelpCircle size={12} />
                    <span>Oops, correct habit is: <strong>{q.correctAnswer}</strong>.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action button bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div>
            {!showResults ? (
              <p className="text-xs text-slate-500 leading-normal">
                Double-check your choices, and then tap "Submit Lesson Quiz" to unlock next module.
              </p>
            ) : (
              <p className="text-xs text-slate-500 leading-normal">
                You earned <strong className="text-indigo-600">{stats.vocabGapScore * 5} Stars</strong>! You can clear results or proceed directly.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {showResults && (
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 focus:outline-none"
              >
                <RotateCcw size={13} /> Try Again
              </button>
            )}

            {!showResults ? (
              <button
                onClick={handleSubmitQuiz}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm focus:outline-none"
              >
                Submit Lesson Quiz
              </button>
            ) : (
              <button
                onClick={onAdvance}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 focus:outline-none"
              >
                Go to Dialogue <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
