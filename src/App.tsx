import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import ReaderView from "./components/ReaderView";
import { UserPreferences, ReadingStats, ReadingPosition, Bookmark } from "./types";
import { SAMPLE_BOOKS } from "./data/books";

export default function App() {
  // Reading Setup State (Preferences & Calibration parameters)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Core shelf state tracking
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [currentPosition, setCurrentPosition] = useState<ReadingPosition>({
    bookId: "alice-wonderland",
    chapterId: "chapter-1",
    paragraphIndex: 0,
  });

  // Streaks, finished counts, total seconds
  const [stats, setStats] = useState<ReadingStats>({
    booksCompleted: 1,
    readingStreak: 3,
    minutesRead: 24,
    wordsRead: 4400,
    dailyGoalMinutes: 30,
    lastReadDate: new Date().toISOString().split("T")[0],
  });

  // Dynamic user-feedback checkups tracker
  const [satisfactionHistory, setSatisfactionHistory] = useState<string[]>([]);

  // 1. Load persisted data from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("lumina_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(parsed);
        setHasCompletedOnboarding(true);
      } else {
        setHasCompletedOnboarding(false);
      }

      const savedBookmarks = localStorage.getItem("lumina_bookmarks");
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }

      const savedPos = localStorage.getItem("lumina_position");
      if (savedPos) {
        setCurrentPosition(JSON.parse(savedPos));
      }

      const savedStats = localStorage.getItem("lumina_stats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      const savedSatis = localStorage.getItem("lumina_satisfactions");
      if (savedSatis) {
        setSatisfactionHistory(JSON.parse(savedSatis));
      }
    } catch (e) {
      console.warn("Storage loading failed:", e);
    }
  }, []);

  // 2. Local Storage sync helpers
  const savePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem("lumina_preferences", JSON.stringify(newPrefs));
    setHasCompletedOnboarding(true);
  };

  const handleUpdatePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    localStorage.setItem("lumina_preferences", JSON.stringify(updated));
  };

  const handleAddBookmark = (newB: Bookmark) => {
    const updated = [newB, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("lumina_bookmarks", JSON.stringify(updated));
  };

  const handleUpdatePosition = (pos: ReadingPosition) => {
    setCurrentPosition(pos);
    localStorage.setItem("lumina_position", JSON.stringify(pos));
  };

  const handleReadingMinute = () => {
    // Add positive reading minutes to parameters and simulated rendering word counts
    const addedMinutes = 1;
    const addedWords = 180; // approximate words scanned with active highlighting
    setStats((prev) => {
      const updated = {
        ...prev,
        minutesRead: prev.minutesRead + addedMinutes,
        wordsRead: prev.wordsRead + addedWords,
      };
      localStorage.setItem("lumina_stats", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAnswerSatisfaction = (feeling: string) => {
    const updated = [feeling, ...satisfactionHistory].slice(0, 5); // Store top 5 reactions
    setSatisfactionHistory(updated);
    localStorage.setItem("lumina_satisfactions", JSON.stringify(updated));
  };

  const handleRestartOnboarding = () => {
    setHasCompletedOnboarding(false);
  };

  // Render Loader screen until localStorage finishes mounting
  if (!preferences && hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#E5E1D8] border-t-[#5B8FB9] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Compiling high-contrast layout parameters...</p>
        </div>
      </div>
    );
  }

  // Phase A: Onboarding Wizard Configuration screen
  if (!hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={(newPrefs) => {
          savePreferences(newPrefs);
          // Set standard starting position or default from last selection
          handleUpdatePosition({
            bookId: "alice-wonderland",
            chapterId: "chapter-1",
            paragraphIndex: 0,
          });
        }}
      />
    );
  }

  // Phase B: Immersive Reading Experience Viewer (centered layout, max-width 700px, premium overlay tools)
  if (selectedBookId) {
    const activeReadingBook = SAMPLE_BOOKS.find((b) => b.id === selectedBookId) || SAMPLE_BOOKS[0];
    return (
      <ReaderView
        book={activeReadingBook}
        preferences={preferences!}
        onUpdatePreferences={handleUpdatePreferences}
        onBackToDashboard={() => setSelectedBookId(null)}
        bookmarks={bookmarks}
        onAddBookmark={handleAddBookmark}
        currentPosition={currentPosition}
        onUpdatePosition={handleUpdatePosition}
        onReadingMinute={handleReadingMinute}
      />
    );
  }

  // Phase C: Platform Dashboard Workspace (Library catalog, stats bento cards, profile preferences and accessibility checkups)
  return (
    <Dashboard
      preferences={preferences!}
      onUpdatePreferences={handleUpdatePreferences}
      bookmarks={bookmarks}
      stats={stats}
      currentPosition={currentPosition}
      onSelectBook={(bookId) => {
        // Initialize current position settings for this target book when selected
        handleUpdatePosition({
          bookId,
          chapterId: bookId === "the-metamorphosis" ? "chapter-1" : "chapter-1",
          paragraphIndex: 0,
        });
        setSelectedBookId(bookId);
      }}
      onRestartOnboarding={handleRestartOnboarding}
      onAnswerSatisfaction={handleAnswerSatisfaction}
      satisfactionHistory={satisfactionHistory}
    />
  );
}
