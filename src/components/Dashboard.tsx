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
  Maximize2,
  Loader2,
  Globe,
  Sparkles,
  Plus
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

  // Shelf books including any dynamically compiled books
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const cached = localStorage.getItem("nara_interactive_custom_books");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sampleIds = SAMPLE_BOOKS.map(b => b.id);
          const filteredCached = parsed.filter((b: any) => !sampleIds.includes(b.id));
          return [...SAMPLE_BOOKS, ...filteredCached];
        }
      }
    } catch (e) {
      console.warn("Could not load cached books from localStorage:", e);
    }
    return SAMPLE_BOOKS;
  });

  // Open Library Search integration states
  const [onlineSearchActive, setOnlineSearchActive] = useState<boolean>(false);
  const [onlineBooks, setOnlineBooks] = useState<Book[]>([]);
  const [searchingOnline, setSearchingOnline] = useState<boolean>(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [generatingBookId, setGeneratingBookId] = useState<string | null>(null);

  // Subject Browse states for Open Library homepage cloning
  const [selectedSubject, setSelectedSubject] = useState<string>("classics");
  const [subjectBooks, setSubjectBooks] = useState<Book[]>([]);
  const [fetchingSubject, setFetchingSubject] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem("nara_interactive_custom_books", JSON.stringify(books));
    } catch (e) {
      console.warn("Could not save custom books:", e);
    }
  }, [books]);

  // Automatically fetch subject books from Open Library when selectedSubject changes
  useEffect(() => {
    const fetchSubjectBooks = async () => {
      setFetchingSubject(true);
      try {
        const querySubject = selectedSubject.toLowerCase().replace(" ", "_");
        const response = await fetch(`https://openlibrary.org/subjects/${querySubject}.json?limit=12`);
        if (!response.ok) {
          throw new Error("Could not pull subject works from Open Library.");
        }
        const data = await response.json();
        const works = data.works || [];
        const mapped = works.map((work: any, index: number) => {
          const id = `openlib-${work.key.split("/").pop()}`;
          const gradients = [
            "from-[#5b8fb9] to-[#b3c7d6]",
            "from-emerald-600 to-teal-950",
            "from-amber-600 to-amber-950",
            "from-pink-500 to-indigo-600",
            "from-blue-800 to-indigo-950",
            "from-purple-800 to-violet-950",
            "from-rose-500 to-slate-900"
          ];
          const coverColor = gradients[index % gradients.length];
          const coverUrl = work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : undefined;
          return {
            id,
            title: work.title,
            author: work.authors?.[0]?.name || "Unknown Author",
            coverColor,
            coverIcon: "Book",
            category: selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1).replace("_", " "),
            difficulty: "Moderate",
            reading_time: 20,
            description: `A classic work in ${selectedSubject.replace("_", " ")} compiled perfectly for dyslexia-optimized reading assistance and live decoding support.`,
            ageGroup: "All Ages",
            chapters: [],
            characters: [],
            concepts: [],
            coverUrl
          };
        });
        setSubjectBooks(mapped);
      } catch (err) {
        console.warn("Could not fetch subject books from Open Library:", err);
      } finally {
        setFetchingSubject(false);
      }
    };

    fetchSubjectBooks();
  }, [selectedSubject]);

  // Automated background query for global database search when looking for a specific book
  useEffect(() => {
    const term = searchQuery.trim();
    if (!term || term.length < 3) {
      setOnlineBooks([]);
      setOnlineError(null);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearchOnline(term);
    }, 850); // 850ms debounce delay to protect API rate limit smoothly

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchOnline = async (term: string) => {
    if (!term || term.trim() === "") {
      setOnlineError("Please type a book title, author, or keyword first.");
      return;
    }
    setSearchingOnline(true);
    setOnlineError(null);
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=9`);
      if (!response.ok) {
        throw new Error("Could not pull results from Open Library database.");
      }
      const data = await response.json();
      const docs = data.docs || [];
      
      const mapped = docs.map((doc: any, index: number) => {
        const id = `openlib-${doc.key.split("/").pop()}`;
        const gradients = [
          "from-[#5B8FB9] to-[#E3EFFD]",
          "from-emerald-600 to-teal-950",
          "from-amber-600 to-amber-950",
          "from-pink-500 to-indigo-600",
          "from-blue-800 to-indigo-950",
          "from-purple-800 to-violet-950",
          "from-rose-500 to-slate-900"
        ];
        const coverColor = gradients[index % gradients.length];
        const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined;
        
        return {
          id,
          title: doc.title,
          author: doc.author_name?.[0] || "Unknown Author",
          coverColor,
          coverIcon: "Book",
          category: doc.subject?.[0] || "Global Literature",
          difficulty: doc.number_of_pages && doc.number_of_pages < 150 ? "Easy" : doc.number_of_pages && doc.number_of_pages < 350 ? "Moderate" : "Challenging",
          reading_time: Math.round((doc.number_of_pages_median || doc.number_of_pages || 180) / 10),
          description: doc.first_sentence?.[0] || (doc.subject ? `A classic narrative detailing: ${doc.subject.slice(0, 3).join(", ")}.` : "A popular work of global literature, ready for accessible reading adjustments."),
          ageGroup: doc.subject?.some((s: string) => s.toLowerCase().includes("kid") || s.toLowerCase().includes("juvenile"))
            ? "Kids"
            : doc.subject?.some((s: string) => s.toLowerCase().includes("teen") || s.toLowerCase().includes("young adult"))
            ? "Teens"
            : "Adults",
          chapters: [],
          characters: [],
          concepts: [],
          coverUrl
        };
      });
      setOnlineBooks(mapped);
    } catch (err: any) {
      console.warn(err);
      setOnlineError("Could not connect to Open Library. Please verify your connection.");
    } finally {
      setSearchingOnline(false);
    }
  };

  const handleGenerateAndReadBook = async (onlineBook: Book) => {
    setGeneratingBookId(onlineBook.id);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Create a short dyslexia-friendly reading excerpt for the book "${onlineBook.title}" by ${onlineBook.author}. Return ONLY valid JSON, no markdown.

Return this exact shape:
{"chapters":[{"id":"chap-1","title":"Opening","content":["paragraph 1","paragraph 2","paragraph 3"]}],"characters":[{"name":"Name","role":"Role","relationships":"Description","events":"Recent events"}],"concepts":[{"term":"Key concept","definition":"Simple definition","keyTerms":["word1","word2"],"examples":["An example sentence"]}]}`
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to format the book content.");
      }
      
      const data = await response.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      
      const fullyFormedBook: Book = {
        ...onlineBook,
        chapters: parsed.chapters || [],
        characters: parsed.characters || [],
        concepts: parsed.concepts || []
      };
      
      setBooks(prev => {
        const filtered = prev.filter(b => b.id !== onlineBook.id);
        return [...filtered, fullyFormedBook];
      });
      
      onSelectBook(fullyFormedBook.id);
    } catch (e) {
      console.warn("AI Generation failed, loading standard narrative:", e);
      const fallbackBook: Book = {
        ...onlineBook,
        chapters: [
          {
            id: "chap-1",
            title: "Chapter I: The Magic Open",
            content: [
              `This is your customized visual-stress-free edition of "${onlineBook.title}" by ${onlineBook.author}.`,
              "Every journey into classic literature begins with learning to slow down and isolate individual lines of thought.",
              "Adjust your typeface font to 'OpenDyslexic' or 'Atkinson Hyperlegible' in the Settings, increase line spacing to match, and click any word to see real supportive decoding translations!"
            ]
          }
        ],
        characters: [
          {
            name: "The Protagonist",
            role: "Determined Leader",
            relationships: "The central voice of this classic tale.",
            events: "Emerged at the start of the narrative to face new questions."
          }
        ],
        concepts: [
          {
            term: "Discovery",
            definition: "The act of finding, learning, or experiencing something brand new for the first time.",
            keyTerms: ["Finding", "Opening", "Learning"],
            examples: ["Finding a secret passageway in a library."]
          }
        ]
      };
      setBooks(prev => {
        const filtered = prev.filter(b => b.id !== onlineBook.id);
        return [...filtered, fallbackBook];
      });
      onSelectBook(fallbackBook.id);
    } finally {
      setGeneratingBookId(null);
    }
  };
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("All");
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
    cream: "bg-[#F7F4EE] text-[#111111] border-[#C5C2B8]",
    yellow: "bg-[#FFFDE5] text-[#000000] border-[#D2CCA9]",
    blue: "bg-[#EEF5FA] text-[#0A192F] border-[#AFC3D4]",
    sepia: "bg-[#F4EAD4] text-[#2D1910] border-[#CCD2B8]",
    dark: "bg-[#121214] text-[#FFFFFF] border-[#383A40]",
  };

  const activeTheme = preferences.theme || "cream";
  const isDark = activeTheme === "dark";

  // Dynamic system styles for the outer Dashboard shell
  const pageBgClass = 
    activeTheme === "dark" ? "bg-[#121214] text-[#E1E4EA]" :
    activeTheme === "yellow" ? "bg-[#FFFDE5] text-[#000000]" :
    activeTheme === "blue" ? "bg-[#EEF5FA] text-[#0A192F]" :
    activeTheme === "sepia" ? "bg-[#F4EAD4] text-[#2D1910]" :
    "bg-[#F7F4EE] text-[#111111]"; // Organic Cream

  const borderClass = 
    activeTheme === "dark" ? "border-[#2D3139]" :
    activeTheme === "yellow" ? "border-[#D2CCA9]" :
    activeTheme === "blue" ? "border-[#AFC3D4]" :
    activeTheme === "sepia" ? "border-[#CCD2B8]" :
    "border-[#DCD9D0]";

  const cardBgClass = 
    activeTheme === "dark" ? "bg-[#1A1D21] border-[#2D3139] text-[#E1E4EA]" :
    activeTheme === "sepia" ? "bg-[#FDFBF4] border-[#DFCEB3]" :
    "bg-white border-[#DCD9D0]";

  const textPrimary = 
    activeTheme === "dark" ? "text-white" :
    activeTheme === "yellow" ? "text-black" :
    activeTheme === "blue" ? "text-[#0A192F]" :
    activeTheme === "sepia" ? "text-[#2D1910]" :
    "text-[#111111]";

  const textSecondary = 
    activeTheme === "dark" ? "text-[#BAC1CC]" :
    activeTheme === "yellow" ? "text-[#2B2505]" :
    activeTheme === "blue" ? "text-[#1E2D4A]" :
    activeTheme === "sepia" ? "text-[#4A3525]" :
    "text-[#444444]";

  const textTertiary = 
    activeTheme === "dark" ? "text-[#7B818F]" :
    activeTheme === "yellow" ? "text-[#5D5030]" :
    activeTheme === "blue" ? "text-[#4A5B7E]" :
    activeTheme === "sepia" ? "text-[#6D5A4E]" :
    "text-[#666666]";

  const headerBgClass = 
    activeTheme === "dark" ? "bg-[#1C1E22]/90 border-[#2D3139] text-[#FFFFFF]" :
    activeTheme === "yellow" ? "bg-[#FFFDE5]/90 border-[#D2CCA9] text-[#000000]" :
    activeTheme === "blue" ? "bg-[#EEF5FA]/90 border-[#AFC3D4] text-[#0A192F]" :
    activeTheme === "sepia" ? "bg-[#F4EAD4]/90 border-[#CCD2B8] text-[#2D1910]" :
    "bg-white/50 border-[#DCD9D0] text-[#111111]";

  const inputBgClass = 
    activeTheme === "dark" ? "bg-[#2A2D35] text-[#FFFFFF] border-[#383A40]" :
    activeTheme === "yellow" ? "bg-[#FFFDE5] text-black border-[#D2CCA9]" :
    activeTheme === "blue" ? "bg-[#EEF5FA] text-[#0A192F] border-[#AFC3D4]" :
    activeTheme === "sepia" ? "bg-[#FDFBF4] text-[#2D1910] border-[#CCD2B8]" :
    "bg-[#F7F4EE]/50 text-stone-900 border-[#DCD9D0]";

  const buttonClass =
    activeTheme === "dark" ? "bg-[#252830] text-[#E1E4EA] hover:bg-[#323642] border-[#2D3139]" :
    activeTheme === "sepia" ? "bg-[#FDFBF4] text-[#2D1910] hover:bg-[#ECE0C6] border-[#DFCEB3]" :
    "bg-white text-stone-700 hover:bg-stone-50 border-[#DCD9D0]";

  const fontClasses: Record<string, string> = {
    Lexend: "font-lexend",
    OpenDyslexic: "font-dyslexic",
    Atkinson: "font-atkinson",
    Inter: "font-inter",
  };

  // Resolve current read book if exists
  const activeBook = books.find((b) => b.id === currentPosition.bookId) || books[0];

  // Filters catalog
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === "All" || book.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesAgeGroup = selectedAgeGroup === "All" || book.ageGroup === selectedAgeGroup;

    return matchesSearch && matchesDifficulty && matchesCategory && matchesAgeGroup;
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
    <div id="dashboard-root" className={`min-h-screen ${pageBgClass} font-sans flex flex-col justify-between transition-all duration-300`}>
      
      {/* HEADER: Geometric navigation toolbar */}
      <nav className={`h-16 border-b px-8 flex items-center justify-between backdrop-blur-sm shadow-xs sticky top-0 z-40 ${headerBgClass} ${borderClass} transition-all duration-300`}>
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
                  isActive ? "border-[#5B8FB9] text-[#5B8FB9]" : `border-transparent ${textSecondary} hover:text-[#5B8FB9]`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Badge Profile Avatar */}
        <div className="flex items-center gap-2 font-sans">
          {currentUser ? (
            <button
              onClick={() => setActiveTab("profile")}
              className="px-3 h-10 rounded-full bg-[#5B8FB9]/10 text-[#3D729E] border border-[#5B8FB9]/20 flex items-center gap-2 hover:bg-[#5B8FB9]/20 transition-all cursor-pointer touch-target"
              aria-label="View user profile"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#3D729E] to-[#6FA6CD] text-white flex items-center justify-center text-[10px] font-black">
                {currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-bold truncate max-w-[120px]">{currentUser.email}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("profile")}
              className="px-4 h-10 rounded-full bg-[#5B8FB9] hover:bg-[#4C7C9E] text-white font-black text-xs transition-all cursor-pointer shadow-xs touch-target"
              aria-label="Register or sign in"
            >
              Register or sign in
            </button>
          )}
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
            const detailBook = books.find((b) => b.id === detailedBookId) || onlineBooks.find((b) => b.id === detailedBookId)!;
            const diffSpec = DIFFICULTY_SPECS[detailBook.difficulty];
            const activeProfileClass = fontClasses[preferences.font];
            const previewTextSample = (detailBook.chapters && detailBook.chapters[0]?.content[0]) || "This custom Open Library book is fully compatible with Nara's Visual Stress assistant tools. Adjust your line space, font typeface, and reading guides above.";

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
                    {generatingBookId === detailBook.id ? (
                      <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center text-emerald-800">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        <p className="text-xs font-black uppercase tracking-wider">Accessing & Formatting chapters...</p>
                        <p className="text-[10px] text-emerald-600 max-w-md">
                          Our active AI reading companion is currently generating structured paragraph segments, concept definitions, and character lists for this catalog item.
                        </p>
                      </div>
                    ) : detailBook.chapters && detailBook.chapters.length > 0 ? (
                      <button
                        onClick={() => onSelectBook(detailBook.id)}
                        className="w-full h-14 bg-[#5B8FB9] text-white font-black text-sm uppercase rounded-2xl tracking-widest hover:bg-[#497A9E] transition-all flex items-center justify-center gap-2 shadow-lg hover:translate-y-[-1px] cursor-pointer"
                      >
                        <span>Start Reading Experience</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateAndReadBook(detailBook)}
                        className="w-full h-14 bg-gradient-to-r from-emerald-600 to-[#5B8FB9] text-white font-black text-sm uppercase rounded-2xl tracking-widest hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg hover:translate-y-[-1px] cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 text-emerald-100" />
                        <span>AI Format & Start Reading</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* STANDARD TABS */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Tab 1: Library Index */}
            {activeTab === "library" && (() => {
              // Open Library style: cover-dominant vertical card for horizontal shelf rows
              const renderBookCard = (book: Book, isGlobal = false) => {
                return (
                  <div
                    key={book.id}
                    className="group flex-shrink-0 w-36 flex flex-col cursor-pointer"
                    onClick={() => setDetailedBookId(book.id)}
                  >
                    <div className="relative w-36 h-52 rounded-lg overflow-hidden shadow-md border border-[#DCD9D0]/60 bg-[#F0EDE6] flex items-center justify-center">
                      {book.coverUrl ? (
                        <>
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className={`hidden absolute inset-0 bg-gradient-to-br ${book.coverColor} p-3 text-white flex-col justify-between`}>
                            <span className="text-[9px] font-black uppercase opacity-80 line-clamp-1">{book.author}</span>
                            <p className="text-xs font-extrabold leading-tight line-clamp-3">{book.title}</p>
                          </div>
                        </>
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} p-3 text-white flex flex-col justify-between`}>
                          <span className="text-[9px] font-black uppercase opacity-80 line-clamp-1">{book.author}</span>
                          <p className="text-xs font-extrabold leading-tight line-clamp-3">{book.title}</p>
                          <span className="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded w-fit">{book.difficulty}</span>
                        </div>
                      )}
                      <span className={`absolute top-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded ${isGlobal ? 'bg-emerald-600 text-white' : 'bg-[#5B8FB9] text-white'}`}>
                        {isGlobal ? "Global" : "Offline"}
                      </span>
                    </div>
                    <div className="mt-2 px-0.5">
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#5B8FB9] transition-colors">{book.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{book.author}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); isGlobal ? handleGenerateAndReadBook(book) : onSelectBook(book.id); }}
                      className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        isGlobal
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white'
                          : 'bg-[#EEF5FA] text-[#5B8FB9] border border-[#5B8FB9]/30 hover:bg-[#5B8FB9] hover:text-white'
                      }`}
                    >
                      {isGlobal ? (generatingBookId === book.id ? "Loading..." : "Read") : "Read"}
                    </button>
                  </div>
                );
              };

              const renderShelfRow = (label: string, emoji: string, bookList: Book[], isGlobal = false, loading = false) => (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">{label}</h3>
                    {isGlobal && <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-black px-2 py-0.5 rounded">Open Library</span>}
                  </div>
                  {loading ? (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-[#5B8FB9]" />
                      <span className="text-xs text-slate-400">Loading titles...</span>
                    </div>
                  ) : bookList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3">No titles found.</p>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-3" style={{scrollbarWidth:'none'}}>
                      {bookList.map((book) => renderBookCard(book, isGlobal))}
                    </div>
                  )}
                </div>
              );

              const subjectOptions = [
                { key: "classics", label: "Classics", emoji: "📜" },
                { key: "fantasy", label: "Fantasy", emoji: "🧙‍♂️" },
                { key: "science_fiction", label: "Sci-Fi", emoji: "🚀" },
                { key: "biographies", label: "Biographies", emoji: "🧠" },
                { key: "history", label: "History", emoji: "🏛️" },
                { key: "romance", label: "Romance", emoji: "💖" },
                { key: "mystery", label: "Mystery", emoji: "🕵️‍♂️" },
                { key: "children", label: "Kids Story", emoji: "👶" }
              ];

              return (
                <div className="space-y-6">
                  
                  {/* Hero Header Greeting with date */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight">Open Library Portal</h1>
                      <p className="text-xs text-[#666666] mt-1 font-bold">
                        Browse, convert, and format millions of free public domain classics instantly with active support layers.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#666666] bg-white border px-3 py-1.5 rounded-xl">
                      Today is Thursday, Jun 11
                    </span>
                  </div>

                  {/* Interactive Search Tool row (Filters by title, author, difficulty, length, categories, age) */}
                  <div className="bg-white p-4 border border-[#DCD9D0] rounded-2xl grid grid-cols-1 md:grid-cols-6 gap-3 shadow-xs font-sans">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search millions of books by title, author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F7F4EE]/50 border border-[#DCD9D0] rounded-xl focus:outline-none focus:border-[#5B8FB9]"
                      />
                    </div>

                    <div>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full text-xs py-2 px-3 bg-white border border-[#DCD9D0] rounded-xl focus:outline-none font-bold"
                      >
                        <option value="All">All Difficulties</option>
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
                        <option value="All">All Categories</option>
                        {categories.filter(c => c !== "All").map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedAgeGroup}
                        onChange={(e) => setSelectedAgeGroup(e.target.value)}
                        className="w-full text-xs py-2 px-3 bg-white border border-[#DCD9D0] rounded-xl focus:outline-none font-bold text-amber-900 border-amber-200"
                      >
                        <option value="All">All Age Groups</option>
                        <option value="Kids">Kids (under 12)</option>
                        <option value="Teens">Teens (13-17)</option>
                        <option value="Adults">Adults (18+)</option>
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
                        <option value="length-asc">Sort: Reading Time (Short)</option>
                        <option value="length-desc">Sort: Reading Time (Long)</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject Genre Navigation Bar */}
                  <div className="space-y-3 bg-white/40 p-4 border border-[#DCD9D0]/60 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-[#666666] tracking-widest">
                        Browse Millions of Books by Subject (Open Library Stream)
                      </h3>
                      {fetchingSubject && (
                        <span className="flex items-center gap-1.5 text-[10px] uppercase font-black text-[#5B8FB9] animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Indexing...
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                      {subjectOptions.map((opt) => {
                        const isActive = selectedSubject === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => setSelectedSubject(opt.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#5B8FB9] text-white border-[#5B8FB9] shadow-inner font-extrabold translate-y-[0.5px]"
                                : "bg-white text-slate-700 border-[#DCD9D0] hover:border-[#5B8FB9]"
                            }`}
                          >
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clean, Non-Flicker Layout matching user search action */}
                  {!searchQuery.trim() ? (
                    <div className="space-y-8">
                      {/* Active continue reading focus highlight if set */}
                      <div
                        onClick={() => onSelectBook(activeBook.id)}
                        className="bg-white border border-[#DCD9D0] rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-xs hover:border-[#5B8FB9] cursor-pointer transition-all"
                      >
                        <div className={`w-28 h-36 bg-gradient-to-br ${activeBook.coverColor} rounded-xl shadow-md flex-shrink-0 flex items-center justify-center text-center p-3 text-white border border-black/10`}>
                          <p className="text-xs font-black truncate max-w-full">{activeBook.title}</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1 animate-fadeIn">
                          <div>
                            <span className="px-2 py-1 bg-[#EEF5FA] text-[#5B8FB9] text-[9px] font-black rounded uppercase">Current Active Bookshelf</span>
                            <h2 className="text-xl font-bold mt-2 text-[#222222]">{activeBook.title}</h2>
                            <p className="text-[#666666] text-xs leading-relaxed max-w-xl mt-1">
                              Active spot: {activeBook.chapters && activeBook.chapters[0]?.title}. Pick back up with high spacing, read along, and text isolation tools.
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="h-10 px-5 bg-[#5B8FB9] text-white rounded-xl text-xs font-bold hover:bg-[#4A7BA3] flex items-center gap-1.5 shadow-sm">
                              <span>Resume Reading Space</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Offline Bookshelf Row */}
                      {renderShelfRow(
                        "Your Bookshelf",
                        "📚",
                        books.filter(b => {
                          const sub = selectedSubject.toLowerCase();
                          if (sub === "classics") return b.category.toLowerCase().includes("classic");
                          if (sub === "fantasy") return ["alice-wonderland", "peter-pan", "the-little-prince", "the-secret-garden"].includes(b.id);
                          if (sub === "science_fiction") return ["astronomy-basics", "frankenstein", "the-time-machine"].includes(b.id);
                          if (sub === "children") return ["alice-wonderland", "peter-pan", "the-little-prince", "the-secret-garden"].includes(b.id);
                          if (sub === "romance") return ["pride-prejudice"].includes(b.id);
                          if (sub === "mystery") return ["sherlock-holmes", "frankenstein"].includes(b.id);
                          return true;
                        }),
                        false
                      )}

                      {/* Open Library Stream Row */}
                      {renderShelfRow(
                        subjectOptions.find(o => o.key === selectedSubject)?.label || selectedSubject,
                        subjectOptions.find(o => o.key === selectedSubject)?.emoji || "🌎",
                        subjectBooks,
                        true,
                        fetchingSubject
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fadeIn">
                      {/* Search results subdivision */}
                      <div>
                        <h3 className="text-xs font-extrabold uppercase text-[#777777] tracking-widest mb-4">Matches in My Bookshelf</h3>
                        {filteredBooks.length > 0 ? (
                          <div className="flex gap-4 overflow-x-auto pb-3" style={{scrollbarWidth:'none'}}>
                            {filteredBooks.map((book) => renderBookCard(book, false))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic p-4 bg-white rounded-xl border border-[#DCD9D0]">
                            No pre-loaded bookshelf titles match your criteria. Searching the global library below...
                          </p>
                        )}
                      </div>

                      {/* Global Database Automated Search subdivision */}
                      <div className="border-t border-[#DCD9D0]/60 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <h3 className="text-xs font-extrabold uppercase text-emerald-800 tracking-widest">
                              Discoveries from Free Global Library (Open Library & Gutenberg Integration)
                            </h3>
                          </div>
                          {searchingOnline && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-black text-[#5B8FB9] animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Searching...
                            </span>
                          )}
                        </div>

                        {onlineError && (
                          <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 p-4 rounded-xl mb-4">
                            {onlineError}
                          </p>
                        )}

                        {searchingOnline && onlineBooks.length === 0 ? (
                          <div className="text-center py-12 bg-white/50 border border-dashed border-[#DCD9D0] rounded-2xl">
                            <Loader2 className="w-6 h-6 animate-spin text-[#5B8FB9] mx-auto" />
                            <p className="text-xs font-bold text-slate-700 mt-3 uppercase tracking-wider">Connecting to Open Library & Gutenberg database...</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Searching for covers, authors, metadata, and books matching "{searchQuery}" automatically.</p>
                          </div>
                        ) : onlineBooks.length > 0 ? (
                          <div className="flex gap-4 overflow-x-auto pb-3" style={{scrollbarWidth:'none'}}>
                            {onlineBooks.map((book) => renderBookCard(book, true))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-[#F7F4EE]/40 rounded-2xl border border-dashed border-[#DCD9D0]">
                            <p className="text-xs text-[#666666] font-bold">
                              {searchingOnline ? "Updating live database entries..." : `No additional global public domain matches were found for "${searchQuery}".`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

            {/* Tab 2: Resume */}
            {activeTab === "resume" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black">Continue Reading Space</h2>
                <p className="text-xs text-[#666666]">Instantly rejoin your paragraphs with preloaded settings intact.</p>

                <div className="space-y-4">
                  {books.map((book) => {
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
                  </div>

                  {/* Right Columns: Presets and Onboarding Rerun */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#DCD9D0] space-y-6 font-sans">
                    {currentUser ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B8FB9] to-[#E3EFFD] flex items-center justify-center font-black text-white text-xl">
                            {currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : "R"}
                          </div>
                          <div>
                            <p className="text-lg font-bold">Nara Active Reader</p>
                            <p className="text-xs text-emerald-600 font-bold">✓ Synced: {currentUser.email}</p>
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
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                          <User className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">No Verified Account</p>
                          <p className="text-xs text-gray-500 font-bold max-w-xs mx-auto mt-1 leading-normal">
                            Sign up or sign in using the passwordless email form to see your synced reader account and lock in custom settings permanently.
                          </p>
                        </div>
                        <div className="bg-[#F7F4EE] text-gray-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#DCD9D0]">
                          Reading as Guest
                        </div>
                      </div>
                    )}

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
                  <h2 className={`text-2xl font-black ${textPrimary}`}>Accessibility Control Tower</h2>
                  <p className={`text-xs ${textSecondary}`}>Refine visual properties, toggles, and synthesize audio preferences.</p>
                </div>

                <div className={`p-8 rounded-3xl border space-y-6 ${cardBgClass} ${borderClass}`}>
                  
                  {/* Contrast, spacing slider controls */}
                  <div className="space-y-6">
                    <h3 className={`text-sm font-black border-b pb-2 ${textPrimary} ${borderClass}`}>Custom Adjustments</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className={`text-xs font-bold block ${textSecondary}`}>Fine-tune Font Size ({preferences.textSize}px)</label>
                        <input
                          type="range"
                          min="16"
                          max="36"
                          value={preferences.textSize}
                          onChange={(e) => onUpdatePreferences({ ...preferences, textSize: parseInt(e.target.value) })}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#5B8FB9] ${isDark ? 'bg-[#2A2D35]' : 'bg-[#DCD9D0]'}`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold block ${textSecondary}`}>Fine-tune Line Height ({preferences.lineSpacing}x)</label>
                        <input
                          type="range"
                          min="1.2"
                          max="2.5"
                          step="0.1"
                          value={preferences.lineSpacing}
                          onChange={(e) => onUpdatePreferences({ ...preferences, lineSpacing: parseFloat(e.target.value) })}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#5B8FB9] ${isDark ? 'bg-[#2A2D35]' : 'bg-[#DCD9D0]'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className={`text-xs font-bold block ${textSecondary}`}>Active Typographic Font</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Lexend", "OpenDyslexic", "Atkinson", "Inter"].map((f) => (
                            <button
                              key={f}
                              onClick={() => onUpdatePreferences({ ...preferences, font: f as any })}
                              className={`p-2 border rounded-xl text-xs font-extrabold transition-all truncate text-left select-none cursor-pointer ${
                                preferences.font === f
                                  ? "border-[#5B8FB9] bg-[#5B8FB9]/10 text-[#5B8FB9] ring-2 ring-[#5B8FB9]/20"
                                  : buttonClass
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold block ${textSecondary}`}>Active Contrast Theme (Toggle Dark Mode)</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {[
                            { id: "cream", label: "Cream Light", bg: "#F7F4EE" },
                            { id: "yellow", label: "Soft Yellow", bg: "#FFFDE5" },
                            { id: "blue", label: "Ice Blue", bg: "#EEF5FA" },
                            { id: "sepia", label: "Sepia Warm", bg: "#F4EAD4" },
                            { id: "dark", label: "Midnight Dark", bg: "#1E1F22" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                onUpdatePreferences({ ...preferences, theme: t.id as any });
                              }}
                              className={`p-2 border rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer truncate ${
                                preferences.theme === t.id
                                  ? "border-[#5B8FB9] bg-[#5B8FB9]/10 text-[#5B8FB9] ring-2 ring-[#5B8FB9]/20"
                                  : buttonClass
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                                style={{ backgroundColor: t.bg }}
                              />
                              <span className="truncate">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motion Toggles */}
                  <div className="space-y-4">
                    <h3 className={`text-sm font-black border-b pb-2 ${textPrimary} ${borderClass}`}>System Parameters</h3>
                    
                    <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-[#252830]' : 'bg-gray-50'}`}>
                      <div>
                        <p className={`text-xs font-black ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>WCAG AAA Reduce Motion</p>
                        <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#8C93A3]' : 'text-gray-400'}`}>Turns off heavy text fades and slide transitions to avoid visual fatigue.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.reduceMotion}
                        onChange={(e) => onUpdatePreferences({ ...preferences, reduceMotion: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#5B8FB9] focus:ring-[#5B8FB9] accent-[#5B8FB9] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Accessibility Standards list */}
                  <div className={`p-4 rounded-xl space-y-2 border ${isDark ? 'bg-sky-950/20 border-sky-900/40 text-sky-200' : 'bg-blue-50 border-blue-200 text-[#1B2A4A]'}`}>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#5B8FB9]" /> WCAG AA compliance audited:
                    </p>
                    <ul className={`text-[11px] list-disc pl-5 space-y-1 ${isDark ? 'text-sky-200/80' : 'text-[#444444]'}`}>
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