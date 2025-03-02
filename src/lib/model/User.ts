import { Schema, model, models, type Document } from "mongoose";

interface IUser extends Document {
  email: string;
  name?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  publicKey: string;
}

export type { IUser };

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    provider: { type: String, required: true },
    publicKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Static method to findOrCreate a user by publicKey
UserSchema.statics.findOrCreateByPublicKey = async function (
  publicKey: string
) {
  let user = await this.findOne({ publicKey });
  if (!user) {
    user = await this.create({
      email: `${publicKey}@placeholder.com`, // Placeholder email
      provider: "wallet",
      publicKey,
    });
  }
  return user;
};

const User = models.User || model<IUser>("User", UserSchema);
export default User;
