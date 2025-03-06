export interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  matchDate: string;
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  isActive: boolean;
  closedAt: string;
}

export interface Prediction {
  id: string;
  match: string;
  question: string;
  selectedOption: string;
  date: string;
  status: "pending" | "won" | "lost";
  reward?: number;
}
