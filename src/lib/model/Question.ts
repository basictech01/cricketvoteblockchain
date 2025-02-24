import { Schema, model, models, Document } from 'mongoose';

interface IQuestion extends Document {
  question: string;
  options: string[];    
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);  

const Question = models.Question || model<IQuestion>('Question', QuestionSchema);

export default Question;

export type { IQuestion };