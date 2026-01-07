import React, { useState, useEffect, useCallback } from 'react';
import { HistoryEntry, ModalType } from './types';
import { generateSpiritualInsight } from './services/geminiService';
import { MandalaBackground } from './components/MandalaBackground';
import { HistoryModal } from './components/HistoryModal';
import { 
  Plus, 
  RotateCcw, 
  History, 
  Footprints, 
  Sparkles,
  Save,
  CheckCircle2,
  Menu,
  Share2
} from 'lucide-react';

const STORAGE_KEY_STATS = 'pradakshina_stats';
const STORAGE_KEY_HISTORY = 'pradakshina_history';
const STORAGE_KEY_CURRENT_SESSION = 'pradakshina_current_session';

function App() {
  // --- State with Lazy Initialization for Persistence ---
  
  // 1. Current Count
  const [currentCount, setCurrentCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  
  // 2. Total Lifetime Count
  const [totalLifetimeCount, setTotalLifetimeCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
      if (savedStats) {
        try {
          return JSON.parse(savedStats).totalRounds || 0;
        } catch (e) { return 0; }
      }
    }
    return 0;
  });

  // 3. History
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        try {
          return JSON.parse(savedHistory);
        } catch (e) { return []; }
      }
    }
    return [];
  });

  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [isAnimating, setIsAnimating] = useState(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [lastInsight, setLastInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Effects ---
  
  // 1. Check for URL parameters (Shared Links) on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCount = params.get('count');
    
    if (sharedCount) {
      const parsed = parseInt(sharedCount, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setCurrentCount(parsed);
        // Clean the URL so reload doesn't reset progress if user continues counting
        window.history.replaceState({}, '', window.location.pathname);
        showToast(`Imported shared session: ${parsed} rounds`);
      }
    }
  }, []);

  // 2. Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, currentCount.toString());
  }, [currentCount]);

  useEffect(() => {
    const stats = { totalRounds: totalLifetimeCount };
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [totalLifetimeCount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  // --- Helper ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Handlers ---

  const handleIncrement = () => {
    setCurrentCount(prev => prev + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleResetCurrent = () => {
    if (currentCount > 0 && window.confirm("Reset current session without saving?")) {
      setCurrentCount(0);
      setLastInsight(null);
    }
  };

  const handleSaveSession = async () => {
    if (currentCount === 0) return;

    setIsGeneratingInsight(true);
    const insight = await generateSpiritualInsight(currentCount);
    setIsGeneratingInsight(false);
    
    setLastInsight(insight);

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      count: currentCount,
      timestamp: Date.now(),
      insight: insight
    };

    setHistory(prev => [...prev, newEntry]);
    setTotalLifetimeCount(prev => prev + currentCount);
    setCurrentCount(0); // Reset for next session
    setActiveModal(ModalType.INSIGHT);
  };

  const handleManualAdd = async () => {
    const val = parseInt(manualInput);
    if (!isNaN(val) && val > 0) {
      setIsGeneratingInsight(true);
      const insight = await generateSpiritualInsight(val);
      setIsGeneratingInsight(false);

      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        count: val,
        timestamp: Date.now(),
        insight: insight,
        note: 'Manual Entry'
      };

      setHistory(prev => [...prev, newEntry]);
      setTotalLifetimeCount(prev => prev + val);
      // We intentionally do not show the success popup for manual entry to keep it quick
      setManualInput('');
      setActiveModal(ModalType.NONE);
    }
  };

  const handleClearHistory = () => {
    if(window.confirm("Are you sure? This will delete all history and reset the lifetime counter.")) {
      setHistory([]);
      setTotalLifetimeCount(0);
      setActiveModal(ModalType.NONE);
    }
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    // If current session has rounds, include them in the link
    if (currentCount > 0) {
      url.searchParams.set('count', currentCount.toString());
    }

    const shareData = {
      title: 'Pradakshina Path',
      text: currentCount > 0 
        ? `I have completed ${currentCount} Pradakshina rounds in this session. Join me on the path.`
        : `Track your spiritual circumambulation journey with Pradakshina Path.`,
      url: url.toString()
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url.toString());
        showToast('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback
      try {
        await navigator.clipboard.writeText(url.toString());
        showToast('Link copied to clipboard!');
      } catch (clipboardErr) {
        showToast('Could not copy link.');
      }
    }
  };

  // --- Render ---

  return (
    <div className="relative min-h-screen text-gray-800 overflow-hidden flex flex-col">
      <MandalaBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white px-6 py-2 rounded-full shadow-lg text-sm animate-fade-in-up backdrop-blur-sm pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <nav className="relative z-10 p-6 flex justify-between items-center glass-card border-b border-orange-100/50">
        <div className="flex items-center gap-2 text-orange-800">
          <div className="p-2 bg-orange-100 rounded-lg">
             <Footprints size={24} className="text-orange-600" />
          </div>
          <span className="text-2xl font-bold spiritual-font hidden sm:block">Pradakshina Path</span>
          <span className="text-xl font-bold spiritual-font sm:hidden">Pradakshina</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2 text-orange-700 hover:bg-orange-100 rounded-full transition-colors"
            aria-label="Share"
          >
            <Share2 size={24} />
          </button>
          <button 
            onClick={() => setActiveModal(ModalType.HISTORY)}
            className="p-2 text-orange-700 hover:bg-orange-100 rounded-full transition-colors relative"
            aria-label="History"
          >
            <History size={24} />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-8">
        
        {/* Total Stats Banner */}
        <div className="bg-white/60 backdrop-blur-md px-6 py-2 rounded-full border border-orange-200 text-orange-900 font-medium shadow-sm flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-600" />
          <span>Lifetime Rounds: </span>
          <span className="font-bold text-lg">{totalLifetimeCount}</span>
        </div>

        {/* The Big Counter */}
        <div className="relative group">
          {/* Decorative Rings */}
          <div className={`absolute inset-0 rounded-full border-[6px] border-orange-200 scale-110 transition-transform duration-700 ${isAnimating ? 'scale-125 opacity-0' : 'opacity-100'}`}></div>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-300 animate-[spin_20s_linear_infinite] opacity-40 pointer-events-none"></div>
          
          <button
            onClick={handleIncrement}
            className={`
              w-64 h-64 rounded-full bg-gradient-to-br from-orange-400 to-red-500 
              shadow-[0_20px_50px_rgba(234,88,12,0.3)] 
              flex flex-col items-center justify-center text-white
              transition-all duration-100 active:scale-95
              border-4 border-white/20 relative overflow-hidden
              ${isAnimating ? 'ring-8 ring-orange-200' : ''}
            `}
            aria-label="Increment Counter"
          >
             {/* Ripple effect container could go here */}
             <span className="text-orange-100 text-sm tracking-widest uppercase mb-2 font-medium">Current Session</span>
             <span className="text-8xl font-bold font-mono tracking-tighter leading-none">{currentCount}</span>
             <span className="text-orange-100/80 text-xs mt-4">Tap to Count</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-sm justify-center">
           <button 
             onClick={handleResetCurrent}
             disabled={currentCount === 0}
             className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/60 hover:bg-white/90 shadow-sm border border-orange-100 transition-all text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed w-20"
           >
             <RotateCcw size={20} />
             <span className="text-xs font-medium">Reset</span>
           </button>

           <button 
             onClick={handleSaveSession}
             disabled={currentCount === 0 || isGeneratingInsight}
             className="flex-1 flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isGeneratingInsight ? (
               <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
             ) : (
               <Save size={24} />
             )}
             <span className="text-sm font-medium">Save Session</span>
           </button>

           <button 
             onClick={() => setActiveModal(ModalType.ADD_MANUAL)}
             className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/60 hover:bg-white/90 shadow-sm border border-orange-100 transition-all text-gray-600 w-20"
           >
             <Plus size={20} />
             <span className="text-xs font-medium">Add</span>
           </button>
        </div>

      </main>

      {/* Manual Add Modal */}
      {activeModal === ModalType.ADD_MANUAL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-orange-900 mb-4 spiritual-font">Add Counts Manually</h3>
            <p className="text-gray-600 text-sm mb-4">Did you complete rounds without your device? Add them here.</p>
            
            <input 
              type="number" 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g., 108"
              className="w-full p-4 text-2xl text-center border-2 border-orange-100 rounded-xl focus:border-orange-500 focus:outline-none mb-6 font-mono text-orange-600"
              autoFocus
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setActiveModal(ModalType.NONE); setManualInput(''); }}
                className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleManualAdd}
                disabled={!manualInput || isGeneratingInsight}
                className="flex-1 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 disabled:opacity-50"
              >
                 {isGeneratingInsight ? 'Processing...' : 'Add Counts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insight Success Modal */}
      {activeModal === ModalType.INSIGHT && lastInsight && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up border-t-4 border-orange-500">
             <div className="flex justify-center mb-4">
               <div className="p-3 bg-green-100 rounded-full text-green-600">
                 <CheckCircle2 size={32} />
               </div>
             </div>
             
             <h3 className="text-2xl font-bold text-center text-gray-800 mb-2 spiritual-font">Session Recorded</h3>
             <p className="text-center text-gray-500 mb-6 text-sm">Your Pradakshina has been added to the path.</p>
             
             <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6 relative">
               <Sparkles className="absolute top-3 left-3 text-orange-300" size={16} />
               <p className="text-center text-orange-800 italic font-medium leading-relaxed font-serif">
                 "{lastInsight}"
               </p>
               <Sparkles className="absolute bottom-3 right-3 text-orange-300" size={16} />
             </div>

             <button 
               onClick={() => setActiveModal(ModalType.NONE)}
               className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
             >
               Continue Journey
             </button>
           </div>
         </div>
      )}

      <HistoryModal 
        isOpen={activeModal === ModalType.HISTORY} 
        onClose={() => setActiveModal(ModalType.NONE)}
        history={history}
        onClear={handleClearHistory}
      />
    </div>
  );
}

export default App;