import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import ReaderView from "./components/ReaderView";
import { UserPreferences, ReadingStats, ReadingPosition, Bookmark } from "./types";
import { SAMPLE_BOOKS } from "./data/books";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";

export default function App() {
  // Reading Setup State (Preferences & Calibration parameters)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [magicLinkStatus, setMagicLinkStatus] = useState<{ type: "success" | "error" | "loading"; message: string } | null>(null);

  // Core shelf state tracking
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [currentPosition, setCurrentPosition] = useState<ReadingPosition>({
    bookId: "alice-wonderland",
    chapterId: "chapter-1",
    paragraphIndex: 0,
  });

  // Streaks, finished counts, total seconds — zeroed so new users start fresh
  const [stats, setStats] = useState<ReadingStats>({
    booksCompleted: 0,
    readingStreak: 0,
    minutesRead: 0,
    wordsRead: 0,
    dailyGoalMinutes: 30,
    lastReadDate: "",
  });

  // Dynamic user-feedback checkups tracker
  const [satisfactionHistory, setSatisfactionHistory] = useState<string[]>([]);

  // 0. Auto passwordless email login link handler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      setMagicLinkStatus({ type: "loading", message: "Verifying your magic email link..." });
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please type your email to confirm signing back into Nara:");
      }

      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem("emailForSignIn");
            setMagicLinkStatus({
              type: "success",
              message: `Success! Signed in as ${result.user?.email || "Nara user"}!`
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((err: any) => {
            console.error(err);
            setMagicLinkStatus({
              type: "error",
              message: `Failed to authenticate link: ${err.message || err}`
            });
          });
      } else {
        setMagicLinkStatus(null);
      }
    }

    return () => unsubscribe();
  }, []);

  // 0.1 Active Firestore sync manager
  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for user profile metadata
    const profileRef = doc(db, "users", currentUser.uid);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserPreferences;
        setPreferences(data);
        setHasCompletedOnboarding(true);
      } else {
        // Seed Firestore profile with current local preferences if user just registered
        if (preferences) {
          const profilePayload = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            font: preferences.font,
            textSize: preferences.textSize,
            lineSpacing: preferences.lineSpacing,
            theme: preferences.theme,
            support: preferences.support,
            reduceMotion: preferences.reduceMotion,
            ...(preferences.narratorVoice ? { narratorVoice: preferences.narratorVoice } : {})
          };
          setDoc(profileRef, profilePayload).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser!.uid}`);
    });

    // Real-time listener for bookmarks
    const bookmarksRef = collection(db, "users", currentUser.uid, "bookmarks");
    const unsubBookmarks = onSnapshot(bookmarksRef, (snapshot) => {
      const fbBookmarks: Bookmark[] = [];
      snapshot.forEach((docSnap) => {
        fbBookmarks.push(docSnap.data() as Bookmark);
      });
      fbBookmarks.sort((a, b) => b.timestamp - a.timestamp);
      setBookmarks(fbBookmarks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${currentUser!.uid}/bookmarks`);
    });

    // Real-time listener for reading positions
    const positionsRef = collection(db, "users", currentUser.uid, "positions");
    const unsubPositions = onSnapshot(positionsRef, (snapshot) => {
      snapshot.forEach((docSnap) => {
        const pos = docSnap.data() as ReadingPosition;
        if (pos.bookId === currentPosition.bookId) {
          setCurrentPosition(pos);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${currentUser!.uid}/positions`);
    });

    // Real-time listener for reading stats
    const statsDocRef = doc(db, "users", currentUser.uid, "stats", "reading");
    const unsubStats = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as ReadingStats);
      } else {
        // Seed stats with real zeros for new users
        const statsPayload = {
          userId: currentUser.uid,
          booksCompleted: 0,
          readingStreak: 0,
          minutesRead: 0,
          wordsRead: 0,
          dailyGoalMinutes: 30,
          lastReadDate: "",
        };
        setDoc(statsDocRef, statsPayload).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser!.uid}/stats/reading`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser!.uid}/stats/reading`);
    });

    // Migrate any pre-existing bookmarks and position from local variables to Cloud Firestore
    const migrateLocalToFirestore = async () => {
      try {
        if (bookmarks.length > 0) {
          for (const bm of bookmarks) {
            const bmRef = doc(db, "users", currentUser.uid, "bookmarks", bm.id);
            await setDoc(bmRef, {
              id: bm.id,
              userId: currentUser.uid,
              bookId: bm.bookId,
              chapterId: bm.chapterId,
              paragraphIndex: bm.paragraphIndex,
              textSnippet: bm.textSnippet,
              timestamp: bm.timestamp,
              ...(bm.note ? { note: bm.note } : {})
            });
          }
        }
      } catch (err) {
        console.warn("Soft migration skipped:", err);
      }
    };
    migrateLocalToFirestore();

    return () => {
      unsubProfile();
      unsubBookmarks();
      unsubPositions();
      unsubStats();
    };
  }, [currentUser]);

  // 1. Load persisted data from localStorage on mount (offline cache fallback)
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

  // 2. Local Storage & Firestore dual-sync helpers
  const savePreferences = (newPrefs: UserPreferences) => {
    newPrefs = { letterSpacing: 0.05, wordSpacing: 0.1, bionicReading: false, syllableBreaking: false, ...newPrefs };
    setPreferences(newPrefs);
    localStorage.setItem("lumina_preferences", JSON.stringify(newPrefs));
    setHasCompletedOnboarding(true);

    if (currentUser) {
      const profileRef = doc(db, "users", currentUser.uid);
      setDoc(profileRef, {
        uid: currentUser.uid,
        email: currentUser.email || "",
        font: newPrefs.font,
        textSize: newPrefs.textSize,
        lineSpacing: newPrefs.lineSpacing,
        theme: newPrefs.theme,
        support: newPrefs.support,
        reduceMotion: newPrefs.reduceMotion,
        ...(newPrefs.narratorVoice ? { narratorVoice: newPrefs.narratorVoice } : {})
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
    }
  };

  const handleUpdatePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    localStorage.setItem("lumina_preferences", JSON.stringify(updated));

    if (currentUser) {
      const profileRef = doc(db, "users", currentUser.uid);
      setDoc(profileRef, {
        uid: currentUser.uid,
        email: currentUser.email || "",
        font: updated.font,
        textSize: updated.textSize,
        lineSpacing: updated.lineSpacing,
        theme: updated.theme,
        support: updated.support,
        reduceMotion: updated.reduceMotion,
        ...(updated.narratorVoice ? { narratorVoice: updated.narratorVoice } : {})
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
    }
  };

  const handleAddBookmark = (newB: Bookmark) => {
    const updated = [newB, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("lumina_bookmarks", JSON.stringify(updated));

    if (currentUser) {
      const bmRef = doc(db, "users", currentUser.uid, "bookmarks", newB.id);
      setDoc(bmRef, {
        id: newB.id,
        userId: currentUser.uid,
        bookId: newB.bookId,
        chapterId: newB.chapterId,
        paragraphIndex: newB.paragraphIndex,
        textSnippet: newB.textSnippet,
        timestamp: newB.timestamp,
        ...(newB.note ? { note: newB.note } : {})
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/bookmarks/${newB.id}`));
    }
  };

  const handleUpdatePosition = (pos: ReadingPosition) => {
    setCurrentPosition(pos);
    localStorage.setItem("lumina_position", JSON.stringify(pos));

    if (currentUser) {
      const posRef = doc(db, "users", currentUser.uid, "positions", pos.bookId);
      setDoc(posRef, {
        userId: currentUser.uid,
        bookId: pos.bookId,
        chapterId: pos.chapterId,
        paragraphIndex: pos.paragraphIndex,
        updatedAt: new Date().toISOString()
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/positions/${pos.bookId}`));
    }
  };

  // Real reading stats: streak logic + actual minute/word tracking
  const handleReadingMinute = () => {
    const addedMinutes = 1;
    const addedWords = 180;
    const today = new Date().toISOString().split("T")[0];

    setStats((prev) => {
      const lastDate = prev.lastReadDate || "";
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      let newStreak = prev.readingStreak;
      if (lastDate === today) {
        // Already counted today — don't increment streak again
        newStreak = prev.readingStreak;
      } else if (lastDate === yesterday) {
        // Consecutive day — extend streak
        newStreak = prev.readingStreak + 1;
      } else if (lastDate === "") {
        // First ever session
        newStreak = 1;
      } else {
        // Gap in reading — reset streak to 1
        newStreak = 1;
      }

      const updated = {
        ...prev,
        minutesRead: prev.minutesRead + addedMinutes,
        wordsRead: prev.wordsRead + addedWords,
        readingStreak: newStreak,
        lastReadDate: today,
      };

      localStorage.setItem("lumina_stats", JSON.stringify(updated));

      if (currentUser) {
        const statsRef = doc(db, "users", currentUser.uid, "stats", "reading");
        setDoc(statsRef, {
          userId: currentUser.uid,
          booksCompleted: updated.booksCompleted,
          readingStreak: updated.readingStreak,
          minutesRead: updated.minutesRead,
          wordsRead: updated.wordsRead,
          dailyGoalMinutes: updated.dailyGoalMinutes,
          lastReadDate: updated.lastReadDate,
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/stats/reading`));
      }

      return updated;
    });
  };

  const handleAnswerSatisfaction = (feeling: string) => {
    const updated = [feeling, ...satisfactionHistory].slice(0, 5);
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
          handleUpdatePosition({
            bookId: "alice-wonderland",
            chapterId: "chapter-1",
            paragraphIndex: 0,
          });
        }}
      />
    );
  }

  // Phase B: Immersive Reading Experience Viewer
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

  // Phase C: Platform Dashboard Workspace
  return (
    <>
      {magicLinkStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border text-xs font-bold max-w-sm flex flex-col gap-1 transition-all ${
          magicLinkStatus.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-800"
            : magicLinkStatus.type === "error"
            ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/90 dark:text-rose-300 dark:border-rose-800"
            : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-800 animate-pulse"
        }`}>
          <div className="flex justify-between items-center gap-4">
            <span>{magicLinkStatus.message}</span>
            <button
              onClick={() => setMagicLinkStatus(null)}
              className="text-stone-400 hover:text-stone-600 font-extrabold text-base leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <Dashboard
        preferences={preferences!}
        onUpdatePreferences={handleUpdatePreferences}
        bookmarks={bookmarks}
        stats={stats}
        currentPosition={currentPosition}
        onSelectBook={(bookId) => {
          handleUpdatePosition({
            bookId,
            chapterId: "chapter-1",
            paragraphIndex: 0,
          });
          setSelectedBookId(bookId);
        }}
        onRestartOnboarding={handleRestartOnboarding}
        onAnswerSatisfaction={handleAnswerSatisfaction}
        satisfactionHistory={satisfactionHistory}
      />
    </>
  );
}