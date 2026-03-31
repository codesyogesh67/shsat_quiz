export type QuestionType = "MULTIPLE_CHOICE" | "FREE_RESPONSE";

export type Choice = {
  key: string;
  text: string;
};

export type QuestionMedia = {
  type: "image" | "graph";
  url?: string;
  base64?: string;
  alt?: string;
  xAxis?: { min: number; max: number };
  yAxis?: { min: number; max: number };
  shapes?: {
    type: "line" | "polygon";
    points: number[][];
    fill?: string;
  }[];
} | null;

export type ExamQuestion = {
  id: string;
  index: number;
  type: QuestionType;
  category?: string | null;
  stem: string;
  choices?: Choice[];
  answer?: string;
  media?: QuestionMedia;
  examSet?: string | null;
};

export type ReviewFilter = "all" | "wrong" | "correct" | "flagged";

export type ResultPerQuestion = {
  id: string;
  index: number;
  correct: boolean;
  user?: string;
  gold?: string;
  category?: string;
  flagged: boolean;
};

export type CategoryResult = {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
};

export type SessionResultsData = {
  score: number;
  accuracy: number;
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  byCategory: Record<string, CategoryResult>;
  perQuestion: ResultPerQuestion[];
};
