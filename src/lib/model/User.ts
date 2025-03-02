import { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  name?: string;
  profilePicture?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  balance: number;
  publicKey: string;
  privateKey: string;
}

export type { IUser };
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    profilePicture: { type: String },
    provider: { type: String, required: true },
    balance: { type: Number, default: 100 },
    publicKey: { type: String },
    privateKey: { type: String },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);
export default User;
