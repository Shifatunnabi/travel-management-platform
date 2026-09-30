/**
 * Gives every room that predates the details page a public slug.
 * Safe to re-run: rooms that already have one are left alone.
 *
 *   npx tsx scripts/backfill-room-slugs.ts
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Room, generateRoomSlug } from "@/lib/models/Room";

async function main() {
  await connectDB();
  const rooms = await Room.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] })
    .select("name")
    .lean();

  for (const room of rooms) {
    const slug = await generateRoomSlug(room.name);
    await Room.updateOne({ _id: room._id }, { $set: { slug } });
    console.log(`${room.name} -> ${slug}`);
  }
  console.log(`Backfilled ${rooms.length} room(s).`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
