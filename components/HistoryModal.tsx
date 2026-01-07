import React from 'react';
import { HistoryEntry } from '../types';
import { X, Calendar, Sparkles } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50">
          <h2 className="text-xl text-orange-900 spiritual-font font-bold">Your Journey</h2>
          <button onClick={onClose} className="p-2 hover:bg-orange-200 rounded-full transition-colors text-orange-800">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p>No sessions recorded yet.</p>
              <p className="text-sm mt-2">Begin your first Pradakshina.</p>
            </div>
          ) : (
            history.slice().reverse().map((entry) => (
              <div key={entry.id} className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-2xl text-orange-600">{entry.count} <span className="text-sm text-orange-400 font-normal">rounds</span></span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {entry.insight && (
                  <div className="text-sm text-gray-700 italic border-l-2 border-orange-300 pl-3 py-1">
                    "{entry.insight}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
           <div className="p-4 border-t border-orange-100 bg-gray-50">
             <button 
               onClick={() => {
                 if(window.confirm("Are you sure you want to clear your entire history? This cannot be undone.")) {
                   onClear();
                 }
               }}
               className="w-full py-2 text-red-500 text-sm hover:text-red-700 transition-colors"
             >
               Clear History
             </button>
           </div>
        )}
      </div>
    </div>
  );
};