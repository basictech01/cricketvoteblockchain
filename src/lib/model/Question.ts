import { Schema, model, models, Document } from "mongoose";

interface IQuestion extends Document {
  question: string;
  options: string[];
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  closedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Question =
  models.Question || model<IQuestion>("Question", QuestionSchema);

export default Question;

export type { IQuestion };
