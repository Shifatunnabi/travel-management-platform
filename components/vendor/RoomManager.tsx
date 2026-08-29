"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { BedDouble, Plus, Pencil, Users, Power, X, Loader2 } from "lucide-react";
import { Card, EmptyState, StatusPill } from "@/components/admin/Shell";
import RoomForm, { type RoomFormValues } from "./RoomForm";
import { setRoomStatusAction } from "@/lib/actions/vendor";
import { formatCurrency } from "@/lib/utils/formatters";

type Room = RoomFormValues & { _id: string; status: "active" | "inactive" };

export default function RoomManager({ hotelId, rooms }: { hotelId: string; rooms: Room[] }) {
  const [editing, setEditing] = useState<Room | "new" | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (room: Room) =>
    start(async () => {
      setError(null);
      const result = await setRoomStatusAction(room._id, room.status !== "active");
      if (!result.ok) setError(result.message ?? "Could not update the room.");
    });

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {editing && (
        <Card
          title={editing === "new" ? "Add a room type" : `Edit ${editing.name}`}
          action={
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          }
        >
          <RoomForm
            hotelId={hotelId}
            initial={editing === "new" ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        </Card>
      )}

      <Card
        title="Room types"
        description="A room type is a category, not a single room — set how many of each you have."
        action={
          !editing && (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} /> Add room
            </button>
          )
        }
      >
        {rooms.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No rooms yet"
            description="Add at least one room type before this property can be submitted for review."
            action={
              <button
                type="button"
                onClick={() => setEditing("new")}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus size={16} /> Add a room
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {rooms.map((room) => (
              <li
                key={room._id}
                className={`border rounded-xl p-4 transition-colors ${
                  room.status === "active" ? "border-slate-200" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex gap-4">
                  {room.images[0] ? (
                    <Image
                      src={room.images[0].url}
                      alt=""
                      width={96}
                      height={72}
                      className="w-24 h-18 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-18 rounded-lg bg-slate-100 shrink-0" aria-hidden="true" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{room.name}</h3>
                      {room.status !== "active" && <StatusPill status="inactive" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {room.bedType}
                      {room.sizeSqm ? ` · ${room.sizeSqm} sqm` : ""} ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <Users size={11} /> {room.maxAdults} adults
                        {room.maxChildren > 0 && ` + ${room.maxChildren} children`}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {room.ratePlans.map((p) => (
                        <span
                          key={p.code}
                          className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          title={p.refundable ? `Free cancellation up to ${p.cancellationHours}h before` : "Non-refundable"}
                        >
                          {p.name} · {formatCurrency(room.basePrice + p.priceDelta)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 tabular-nums">
                      {formatCurrency(room.basePrice)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {room.totalUnits} room{room.totalUnits === 1 ? "" : "s"}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => setEditing(room)}
                        title="Edit room"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggle(room)}
                        title={room.status === "active" ? "Take off sale" : "Put back on sale"}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                      >
                        {pending ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
