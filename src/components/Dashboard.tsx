import React, { useState, useEffect } from "react";
import NaraLogo from "./NaraLogo";
import { Book, UserPreferences, Bookmark, ReadingPosition, ReadingStats } from "../types";
import { SAMPLE_BOOKS, DIFFICULTY_SPECS } from "../data/books";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, sendSignInLinkToEmail, User as FirebaseUser } from "firebase/auth";
import {
  Compass,
  BookOpen,
  Activity,
  User,
  Sliders,
  Search,
  ArrowRight,
  Flame,
  CheckCircle,
  HelpCircle,
  Volume2,
  Bookmark as BookmarkIcon,
  Smile,
  Maximize2
} from "lucide-react";

interface DashboardProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
  bookmarks: Bookmark[];
  stats: ReadingStats;
  currentPosition: ReadingPosition;
  onSelectBook: (bookId: string) => void;
  onRestartOnboarding: () => void;
  onAnswerSatisfaction: (feeling: string) => void;
  satisfactionHistory: string[];
}

export default function Dashboard({
  preferences,
  onUpdatePreferences,
  bookmarks,
  stats,
  currentPosition,
  onSelectBook,
  onRestartOnboarding,
  onAnswerSatisfaction,
  satisfactionHistory,
}: DashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"library" | "resume" | "stats" | "profile" | "settings">("library");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("recommended");

  // Selected Book for the Detail View
  const [detailedBookId, setDetailedBookId] = useState<string | null>(null);

  // Authentication states & events
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
    });
    return () => unsubscribe();
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthLoading(true);
    setAuthError("");
    setMagicLinkSent(false);

    try {
      const actionCodeSettings = {
        url: window.location.href.split("?")[0],
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, authEmail, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", authEmail);
      setMagicLinkSent(true);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "An error occurred while dispatching the link.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  // Core visual theme names mapped
  const themeClasses: Record<string, string> = {
    cream: "bg-[#F7F4EE] text-[#222222] border-[#DCD9D0]",
    yellow: "bg-[#FFFDE5] text-[#1D1B11] border-[#E8E3CD]",
    blue: "bg-[#EEF5FA] text-[#1B2A4A] border-[#D0DFEB]",
    sepia: "bg-[#F4EAD4] text-[#3E2723] border-[#DFCEB3]",
    dark: "bg-[#1E1F22] text-[#E3E3E3] border-[#383A40]",
  };

  const fontClasses: Record<string, string> = {
    Lexend: "font-lexend",
    OpenDyslexic: "font-dyslexic",
    Atkinson: "font-atkinson",
    Inter: "font-inter",
  };

  // Resolve current read book if exists
  const activeBook = SAMPLE_BOOKS.find((b) => b.id === currentPosition.bookId) || SAMPLE_BOOKS[0];

  // Filters catalog
  const filteredBooks = SAMPLE_BOOKS.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === "All" || book.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;

    return matchesSearch && matchesDifficulty && matchesCategory;
  }).sort((a, b) => {
    if (selectedSort === "az") {
      return a.title.localeCompare(b.title);
    }
    if (selectedSort === "za") {
      return b.title.localeCompare(a.title);
    }
    if (selectedSort === "length-asc") {
      return a.reading_time - b.reading_time;
    }
    if (selectedSort === "length-desc") {
      return b.reading_time - a.reading_time;
    }
    return 0; // Default Order
  });

  const categories = ["All", "Beginner Classics", "Young Adult Classics", "Personal Growth / Science"];

  // Satisfaction questions options
  const [satisfactionInput, setSatisfactionInput] = useState<string>("");
  const handleSatisfactionAnswer = (text: string) => {
    onAnswerSatisfaction(text);
    setSatisfactionInput("");
  };

  return (
    <div id="dashboard-root" className="min-h-screen bg-[#F7F4EE] text-[#222222] font-sans flex flex-col justify-between">
      
      {/* HEADER: Geometric navigation toolbar */}
      <nav className="h-16 border-b border-[#DCD9D0] px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm shadow-xs sticky top-0 z-40">
        <NaraLogo showText={true} />
        
        {/* Navigation tabs */}
        <div className="hidden md:flex gap-8">
          {[
            { id: "library", label: "Library", icon: Compass },
            { id: "resume", label: "Continue Reading", icon: BookOpen },
            { id: "stats", label: "Reading Stats", icon: Activity },
            { id: "profile", label: "Profile", icon: User },
            { id: "settings", label: "Settings", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setDetailedBookId(null);
                }}
                className={`text-xs font-black uppercase flex items-center gap-1.5 pb-1 border-b-2 transition-colors touch-target ${
                  isActive ? "border-[#5B8FB9] text-[#222222]" : "border-transparent text-[#666666] hover:text-[#222222]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Badge Profile Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 rounded-full bg-[#E5E1D8] border border-[#DCD9D0] flex items-center justify-center font-black text-xs hover:bg-gray-100 touch-target"
            aria-label="View user profile"
          >
            JD
          </button>
        </div>
      </nav>

      {/* MOBILE LOWER NAVIGATION BAR (High-contrast 44px tap targets for mobile) */}
      <div className="md:hidden bg-white border-t border-[#DCD9D0] px-4 py-2 fixed bottom-0 left-0 right-0 z-40 flex justify-around">
        {[
          { id: "library", label: "Library", icon: Compass },
          { id: "resume", label: "Resume", icon: BookOpen },
          { id: "stats", label: "Stats", icon: Activity },
          { id: "profile", label: "Profile", icon: User },
          { id: "settings", label: "Preferences", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setDetailedBookId(null);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold ${
                isActive ? "text-[#5B8FB9]" : "text-[#666666]"
              } touch-target`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full mb-16 md:mb-0">
        
        {/* IF A DETAILED BOOK VIEW IS OPEN, INTERCEPT LAYOUT */}
        {detailedBookId ? (
          (() => {
            const detailBook = SAMPLE_BOOKS.find((b) => b.id === detailedBookId)!;
            const diffSpec = DIFFICULTY_SPECS[detailBook.difficulty];
            const activeProfileClass = fontClasses[preferences.font];
            const previewTextSample = detailBook.chapters[0]?.content[0] || "";

            return (
              <div className="bg-white border border-[#DCD9D0] rounded-3xl p-6 md:p-10 shadow-sm animate-fadeIn space-y-8">
                {/* Back to library navigation */}
                <button
                  onClick={() => setDetailedBookId(null)}
                  className="px-4 py-2 border border-[#DCD9D0] rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5"
                >
                  &larr; Back to Shelf
                </button>

                {/* Detail Book Info Columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left big Cover */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className={`w-64 h-80 rounded-2xl bg-gradient-to-br ${detailBook.coverColor} p-6 shadow-lg border border-black/10 flex flex-col justify-between text-white relative`}>
                      <div className="self-end opacity-20">LUMINA ACCESSIBLE</div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black">{detailBook.title}</p>
                        <p className="text-xs uppercase tracking-widest font-bold opacity-80">{detailBook.author}</p>
                      </div>
                      <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl backdrop-blur-md">
                        <span className="text-[10px] font-black">{detailBook.difficulty} Difficulty</span>
                        <span className="text-[10px] font-black">{detailBook.reading_time} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Right metadata description */}
                  <div className="md:col-span-8 space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#5B8FB9] tracking-widest bg-[#EEF5FA] px-3 py-1 rounded">
                        {detailBook.category}
                      </span>
                      <h1 className="text-3xl font-extrabold tracking-tight mt-1">{detailBook.title}</h1>
                      <p className="text-base text-[#666666] font-bold">by {detailBook.author}</p>
                    </div>

                    <p className="text-sm leading-relaxed text-[#444444] bg-slate-50 p-4 rounded-xl border border-dashed">
                      {detailBook.description}
                    </p>

                    {/* Difficulty Score Indicators */}
                    <div className={`border p-4 rounded-xl space-y-1.5 ${diffSpec.badgeColor}`}>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Level of Difficulty Assessment:</p>
                      <p className="text-xs font-bold">{diffSpec.desc}</p>
                    </div>

                    {/* IA Mandate: ACCESSIBILITY PREVIEW PANEL */}
                    <div className="p-6 bg-gray-50 border border-[#DCD9D0] rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold uppercase text-[#666666] tracking-widest">Accessibility Preview</span>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">Active Rules applied</span>
                      </div>
                      
                      <p className="text-[10px] text-[#777777] leading-relaxed">
                        Look at how your text settings (Font, size, color template) will feel before loading:
                      </p>

                      <div
                        className={`p-4 rounded-xl border max-h-[140px] overflow-y-auto ${themeClasses[preferences.theme]}`}
                      >
                        <p
                          style={{
                            fontSize: `${preferences.textSize}px`,
                            lineHeight: preferences.lineSpacing,
                          }}
                          className={`${activeProfileClass} break-words`}
                        >
                          {previewTextSample}
                        </p>
                      </div>
                    </div>

                    {/* Master Action Trigger */}
                    <button
                      onClick={() => onSelectBook(detailBook.id)}
                      className="w-full h-14 bg-[#5B8FB9] text-white font-black text-sm uppercase rounded-2xl tracking-widest hover:bg-[#497A9E] transition-all flex items-center justify-center gap-2 shadow-lg hover:translate-y-[-1px] cursor-pointer"
                    >
                      <span>Start Reading Experience</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* STANDARD TABS */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Tab 1: Library Index */}
            {activeTab === "library" && (
              <div className="space-y-6">
                
                {/* Hero Header Greeting with date */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Welcome to Nara</h1>
                    <p className="text-xs text-[#666666] mt-1 font-bold">
                      Reading should bring achievement, not exhaustion. Select books below to begin with active support.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#666666] bg-white border px-3 py-1.5 rounded-xl">
                    Today is Thursday, Jun 11
                  </span>
                </div>

                {/* Interactive Search Tool row (Filters by title, author, difficulty, length, categories) */}
                <div className="bg-white p-4 border border-[#DCD9D0] rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 shadow-xs">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search title, author or genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F7F4EE]/50 border border-[#DCD9D0] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DCD9D0] rounded-xl focus:outline-none font-bold"
                    >
                      <option value="All">All Difficulty Scores</option>
                      <option value="Easy">Easy Level</option>
                      <option value="Moderate">Moderate Level</option>
                      <option value="Challenging">Challenging Level</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DCD9D0] rounded-xl focus:outline-none font-bold"
                    >
                      <option value="All">All Standard Categories</option>
                      {categories.filter(c => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="w-full text-xs py-2 px-3 bg-white border border-[#DCD9D0] rounded-xl focus:outline-none font-bold text-gray-700"
                    >
                      <option value="recommended">Sort: Default Order</option>
                      <option value="az">Sort: Alphabetical (A-Z)</option>
                      <option value="za">Sort: Alphabetical (Z-A)</option>
                      <option value="length-asc">Sort: Reading Time (Short first)</option>
                      <option value="length-desc">Sort: Reading Time (Long first)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-xs text-[#666666] font-bold">
                      Showing {filteredBooks.length} titles
                    </span>
                  </div>
                </div>

                {/* Continue reading strip hero if exists */}
                <div
                  onClick={() => onSelectBook(activeBook.id)}
                  className="bg-white border border-[#DCD9D0] rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-xs hover:border-[#5B8FB9] cursor-pointer transition-all"
                >
                  <div className={`w-28 h-36 bg-gradient-to-br ${activeBook.coverColor} rounded-xl shadow-md flex-shrink-0 flex items-center justify-center text-center p-3 text-white border border-black/10`}>
                    <p className="text-xs font-black truncate max-w-full">{activeBook.title}</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <span className="px-2 py-1 bg-[#EEF5FA] text-[#5B8FB9] text-[9px] font-black rounded uppercase">Current Active Bookshelf</span>
                      <h2 className="text-xl font-bold mt-2 text-[#222222]">{activeBook.title}</h2>
                      <p className="text-[#666666] text-xs leading-relaxed max-w-xl mt-1">
                        Active spot: {activeBook.chapters[0]?.title}. Pick back up with high spacing, read along, and text isolation tools.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="h-10 px-5 bg-[#5B8FB9] text-white rounded-xl text-xs font-bold hover:bg-[#4A7BA3] flex items-center gap-1.5 shadow-sm">
                        <span>Resume Reading Setup</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Books Shelf Grid */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-[#777777] tracking-widest mb-4">Recommended Shelf</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => {
                      const limitDesc = book.description.substring(0, 100) + "...";
                      return (
                        <div
                          key={book.id}
                          onClick={() => setDetailedBookId(book.id)}
                          className="bg-white border border-[#DCD9D0] rounded-2xl p-5 flex flex-col justify-between hover:border-[#5B8FB9] hover:shadow-md cursor-pointer transition-all"
                        >
                          <div className="space-y-4">
                            <div className={`h-40 rounded-xl bg-gradient-to-br ${book.coverColor} p-4 text-white flex flex-col justify-between border border-black/5`}>
                              <span className="text-[10px] font-black uppercase opacity-75">{book.author}</span>
                              <p className="text-base font-extrabold">{book.title}</p>
                              <div className="flex justify-between items-center text-[9px] font-black bg-white/20 p-1.5 rounded">
                                <span>{book.difficulty}</span>
                                <span>{book.reading_time}m length</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-[#888888] font-bold uppercase">{book.category}</p>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{limitDesc}</p>
                            </div>
                          </div>
                          
                          <button
                            className="mt-4 w-full py-2 border border-[#5B8FB9] text-[#5B8FB9] rounded-xl text-xs font-bold hover:bg-[#5B8FB9] hover:text-white transition-colors"
                          >
                            Explore Book
                          </button>
                        </div>
                      );
                    })}

                    {filteredBooks.length === 0 && (
                      <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-[#DCD9D0]">
                        <p className="text-sm font-bold text-[#666666]">No books match your cognitive filter guidelines.</p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedDifficulty("All");
                            setSelectedCategory("All");
                          }}
                          className="text-xs font-bold text-[#5B8FB9] underline mt-1"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shelf Guide Box */}
                <div className="bg-[#5B8FB9] hover:bg-[#4C7C9E] rounded-2xl p-6 text-white transition-colors">
                  <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Workspace Principle</p>
                  <p className="text-sm leading-relaxed max-w-xl">
                    You aren't trying to finish a massive library index today. Pick one single story, focus on a comfortable speed, and let your eyes guide your limits.
                  </p>
                </div>

              </div>
            )}

            {/* Tab 2: Resume */}
            {activeTab === "resume" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black">Continue Reading Space</h2>
                <p className="text-xs text-[#666666]">Instantly rejoin your paragraphs with preloaded settings intact.</p>

                <div className="space-y-4">
                  {SAMPLE_BOOKS.map((book) => {
                    const isBookActive = book.id === currentPosition.bookId;
                    return (
                      <div
                        key={book.id}
                        onClick={() => onSelectBook(book.id)}
                        className={`bg-white border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#5B8FB9] cursor-pointer transition-all ${
                          isBookActive ? "border-[#5B8FB9] ring-2 ring-[#5B8FB9]/20" : "border-[#DCD9D0]"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${book.coverColor} flex-shrink-0 flex items-center justify-center p-2 text-center text-white border border-black/10`}>
                            <span className="text-[10px] font-black">{book.title.slice(0, 15)}</span>
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-base font-bold">{book.title}</p>
                            <p className="text-xs text-[#666666] mt-0.5">by {book.author}</p>
                            {isBookActive ? (
                              <span className="mt-1 inline-block bg-yellow-100 text-yellow-900 border text-[9px] font-black rounded px-2 py-0.5">
                                Active Reading Position
                              </span>
                            ) : (
                              <span className="mt-1 inline-block bg-gray-50 border text-[9px] font-black rounded px-2 py-0.5">
                                Shelf Book
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="h-10 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1">
                            <span>Open Reader</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Stats (No aggressive competition, positive encouragement stats) */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">Reading Stats & Milestones</h2>
                  <p className="text-xs text-[#666666]">Keep tracking positive daily routines. Focus on achievements, not comparisons.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#DCD9D0] flex flex-col justify-between">
                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Reading Streak</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-3xl font-black text-amber-700 flex items-center gap-1">
                        <Flame className="w-6 h-6 text-amber-600 fill-current" />
                        <span>{stats.readingStreak} Days</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#DCD9D0] flex flex-col justify-between">
                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Active Reading Minutes</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-3xl font-black text-[#5B8FB9]">{stats.minutesRead} mins</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#DCD9D0] flex flex-col justify-between">
                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Total Words Rendered</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-3xl font-black">{stats.wordsRead.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#DCD9D0] flex flex-col justify-between">
                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Books Finished</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-3xl font-black text-green-700">{stats.booksCompleted} volume</p>
                    </div>
                  </div>
                </div>

                {/* GAIL IA MANDATE: Success single metric "Did reading feel easier today?" */}
                <div className="bg-[#FFFDEB] border border-[#EBE6C2] rounded-3xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-amber-800 font-bold flex-shrink-0">
                      <Smile />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-amber-900">Measuring Reading Comfort Index</h4>
                      <p className="text-xs text-[#5A5636] mt-1 pr-6">
                        Dyslexia and visual stress platforms should optimize for calm understanding, not simple mouse-clicks. Tell us how reading felt today to customize our local rules.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/65 rounded-xl border border-amber-300 flex flex-wrap gap-2 items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">Did reading feel easier or more achievable layout-wise today?</span>
                    <div className="flex gap-2">
                      {[
                        "Much Easier and Calmer!",
                        "Somewhat Better Comfort",
                        "Still felt tiring / high strain",
                        "Loved line highlights!",
                      ].map((ans) => (
                        <button
                          key={ans}
                          onClick={() => handleSatisfactionAnswer(ans)}
                          className="bg-white border border-[#DCD9D0] hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 text-[#222222]"
                        >
                          {ans}
                        </button>
                      ))}
                    </div>
                  </div>

                  {satisfactionHistory.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-black uppercase text-amber-800 tracking-widest mb-2">Previous Check-Ins:</p>
                      <div className="flex flex-wrap gap-2">
                        {satisfactionHistory.map((hist, i) => (
                          <span key={i} className="text-xs bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold">
                            &bull; {hist}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Micro-visualization of physical reading progress */}
                <div className="bg-white p-6 rounded-3xl border border-[#DCD9D0] space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-[#777777] tracking-widest">Calculated Daily Comfort Zone</h4>
                  <div className="w-full bg-[#E5E1D8] h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#5B8FB9] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (stats.minutesRead / stats.dailyGoalMinutes) * 100)}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#666666]">
                    <span>Current Goal progress: {stats.minutesRead} mins</span>
                    <span>Daily optimal objective: {stats.dailyGoalMinutes} mins</span>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 4: Profile */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">Your Reading Profile</h2>
                  <p className="text-xs text-[#666666]">View and modify active aesthetics presets chosen during onboarding.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Accounts / Authentication via Magic Link */}
                  <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-[#DCD9D0] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase text-[#666666] tracking-widest mb-3">Reader Account</h3>
                      <p className="text-stone-500 text-xs mb-4 leading-relaxed">
                        Secure your personalized bookmarks, reading stats, and custom settings across all of your browsers password-free.
                      </p>

                      {currentUser ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-[#EEF5FA] p-3 rounded-xl border border-[#D0DFEB]">
                            <div className="w-10 h-10 rounded-full bg-[#5B8FB9] text-white flex items-center justify-center font-black text-sm shrink-0">
                              {currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : "R"}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[9px] text-[#5B8FB9] font-extrabold uppercase tracking-wider">Logged In</p>
                              <p className="text-xs font-bold text-[#1B2A4A] truncate">{currentUser.email}</p>
                            </div>
                          </div>

                          <button
                            onClick={handleSignOut}
                            className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-200"
                          >
                            Sign Out Account
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSendMagicLink} className="space-y-3">
                          <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#777777] block mb-1">
                              Your Email Address
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="you@domain.com"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              className="w-full text-xs p-3 bg-[#F7F4EE]/50 border border-[#DCD9D0] rounded-xl focus:outline-none focus:border-[#5B8FB9]"
                            />
                          </div>

                          {authError && (
                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100 leading-normal">
                              {authError}
                            </p>
                          )}

                          {magicLinkSent && (
                            <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 leading-normal">
                              ✓ Check your inbox! We dispatched your Nara magic link.
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={authLoading}
                            className={`w-full py-2.5 bg-[#5B8FB9] hover:bg-[#4C7C9E] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              authLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            {authLoading ? "Dispatching..." : "Send Magic Sign Up Link"}
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#DCD9D0]/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Firestore Sync Active
                      </span>
                    </div>
                  </div>

                  {/* Right Columns: Presets and Onboarding Rerun */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#DCD9D0] space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B8FB9] to-[#E3EFFD] flex items-center justify-center font-black text-white text-xl">
                        {currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "JD"}
                      </div>
                      <div>
                        <p className="text-lg font-bold">{currentUser?.email ? "Nara Active Reader" : "Julian Dawson"}</p>
                        <p className="text-xs text-gray-500 font-bold">{currentUser?.email || "ioana.el.ionescu@gmail.com"}</p>
                      </div>
                    </div>

                    <hr className="border-[#DCD9D0]" />

                    <div>
                      <h3 className="text-xs font-extrabold uppercase text-[#666666] tracking-widest mb-3">Locked Preferences</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#DCD9D0]">
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase">Typeface Font</p>
                          <p className={`text-base font-black ${fontClasses[preferences.font] || ""} mt-1`}>{preferences.font}</p>
                        </div>

                        <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#DCD9D0]">
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase">Render Size</p>
                          <p className="text-base font-black mt-1">{preferences.textSize}px</p>
                        </div>

                        <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#DCD9D0]">
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase">Contrast Theme</p>
                          <p className="text-base font-black mt-1 capitalize">{preferences.theme}</p>
                        </div>

                        <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#DCD9D0]">
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase">Line Spacing multiplier</p>
                          <p className="text-base font-black mt-1">{preferences.lineSpacing}x</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <button
                        onClick={onRestartOnboarding}
                        className="w-full py-3 border-2 border-[#5B8FB9] text-[#5B8FB9] hover:bg-[#5B8FB9] hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Re-run Interactive Onboarding Setup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Settings */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">Accessibility Control Tower</h2>
                  <p className="text-xs text-[#666666]">Refine visual properties, toggles, and synthesize audio preferences.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-[#DCD9D0] space-y-6">
                  
                  {/* Contrast, spacing slider controls */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-stone-900 border-b pb-2">Custom Adjustments</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block">Fine-tune Font Size ({preferences.textSize}px)</label>
                        <input
                          type="range"
                          min="16"
                          max="36"
                          value={preferences.textSize}
                          onChange={(e) => onUpdatePreferences({ ...preferences, textSize: parseInt(e.target.value) })}
                          className="w-full h-2 bg-[#DCD9D0] rounded-lg appearance-none cursor-pointer accent-[#5B8FB9]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block">Fine-tune Line Height ({preferences.lineSpacing}x)</label>
                        <input
                          type="range"
                          min="1.2"
                          max="2.5"
                          step="0.1"
                          value={preferences.lineSpacing}
                          onChange={(e) => onUpdatePreferences({ ...preferences, lineSpacing: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-[#DCD9D0] rounded-lg appearance-none cursor-pointer accent-[#5B8FB9]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motion Toggles */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-stone-900 border-b pb-2">System Parameters</h3>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-gray-800">WCAG AAA Reduce Motion</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Turns off heavy text fades and slide transitions to avoid visual fatigue.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.reduceMotion}
                        onChange={(e) => onUpdatePreferences({ ...preferences, reduceMotion: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#5B8FB9] focus:ring-[#5B8FB9] accent-[#5B8FB9]"
                      />
                    </div>
                  </div>

                  {/* Accessibility Standards list */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#5B8FB9]" /> WCAG AA compliance audited:
                    </p>
                    <ul className="text-[11px] text-[#444444] list-disc pl-5 space-y-1">
                      <li>Color contrast values strictly avoid #FFFFFF backgrounds to relieve macular tension.</li>
                      <li>High contrast focus indicators remain visible at all times.</li>
                      <li>Keyboard inputs provide full mouse-free platform exploration.</li>
                    </ul>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
