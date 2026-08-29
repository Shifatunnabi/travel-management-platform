import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  VENDOR_MEMBER_ROLES,
  VENDOR_STATUSES,
  type VendorMemberRole,
  type VendorStatus,
} from "./types";

export interface IKycDocument {
  label: string;
  publicId: string;
  url: string;
  uploadedAt: Date;
}

export interface IVendor {
  _id: Types.ObjectId;
  ownerUserId: Types.ObjectId;
  businessName: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  tradeLicenceNo?: string;
  tin?: string;
  kycDocuments: IKycDocument[];
  bank: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branch?: string;
    routingNumber?: string;
    verified: boolean;
    verifiedAt?: Date | null;
  };
  /** Overrides the platform default when set. */
  commissionPct?: number | null;
  /** Overrides the platform default settlement window when set. */
  settlementDays?: number | null;
  status: VendorStatus;
  moderation: {
    reviewedBy?: Types.ObjectId | null;
    note?: string;
    at?: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    contactEmail: { type: String, required: true, lowercase: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    tradeLicenceNo: String,
    tin: String,
    kycDocuments: [
      new Schema<IKycDocument>(
        {
          label: { type: String, required: true },
          publicId: { type: String, required: true },
          url: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
    ],
    bank: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      branch: String,
      routingNumber: String,
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
    },
    commissionPct: { type: Number, min: 0, max: 100, default: null },
    settlementDays: { type: Number, min: 0, default: null },
    status: { type: String, enum: VENDOR_STATUSES, default: "pending", index: true },
    moderation: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      note: String,
      at: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

export const Vendor: Model<IVendor> =
  (models.Vendor as Model<IVendor>) ?? model<IVendor>("Vendor", vendorSchema);

export interface IVendorMember {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  userId: Types.ObjectId;
  role: VendorMemberRole;
  invitedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorMemberSchema = new Schema<IVendorMember>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: VENDOR_MEMBER_ROLES, default: "staff" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
vendorMemberSchema.index({ vendorId: 1, userId: 1 }, { unique: true });

export const VendorMember: Model<IVendorMember> =
  (models.VendorMember as Model<IVendorMember>) ??
  model<IVendorMember>("VendorMember", vendorMemberSchema);
