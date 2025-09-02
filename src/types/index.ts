export type QuestionType = "MULTIPLE_CHOICE" | "GRID_IN";
export type Choice = { key: string; text: string };
export type Mode = "CONFIG" | "TEST" | "RESULTS";

export type RawQuestion = {
  id: string;
  index?: number; // display number
  type: QuestionType;
  category?: string;
  stem: string; // can include simple HTML/markdown-like text
  choices?: Choice[]; // only for MC
  answer: string; // "A" | "B" | ... or a numeric/fraction string like "-4" or "3/10"
};

// UI-delivered: index must be present
export interface Question extends Omit<RawQuestion, "index"> {
  index: number; // <— required when returned to client
}

export type TimerDisplayProps = {
  durationSec: number; // total time in seconds
  running: boolean; // start/stop
  onTimeUp: () => void; // callback when time hits 0
};
