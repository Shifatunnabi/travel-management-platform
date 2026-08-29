"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Lock, X } from "lucide-react";
import { Card } from "@/components/admin/Shell";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { bulkInventoryAction, setNightAction } from "@/lib/actions/vendor";
import { idleState } from "@/lib/actions/_result";
import { formatCurrency } from "@/lib/utils/formatters";
import type { CalendarNight } from "@/lib/services/vendor-data";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shiftKey(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function RateCalendar({
  hotelId,
  rooms,
  selectedRoomId,
  nights,
  startKey,
}: {
  hotelId: string;
  rooms: { id: string; name: string; basePrice: number; totalUnits: number }[];
  selectedRoomId: string;
  nights: CalendarNight[];
  startKey: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<CalendarNight | null>(null);
  const [bulkState, bulkAction] = useActionState(bulkInventoryAction, idleState);
  const [pending, start] = useTransition();
  const [rowError, setRowError] = useState<string | null>(null);

  const go = (roomId: string, key: string) =>
    router.push(`/vendor/hotels/${hotelId}/calendar?room=${roomId}&start=${key}`);

  const saveNight = (patch: {
    price?: number | null;
    unitsTotal?: number;
    closed?: boolean;
    minStay?: number;
  }) => {
    if (!editing) return;
    start(async () => {
      setRowError(null);
      const result = await setNightAction(selectedRoomId, editing.dateKey, patch);
      if (result.ok) {
        setEditing(null);
        router.refresh();
      } else {
        setRowError(result.message ?? "Could not save that night.");
      }
    });
  };

  // Pad so the grid starts on the correct weekday column.
  const leading = new Date(`${nights[0]?.dateKey}T00:00:00.000Z`).getUTCDay();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {rooms.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => go(r.id, startKey)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              r.id === selectedRoomId
                ? "bg-brand-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <Card
        title="Calendar"
        description="Click any night to change its price, availability, or minimum stay."
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(selectedRoomId, shiftKey(startKey, -35))}
              aria-label="Previous 5 weeks"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => go(selectedRoomId, shiftKey(startKey, 35))}
              aria-label="Next 5 weeks"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      >
        {rowError && (
          <div role="alert" className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">
            {rowError}
          </div>
        )}

        <div className="grid grid-cols-7 gap-1.5 min-w-[560px]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center pb-1">
              {d}
            </div>
          ))}
          {Array.from({ length: leading }).map((_, i) => (
            <div key={`pad-${i}`} aria-hidden="true" />
          ))}
          {nights.map((n) => {
            const soldOut = n.unitsFree === 0;
            const day = Number(n.dateKey.slice(8, 10));
            return (
              <button
                key={n.dateKey}
                type="button"
                onClick={() => setEditing(n)}
                className={`text-left p-2 rounded-lg border transition-colors min-h-[74px] ${
                  n.closed
                    ? "bg-slate-100 border-slate-200 hover:border-slate-400"
                    : soldOut
                      ? "bg-rose-50 border-rose-200 hover:border-rose-400"
                      : "bg-white border-slate-200 hover:border-brand-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums">{day}</span>
                  {n.closed && <Lock size={10} className="text-slate-400" />}
                </div>
                <p
                  className={`text-xs font-bold tabular-nums mt-1 ${
                    n.hasOverride ? "text-brand-600" : "text-slate-800"
                  }`}
                >
                  {n.closed ? "—" : formatCurrency(n.price)}
                </p>
                <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                  {n.closed ? "Closed" : `${n.unitsFree}/${n.unitsTotal} left`}
                </p>
                {n.minStay > 1 && !n.closed && (
                  <p className="text-[10px] text-amber-600 font-medium">min {n.minStay}n</p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-slate-200 bg-white" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-rose-200 bg-rose-50" /> Sold out
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-slate-200 bg-slate-100" /> Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-brand-600 font-bold">৳</span> Price overridden for that night
          </span>
        </div>
      </Card>

      {editing && (
        <NightEditor
          night={editing}
          pending={pending}
          onClose={() => setEditing(null)}
          onSave={saveNight}
        />
      )}

      <Card title="Bulk edit" description="Apply a change across a date range — for a season, a holiday, or every weekend.">
        <form action={bulkAction} className="space-y-4">
          <input type="hidden" name="roomId" value={selectedRoomId} />
          <ActionMessage state={bulkState} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bulk-from" className="block text-xs font-semibold text-slate-600 mb-1.5">From</label>
              <input id="bulk-from" type="date" name="from" required defaultValue={startKey}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="bulk-to" className="block text-xs font-semibold text-slate-600 mb-1.5">To</label>
              <input id="bulk-to" type="date" name="to" required defaultValue={shiftKey(startKey, 30)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>

          <fieldset>
            <legend className="text-xs font-semibold text-slate-600 mb-1.5">Apply on</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d, i) => (
                <label
                  key={d}
                  className="cursor-pointer select-none px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-brand-300 has-checked:bg-brand-600 has-checked:text-white has-checked:border-brand-600"
                >
                  <input type="checkbox" name="weekdays" value={i} defaultChecked className="sr-only" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="bulk-price" className="block text-xs font-semibold text-slate-600 mb-1.5">Price</label>
              <input id="bulk-price" type="number" name="price" min={100} placeholder="Unchanged"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums" />
            </div>
            <div>
              <label htmlFor="bulk-units" className="block text-xs font-semibold text-slate-600 mb-1.5">Rooms open</label>
              <input id="bulk-units" type="number" name="unitsTotal" min={0} placeholder="Unchanged"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums" />
            </div>
            <div>
              <label htmlFor="bulk-min" className="block text-xs font-semibold text-slate-600 mb-1.5">Min stay</label>
              <input id="bulk-min" type="number" name="minStay" min={1} max={30} placeholder="Unchanged"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums" />
            </div>
            <div>
              <label htmlFor="bulk-closed" className="block text-xs font-semibold text-slate-600 mb-1.5">Sale</label>
              <select id="bulk-closed" name="closed" defaultValue="unchanged"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="unchanged">Unchanged</option>
                <option value="open">Open for sale</option>
                <option value="closed">Stop sell</option>
              </select>
            </div>
          </div>

          <SubmitButton pendingLabel="Applying...">Apply to range</SubmitButton>
        </form>
      </Card>
    </div>
  );
}

function NightEditor({
  night,
  pending,
  onClose,
  onSave,
}: {
  night: CalendarNight;
  pending: boolean;
  onClose: () => void;
  onSave: (patch: { price?: number | null; unitsTotal?: number; closed?: boolean; minStay?: number }) => void;
}) {
  const [price, setPrice] = useState(String(night.price));
  const [units, setUnits] = useState(String(night.unitsTotal));
  const [minStay, setMinStay] = useState(String(night.minStay));
  const [closed, setClosed] = useState(night.closed);
  const committed = night.unitsBooked + night.unitsHeld;

  return (
    <Card
      title={new Date(`${night.dateKey}T00:00:00.000Z`).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
      })}
      action={
        <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
          <X size={16} />
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="n-price" className="block text-xs font-semibold text-slate-600 mb-1.5">Price for this night</label>
          <input id="n-price" type="number" min={100} value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums" />
        </div>
        <div>
          <label htmlFor="n-units" className="block text-xs font-semibold text-slate-600 mb-1.5">Rooms open</label>
          <input id="n-units" type="number" min={committed} value={units} onChange={(e) => setUnits(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums" />
          <p className="text-[11px] text-slate-400 mt-1">
            {committed} already sold — cannot go below.
          </p>
        </div>
        <div>
          <label htmlFor="n-min" className="block text-xs font-semibold text-slate-600 mb-1.5">Minimum stay</label>
          <input id="n-min" type="number" min={1} max={30} value={minStay} onChange={(e) => setMinStay(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 tabular-nums" />
        </div>
      </div>

      <label className="flex items-center gap-2 mt-4 cursor-pointer">
        <input type="checkbox" checked={closed} onChange={(e) => setClosed(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-brand-600" />
        <span className="text-sm text-slate-700">Stop sell — do not offer this room on this night</span>
      </label>

      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onSave({
              price: Number(price) || night.price,
              unitsTotal: Number(units),
              minStay: Number(minStay) || 1,
              closed,
            })
          }
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Save night
        </button>
        {night.hasOverride && (
          <button
            type="button"
            disabled={pending}
            onClick={() => onSave({ price: null })}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Reset to base price
          </button>
        )}
      </div>
    </Card>
  );
}
