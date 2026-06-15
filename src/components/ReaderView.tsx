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
  // Safe defaults for new prefs — backward compatible with old saved preferences
  const safePrefs = {
    ...preferences,
    letterSpacing: preferences.letterSpacing ?? 0.05,
    wordSpacing: preferences.wordSpacing ?? 0.1,
    bionicReading: preferences.bionicReading ?? false,
    syllableBreaking: preferences.syllableBreaking ?? false,
  };
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
  const [simplifyLevel, setSimplifyLevel] = useState<"little" | "lot" | "child">("little");

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
    cream: "bg-[#F7F4EE] text-[#111111] border-[#C5C2B8]",
    yellow: "bg-[#FFFDE5] text-[#000000] border-[#D2CCA9]",
    blue: "bg-[#EEF5FA] text-[#0A192F] border-[#AFC3D4]",
    sepia: "bg-[#F4EAD4] text-[#2D1910] border-[#CCD2B8]",
    dark: "bg-[#1E1F22] text-[#FFFFFF] border-[#383A40]",
  };

  const themeConfigNames = {
    cream: "Organic Cream",
    yellow: "Soft Yellow",
    blue: "Soft Ice Blue",
    sepia: "Classic Sepia",
    dark: "Midnight Grey / Dark",
  };

  const isDark = preferences.theme === "dark";
  const isYellow = preferences.theme === "yellow";
  const isBlue = preferences.theme === "blue";
  const isSepia = preferences.theme === "sepia";

  // Dynamic system style lookups for entire workspace Shell
  const shellBgClass = isDark 
    ? "bg-[#121214] text-[#E1E4EA]" 
    : isYellow 
    ? "bg-[#FFFDE5] text-[#1D1B11]" 
    : isBlue 
    ? "bg-[#EEF5FA] text-[#1B2A4A]" 
    : isSepia 
    ? "bg-[#F4EAD4] text-[#3E2723]" 
    : "bg-[#F7F4EE] text-[#111111]"; // Organic Cream

  const headerBgClass = isDark 
    ? "bg-[#1C1E22]/90 border-[#2D3139] text-[#FFFFFF]" 
    : isYellow 
    ? "bg-[#FFFDE5]/90 border-[#D2CCA9] text-[#000000]" 
    : isBlue 
    ? "bg-[#EEF5FA]/90 border-[#AFC3D4] text-[#0A192F]" 
    : isSepia 
    ? "bg-[#F4EAD4]/90 border-[#CCD2B8] text-[#2D1910]" 
    : "bg-white/90 border-[#DCD9D0] text-[#111111]";

  const cardBgClass = isDark 
    ? "bg-[#1A1D21] border-[#2D3139] text-[#E1E4EA]" 
    : isYellow 
    ? "bg-white border-[#E8E3CD]" 
    : isBlue 
    ? "bg-white border-[#D0DFEB]" 
    : isSepia 
    ? "bg-[#FDFBF4] border-[#DFCEB3]" 
    : "bg-white border-[#DCD9D0]";

  const buttonClass = isDark
    ? "bg-[#252830] text-[#E1E4EA] hover:bg-[#323642] border-[#2D3139]"
    : isSepia
    ? "bg-[#FDFBF4] text-[#3E2723] hover:bg-[#ECE0C6] border-[#DFCEB3]"
    : "bg-white text-stone-700 hover:bg-stone-50 border-[#DCD9D0]";

  const labelClass = isDark ? "text-[#BAC1CC]" : "text-[#555555]";
  const mutedTextClass = isDark ? "text-[#A5AAB5]" : "text-[#666666]";
  const textPrimary = isDark ? "text-white" : isYellow ? "text-black" : isBlue ? "text-[#0A192F]" : isSepia ? "text-[#2D1910]" : "text-[#111111]";
  const textSecondary = isDark ? "text-[#BAC1CC]" : isYellow ? "text-[#2F2A15]" : isBlue ? "text-[#1E2D4A]" : isSepia ? "text-[#4A3525]" : "text-[#444444]";
  const textTertiary = isDark ? "text-[#7B818F]" : isYellow ? "text-[#5D5030]" : isBlue ? "text-[#4A5B7E]" : isSepia ? "text-[#6D5A4E]" : "text-[#666666]";

  // Chapter Navigation Handler
  const goToNextChapter = () => {
    if (safeChapterIndex < book.chapters.length - 1) {
      const nextCh = book.chapters[safeChapterIndex + 1];
      // Update local state immediately — don't wait for Firestore
      const newPos = { bookId: book.id, chapterId: nextCh.id, paragraphIndex: 0 };
      onUpdatePosition(newPos);
      // Also force local display to reset
      setHighlightedSentenceIndex(0);
      setIsPlayingAudio(false);
      setAiSimplifyOverlay(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevChapter = () => {
    if (safeChapterIndex > 0) {
      const prevCh = book.chapters[safeChapterIndex - 1];
      const newPos = { bookId: book.id, chapterId: prevCh.id, paragraphIndex: 0 };
      onUpdatePosition(newPos);
      setHighlightedSentenceIndex(0);
      setIsPlayingAudio(false);
      setAiSimplifyOverlay(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  if (isPlayingAudio) {
    const pText = activeChapter.content[activeParagraphIndex] || "";
    const sentences = pText.match(/[^.!?]+[.!?]+(\s|$)/g) || [pText];

    if (highlightedSentenceIndex >= sentences.length) {
      setHighlightedSentenceIndex(0);
      return;
    }

    // Speak remaining sentences as one queued block — no cancel() between them
    const remaining = sentences.slice(highlightedSentenceIndex);
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const scored = [...voices]
      .filter(v => v.lang.toLowerCase().startsWith("en"))
      .sort((a, b) => {
        const score = (n: string) => {
          let s = 0;
          if (n.includes("natural") || n.includes("online")) s += 20;
          if (n.includes("google")) s += 12;
          if (n.includes("premium") || n.includes("alex")) s += 10;
          if (n.includes("samantha") || n.includes("daniel") || n.includes("jenny")) s += 5;
          return s;
        };
        return score(b.name.toLowerCase()) - score(a.name.toLowerCase());
      });

    const preferredVoice =
      (preferences.narratorVoice ? voices.find(v => v.name === preferences.narratorVoice) : null) ||
      scored[0] ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0];

    remaining.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.rate = audioSpeed;
      utterance.pitch = 1.05;
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => {
        const absoluteIndex = highlightedSentenceIndex + i;
        if (absoluteIndex < sentences.length - 1) {
          setHighlightedSentenceIndex(absoluteIndex + 1);
        } else {
          if (activeParagraphIndex < activeChapter.content.length - 1) {
            onUpdatePosition({ ...currentPosition, paragraphIndex: activeParagraphIndex + 1 });
            setHighlightedSentenceIndex(0);
          } else {
            setIsPlayingAudio(false);
            setHighlightedSentenceIndex(0);
          }
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          const absoluteIndex = highlightedSentenceIndex + i;
          setTimeout(() => {
            if (absoluteIndex < sentences.length - 1) {
              setHighlightedSentenceIndex(absoluteIndex + 1);
            } else if (activeParagraphIndex < activeChapter.content.length - 1) {
              onUpdatePosition({ ...currentPosition, paragraphIndex: activeParagraphIndex + 1 });
              setHighlightedSentenceIndex(0);
            } else {
              setIsPlayingAudio(false);
              setHighlightedSentenceIndex(0);
            }
          }, 1200);
        }
      };

      window.speechSynthesis.speak(utterance);
    });

  } else {
    window.speechSynthesis.cancel();
  }

  return () => { window.speechSynthesis.cancel(); };
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
      const levelPrompt: Record<string, string> = {
        little: "Rewrite this passage with slightly simpler vocabulary and shorter sentences. Keep the same tone. Return only the rewritten text, nothing else.",
        lot: "Rewrite this passage using very simple words and short sentences. Remove complex ideas. Return only the rewritten text, nothing else.",
        child: "Rewrite this passage as if explaining it to a 10-year-old. Use simple everyday words, short sentences, and a friendly tone. Return only the rewritten text, nothing else.",
      };
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: `${levelPrompt[simplifyLevel]}\n\nPassage: "${text}"` }]
        }),
      });
      const data = await res.json();
      const simplifiedText = data.content?.[0]?.text || text;
      setAiSimplifyOverlay({ paragraphIndex: pIndex, simplifiedText });
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
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a warm, encouraging reading coach helping a dyslexic reader. Explain this text in simple, friendly language using short sentences.\n\nText: "${textToExplain}"\n\nContext: "${activeChapter.content.slice(0, 2).join(" ")}"`
          }]
        }),
      });
      const data = await res.json();
      setAiExplainOutput(data.content?.[0]?.text || "No explanation returned from reading assistant.");
    } catch (err) {
      console.error(err);
      setAiExplainOutput("Unable to connect to reading assistant. Please check your connection.");
    } finally {
      setAiExplainLoading(false);
    }
  };

  // Premium AI Feature: Summarize chapter
  const handleSummarizeChapter = async () => {
    setAiSummaryLoading(true);
    setShowSummaryModal(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a reading coach for dyslexic readers. Summarize this book chapter in a structured JSON format. Return ONLY valid JSON, no markdown, no explanation.\n\nChapter: "${activeChapter.title}"\nContent: "${activeChapter.content.join(" ")}"\n\nReturn this exact JSON shape:\n{"chapterSummary":{"keyIdeas":["idea1","idea2","idea3"],"mainEvents":["event1","event2","event3"],"characterUpdates":["update1","update2"]}}`
          }]
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiSummaryOutput(parsed.chapterSummary);
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

  const [bookmarkToast, setBookmarkToast] = useState<boolean>(false);

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
    setBookmarkToast(true);
    setTimeout(() => setBookmarkToast(false), 2000);
  };

  // Syllable breaking — pattern-based, no library needed
  // Inserts soft hyphens using consonant cluster rules (English approximation)
  const syllabify = (word: string): string => {
    if (word.length <= 3) return word;
    const clean = word.replace(/[^a-zA-Z]/g, "");
    if (clean.length <= 3) return word;
    const vowels = "aeiouAEIOU";
    const isVowel = (ch: string) => vowels.includes(ch);
    let result = "";
    let lastBreak = 0;
    for (let i = 1; i < clean.length - 1; i++) {
      const prev = clean[i - 1];
      const curr = clean[i];
      const next = clean[i + 1];
      // Break between vowel→consonant→vowel (V-CV rule)
      if (!isVowel(prev) && isVowel(curr) && !isVowel(next) && i - lastBreak >= 2) {
        result += clean.slice(lastBreak, i) + "·";
        lastBreak = i;
      }
      // Break between two consonants between vowels (VC-CV rule)
      else if (isVowel(prev) && !isVowel(curr) && !isVowel(next) && isVowel(next) && i - lastBreak >= 2) {
        result += clean.slice(lastBreak, i + 1) + "·";
        lastBreak = i + 1;
      }
    }
    result += clean.slice(lastBreak);
    // Preserve punctuation from original word
    const punctBefore = word.match(/^[^a-zA-Z]*/)?.[0] || "";
    const punctAfter = word.match(/[^a-zA-Z]*$/)?.[0] || "";
    return punctBefore + result + punctAfter;
  };

  // Bionic Reading — bold first half of each word
  const renderBionicSpans = (text: string, isCurrentParagraph: boolean) => {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    return sentences.map((sentence, idx) => {
      const words = sentence.split(" ");
      const isHighlightedSentence = isCurrentParagraph && isPlayingAudio && idx === highlightedSentenceIndex;
      return (
        <span key={idx} className={`transition-all rounded-sm px-1 inline ${isHighlightedSentence ? "bg-[#FFE082]/90 text-[#3E2723] shadow-sm" : ""}`}>
          {words.map((word, wIdx) => {
            const cleanWord = word.replace(/[^\w]/g, "");
            const boldLen = Math.ceil(cleanWord.length / 2);
            const display = safePrefs.syllableBreaking ? syllabify(word) : word;
            const boldPart = display.slice(0, boldLen);
            const restPart = display.slice(boldLen);
            return (
              <span key={wIdx} onClick={() => handleWordClick(word)} className="cursor-pointer inline-block mx-0.5 hover:underline" role="button" tabIndex={0} aria-label={`Word: ${cleanWord}`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleWordClick(word); }}>
                <strong>{boldPart}</strong>{restPart}{" "}
              </span>
            );
          })}
        </span>
      );
    });
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
    <div id="reader-shell" className={`min-h-screen ${shellBgClass} font-sans flex flex-col relative transition-all duration-300`}>
      
      {/* 1. Header with minimalist Incluread Logo style */}
      <header className={`h-16 border-b px-6 flex items-center justify-between backdrop-blur-sm sticky top-0 z-40 ${headerBgClass} transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className={`flex items-center gap-1 text-xs font-black uppercase transition-all border px-3 py-2 rounded-xl touch-target ${buttonClass}`}
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
        <main className="col-span-1 lg:col-span-8 flex flex-col items-center max-w-[720px] w-full mx-auto">
          
          {/* Chapter Quick Selector card */}
          <div className={`w-full max-w-[700px] border rounded-2xl p-4 mb-6 flex justify-between items-center shadow-sm ${cardBgClass} transition-all duration-300`}>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevChapter(); }}
              disabled={safeChapterIndex === 0}
              className={`p-2 border rounded-xl disabled:opacity-40 transition-all ${buttonClass}`}
              aria-label="Go to previous chapter"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <p className={`text-[10px] font-black uppercase tracking-widest ${textTertiary}`}>Active Chapter</p>
              <p className="text-sm font-bold mt-0.5">{activeChapter.title}</p>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); goToNextChapter(); }}
              disabled={safeChapterIndex === book.chapters.length - 1}
              className={`p-2 border rounded-xl disabled:opacity-40 transition-all ${buttonClass}`}
              aria-label="Go to next chapter"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bookmarking notification or interactive button */}
          <div className="w-full max-w-[700px] flex justify-end gap-2 mb-3">
            <button
              onClick={triggerAddBookmark}
              className={`text-xs border flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${buttonClass}`}
            >
              <BookmarkIcon className="w-4 h-4 text-[#5B8FB9]" />
              <span>{bookmarkToast ? "Saved!" : "Bookmark"}</span>
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
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {!isSimplifyApplied && (
                          <div className="flex items-center gap-1 bg-white/70 border border-black/5 p-1 rounded-lg">
                            {(["little", "lot", "child"] as const).map((level) => (
                              <button key={level} onClick={(e) => { e.stopPropagation(); setSimplifyLevel(level); }}
                                className={`text-[9px] font-black px-2 py-1 rounded transition-all uppercase ${simplifyLevel === level ? "bg-[#5B8FB9] text-white" : "text-slate-400 hover:text-[#5B8FB9]"}`}>
                                {level === "little" ? "Simpler" : level === "lot" ? "Much simpler" : "Child-friendly"}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 bg-white/70 border border-black/5 p-1 rounded-lg">
                          <button onClick={(e) => { e.stopPropagation(); handleSimplifyParagraph(pIndex, paragraphText); }}
                            className="text-[10px] uppercase font-black tracking-wider text-[#5B8FB9] hover:bg-slate-100 px-2 py-1 rounded"
                            disabled={aiSimplifyLoading}>
                            {aiSimplifyLoading ? "Simplifying..." : isSimplifyApplied ? "↩ Original" : "Simplify ✨"}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button onClick={(e) => { e.stopPropagation(); handleExplainText(paragraphText); }}
                            className="text-[10px] uppercase font-black tracking-wider text-green-700 hover:bg-green-50 px-2 py-1 rounded">
                            Explain
                          </button>
                        </div>
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
                            letterSpacing: `${safePrefs.letterSpacing}em`,
                            wordSpacing: `${safePrefs.wordSpacing}em`,
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
                          letterSpacing: `${safePrefs.letterSpacing}em`,
                          wordSpacing: `${safePrefs.wordSpacing}em`,
                        }}
                        className={`${textFontStyles[preferences.font]}`}
                      >
                        {safePrefs.bionicReading
                          ? renderBionicSpans(paragraphText, isActiveP)
                          : renderSentenceSpans(paragraphText, isActiveP)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Chapter progress bar + metrics */}
          <div className="flex flex-col max-w-[700px] w-full mt-4 px-4 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-[#7B818F]" : "text-[#888888]"}`}>Chapter progress</span>
                <span className={`text-[10px] font-bold ${isDark ? "text-[#BAC1CC]" : "text-[#555555]"}`}>
                  {activeParagraphIndex + 1} / {activeChapter.content.length} · {Math.round(((activeParagraphIndex + 1) / activeChapter.content.length) * 100)}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-[#2D3139]" : "bg-[#E8E4DC]"}`}>
                <div className="h-full rounded-full bg-[#5B8FB9] transition-all duration-500"
                  style={{ width: `${Math.round(((activeParagraphIndex + 1) / activeChapter.content.length) * 100)}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#666666]">
              <span className={`px-2 py-1 border rounded-lg ${isDark ? "bg-[#1A1D21] border-[#2D3139] text-[#BAC1CC]" : "bg-white border-[#DCD9D0]"}`}>{book.difficulty}</span>
              <span className={`px-2 py-1 border rounded-lg ${isDark ? "bg-[#1A1D21] border-[#2D3139] text-[#BAC1CC]" : "bg-white border-[#DCD9D0]"}`}>~{book.reading_time}m read</span>
              <span className={`px-2 py-1 border rounded-lg ${isDark ? "bg-[#1A1D21] border-[#2D3139] text-[#BAC1CC]" : "bg-white border-[#DCD9D0]"}`}>{activeChapter.title}</span>
            </div>
          </div>
        </main>

        {/* Right side companion columns: Stats panels, preferences, and lists */}
        <aside id="cognitive-dock animate-fadeIn" className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Audio read-along assist trigger panel */}
          <div className={`border rounded-3xl p-6 shadow-sm ${cardBgClass} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs uppercase font-extrabold tracking-widest flex items-center gap-1 ${isDark ? 'text-[#BAC1CC]' : 'text-[#777777]'}`}>
                <Volume2 className="w-4 h-4 text-[#5B8FB9]" /> Narrator Companion
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isDark ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50' : 'bg-amber-50 text-amber-700'}`}>Active Sync</span>
            </div>

            <div className="space-y-4">
              <p className={`text-xs ${textSecondary}`}>
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
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-[#383A40]' : 'border-[#DCD9D0]/50'}`}>
                <span className={`text-[9px] font-bold uppercase flex items-center gap-1 mb-1 ${isDark ? 'text-[#A5AAB5]' : 'text-[#888888]'}`}>
                  <User className="w-3.5 h-3.5 text-[#5B8FB9]" /> Choose Narrator Voice
                </span>
                <select
                  value={preferences.narratorVoice || ""}
                  onChange={(e) => onUpdatePreferences({ ...preferences, narratorVoice: e.target.value })}
                  className={`w-full text-xs p-1.5 rounded-lg font-bold truncate ${isDark ? 'bg-[#252830] border-[#383A40] text-stone-200' : 'bg-[#F7F4EE] border-[#DCD9D0] text-stone-700'}`}
                >
                  <option value="">Default Human Reader</option>
                  {(() => {
                    const sorted = [...availableVoices]
                      .filter(v => v.lang.toLowerCase().startsWith("en"))
                      .sort((a, b) => {
                        const nameA = a.name.toLowerCase();
                        const nameB = b.name.toLowerCase();
                        let sA = 0;
                        let sB = 0;
                        if (nameA.includes("natural") || nameA.includes("online")) sA += 20;
                        if (nameA.includes("google")) sA += 12;
                        if (nameA.includes("premium") || nameA.includes("alex")) sA += 10;
                        if (nameA.includes("samantha") || nameA.includes("daniel") || nameA.includes("jenny")) sA += 5;

                        if (nameB.includes("natural") || nameB.includes("online")) sB += 20;
                        if (nameB.includes("google")) sB += 12;
                        if (nameB.includes("premium") || nameB.includes("alex")) sB += 10;
                        if (nameB.includes("samantha") || nameB.includes("daniel") || nameB.includes("jenny")) sB += 5;

                        return sB - sA;
                      });
                    return sorted.map((voice, idx) => (
                      <option key={idx} value={voice.name} className={`${isDark ? 'bg-[#1E1F22] text-white' : 'bg-white text-stone-800'}`}>
                        {voice.name} ({voice.lang})
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          </div>

          {/* Quick interactive Focus Modes block */}
          <div className={`rounded-3xl p-6 shadow-xs border transition-all duration-300 ${isDark ? 'bg-[#211E10] border-[#5C531E] text-amber-200' : 'bg-[#FFFDEB] border-[#EBE6C2] text-[#2D1910]'}`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-4 flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-[#777777]'}`}>
              <Highlighter className="w-4 h-4 text-amber-500" /> Sensory Focus Modes
            </h3>

            <p className={`text-[11px] leading-relaxed mb-4 ${isDark ? 'text-amber-300/80' : 'text-[#5A5636]'}`}>
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
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    focusMode === f.id
                      ? isDark ? "bg-amber-500/20 border-amber-400 font-extrabold text-amber-300 shadow-sm" : "bg-amber-200/50 border-amber-500 font-extrabold text-amber-950"
                      : isDark ? "bg-[#2A2715] border-[#5C531E] text-amber-200 hover:bg-[#34301A]" : "bg-white border-[#DCD9D0] hover:bg-gray-50 text-stone-700 font-medium"
                  }`}
                >
                  <p>{f.label}</p>
                  <p className={`text-[9px] font-normal mt-0.5 ${isDark ? "text-amber-300/50" : "text-[#888888]"}`}>{f.desc}</p>
                </button>
              ))}
            </div>

            {/* Reading enhancement toggles */}
            <div className={`mt-4 pt-4 border-t space-y-2 ${isDark ? "border-amber-900/40" : "border-[#EBE6C2]"}`}>
              {[
                { key: "bionicReading", label: "Bionic Reading", desc: "Bolds first letters to guide the eye" },
                { key: "syllableBreaking", label: "Syllable Breaks", desc: "Shows syl·la·ble di·vi·sions" },
              ].map(({ key, label, desc }) => (
                <button key={key}
                  onClick={() => onUpdatePreferences({ ...preferences, [key]: !safePrefs[key as keyof typeof safePrefs] })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    safePrefs[key as keyof typeof safePrefs]
                      ? isDark ? "bg-amber-500/20 border-amber-400 text-amber-300" : "bg-amber-200/50 border-amber-500 text-amber-950"
                      : isDark ? "bg-[#2A2715] border-[#5C531E] text-amber-200" : "bg-white border-[#DCD9D0] text-stone-700"
                  }`}>
                  <div className="text-left">
                    <p>{label}</p>
                    <p className={`text-[9px] font-normal mt-0.5 ${isDark ? "text-amber-300/50" : "text-[#888888]"}`}>{desc}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${safePrefs[key as keyof typeof safePrefs] ? "bg-amber-500 text-white" : isDark ? "bg-[#1E1C10] text-amber-400" : "bg-[#F7F4EE] text-stone-400"}`}>
                    {safePrefs[key as keyof typeof safePrefs] ? "ON" : "OFF"}
                  </span>
                </button>
              ))}
            </div>

            {/* Letter & Word Spacing sliders */}
            <div className={`mt-4 pt-4 border-t space-y-4 ${isDark ? "border-amber-900/40" : "border-[#EBE6C2]"}`}>
              {[
                { key: "letterSpacing", label: "Letter Spacing", min: 0, max: 0.2, step: 0.01, unit: "em", hint: ["Default", "Wide"] },
                { key: "wordSpacing", label: "Word Spacing", min: 0, max: 0.5, step: 0.02, unit: "em", hint: ["Default", "Wide"] },
              ].map(({ key, label, min, max, step, unit, hint }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-amber-400" : "text-[#666666]"}`}>{label}</span>
                    <span className={`text-[10px] font-bold ${isDark ? "text-amber-300" : "text-slate-500"}`}>
                      {(safePrefs[key as keyof typeof safePrefs] as number).toFixed(2)}{unit}
                    </span>
                  </div>
                  <input type="range" min={min} max={max} step={step}
                    value={safePrefs[key as keyof typeof safePrefs] as number}
                    onChange={(e) => onUpdatePreferences({ ...preferences, [key]: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500" />
                  <div className={`flex justify-between text-[9px] mt-0.5 ${isDark ? "text-amber-300/50" : "text-slate-400"}`}>
                    <span>{hint[0]}</span><span>{hint[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Side Drawer Switch Triggers: Memory Cards, AI, Dictionary */}
          <div className={`border rounded-3xl p-6 space-y-4 shadow-sm transition-all duration-300 ${cardBgClass}`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isDark ? 'text-[#BAC1CC]' : 'text-[#666666]'}`}>
              Reader Support Drawers
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveSideDrawer(activeSideDrawer === "memory" ? "none" : "memory")}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                  activeSideDrawer === "memory" 
                    ? "border-[#5B8FB9] bg-[#5B8FB9]/10 text-[#5B8FB9] ring-2 ring-[#5B8FB9]/30" 
                    : buttonClass
                }`}
              >
                <span className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#5B8FB9]" /> Memory Support Cards
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-[#5B8FB9]'}`}>
                  {book.characters.length + book.concepts.length} active
                </span>
              </button>

              <button
                onClick={() => setActiveSideDrawer(activeSideDrawer === "aichat" ? "none" : "aichat")}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                  activeSideDrawer === "aichat" 
                    ? "border-green-600 bg-green-50/20 text-green-700" 
                    : buttonClass
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-700 font-semibold" /> Ask AI Language Assistant
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${isDark ? 'bg-green-950/50 text-green-400' : 'bg-green-50 text-green-700'}`}>Open</span>
              </button>
            </div>

            {/* Render selected drawer content here inside the column for clean desktop layouts */}
            {activeSideDrawer === "memory" && (
              <div className="pt-2 border-t mt-2 space-y-4 transition-all">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-black ${textPrimary}`}>Story Anchor Cards</span>
                  <button onClick={() => setActiveSideDrawer("none")} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {book.characters.length > 0 && (
                  <div className="space-y-3">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${textTertiary}`}>Character Profiles</p>
                    {book.characters.map((char, index) => (
                      <div key={index} className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-sky-950/20 border-sky-900/50 text-[#BAC1CC]' : 'bg-[#EEF5FA] border-[#D0DFEB] text-[#1B2A4A]'}`}>
                        <p className="font-bold">{char.name}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-[#5B8FB9]' : 'text-sky-700'}`}>{char.role}</p>
                        <p className={`text-[11px] mt-1.5 ${isDark ? 'text-gray-300' : 'text-[#444444]'}`}><span className="font-bold">Relationships:</span> {char.relationships}</p>
                        <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-300' : 'text-[#444444]'}`}><span className="font-bold">Recent Storyline:</span> {char.events}</p>
                      </div>
                    ))}
                  </div>
                )}

                {book.concepts.length > 0 && (
                  <div className="space-y-3">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${textTertiary}`}>Concept Anchors</p>
                    {book.concepts.map((conc, index) => (
                      <div key={index} className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-amber-950/20 border-amber-900/50 text-amber-200' : 'bg-[#FDFBF2] border-[#DFCEB3] text-amber-900'}`}>
                        <p className="font-bold">{conc.term}</p>
                        <p className={`text-[11px] mt-1 italic ${isDark ? 'text-amber-100/70' : 'text-[#555555]'}`}>&ldquo;{conc.definition}&rdquo;</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conc.keyTerms.map((kw, i) => (
                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>{kw}</span>
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
                      <p className="font-bold text-[10px] uppercase text-green-800 mb-1">AI Coach</p>
                      <div className="text-[11px] space-y-2">
                        {aiExplainOutput
                          .replace(/#{1,6}\s*/g, '')
                          .replace(/\*\*([^*]+)\*\*/g, '$1')
                          .replace(/\*([^*]+)\*/g, '$1')
                          .replace(/^[-\u2022]\s*/gm, '')
                          .split('\n')
                          .filter((line: string) => line.trim())
                          .map((line: string, i: number) => (
                            <p key={i} className="leading-relaxed">{line.trim()}</p>
                          ))
                        }
                      </div>
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
      <footer className={`border-t p-4 sticky bottom-0 z-40 shadow-lg mt-auto ${headerBgClass} transition-all duration-300`}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowToolbarSettings(!showToolbarSettings)}
              className={`p-3 rounded-xl border flex items-center justify-center font-bold text-xs gap-1.5 transition-colors ${
                showToolbarSettings ? "bg-[#5B8FB9] text-white border-[#5B8FB9]" : buttonClass
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
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1 hover:brightness-105 animate-none"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingAudio ? "Pause" : "Listen along"}</span>
            </button>
          </div>
        </div>

        {/* Floating Settings Panel underneath Toolbar when clicked */}
        {showToolbarSettings && (
          <div className={`max-w-4xl mx-auto mt-4 p-4 border rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 transition-all ${cardBgClass} transition-all duration-300`}>
            <div>
              <p className={`text-[10px] font-black uppercase ${textTertiary}`}>Read Typography</p>
              <div className="grid grid-cols-2 gap-1 mt-1.5">
                {["Lexend", "OpenDyslexic", "Atkinson", "Inter"].map((f) => (
                  <button
                    key={f}
                    onClick={() => onUpdatePreferences({ ...preferences, font: f as any })}
                    className={`p-1.5 border rounded-lg text-xs font-bold text-left truncate transition-all ${
                      preferences.font === f ? "border-[#5B8FB9] bg-[#5B8FB9]/10 text-[#5B8FB9]" : buttonClass
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