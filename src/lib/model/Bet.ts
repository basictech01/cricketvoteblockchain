import { Schema, model, models, Document } from 'mongoose';

interface IBet extends Document {
  question: string;
  user: string;
  option: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  isClaimed: boolean;
}

const BetSchema = new Schema<IBet>(
  {
    question: { type: Schema.Types.String, ref: 'Question', required: true },
    user: { type: Schema.Types.String, ref: 'User', required: true },
    option: { type: Schema.Types.String, required: true },
    status: { type: Schema.Types.String, default: "pending" },
    isClaimed: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true }
);

const Bet = models.Bet || model<IBet>('Bet', BetSchema);

export default Bet;

export type { IBet };