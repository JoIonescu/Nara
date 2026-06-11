export type FontOption = "Lexend" | "OpenDyslexic" | "Atkinson" | "Inter";
export type ThemeOption = "cream" | "yellow" | "blue" | "sepia" | "dark";
export type SupportMode = "read-only" | "read-audio" | "audio-first";
export type FocusModeType = "normal" | "paragraph" | "line" | "window";

export interface UserPreferences {
  font: FontOption;
  textSize: number; // 16px to 36px
  lineSpacing: number; // 1.2 to 2.5
  theme: ThemeOption;
  support: SupportMode;
  reduceMotion: boolean;
}

export interface CharacterCard {
  name: string;
  role: string;
  relationships: string;
  events: string;
}

export interface ConceptCard {
  term: string;
  definition: string;
  keyTerms: string[];
  examples: string[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string[]; // Paragraphs
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string; // Elegant gradients for cover backgrounds
  coverIcon: string;  // Lucide icon name to render on cover
  category: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  reading_time: number; // in minutes
  description: string;
  chapters: Chapter[];
  characters: CharacterCard[];
  concepts: ConceptCard[];
}

export interface ReadingPosition {
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  scrollOffset?: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  textSnippet: string;
  note?: string;
  timestamp: number;
}

export interface ReadingStats {
  booksCompleted: number;
  readingStreak: number;
  minutesRead: number;
  wordsRead: number;
  dailyGoalMinutes: number;
  lastReadDate?: string; // YYYY-MM-DD
}

export interface AIResponse {
  simplifiedText?: string;
  explanation?: string;
  chapterSummary?: {
    keyIdeas: string[];
    mainEvents: string[];
    characterUpdates: string[];
  };
}
