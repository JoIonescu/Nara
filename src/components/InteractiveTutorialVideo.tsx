import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Eye, Sparkles, BookOpen, Clock, Minimize2, Check } from "lucide-react";

export default function InteractiveTutorialVideo() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showCC, setShowCC] = useState<boolean>(true);

  // Auto-advancement simulated video timeline
  // The "video" will demonstrate 4 main features of Nara:
  // 1. Personalized Contrast & Weighted Fonts
  // 2. Focused Reading Ruler & Sensory Guides
  // 3. Audio Narration with Live Highlight sync
  // 4. One-Click AI Complexity simplification
  const videoSteps = [
    {
      title: "1. Adapting Layouts & Fonts",
      desc: "Nara instantly adjusts spacing, font sizes, and contrast templates (like Organic Cream) to reduce eye strain and mirror-letter fatigue.",
      highlight: "Lexend & OpenDyslexic weighted-bottom typefaces.",
      caption: "[Narrator]: Welcome to Nara. Let's begin by customizing your reading layouts, choosing weights designed specifically to alleviate macular tension and letter swapping.",
      color: "from-amber-100 to-orange-100",
      contentComp: (
        <div className="p-4 bg-[#F7F4EE] border border-[#DCD9D0] rounded-xl text-[#222222] font-lexend space-y-2 animate-pulse">
          <p className="text-xs font-black text-[#5B8FB9] uppercase tracking-widest">Typeface: Lexend</p>
          <p className="text-sm leading-relaxed font-medium">The way we read shouldn't be fixed. Some of us need wider spacing, others need larger letters.</p>
        </div>
      )
    },
    {
      title: "2. Focused Reading Rulers",
      desc: "Activate the digital card indicator or focus ruler mask. Unwanted lines vanish, keeping your line progression strictly focused.",
      highlight: "ADHD and visual sensory distraction blocks.",
      caption: "[Narrator]: If you easily lose your place, our sensory ruler guides isolate lines in a high-contrast visual runway, blocking out adjacent background noise.",
      color: "from-sky-100 to-indigo-100",
      contentComp: (
        <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[#A0B0C0]/20 animate-pulse pointer-events-none" />
          <div className="p-2 bg-yellow-100 border-l-4 border-yellow-500 rounded text-xs font-mono font-bold">
            ⚡ Focus mode: Line Isolation Ruler Active
          </div>
          <p className="text-xs mt-2 text-stone-700 font-medium">Only the current line stands out clearly while others are softly dimmed away.</p>
        </div>
      )
    },
    {
      title: "3. Interactive Audio Companion",
      desc: "Synchronized speech rendering speaks paragraphs aloud word-by-word, guiding your scanning speed perfectly.",
      highlight: "Browser-native high fidelity synthesizer.",
      caption: "[Narrator]: Tap listen, and our active audio engine reads the text aloud, tracking each sentence with color highlights to foster dual-sensory reinforcement.",
      color: "from-purple-100 to-violet-100",
      contentComp: (
        <div className="p-4 bg-[#EEF5FA] border border-[#D0DFEB] rounded-xl space-y-2 text-[#1B2A4A]">
          <div className="flex items-center gap-1 text-xs font-bold text-[#5B8FB9]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Live Audio Narration Sync</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            <span className="bg-amber-200 text-[#1B2A4A] px-1 rounded transition-all">Synchronized speech rendering speaks paragraphs aloud</span> word-by-word.
          </p>
        </div>
      )
    },
    {
      title: "4. One-Click AI Simplification",
      desc: "Tackle dense historical literature, old-styled syntax, or complex scientific jargon back into clean conversational summaries.",
      highlight: "Powered server-side by Gemini AI.",
      caption: "[Narrator]: Stumble on an overly complex paragraph? Tap 'Simplify with AI' to re-render confusing paragraphs into clear, friendly highlights with a single click.",
      color: "from-emerald-100 to-teal-100",
      contentComp: (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
          <div className="flex items-center justify-between text-xs font-black uppercase text-emerald-800">
            <span>Original vs. Simplified</span>
            <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] text-[#222222]">Dynamic AI</span>
          </div>
          <p className="text-[11px] line-through text-stone-400">“The metaphysical framework of this epoch requires meticulous cognitive deconstruction...”</p>
          <p className="text-xs font-bold text-emerald-950">💡 AI Version: “This time period has ideas that are easier to understand if we break them down step-by-step.”</p>
        </div>
      )
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Advance to next step
            setActiveStep((prevStep) => {
              const nextStep = (prevStep + 1) % videoSteps.length;
              return nextStep;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 70); // duration of each step ~7 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Speaking simulated speech narration
  useEffect(() => {
    if (isPlaying && !isMuted) {
      try {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utteranceText = videoSteps[activeStep].caption.replace(/\[Narrator\]:\s*/, "");
          const utterance = new SpeechSynthesisUtterance(utteranceText);
          utterance.rate = 1.05;
          
          const voices = window.speechSynthesis.getVoices();
          const targetVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Natural")) || voices.find(v => v.lang.startsWith("en"));
          if (targetVoice) utterance.voice = targetVoice;

          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn("Tour Voice Narration failed:", err);
      }
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, activeStep, isMuted]);

  return (
    <div id="interactive-tutorial-root" className="bg-stone-900 text-white rounded-2xl overflow-hidden border border-stone-800 shadow-xl flex flex-col">
      
      {/* Video screen stage layout */}
      <div className="relative h-60 bg-gradient-to-br from-stone-950 to-stone-900 flex flex-col justify-between p-4 font-sans select-none">
        
        {/* Top Header metadata */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>Nara Tutorial Tour</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 font-mono">
            {activeStep + 1} / {videoSteps.length}
          </span>
        </div>

        {/* Dynamic Interactive Features Showcase Screen (Centered mockup frame) */}
        <div id="video-mockup-frame" className="my-auto max-w-sm mx-auto w-full transform scale-95 transition-all duration-300">
          <div className={`p-1 rounded-2xl bg-gradient-to-r shadow-inner ${videoSteps[activeStep].color} transition-all duration-500`}>
            {videoSteps[activeStep].contentComp}
          </div>
        </div>

        {/* CC Open Captions Overlay - High contrast black strip */}
        {showCC && (
          <div className="bg-black/85 border border-white/10 p-2.5 rounded-xl text-center text-[11px] font-medium leading-relaxed tracking-wide text-gray-200 z-10 max-w-full truncate whitespace-normal">
            {videoSteps[activeStep].caption}
          </div>
        )}
      </div>

      {/* Video Progress Bar */}
      <div className="w-full bg-stone-800 h-1.5 overflow-hidden cursor-pointer relative">
        <div 
          className="bg-[#5B8FB9] h-full transition-all duration-100 rounded-r-sm" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Control panel buttons footer */}
      <div className="p-3 bg-stone-950 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs border-t border-stone-800">
        <div className="flex items-center gap-2">
          {/* Play/Pause control state */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isPlaying ? "bg-amber-500 text-stone-950 hover:bg-amber-400" : "bg-[#5B8FB9] text-white hover:bg-[#497A9E]"
            }`}
            title={isPlaying ? "Pause Tour Video" : "Play Tour Video"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Voice Speech Synthesis narration toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              isMuted ? "border-stone-700 text-stone-500 hover:text-stone-400" : "border-stone-800 text-amber-400 bg-stone-900"
            }`}
            title={isMuted ? "Unmute Voiceover Guided Tour" : "Mute Voiceover Guided Tour"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* CC captions toggle */}
          <button
            onClick={() => setShowCC(!showCC)}
            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border transition-all ${
              showCC ? "bg-stone-800 text-white border-transparent" : "text-stone-500 border-stone-800 hover:text-stone-400"
            }`}
          >
            CC
          </button>
        </div>

        {/* Step dots navigation */}
        <div className="flex gap-1.5">
          {videoSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveStep(idx);
                setProgress(0);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === activeStep ? "bg-[#5B8FB9] scale-125" : "bg-stone-800"
              }`}
              title={`Go to Tour step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Playing guide info or prompt */}
        <div className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{isPlaying ? "Tour is active..." : "Tap play to start live audio walkthrough"}</span>
        </div>
      </div>

      {/* Explanation of key features shown bottom */}
      <div id="tour-explanation-box" className="p-4 bg-stone-900/50 text-stone-300 text-[11px] leading-relaxed border-t border-stone-800 max-h-[140px] overflow-y-auto">
        <p className="font-extrabold text-white text-xs mb-1">Active Feature Demonstration:</p>
        <p className="font-bold text-[#5B8FB9]">{videoSteps[activeStep].title}</p>
        <p className="text-stone-400 mt-0.5">{videoSteps[activeStep].desc}</p>
      </div>
    </div>
  );
}
