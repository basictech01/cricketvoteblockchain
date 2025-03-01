import { Schema, model, models, Document } from 'mongoose';
import { IQuestion } from './Question';
import { IUser } from './User';

interface IBet extends Document {
  question: IQuestion;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}

const BetSchema = new Schema<IBet>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Bet = models.Bet || model<IBet>('Bet', BetSchema);

export default Bet;

export type { IBet };