import React, { useState } from 'react';
import { AppState, ProcessedImage } from './types';
import { UploadArea } from './components/UploadArea';
import { ComparisonView } from './components/ComparisonView';
import { Button } from './components/Button';
import { removeBackground } from './services/geminiService';
import { Wand2, ImageMinus, Github, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [images, setImages] = useState<ProcessedImage>({ original: '', result: null });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageSelect = async (base64: string) => {
    setImages({ original: base64, result: null });
    setErrorMsg(null);
    setAppState(AppState.PROCESSING);

    try {
      // 1. Send to Gemini
      const processedBase64 = await removeBackground(base64);
      
      // 2. Update state
      setImages(prev => ({ ...prev, result: processedBase64 }));
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong while processing the image.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setImages({ original: '', result: null });
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-darker/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ImageMinus className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              BgGone
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:block text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Powered by Gemini 2.5
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-[100%] blur-[100px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
          
          {/* Hero Text (only show when idle or processing without result) */}
          {(appState === AppState.IDLE || (appState === AppState.PROCESSING && !images.result)) && (
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface border border-slate-700 text-primary text-sm font-medium mb-4">
                <Wand2 className="w-4 h-4 mr-2" />
                AI-Powered Magic
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
                Remove Backgrounds <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                  in Seconds
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Upload your image and let our advanced Gemini AI model isolate the subject with pixel-perfect precision. 
                Free, fast, and high quality.
              </p>
            </div>
          )}

          {/* Workflow State Machine */}
          <div className="w-full transition-all duration-500 ease-in-out">
            
            {appState === AppState.IDLE && (
              <div className="animate-fade-in">
                <UploadArea onImageSelected={handleImageSelect} />
              </div>
            )}

            {appState === AppState.PROCESSING && (
              <div className="w-full max-w-lg mx-auto text-center py-20 animate-pulse-slow">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                  <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                  <Wand2 className="absolute inset-0 m-auto text-primary w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Analyzing Image...</h3>
                <p className="text-slate-400">Gemini is identifying the subject and removing the background.</p>
              </div>
            )}

            {appState === AppState.SUCCESS && images.result && (
              <ComparisonView 
                original={images.original} 
                processed={images.result} 
                onReset={handleReset} 
              />
            )}

            {appState === AppState.ERROR && (
              <div className="max-w-md mx-auto text-center py-12 bg-red-500/5 border border-red-500/20 rounded-2xl">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Processing Failed</h3>
                 <p className="text-slate-400 px-6 mb-6">{errorMsg}</p>
                 <Button onClick={handleReset} variant="outline">Try Again</Button>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-darker py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} BgGone. Built with Google Gemini API & React.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
