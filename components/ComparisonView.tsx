import React, { useState } from 'react';
import { Download, Check, X, Layers } from 'lucide-react';
import { Button } from './Button';

interface ComparisonViewProps {
  original: string;
  processed: string;
  onReset: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed, onReset }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${processed}`;
    link.download = 'removed-bg-gemini.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Layers className="mr-3 text-primary" />
          Result
        </h2>
        
        <div className="flex bg-surface p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'side-by-side' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'overlay' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overlay
          </button>
        </div>
      </div>

      <div className="bg-surface/30 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">Original</span>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700">
                <img src={original} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">Processed</span>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-800 border border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                 {/* Checkerboard pattern for transparency visualization */}
                 <div className="absolute inset-0 opacity-20" 
                      style={{
                        backgroundImage: `linear-gradient(45deg, #334155 25%, transparent 25%), 
                                          linear-gradient(-45deg, #334155 25%, transparent 25%), 
                                          linear-gradient(45deg, transparent 75%, #334155 75%), 
                                          linear-gradient(-45deg, transparent 75%, #334155 75%)`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }} 
                 />
                <img src={`data:image/png;base64,${processed}`} alt="Processed" className="relative z-10 w-full h-full object-contain" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 group">
             {/* Simple toggle for overlay view just to keep it simple for this prompt without complex slider logic */}
             <div className="absolute inset-0 flex items-center justify-center">
                <img src={original} alt="Original" className="absolute h-full object-contain opacity-50 blur-sm scale-95 transition-all duration-500 group-hover:opacity-0" />
                <img src={`data:image/png;base64,${processed}`} alt="Processed" className="absolute h-full object-contain z-10 transition-transform duration-500 hover:scale-105" />
             </div>
             <p className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-sm z-20 pointer-events-none">Hover to inspect details</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button variant="secondary" onClick={onReset} icon={<X size={18} />}>
          Start Over
        </Button>
        <Button onClick={handleDownload} icon={<Download size={18} />}>
          Download HD
        </Button>
      </div>
    </div>
  );
};
