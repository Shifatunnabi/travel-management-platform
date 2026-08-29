import { Schema, model, models, type Model, type Types } from "mongoose";
import { PLATFORM_ROLES, USER_ROLES, type PlatformRole, type UserRole } from "./types";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  platformRole?: PlatformRole;
  emailVerifiedAt?: Date | null;
  verificationToken?: string | null;
  verificationTokenExpiresAt?: Date | null;
  resetToken?: string | null;
  resetTokenExpiresAt?: Date | null;
  status: "active" | "suspended";
  nationality?: string;
  dateOfBirth?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    avatar: String,
    role: { type: String, enum: USER_ROLES, default: "customer", index: true },
    platformRole: { type: String, enum: PLATFORM_ROLES },
    emailVerifiedAt: { type: Date, default: null },
    verificationToken: { type: String, default: null, select: false },
    verificationTokenExpiresAt: { type: Date, default: null, select: false },
    resetToken: { type: String, default: null, select: false },
    resetTokenExpiresAt: { type: Date, default: null, select: false },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    nationality: String,
    dateOfBirth: String,
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) ?? model<IUser>("User", userSchema);
