import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react'; // Assuming you might have icons, otherwise use text

const CODE_SNIPPETS = `
import { Christmas } from '@universe/holidays';
import { Magic } from '@fantasy/particles';

function MerryChristmas() {
  const spirit = new Magic.Spirit({
    joy: 100,
    warmth: Infinity,
    hope: true
  });

  const tree = new Christmas.Tree({
    type: 'Evergreen',
    decorations: ['Lights', 'Star', 'Love'],
    height: '100vh'
  });

  // Initializing magical sequence...
  // Loading assets...
  // Compiling shaders...
  // 00:00:01 - System Ready.
  
  return spirit.bless(tree);
}

// Executing miracle...
// ...
`;

export const CodeOverlay: React.FC<{ isAudioPlaying: boolean; toggleAudio: () => void }> = ({ isAudioPlaying, toggleAudio }) => {
  const [text, setText] = useState('');
  
  useEffect(() => {
    // Delay start by 4.5 seconds to match the tree construction animation
    const startDelay = 4500; 
    let typeTimer: ReturnType<typeof setInterval>;
    
    const startTyping = () => {
        let i = 0;
        typeTimer = setInterval(() => {
          setText(CODE_SNIPPETS.slice(0, i));
          i++;
          if (i > CODE_SNIPPETS.length) clearInterval(typeTimer);
        }, 30);
    };

    const delayTimer = setTimeout(startTyping, startDelay);

    return () => {
        clearTimeout(delayTimer);
        if (typeTimer) clearInterval(typeTimer);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 text-slate-300 font-mono">
      {/* Top Bar */}
      <div className="flex justify-between items-start opacity-70">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-slate-700/50 max-w-md w-full shadow-2xl">
          <div className="flex gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <pre className="text-xs md:text-sm text-cyan-400 code-scroll overflow-hidden whitespace-pre-wrap leading-relaxed h-64 md:h-auto">
            {text}
            <span className="animate-pulse">_</span>
          </pre>
        </div>
        
        <div className="text-right hidden md:block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 font-[Inter] tracking-tighter">
                MERRY<br/>CHRISTMAS
            </h1>
            <p className="text-sm text-slate-500 mt-1">v.20.2.4-beta</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-end pointer-events-auto">
        {/* Left Side: Stats */}
        <div className="text-xs text-slate-600 font-mono">
            <p>RENDER_ENGINE: R3F_WebGL</p>
            <p>FPS: 60.0</p>
            <p className="text-cyan-800">STATUS: ONLINE</p>
        </div>

        {/* Right Side: Button */}
        <div className="flex items-center gap-4">
             <button 
                onClick={toggleAudio}
                className="group flex items-center gap-3 bg-slate-800/80 hover:bg-cyan-900/50 backdrop-blur-md border border-slate-700 hover:border-cyan-500/50 text-slate-300 px-6 py-3 rounded-full transition-all duration-300 shadow-lg"
             >
                {isAudioPlaying ? (
                   <span className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> 
                     PAUSE MUSIC
                   </span>
                ) : (
                    <span className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-400 rounded-full"/> 
                     PLAY MUSIC
                   </span>
                )}
             </button>
        </div>
      </div>
    </div>
  );
};