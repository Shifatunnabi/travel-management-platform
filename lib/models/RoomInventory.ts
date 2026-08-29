import { Schema, model, models, type Model, type Types } from "mongoose";

/**
 * One document per room type per night. This is what makes availability a
 * single indexed query and lets a vendor price or close an individual date.
 * Documents are created lazily the first time a date is touched.
 */
export interface IRoomInventory {
  _id: Types.ObjectId;
  roomId: Types.ObjectId;
  hotelId: Types.ObjectId;
  /** Midnight UTC of the night being sold. */
  date: Date;
  unitsTotal: number;
  unitsBooked: number;
  unitsHeld: number;
  /** null → fall back to room.basePrice */
  priceOverride?: number | null;
  closed: boolean;
  minStay: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomInventorySchema = new Schema<IRoomInventory>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    date: { type: Date, required: true },
    unitsTotal: { type: Number, required: true, min: 0 },
    unitsBooked: { type: Number, default: 0, min: 0 },
    unitsHeld: { type: Number, default: 0, min: 0 },
    priceOverride: { type: Number, default: null },
    closed: { type: Boolean, default: false },
    minStay: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true },
);

roomInventorySchema.index({ roomId: 1, date: 1 }, { unique: true });
roomInventorySchema.index({ hotelId: 1, date: 1 });

export const RoomInventory: Model<IRoomInventory> =
  (models.RoomInventory as Model<IRoomInventory>) ??
  model<IRoomInventory>("RoomInventory", roomInventorySchema);
