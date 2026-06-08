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
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserStats } from '../types';
import { SCRAMBLED_SENTENCES } from '../data';

interface GrammarModuleProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAdvance: () => void;
}

export const GrammarModule: React.FC<GrammarModuleProps> = ({
  stats,
  setStats,
  onAdvance
}) => {
  // Game states
  const [currentScrambleIdx, setCurrentScrambleIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [scrambledPool, setScrambledPool] = useState<string[]>(
    SCRAMBLED_SENTENCES[0].scrambledWords
  );
  
  // Scoring parameters
  const [feedbacks, setFeedbacks] = useState<{
    correct: boolean;
    submitted: boolean;
    userString: string;
  } | null>(null);

  const [scrambleScores, setScrambleScores] = useState<Record<number, number>>({});
  const [fullGameCompleted, setFullGameCompleted] = useState(stats.grammarCompleted);

  const activeQuestion = SCRAMBLED_SENTENCES[currentScrambleIdx];

  const handleResetGame = () => {
    setCurrentScrambleIdx(0);
    setSelectedWords([]);
    setScrambledPool(SCRAMBLED_SENTENCES[0].scrambledWords);
    setFeedbacks(null);
    setScrambleScores({});
    setFullGameCompleted(false);

    setStats(prev => ({
      ...prev,
      grammarCompleted: false,
      grammarScrambleScore: 0,
      grammarAnswersState: {}
    }));
  };

  // Add a word to the active tray
  const handleWordClick_toTray = (word: string, idxToRemove: number) => {
    if (feedbacks?.submitted) return;
    setSelectedWords(prev => [...prev, word]);
    setScrambledPool(prev => prev.filter((_, i) => i !== idxToRemove));
  };

  // Click a word in active tray to send it back to selection pool
  const handleWordClick_toPool = (word: string, idxToRemove: number) => {
    if (feedbacks?.submitted) return;
    setScrambledPool(prev => [...prev, word]);
    setSelectedWords(prev => prev.filter((_, i) => i !== idxToRemove));
  };

  // Check the currently assembled sentence
  const handleCheckSentence = () => {
    if (selectedWords.length === 0) return;

    // Build sentence: join with spaces, add a final full stop if missing or already in answers
    let userSentence = selectedWords.join(' ');
    
    // Auto correct punctuation spacing e.g., "don’t" or "don't" (PDF uses curly don’t in slide 14, let's clean string)
    const cleanUser = userSentence.replace(/\s+\./g, '.').trim();
    
    // Normalization logic
    const normalizeStr = (s: string) => s.toLowerCase().replace(/’/g, "'").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

    const normalizedCleanUser = normalizeStr(cleanUser);
    const normalizedCorrect = normalizeStr(activeQuestion.correctSentence);

    const isMatch = normalizedCleanUser === normalizedCorrect;

    setFeedbacks({
      correct: isMatch,
      submitted: true,
      userString: cleanUser
    });

    setScrambleScores(prev => ({
      ...prev,
      [activeQuestion.id]: isMatch ? 1 : 0
    }));
  };

  // Advance to next scramble stage or complete
  const handleNextScramble = () => {
    const nextIdx = currentScrambleIdx + 1;

    if (nextIdx < SCRAMBLED_SENTENCES.length) {
      setCurrentScrambleIdx(nextIdx);
      setSelectedWords([]);
      setScrambledPool(SCRAMBLED_SENTENCES[nextIdx].scrambledWords);
      setFeedbacks(null);
    } else {
      // Completed full word scrambler
      let scoreSum = 0;
      SCRAMBLED_SENTENCES.forEach(sc => {
        scoreSum += scrambleScores[sc.id] ?? (sc.id === activeQuestion.id ? (feedbacks?.correct ? 1 : 0) : 0);
      });

      setStats(prev => ({
        ...prev,
        grammarCompleted: true,
        grammarScrambleScore: scoreSum,
        stars: prev.stars + (scoreSum * 15) // bonus star points
      }));

      setFullGameCompleted(true);
    }
  };

  return (
    <div className="space-y-6" id="grammar-tab-panel">
      
      {/* Slide 11 & 12 Formula Cheat Sheet Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           {/* Affirmative Block (6 columns) */}
        <div className="md:col-span-6 bg-white border border-slate-205 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b pb-2 bg-white">
            <Layers size={16} className="text-indigo-600" />
            Formula A: Affirmative Routines
          </h3>

          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              When we talk about habits in English, we use the <strong>Present Simple</strong>. Place the <strong>Noun or Pronoun</strong> directly with the <strong>base form of a verb</strong>.
            </p>

            {/* Structured Table */}
            <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-50 border-b p-2 font-bold text-slate-500 uppercase tracking-widest text-[9px]">
                <div className="col-span-4">Pronoun (Subject)</div>
                <div className="col-span-4">Base Verb</div>
                <div className="col-span-4">Object / Setting</div>
              </div>
              <div className="grid grid-cols-12 p-2 border-b font-medium text-slate-700">
                <div className="col-span-4 font-bold text-indigo-600">I / You / We / They</div>
                <div className="col-span-4 italic">watch</div>
                <div className="col-span-4">TV at the weekend.</div>
              </div>
              <div className="grid grid-cols-12 p-2 font-medium text-slate-700">
                <div className="col-span-4 font-bold text-purple-500">He / She / It</div>
                <div className="col-span-4 italic">watches <span className="text-[10px] text-purple-600 font-bold">(+s)</span></div>
                <div className="col-span-4">TV every morning.</div>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 text-[11px] text-indigo-900 font-medium">
              💡 <strong>Grammar Tip:</strong> When we refer to other people, we add an <strong>‘s’</strong> after the verb (e.g., <em>He study → He studies</em>). This rule applies to singular third person.
            </div>
          </div>
        </div>

        {/* Negative Block (6 columns) */}
        <div className="md:col-span-6 bg-white border border-slate-205 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b pb-2 bg-white">
            <Layers size={16} className="text-rose-500" />
            Formula B: Negative Routines
          </h3>

          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              If an activity is NOT part of our standard routine, we place <strong>do not (or don’t)</strong> directly before the action verb.
            </p>

            {/* Structure table */}
            <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-50 border-b p-2 font-bold text-slate-500 uppercase tracking-widest text-[9px]">
                <div className="col-span-3">Subject</div>
                <div className="col-span-3">Negative Aux</div>
                <div className="col-span-3">Action Verb</div>
                <div className="col-span-3">Setting</div>
              </div>
              <div className="grid grid-cols-12 p-2 border-b font-medium text-slate-700">
                <div className="col-span-3 font-bold text-indigo-600">I / We</div>
                <div className="col-span-3 text-rose-500 font-bold">don’t</div>
                <div className="col-span-3 italic">cook</div>
                <div className="col-span-3">often.</div>
              </div>
              <div className="grid grid-cols-12 p-2 font-medium text-slate-700">
                <div className="col-span-3 font-bold text-purple-500">He / She</div>
                <div className="col-span-3 text-rose-600 font-bold">doesn’t</div>
                <div className="col-span-3 italic">study</div>
                <div className="col-span-3">at night.</div>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 border rounded-lg space-y-1 text-[11px] text-slate-600">
              <p className="font-bold uppercase text-[9px] text-slate-405 tracking-wider">Common Time Expressions:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-semibold">every day</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-semibold">every year</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-semibold">at the weekend</span>
                <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-semibold">at night</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Slide 14 Scrambled Sentence arranger game */}
      <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm">
        
        {/* Module progress state */}
        <div className="flex items-center justify-between border-b pb-3.5 mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 bg-white">
              <Sparkles size={16} className="text-indigo-600" />
              Duolingo-Style Word Arranger: Slide 14 Drills
            </h3>
            <p className="text-xs text-slate-500">
              Tap the shuffled blocks to form a logically structured present simple routine sentence.
            </p>
          </div>
          {fullGameCompleted && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-3.5 py-1 rounded-full text-xs animate-fade-in">
              Score: {stats.grammarScrambleScore} / 4 Correct
            </div>
          )}
        </div>

        {!fullGameCompleted ? (
          <div className="space-y-6">
            
            {/* Step indicators */}
            <div className="flex items-center gap-1.5">
              {SCRAMBLED_SENTENCES.map((sc, i) => (
                <div
                  key={sc.id}
                  className={`h-1.5 rounded-full flex-1 transition-all ${
                    i === currentScrambleIdx
                      ? 'bg-indigo-600'
                      : i < currentScrambleIdx
                        ? 'bg-emerald-500'
                        : 'bg-slate-100'
                  }`}
                ></div>
              ))}
            </div>

            {/* Sentence tray (where user chosen words are positioned) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 min-h-[96px] flex flex-wrap gap-2.5 items-center justify-center shadow-inner relative">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-400 font-medium italic select-none">
                  Tap word blocks below to assemble your sentence...
                </span>
              ) : (
                selectedWords.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordClick_toPool(word, i)}
                    className="bg-white hover:bg-indigo-50 border-2 border-slate-200/80 hover:border-indigo-300 text-slate-800 font-semibold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow active:scale-[0.98] transition-all text-center flex items-center focus:outline-none"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word selection pool */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
                Word Selection Pool
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center items-center py-2.5">
                {scrambledPool.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordClick_toTray(word, i)}
                    className="bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm hover:text-indigo-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all focus:outline-none shadow-sm"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Results block */}
            {feedbacks?.submitted && (
              <div className={`p-4 rounded-xl border ${
                feedbacks.correct
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                  : 'bg-red-50 border-red-250 text-red-800'
              } flex flex-col sm:flex-row shadow-sm gap-3 justify-between items-start sm:items-center`}>
                <div className="flex items-start gap-2">
                  <div className="mt-1 shrink-0">
                    {feedbacks.correct ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase">
                      {feedbacks.correct ? 'Excellent arrangement!' : 'Incorrect Word Order'}
                    </h4>
                    <p className="text-xs font-medium mt-1">
                      Your answer: <code className="font-mono bg-white/60 px-1 py-0.5 rounded leading-normal">"{feedbacks.userString}"</code>
                    </p>
                    <p className="text-xs font-semibold leading-relaxed mt-1 p-2 bg-white/40 rounded-lg max-w-lg">
                      💡 <strong>Target Solution:</strong> "{activeQuestion.correctSentence}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextScramble}
                  className={`text-xs font-semibold min-w-[120px] py-2 px-4 rounded-lg focus:outline-none shadow shrink-0 text-center ${
                    feedbacks.correct
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {currentScrambleIdx < SCRAMBLED_SENTENCES.length - 1 ? 'Next Sentence' : 'Finish Challenge'}
                </button>
              </div>
            )}

            {/* Answer check tools */}
            {!feedbacks?.submitted && (
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex gap-1.5 text-[11px] text-slate-500 font-medium pb-2 sm:pb-0">
                  <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Hint:</strong> {activeQuestion.hint}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <button
                    onClick={() => {
                      setSelectedWords([]);
                      setScrambledPool(activeQuestion.scrambledWords);
                    }}
                    className="p-2 border font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg text-xs"
                    title="Reset choice pool"
                  >
                    Clear Slate
                  </button>
                  <button
                    onClick={handleCheckSentence}
                    disabled={selectedWords.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] transition-transform active:scale-[0.99] font-bold text-white px-5 py-2 rounded-lg text-xs disabled:opacity-50"
                  >
                    Check Assembled Sentence
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          // Finished Scrambler panel
          <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="text-5xl">🏆</span>
            <h4 className="font-extrabold text-sm text-emerald-800 mt-2">Word Arranger Completed!</h4>
            <p className="text-xs text-emerald-600 font-medium leading-relaxed max-w-md mx-auto mt-1">
              Fantastic! You correctly unscrambled the Present Simple sentences and loaded <strong className="text-indigo-600">{stats.grammarScrambleScore * 15} Stars</strong> to your progressing dashboard index!
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={handleResetGame}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg focus:outline-none"
              >
                Reset Word Arranger
              </button>
              <button
                onClick={onAdvance}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1 focus:outline-none"
              >
                Go to Final Quiz <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
