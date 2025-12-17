import React, { useState, useEffect, useRef } from 'react';
import { X, Expand, Shrink } from 'lucide-react';

const CODE_SNIPPETS = `
// System Boot Sequence v20.2.4
// ----------------------------------------
import { Christmas } from '@universe/holidays';
import { Magic } from '@fantasy/particles';

async function initializeEve() {
  console.log("Connecting to North Pole Node...");
  
  const spirit = new Magic.Spirit({
    joy: 100,
    warmth: Infinity,
    hope: true,
    renderEngine: 'Love-WebGL'
  });

  const tree = new Christmas.Tree({
    type: 'Cyber-Evergreen',
    decorations: ['NeonLights', 'QuantumStar', 'Memories'],
    height: '100vh',
    resolution: '4K'
  });

  // > Initializing magical sequence...
  await spirit.gather(tree);
  
  // > Loading assets... [Done]
  // > Compiling shaders... [Done]
  // > Synchronizing hearts... [Done]
  
  // 00:00:01 - System Ready.
  // Miracle deployed successfully.
  
  return spirit.bless(tree);
}

// > Executing miracle...
// > Happy Holidays!
`;

interface CodeOverlayProps {
    isAudioPlaying: boolean;
    toggleAudio: () => void;
    viewMode: 'tree' | 'universe';
    setViewMode: (mode: 'tree' | 'universe') => void;
    selectedPhoto: string | null;
    onClosePhoto: () => void;
}

export const CodeOverlay: React.FC<CodeOverlayProps> = ({ 
    isAudioPlaying, 
    toggleAudio, 
    viewMode, 
    setViewMode,
    selectedPhoto,
    onClosePhoto
}) => {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    // 1. Wait for the tree animation (5s) + Star (0s) + 1s delay = 6.0s
    const appearanceDelay = 6000;
    
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, appearanceDelay);

    // 2. Start typing effect shortly after UI fades in
    let typeTimer: ReturnType<typeof setInterval>;
    
    const startTyping = () => {
        let i = 0;
        typeTimer = setInterval(() => {
          setText(CODE_SNIPPETS.slice(0, i));
          i++;
          
          // Auto-scroll to bottom
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }

          if (i > CODE_SNIPPETS.length) clearInterval(typeTimer);
        }, 25); // Slightly faster typing
    };

    const typeDelayTimer = setTimeout(startTyping, appearanceDelay + 800);

    return () => {
        clearTimeout(showTimer);
        clearTimeout(typeDelayTimer);
        if (typeTimer) clearInterval(typeTimer);
    };
  }, []);

  return (
    <>
        {/* Main UI Overlay */}
        <div className={`absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-8 text-slate-300 font-mono transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            {/* Terminal Window */}
            <div className="bg-slate-950/30 backdrop-blur-sm p-4 rounded-lg border border-slate-700/30 shadow-2xl w-full max-w-lg relative overflow-hidden group hover:bg-slate-950/40 transition-colors duration-500 pointer-events-auto">
                {/* Window Controls */}
                <div className="flex gap-2 mb-3 border-b border-white/10 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <span className="ml-2 text-[10px] text-slate-400 uppercase tracking-widest">term // root --merry-xmas</span>
                </div>
                
                {/* Code Content */}
                <pre 
                    ref={scrollRef}
                    className="text-xs md:text-sm text-cyan-300/90 code-scroll overflow-y-auto max-h-[40vh] md:max-h-[50vh] whitespace-pre-wrap leading-relaxed font-fira text-shadow-sm"
                >
                    {text}
                    <span className="animate-pulse inline-block w-2 h-4 bg-cyan-400 align-middle ml-1"></span>
                </pre>
                
                {/* Decoration: Scanline */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent bg-[length:100%_4px] opacity-20"></div>
            </div>
            
            {/* Title (Desktop) */}
            <div className="text-right hidden md:block opacity-90">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-blue-600 font-[Inter] tracking-tighter drop-shadow-lg filter">
                    MERRY<br/>CHRISTMAS
                </h1>
                <p className="text-sm text-slate-400 mt-2 font-light tracking-widest uppercase">System Online // v.20.2.4</p>
            </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end pointer-events-auto mt-4 gap-4">
            {/* Left Side: Stats */}
            <div className="text-[10px] md:text-xs text-slate-500 font-mono space-y-1">
                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> SERVER_TIME: 12/24/2024</p>
                <p>RENDER_ENGINE: R3F_WebGL_2.0</p>
                <p>MEM_USAGE: 240MB / 1024MB</p>
            </div>

            {/* Right Side: Control Buttons */}
            <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <button 
                    onClick={() => setViewMode(viewMode === 'tree' ? 'universe' : 'tree')}
                    className={`group relative overflow-hidden flex items-center gap-3 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/30 text-slate-300 px-6 py-3 rounded-full transition-all duration-500 shadow-lg ${viewMode === 'universe' ? 'border-cyan-500/80 shadow-cyan-500/20' : 'hover:border-cyan-500/50'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"/>
                    
                    {viewMode === 'tree' ? (
                         <span className="flex items-center gap-2 relative z-10 text-xs md:text-sm">
                            <Expand className="w-4 h-4 text-cyan-400" />
                            EXPAND MEMORIES
                         </span>
                    ) : (
                         <span className="flex items-center gap-2 relative z-10 text-xs md:text-sm">
                            <Shrink className="w-4 h-4 text-purple-400" />
                            ASSEMBLE TREE
                         </span>
                    )}
                </button>

                {/* Music Button */}
                <button 
                    onClick={toggleAudio}
                    className="group relative overflow-hidden flex items-center gap-3 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/30 hover:border-cyan-500/50 text-slate-300 px-6 py-3 rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"/>
                    
                    {isAudioPlaying ? (
                    <span className="flex items-center gap-2 relative z-10 text-xs md:text-sm">
                        <span className="flex gap-1 h-3 items-end">
                            <span className="w-0.5 h-3 bg-green-400 animate-[bounce_1s_infinite]"></span>
                            <span className="w-0.5 h-2 bg-green-400 animate-[bounce_1.2s_infinite]"></span>
                            <span className="w-0.5 h-4 bg-green-400 animate-[bounce_0.8s_infinite]"></span>
                        </span>
                        PAUSE
                    </span>
                    ) : (
                        <span className="flex items-center gap-2 relative z-10 text-xs md:text-sm">
                        <span className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.5)]"/> 
                        PLAY
                    </span>
                    )}
                </button>
            </div>
        </div>
        </div>

        {/* Photo Modal */}
        {selectedPhoto && (
            <div 
                className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 p-4"
                onClick={onClosePhoto}
            >
                <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={onClosePhoto}
                        className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <div className="relative p-1 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 rounded-lg shadow-2xl">
                         <div className="bg-slate-900 rounded-lg overflow-hidden">
                             <img 
                                src={selectedPhoto} 
                                alt="Memory" 
                                className="w-full h-auto max-h-[85vh] object-contain"
                             />
                         </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
