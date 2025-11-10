
export interface QuizOption {
  /** Unique option identifier (e.g., "A", "B", "C", "D" or custom keys) */
  key: string;
  /** Option value - can be numeric (for ratings) or string (for text options) */
  value: number | string;
  /** Display text shown to the user for this option */
  label: string;
  /** Optional image URL for visual options (used in single-image-grid questions) */
  image?: string;
}

export class QuizAnswer {
  questionKey!: string;
  questionLabel!: string;
  mainQuestionLabel?: string;
  questionType!: 'rate' | 'single-image' | 'single-image-grid' | 'single-list';
  selectedValue!: string | number;
  selectedOption?: QuizOption | null;
  timestamp!: string;
  isCorrect?: boolean;
  subQuestionText?: string; // For rate questions (row label)
}

export class QuizUserAnswer {
  selectedValue!: string | number;
  selectedOption?: QuizOption | null;
  timestamp!: string;
  isCorrect?: boolean;
  subQuestionText?: string; // For rate questions
}

export class QuizQuestionAnswer {
  questionId!: string;
  questionType!: 'rate' | 'single-image' | 'single-image-grid' | 'single-list';
  userAnswers!: QuizUserAnswer[];
}

export class QuizServerPayload {
  id!: string;
  answers!: QuizQuestionAnswer[];
  completedAt?: string;
  totalQuestions?: number;
  correctAnswers?: number;
}

// Type for the answers collection used in the component
export type AnswersCollection = { [key: string]: QuizAnswer };