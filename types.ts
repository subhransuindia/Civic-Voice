import type { INDIAN_LANGUAGES } from './constants';

export type Language = typeof INDIAN_LANGUAGES[number];

export interface Bill {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: 'Passed' | 'In Process' | 'Appealed' | 'Announced';
  date: string; // e.g., "Introduced on Aug 3, 2023"
  voteCount: {
    for: number;
    against: number;
  };
}

export interface DebateSegment {
  speaker: string;
  party: string;
  statement: string;
}

export interface MediaItem {
  type: 'Video' | 'Audio' | 'News';
  title: string;
  description: string;
  uri?: string;
}

export interface Viewpoints {
  pro: string;
  con: string;
  neutral: string;
}

export interface ChartDataPoint {
  name: string;
  'If Passed': number;
  'If Not Passed': number;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface MindMapNode {
    title: string;
    children?: string[];
}
export interface MindMap {
    centralTopic: string;
    branches: MindMapNode[];
}


export interface BillAnalysis {
  simplifiedExplanation: string;
  viewpoints: Viewpoints;
  impactData: ChartDataPoint[];
  parliamentaryDebate: DebateSegment[];
  media: MediaItem[];
  flashcards: Flashcard[];
  mindMap: MindMap;
}

export interface ChatMessage {
    id: number;
    text: string;
    author: 'user' | 'ai';
    name: string; // "You", "Priya K.", "Rohan S.", etc.
}