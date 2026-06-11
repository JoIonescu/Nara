import React, { useState, useEffect, useRef } from "react";
import NaraLogo from "./NaraLogo";
import { Book, UserPreferences, Bookmark, ReadingPosition, FocusModeType, CharacterCard, ConceptCard, ThemeOption } from "../types";
import { SAMPLE_BOOKS, DIFFICULTY_SPECS, WORD_DICTIONARY } from "../data/books";
import {
  X,
  Volume2,
  Play,
  Pause,
  Ruler,
  Highlighter,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Smile,
  Maximize2,
  FileText,
  RotateCcw,
  BookOpen,
  User
} from "lucide-react";

interface ReaderViewProps {
  book: Book;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
  onBackToDashboard: () => void;
  bookmarks: Bookmark[];
  onAddBookmark: (b: Bookmark) => void;
  currentPosition: ReadingPosition;
  onUpdatePosition: (pos: ReadingPosition) => void;
  onReadingMinute: () => void;
}

export default function ReaderView({
  book,
  preferences,
  onUpdatePreferences,
  onBackToDashboard,
  bookmarks,
  onAddBookmark,
  currentPosition,
  onUpdatePosition,
  onReadingMinute,
}: ReaderViewProps) {
  // Navigation State
  const activeChapterIndex = book.chapters.findIndex((c) => c.id === currentPosition.chapterId);
  const safeChapterIndex = activeChapterIndex >= 0 ? activeChapterIndex : 0;
  const activeChapter = book.chapters[safeChapterIndex];
  const activeParagraphIndex = currentPosition.paragraphIndex;

  // Reading Mode Aids
  const [focusMode, setFocusMode] = useState<FocusModeType>("normal");
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [rulerTop, setRulerTop] = useState<number>(300);
  const [showToolbarSettings, setShowToolbarSettings] = useState<boolean>(false);
  
  // Word Info Dialog state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDetails, setWordDetails] = useState<{ definition: string; pronunciation: string; example: string; simple: string } | null>(null);

  // Read Along / Audio Engine Simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState<number>(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real dynamic Speech Synthesis voice list
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const getSpeechVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        setAvailableVoices(vList);
      };
      getSpeechVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getSpeechVoices;
      }
    }
  }, []);

  // AI premium assistance overlays
  const [aiSimplifyOverlay, setAiSimplifyOverlay] = useState<{ paragraphIndex: number; simplifiedText: string } | null>(null);
  const [aiSimplifyLoading, setAiSimplifyLoading] = useState<boolean>(false);

  const [aiExplainText, setAiExplainText] = useState<string>("");
  const [aiExplainOutput, setAiExplainOutput] = useState<string | null>(null);
  const [aiExplainLoading, setAiExplainLoading] = useState<boolean>(false);

  const [aiSummaryOutput, setAiSummaryOutput] = useState<{ keyIdeas: string[]; mainEvents: string[]; characterUpdates: string[] } | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Quick settings tabs toggle
  const [activeSideDrawer, setActiveSideDrawer] = useState<"none" | "dictionary" | "aichat" | "memory">("none");

  // Keep track of reading duration
  useEffect(() => {
    const timer = setInterval(() => {
      onReadingMinute();
    }, 60000); // Trigger physical reading minute every 60s
    return () => clearInterval(timer);
  }, [onReadingMinute]);

  // Handle CSS class variables for typography
  const textFontStyles: Record<string, string> = {
    Lexend: "font-lexend",
    OpenDyslexic: "font-dyslexic",
    Atkinson: "font-atkinson",
    Inter: "font-inter",
  };

  const themeClasses: Record<string, string> = {
    cream: "bg-[#F7F4EE] text-[#222222]",
    yellow: "bg-[#FFFDE5] text-[#1D1B11]",
    blue: "bg-[#EEF5FA] text-[#1B2A4A]",
    sepia: "bg-[#F4EAD4] text-[#3E2723]",
    dark: "bg-[#1E1F22] text-[#E3E3E3]",
  };

  const themeConfigNames = {
    cream: "Organic Cream",
    yellow: "Soft Yellow",
    blue: "Soft Ice Blue",
    sepia: "Classic Sepia",
    dark: "Midnight Grey",
  };

  // Chapter Navigation Handler
  const goToNextChapter = () => {
    if (safeChapterIndex < book.chapters.length - 1) {
      const nextCh = book.chapters[safeChapterIndex + 1];
      onUpdatePosition({
        bookId: book.id,
        chapterId: nextCh.id,
        paragraphIndex: 0,
      });
      setIsPlayingAudio(false);
      setAiSimplifyOverlay(null);
    }
  };

  const goToPrevChapter = () => {
    if (safeChapterIndex > 0) {
      const prevCh = book.chapters[safeChapterIndex - 1];
      onUpdatePosition({
        bookId: book.id,
        chapterId: prevCh.id,
        paragraphIndex: 0,
      });
      setIsPlayingAudio(false);
      setAiSimplifyOverlay(null);
    }
  };

  // Draggable reading ruler helper via mouse clicks or keys
  const moveRulerUp = () => setRulerTop((t) => Math.max(100, t - 20));
  const moveRulerDown = () => setRulerTop((t) => Math.min(800, t + 20));

  // Word Assistant Click Helper (Splits sentences safely and triggers popup)
  const handleWordClick = (word: string) => {
    // Sanitize word formatting
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").toLowerCase().trim();
    setSelectedWord(word);
    
    // Look up in dictionary, or generate basic phonetic support
    if (WORD_DICTIONARY[cleanWord]) {
      setWordDetails(WORD_DICTIONARY[cleanWord]);
    } else {
      setWordDetails({
        definition: `The word or concept describing this point in the sentence.`,
        pronunciation: `${cleanWord}-in-place`,
        simple: `Refers to: ${cleanWord}. Tap "Ask AI Detail" below to explore its deep literary meaning instantly.`,
        example: `We read ${cleanWord} with custom assistive configurations.`,
      });
    }
    setActiveSideDrawer("dictionary");
  };

  // Real interactive browser-native Speech Synthesis (Read Aloud) with live sentence tracking
  useEffect(() => {
    // Graceful check for server-side render or non-supported browser contexts
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    if (isPlayingAudio) {
      const pText = activeChapter.content[activeParagraphIndex] || "";
      // Splitting paragraph into sentences
      const sentences = pText.match(/[^.!?]+[.!?]+(\s|$)/g) || [pText];

      if (highlightedSentenceIndex >= sentences.length) {
        setHighlightedSentenceIndex(0);
        return;
      }

      const activeText = sentences[highlightedSentenceIndex].trim();

      if (activeText) {
        // Immediate cancel prior spoken queue to avoid cumulative latency
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(activeText);
        utterance.rate = audioSpeed;

        // Auto select preferred user-selected voice, or a beautiful English custom voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = 
          (preferences.narratorVoice ? voices.find(v => v.name === preferences.narratorVoice) : null) ||
          voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) ||
          voices.find(v => v.lang.startsWith("en")) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Set callbacks for synchronization
        utterance.onend = () => {
          if (highlightedSentenceIndex < sentences.length - 1) {
            setHighlightedSentenceIndex((prev) => prev + 1);
          } else {
            // End of active paragraph block. Advance position in document context
            if (activeParagraphIndex < activeChapter.content.length - 1) {
              onUpdatePosition({
                ...currentPosition,
                paragraphIndex: activeParagraphIndex + 1,
              });
              setHighlightedSentenceIndex(0);
            } else {
              // Reached final sentence of active chapter! Pause audio controls safely
              setIsPlayingAudio(false);
              setHighlightedSentenceIndex(0);
            }
          }
        };

        utterance.onerror = (e) => {
          console.warn("Nara Read Aloud Speech issue:", e);
          // Prevent stuck speech loops on interrupt signals
          if (e.error !== "interrupted" && e.error !== "canceled") {
            // For other rare browser errors, advance manually after a safe delay
            const failTimeout = setTimeout(() => {
              if (highlightedSentenceIndex < sentences.length - 1) {
                setHighlightedSentenceIndex((prev) => prev + 1);
              } else if (activeParagraphIndex < activeChapter.content.length - 1) {
                onUpdatePosition({
                  ...currentPosition,
                  paragraphIndex: activeParagraphIndex + 1,
                });
                setHighlightedSentenceIndex(0);
              } else {
                setIsPlayingAudio(false);
                setHighlightedSentenceIndex(0);
              }
            }, 1200);
            return () => clearTimeout(failTimeout);
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isPlayingAudio, highlightedSentenceIndex, activeParagraphIndex, activeChapter, audioSpeed]);

  // Premium AI Feature: Simplify language of paragraph
  const handleSimplifyParagraph = async (pIndex: number, text: string) => {
    // Already simplified? Dismiss it.
    if (aiSimplifyOverlay && aiSimplifyOverlay.paragraphIndex === pIndex) {
      setAiSimplifyOverlay(null);
      return;
    }

    setAiSimplifyLoading(true);
    try {
      const res = await fetch("/api/ai/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setAiSimplifyOverlay({
        paragraphIndex: pIndex,
        simplifiedText: data.simplifiedText || text,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAiSimplifyLoading(false);
    }
  };

  // Premium AI Feature: Explain text range or term
  const handleExplainText = async (customText?: string) => {
    const textToExplain = customText || aiExplainText || selectedWord || "";
    if (!textToExplain.trim()) return;

    setAiExplainLoading(true);
    setActiveSideDrawer("aichat");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: textToExplain,
          context: activeChapter.content.join(" ")
        }),
      });
      const data = await res.json();
      setAiExplainOutput(data.explanation || "No explanation returned from reading assistant.");
    } catch (err) {
      console.error(err);
      setAiExplainOutput("Unable to connect to reading assistant offline.");
    } finally {
      setAiExplainLoading(false);
    }
  };

  // Premium AI Feature: Summarize chapter
  const handleSummarizeChapter = async () => {
    setAiSummaryLoading(true);
    setShowSummaryModal(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: activeChapter.title,
          paragraphs: activeChapter.content 
        }),
      });
      const data = await res.json();
      setAiSummaryOutput(data.chapterSummary);
    } catch (err) {
      console.error(err);
      setAiSummaryOutput({
        keyIdeas: ["Getting started can feel difficult.", "Use focus mode to anchor your eyes."],
        mainEvents: ["The readers customizes their setup first.", "Each segment holds basic learning terms."],
        characterUpdates: ["All characters continue forward smoothly."]
      });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Fast Bookmark handler
  const triggerAddBookmark = () => {
    const activeText = activeChapter.content[activeParagraphIndex] || "";
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      bookId: book.id,
      chapterId: activeChapter.id,
      paragraphIndex: activeParagraphIndex,
      textSnippet: activeText.slice(0, 70) + "...",
      timestamp: Date.now(),
    };
    onAddBookmark(newBookmark);
  };

  // Utility to highlight active sentence inside active paragraph block
  const renderSentenceSpans = (text: string, isCurrentParagraph: boolean) => {
    // Splitting text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    
    return sentences.map((sentence, idx) => {
      const words = sentence.split(" ");
      const isHighlightedSentence = isCurrentParagraph && isPlayingAudio && idx === highlightedSentenceIndex;

      return (
        <span 
          key={idx}
          className={`transition-all rounded-sm px-1 inline ${
            isHighlightedSentence 
              ? "bg-[#FFE082]/90 text-[#3E2723] font-bold shadow-sm" 
              : ""
          }`}
        >
          {words.map((word, wIdx) => {
            // Check if is the first word highlighting inside sentence (simulates dynamic read progression)
            const cleanWord = word.replace(/[^\w]/g, "");
            return (
              <span
                key={wIdx}
                onClick={() => handleWordClick(word)}
                className="hover:underline focus:bg-indigo-100 cursor-pointer inline-block mx-0.5"
                role="button"
                tabIndex={0}
                aria-label={`Word assistance for ${cleanWord}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleWordClick(word);
                  }
                }}
              >
                {word}{" "}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div id="reader-shell" className="min-h-screen bg-[#F0EDE5] text-[#222222] font-sans flex flex-col relative">
      
      {/* 1. Header with minimalist Nara Logo style */}
      <header className="h-16 border-b border-[#DCD9D0] px-6 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 text-xs font-black uppercase text-[#666666] hover:text-[#222222] transition-colors border border-[#DCD9D0] px-3 py-2 bg-white rounded-xl touch-target"
            aria-label="Return to library shelf"
          >
            <ArrowLeft className="w-4 h-4 text-[#5B8FB9]" />
            <span>Library Shelf</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <NaraLogo showText={true} size="sm" />
          </div>
        </div>

        <div className="text-center font-bold text-xs truncate max-w-sm">
          <span className="text-[#666666]">{book.title}</span> &bull; <span className="text-[#5B8FB9]">{activeChapter.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Draggable physical ruler toggle */}
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
              showRuler ? "bg-[#5B8FB9] text-white border-[#5B8FB9]" : "bg-white text-[#666666] border-[#DCD9D0]"
            } hover:bg-gray-50`}
            title="Toggle Reading Ruler Guide"
            aria-label="Toggle Reading Ruler Guide"
          >
            <Ruler className="w-5 h-5" />
          </button>

          {/* Summarize chapter trigger */}
          <button
            onClick={handleSummarizeChapter}
            className="bg-[#5B8FB9]/10 text-[#5B8FB9] border border-[#5B8FB9]/30 hover:bg-[#5B8FB9]/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            title="AI Memory Summarizer"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Chapter Summary</span>
          </button>
        </div>
      </header>

      {/* 2. Interactive Reader Layout Block */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-4 py-8 gap-8 items-start">
        
        {/* Left main interactive reading column (Max 700px nested) */}
        <main className="col-span-1 lg:col-span-8 flex flex-col items-center">
          
          {/* Chapter Quick Selector card */}
          <div className="w-full max-w-[700px] bg-white border border-[#DCD9D0] rounded-2xl p-4 mb-6 flex justify-between items-center shadow-sm">
            <button
              onClick={goToPrevChapter}
              disabled={safeChapterIndex === 0}
              className="p-2 border border-[#DCD9D0] rounded-xl hover:bg-gray-100 disabled:opacity-40"
              aria-label="Go to previous chapter"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-[#666666] tracking-widest">Active Chapter</p>
              <p className="text-sm font-bold mt-0.5">{activeChapter.title}</p>
            </div>
            
            <button
              onClick={goToNextChapter}
              disabled={safeChapterIndex === book.chapters.length - 1}
              className="p-2 border border-[#DCD9D0] rounded-xl hover:bg-gray-100 disabled:opacity-40"
              aria-label="Go to next chapter"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bookmarking notification or interactive button */}
          <div className="w-full max-w-[700px] flex justify-end gap-2 mb-3">
            <button
              onClick={triggerAddBookmark}
              className="text-xs bg-white text-[#222222] border border-[#DCD9D0] hover:bg-gray-50 flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold"
            >
              <BookmarkIcon className="w-4 h-4 text-[#5B8FB9]" />
              <span>Bookmark spot</span>
            </button>
          </div>

          {/* Draggable Reading Guide Ruler segment when active */}
          {showRuler && (
            <div
              className="absolute left-0 right-0 h-6 bg-yellow-300/40 border-y-2 border-yellow-400 z-10 flex items-center justify-between px-12 pointer-events-none reading-ruler-line"
              style={{ top: `${rulerTop}px` }}
            >
              <span className="text-[9px] uppercase font-bold text-yellow-950 tracking-wider">Assistive Focus line</span>
              <div className="flex gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={moveRulerUp}
                  className="bg-white/80 p-1 text-xs font-black rounded hover:bg-white text-black"
                  aria-label="Move reading guide up"
                >
                  &uarr; Up
                </button>
                <button
                  type="button"
                  onClick={moveRulerDown}
                  className="bg-white/80 p-1 text-xs font-black rounded hover:bg-white text-black"
                  aria-label="Move reading guide down"
                >
                  &darr; Down
                </button>
              </div>
            </div>
          )}

          {/* TEXT CANVAS CONTAINER: 700px width limit, centering text formatting, custom overlays */}
          <div
            id="reading-canvas"
            className={`w-full max-w-[700px] p-8 md:p-12 rounded-3xl border transition-all shadow-sm ${
              themeClasses[preferences.theme]
            } relative overflow-hidden`}
          >
            {/* Visual Focus Modes Masks */}
            {focusMode === "window" && (
              <div className="absolute inset-x-0 h-full pointer-events-none z-10 flex flex-col justify-between">
                <div className="bg-black/75 h-[160px] w-full border-b border-yellow-500/30" />
                <div className="bg-black/75 h-[160px] w-full border-t border-yellow-500/30" />
              </div>
            )}

            <div className="space-y-8 relative z-20">
              {activeChapter.content.map((paragraphText, pIndex) => {
                const isActiveP = pIndex === activeParagraphIndex;
                const isSimplifyApplied = aiSimplifyOverlay && aiSimplifyOverlay.paragraphIndex === pIndex;

                // Opacity changes depending on focus tools:
                let pOpacity = "opacity-100";
                if (focusMode === "paragraph") {
                  pOpacity = isActiveP ? "opacity-100" : "opacity-25 blur-[0.5px]";
                } else if (focusMode === "window") {
                  pOpacity = isActiveP ? "opacity-100" : "opacity-10 pointer-events-none";
                }

                return (
                  <div
                    key={pIndex}
                    onClick={() => {
                      onUpdatePosition({
                        ...currentPosition,
                        paragraphIndex: pIndex,
                      });
                      setHighlightedSentenceIndex(0);
                    }}
                    className={`p-4 rounded-xl transition-all border ${
                      isActiveP
                        ? "border-[#5B8FB9]/50 bg-[#5B8FB9]/5 ring-1 ring-[#5B8FB9]/10"
                        : "border-transparent"
                    } ${pOpacity}`}
                  >
                    {/* Paragraph visual control pill panel for premium AI tasks */}
                    {isActiveP && (
                      <div className="flex items-center gap-1.5 mb-3 bg-white/60 dark:bg-black/20 w-fit p-1 rounded-lg border border-black/5">
                        <button
                          onClick={() => handleSimplifyParagraph(pIndex, paragraphText)}
                          className="text-[10px] uppercase font-black tracking-wider text-[#5B8FB9] hover:bg-slate-100 px-2 py-1 rounded"
                          disabled={aiSimplifyLoading}
                          title="Simplify with Gemini AI"
                        >
                          {aiSimplifyLoading ? "Analyzing..." : isSimplifyApplied ? "Show Original" : "Simplify language ✨"}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleExplainText(paragraphText)}
                          className="text-[10px] uppercase font-black tracking-wider text-green-700 hover:bg-green-50 px-2 py-1 rounded"
                          title="AI Explains meanings"
                        >
                          Explain Passage
                        </button>
                      </div>
                    )}

                    {/* Paragraph Text with integrated custom sizing & line spacing */}
                    {isSimplifyApplied ? (
                      <div className="space-y-2 p-2.5 bg-yellow-100/10 border-l-4 border-amber-600 pl-4 rounded-r-lg">
                        <span className="text-[9px] uppercase font-black text-amber-800 tracking-widest block">Simpler Language (Gemini AI output)</span>
                        <p
                          style={{
                            fontSize: `${preferences.textSize}px`,
                            lineHeight: preferences.lineSpacing,
                          }}
                          className={`${textFontStyles[preferences.font]}`}
                        >
                          {aiSimplifyOverlay.simplifiedText}
                        </p>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: `${preferences.textSize}px`,
                          lineHeight: preferences.lineSpacing,
                        }}
                        className={`${textFontStyles[preferences.font]} tracking-wide`}
                      >
                        {renderSentenceSpans(paragraphText, isActiveP)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Bottom reader navigation and physical metrics indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-center max-w-[700px] w-full mt-4 text-xs font-bold text-[#666666] px-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-white border border-[#DCD9D0] rounded-lg">Difficulty: {book.difficulty}</span>
              <span className="px-2 py-1 bg-white border border-[#DCD9D0] rounded-lg">Estimated Reading Time: {book.reading_time}m</span>
            </div>
            <div className="text-center sm:text-right">
              Progress: Paragraph {activeParagraphIndex + 1} of {activeChapter.content.length}
            </div>
          </div>
        </main>

        {/* Right side companion columns: Stats panels, preferences, and lists */}
        <aside id="cognitive-dock animate-fadeIn" className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Audio read-along assist trigger panel */}
          <div className="bg-white border border-[#DCD9D0] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-extrabold text-[#777777] tracking-widest flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-[#5B8FB9]" /> Narrator Companion
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Active Sync</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[#555555]">
                Highlights update dynamically as you read. Auto-scroll anchors your eyes safely.
              </p>

              <div className="flex items-center justify-center gap-3 py-1">
                {/* Narrator Playback Controls */}
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center text-white font-bold hover:scale-105 transition-all ${
                    isPlayingAudio ? "bg-amber-600 hover:bg-amber-700" : "bg-[#5B8FB9] hover:bg-[#4C7C9E]"
                  }`}
                  aria-label={isPlayingAudio ? "Pause live speech synthesis" : "Play live speech synthesis"}
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                {/* Narrator Speed Multiplier */}
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase text-[#888888]">Voice Speed</span>
                  <select
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    className="mt-1 text-xs font-black bg-[#F7F4EE] border border-[#DCD9D0] p-1.5 rounded-lg"
                  >
                    <option value="0.75">0.75x Slow</option>
                    <option value="1.0">1.0x Normal</option>
                    <option value="1.25">1.25x Comfort</option>
                    <option value="1.5">1.5x Fast</option>
                    <option value="1.75">1.75x Speed</option>
                    <option value="2.0">2.0x ADHD Tempo</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Voice Select */}
              <div className="mt-3 pt-3 border-t border-[#DCD9D0]/50">
                <span className="text-[9px] font-bold uppercase text-[#888888] flex items-center gap-1 mb-1">
                  <User className="w-3.5 h-3.5 text-[#5B8FB9]" /> Choose Narrator Voice
                </span>
                <select
                  value={preferences.narratorVoice || ""}
                  onChange={(e) => onUpdatePreferences({ ...preferences, narratorVoice: e.target.value })}
                  className="w-full text-xs bg-[#F7F4EE] border border-[#DCD9D0] p-1.5 rounded-lg font-bold text-stone-700 truncate"
                >
                  <option value="">Default Human Reader</option>
                  {availableVoices.map((voice, idx) => (
                    <option key={idx} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick interactive Focus Modes block */}
          <div className="bg-[#FFFDEB] border border-[#EBE6C2] rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase text-[#777777] tracking-widest mb-4 flex items-center gap-1">
              <Highlighter className="w-4 h-4 text-amber-700" /> Sensory Focus Modes
            </h3>

            <p className="text-[11px] text-[#5A5636] leading-relaxed mb-4">
              Switch physical visual overlays, isolates rows, and centers cognitive focus parameters.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "normal", label: "Normal Off", desc: "Show full chapter layout" },
                { id: "paragraph", label: "P. Focus", desc: "Highlights current block" },
                { id: "line", label: "Line Focus", desc: "Emphasis single horizontal" },
                { id: "window", label: "Read Window", desc: "Dims adjacent rows" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFocusMode(f.id as FocusModeType)}
                  className={`text-left p-3 rounded-xl border text-xs transition-colors ${
                    focusMode === f.id
                      ? "bg-amber-200/50 border-amber-500 font-extrabold"
                      : "bg-white border-[#DCD9D0] hover:bg-gray-50"
                  }`}
                >
                  <p>{f.label}</p>
                  <p className="text-[9px] text-[#888888] font-normal mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Side Drawer Switch Triggers: Memory Cards, AI, Dictionary */}
          <div className="bg-white border border-[#DCD9D0] rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase text-[#666666] tracking-widest">
              Reader Support Drawers
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveSideDrawer(activeSideDrawer === "memory" ? "none" : "memory")}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold ${
                  activeSideDrawer === "memory" ? "border-[#5B8FB9] bg-slate-50" : "border-[#DCD9D0]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#5B8FB9]" /> Memory Support Cards
                </span>
                <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded font-black text-[#5B8FB9]">
                  {book.characters.length + book.concepts.length} active
                </span>
              </button>

              <button
                onClick={() => setActiveSideDrawer(activeSideDrawer === "aichat" ? "none" : "aichat")}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold ${
                  activeSideDrawer === "aichat" ? "border-green-600 bg-green-50/20" : "border-[#DCD9D0]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-700" /> Ask AI Language Assistant
                </span>
                <span className="text-[10px] bg-green-50 px-2 py-0.5 rounded font-black text-green-700">Open</span>
              </button>
            </div>

            {/* Render selected drawer content here inside the column for clean desktop layouts */}
            {activeSideDrawer === "memory" && (
              <div className="pt-2 border-t mt-2 space-y-4 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black">Story Anchor Cards</span>
                  <button onClick={() => setActiveSideDrawer("none")} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {book.characters.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-[#888888] tracking-widest">Character Profiles</p>
                    {book.characters.map((char, index) => (
                      <div key={index} className="p-3 bg-[#EEF5FA] rounded-xl border border-[#D0DFEB] text-xs">
                        <p className="font-bold text-[#1B2A4A]">{char.name}</p>
                        <p className="text-[10px] font-semibold text-[#5B8FB9] mt-0.5 uppercase tracking-wider">{char.role}</p>
                        <p className="text-[11px] text-[#444444] mt-1.5"><span className="font-bold">Relationships:</span> {char.relationships}</p>
                        <p className="text-[11px] text-[#444444] mt-1"><span className="font-bold">Recent Storyline:</span> {char.events}</p>
                      </div>
                    ))}
                  </div>
                )}

                {book.concepts.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-[#888888] tracking-widest">Concept Anchors</p>
                    {book.concepts.map((conc, index) => (
                      <div key={index} className="p-3 bg-[#FDFBF2] rounded-xl border border-[#DFCEB3] text-xs">
                        <p className="font-bold text-amber-900">{conc.term}</p>
                        <p className="text-[11px] text-[#555555] mt-1 italic">&ldquo;{conc.definition}&rdquo;</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conc.keyTerms.map((kw, i) => (
                            <span key={i} className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">{kw}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {book.characters.length === 0 && book.concepts.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-4">No companion cards loaded for this category.</p>
                )}
              </div>
            )}

            {activeSideDrawer === "aichat" && (
              <div className="pt-2 border-t mt-2 space-y-4 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-green-950 flex items-center gap-1"><Sparkles className="w-4 h-4 text-green-700" /> Explain Section</span>
                  <button onClick={() => setActiveSideDrawer("none")} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-[#666666]">
                    Type any phrase or paste a paragraph below. Or select text directly to receive a simple language breakdown.
                  </p>
                  
                  <textarea
                    rows={3}
                    value={aiExplainText}
                    onChange={(e) => setAiExplainText(e.target.value)}
                    placeholder="Enter unfamiliar terms or idioms here..."
                    className="w-full text-xs p-2.5 border border-[#DCD9D0] rounded-xl focus:outline-none"
                  />

                  <button
                    onClick={() => handleExplainText()}
                    disabled={aiExplainLoading || !aiExplainText.trim()}
                    className="w-full py-2 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 disabled:opacity-40"
                  >
                    {aiExplainLoading ? "AI Coach compiling..." : "Ask AI Explanation"}
                  </button>

                  {aiExplainOutput && (
                    <div className="p-3 bg-green-50/50 rounded-xl border border-green-200 text-green-900 leading-relaxed max-h-[220px] overflow-y-auto">
                      <p className="font-bold text-[10px] uppercase text-green-800 mb-1">AI Coach Output:</p>
                      <p className="text-[11px] whitespace-pre-line">{aiExplainOutput}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSideDrawer === "dictionary" && (
              <div className="pt-2 border-t mt-2 space-y-3 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-amber-900">Word Assistance</span>
                  <button onClick={() => setActiveSideDrawer("none")} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {wordDetails && (
                  <div className="text-xs space-y-2.5">
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="font-bold text-amber-950 text-base italic">&#47; {selectedWord} &#47;</p>
                      <p className="text-[10px] text-[#5B8FB9] tracking-wider font-mono mt-0.5">&ldquo;{wordDetails.pronunciation}&rdquo;</p>
                    </div>

                    <div>
                      <p className="font-black text-[10px] uppercase text-amber-800">Friendly Explanation:</p>
                      <p className="text-[#444444] mt-0.5 text-xs font-bold bg-[#FFFDEB] p-2 rounded-lg border border-[#EBE6C2]">{wordDetails.simple}</p>
                    </div>

                    <div>
                      <p className="font-black text-[10px] uppercase text-gray-500">Dictionary Definition:</p>
                      <p className="text-gray-600 mt-0.5 font-light leading-relaxed">{wordDetails.definition}</p>
                    </div>

                    <div>
                      <p className="font-black text-[10px] uppercase text-black">Example Sentence:</p>
                      <p className="text-[#222222] mt-0.5 italic">{wordDetails.example}</p>
                    </div>

                    <button
                      onClick={() => handleExplainText(selectedWord || "")}
                      className="w-full mt-2 py-2 bg-[#5B8FB9] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#4C7C9E] transition-colors"
                      title="Generate deep AI help"
                    >
                      Ask AI Advanced Literature Detail
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Reader Layout Sticky Accessibility controls (Thumb reachable bottom toolbar) */}
      <footer className="bg-white border-t border-[#DCD9D0] p-4 sticky bottom-0 z-40 shadow-lg mt-auto">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowToolbarSettings(!showToolbarSettings)}
              className={`p-3 rounded-xl border flex items-center justify-center font-bold text-xs gap-1.5 transition-colors ${
                showToolbarSettings ? "bg-[#5B8FB9] text-white border-[#5B8FB9]" : "bg-white text-[#222222] border-[#DCD9D0]"
              }`}
              title="Scale sizes and fonts"
            >
              <Sliders className="w-4 h-4" />
              <span>Aesthetics Tool</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#EEF5FA] p-1 rounded-full border border-[#D0DFEB]">
            <span>&nbsp;</span>
            <div className="text-xs uppercase font-extrabold text-[#1B2A4A] tracking-wider pr-2 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-[#5B8FB9]" /> Focus block:&nbsp;
              <span className="text-[#5B8FB9] font-black">{focusMode}</span>
            </div>
          </div>

          {/* Mobile direct audio triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1 hover:brightness-105"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingAudio ? "Pause" : "Listen along"}</span>
            </button>
          </div>
        </div>

        {/* Floating Settings Panel underneath Toolbar when clicked */}
        {showToolbarSettings && (
          <div className="max-w-4xl mx-auto mt-4 p-4 bg-gray-50 border border-[#DCD9D0] rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase text-[#666666]">Read Typography</p>
              <div className="grid grid-cols-2 gap-1 mt-1.5">
                {["Lexend", "OpenDyslexic", "Atkinson", "Inter"].map((f) => (
                  <button
                    key={f}
                    onClick={() => onUpdatePreferences({ ...preferences, font: f as any })}
                    className={`p-1.5 border rounded-lg text-xs font-bold text-left truncate ${
                      preferences.font === f ? "border-[#5B8FB9] bg-white text-[#5B8FB9]" : "border-gray-200 bg-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase text-[#666666]">Scale size ({preferences.textSize}px)</p>
              <input
                type="range"
                min="16"
                max="36"
                value={preferences.textSize}
                onChange={(e) => onUpdatePreferences({ ...preferences, textSize: parseInt(e.target.value) })}
                className="w-full mt-2 accent-[#5B8FB9]"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase text-[#666666]">Spacing ({preferences.lineSpacing}x)</p>
              <input
                type="range"
                min="1.2"
                max="2.5"
                step="0.1"
                value={preferences.lineSpacing}
                onChange={(e) => onUpdatePreferences({ ...preferences, lineSpacing: parseFloat(e.target.value) })}
                className="w-full mt-2 accent-[#5B8FB9]"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase text-[#666666]">Theme contrast</p>
              <div className="flex gap-1.5 mt-2">
                {(["cream", "yellow", "blue", "sepia", "dark"] as any[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdatePreferences({ ...preferences, theme: t })}
                    className={`w-6 h-6 rounded-full border ${
                      preferences.theme === t ? "ring-2 ring-[#5B8FB9]" : ""
                    }`}
                    style={{
                      backgroundColor:
                        t === "cream"
                          ? "#F7F4EE"
                          : t === "yellow"
                          ? "#FFFDE5"
                          : t === "blue"
                          ? "#EEF5FA"
                          : t === "sepia"
                          ? "#F4EAD4"
                          : "#1E1F22",
                    }}
                    title={themeConfigNames[t as ThemeOption]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* 4. Interactive Full Screen Overlays: AI Chapter Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#DCD9D0] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded tracking-widest">Premium AI Support</span>
                <h3 className="text-xl font-extrabold text-[#222222] mt-1">
                  Memory Enhancing Summarizer: {activeChapter.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setAiSummaryOutput(null);
                }}
                className="p-1 border text-[#666666] border-[#DCD9D0] hover:text-[#222222] rounded-xl bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiSummaryLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-10 h-10 border-4 border-[#E5E1D8] border-t-[#5B8FB9] rounded-full animate-spin" />
                <p className="text-xs text-[#555555] font-semibold">Gemini AI compiling chapter elements, key updates, and character tracking...</p>
              </div>
            ) : aiSummaryOutput ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase font-extrabold text-[#5B8FB9] tracking-widest mb-2 flex items-center gap-1">
                    <Smile className="w-4 h-4" /> Key Narrative Concepts
                  </h4>
                  <ul className="list-disc pl-5 text-sm leading-relaxed text-[#333333] space-y-1.5">
                    {aiSummaryOutput.keyIdeas.map((idea, idx) => (
                      <li key={idx}>{idea}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-extrabold text-[#5B8FB9] tracking-widest mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4" /> Main Storyline Events
                  </h4>
                  <ul className="list-decimal pl-5 text-sm leading-relaxed text-[#444444] space-y-1.5">
                    {aiSummaryOutput.mainEvents.map((evt, idx) => (
                      <li key={idx}><span className="font-bold">Fact {idx + 1}:</span> {evt}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-extrabold text-amber-800 tracking-widest mb-2 flex items-center gap-1">
                    <User className="w-4 h-4 text-amber-800" /> Character State Changes
                  </h4>
                  <ul className="list-disc pl-5 text-sm leading-relaxed text-[#444444] space-y-1.5">
                    {aiSummaryOutput.characterUpdates.map((update, idx) => (
                      <li key={idx} className="italic">&ldquo;{update}&rdquo;</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-gray-400 py-6">Failed to yield summary.</div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setAiSummaryOutput(null);
                }}
                className="px-6 py-2.5 bg-[#222222] text-white text-xs font-black uppercase rounded-xl hover:bg-slate-800"
              >
                Close Anchor Overview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
