"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { MapPin, Plus, Pencil, Tag, Trash2, X, Loader2 } from "lucide-react";
import { Card, EmptyState, StatusPill } from "@/components/admin/Shell";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import { FormGrid, Select, TextArea, TextInput } from "@/components/admin/Inputs";
import {
  deleteDestinationAction, deleteOfferAction, saveDestinationAction, saveOfferAction,
} from "@/lib/actions/admin";
import { idleState } from "@/lib/actions/_result";
import { formatCurrency } from "@/lib/utils/formatters";

export interface DestinationRow {
  id: string;
  city: string;
  country: string;
  description: string;
  image: UploadedImage;
  startingPrice: number;
  currency: string;
  flightDuration?: string;
  href?: string;
  order: number;
  status: "published" | "hidden";
}

export interface OfferRow {
  id: string;
  title: string;
  description: string;
  image: UploadedImage;
  discount: string;
  code?: string;
  type: "hotel" | "flight";
  href?: string;
  /** YYYY-MM-DD, ready for a date input. */
  expiresAt: string;
  order: number;
  status: "published" | "hidden";
}

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

// ─── Destinations ────────────────────────────────────────────────────────────

export function DestinationManager({ rows }: { rows: DestinationRow[] }) {
  const [editing, setEditing] = useState<DestinationRow | "new" | null>(null);

  return (
    <Card
      title="Popular destinations"
      description="The homepage carousel. Shown one card at a time, in this order."
      action={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add destination
          </button>
        )
      }
    >
      {editing && (
        <div className="mb-5 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800 text-sm">
              {editing === "new" ? "New destination" : `Edit ${editing.city}`}
            </p>
            <CloseButton onClick={() => setEditing(null)} />
          </div>
          <DestinationForm
            initial={editing === "new" ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No destinations yet"
          description="The homepage hides this section until you add one."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 border border-slate-200 rounded-xl p-3">
              <Image
                src={row.image.url}
                alt=""
                width={64}
                height={48}
                className="w-16 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 text-sm">{row.city}</p>
                  <span className="text-[11px] text-slate-500">{row.country}</span>
                  {row.status === "hidden" && <StatusPill status="hidden" />}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{row.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-800 tabular-nums">
                  from {formatCurrency(row.startingPrice, row.currency)}
                </p>
                <p className="text-[11px] text-slate-400">position {row.order}</p>
              </div>
              <RowActions
                onEdit={() => setEditing(row)}
                onDelete={() => deleteDestinationAction(row.id)}
                label={row.city}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DestinationForm({
  initial,
  onDone,
}: {
  initial?: DestinationRow;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveDestinationAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone();
      }}
      className="space-y-4"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <ActionMessage state={state} />

      <FormGrid>
        <TextInput label="City" name="city" required defaultValue={initial?.city} placeholder="Cox's Bazar" errors={e?.city} />
        <TextInput label="Country" name="country" required defaultValue={initial?.country} placeholder="Bangladesh" errors={e?.country} />
      </FormGrid>

      <TextArea label="One-line description" name="description" rows={2} defaultValue={initial?.description} placeholder="World's longest natural sandy beach" errors={e?.description} />

      <FormGrid cols={3}>
        <TextInput label="From price" name="startingPrice" type="number" min={0} required prefix="৳" defaultValue={initial?.startingPrice} errors={e?.startingPrice} />
        <TextInput label="Flight time" name="flightDuration" defaultValue={initial?.flightDuration} placeholder="1h 05m" hint="Optional badge." errors={e?.flightDuration} />
        <TextInput label="Position" name="order" type="number" min={0} defaultValue={initial?.order ?? 0} hint="Lower shows first." errors={e?.order} />
      </FormGrid>

      <FormGrid>
        <TextInput label="Link" name="href" defaultValue={initial?.href} placeholder="/flights/search?to=Dubai" hint="Defaults to a flight search for the city." errors={e?.href} />
        <Select label="Status" name="status" defaultValue={initial?.status ?? "published"} options={STATUS_OPTIONS} />
      </FormGrid>

      <input type="hidden" name="currency" value={initial?.currency ?? "BDT"} readOnly />

      <ImageUploader
        name="images"
        folder="hotels"
        scopeId={initial?.id ?? "destinations"}
        initial={initial ? [initial.image] : []}
        max={1}
        label="Card image"
        hint="One landscape photo."
      />
      {e?.images && <p className="text-xs text-rose-600">{e.images[0]}</p>}

      <SubmitButton pendingLabel="Saving...">{initial ? "Save destination" : "Add destination"}</SubmitButton>
    </form>
  );
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export function OfferManager({ rows }: { rows: OfferRow[] }) {
  const [editing, setEditing] = useState<OfferRow | "new" | null>(null);

  return (
    <Card
      title="Special offers"
      description="The homepage promo carousel. Expired offers drop off on their own."
      action={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add offer
          </button>
        )
      }
    >
      {editing && (
        <div className="mb-5 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800 text-sm">
              {editing === "new" ? "New offer" : `Edit ${editing.title}`}
            </p>
            <CloseButton onClick={() => setEditing(null)} />
          </div>
          <OfferForm initial={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No offers yet"
          description="The homepage hides this section until you add one."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const expired = new Date(`${row.expiresAt}T23:59:59Z`) < new Date();
            return (
              <li key={row.id} className="flex items-center gap-3 border border-slate-200 rounded-xl p-3">
                <Image
                  src={row.image.url}
                  alt=""
                  width={64}
                  height={48}
                  className="w-16 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm truncate">{row.title}</p>
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                      {row.discount}
                    </span>
                    {row.code && (
                      <span className="text-[11px] text-slate-500 font-mono">{row.code}</span>
                    )}
                    {row.status === "hidden" && <StatusPill status="hidden" />}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{row.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[11px] font-medium ${expired ? "text-rose-600" : "text-slate-500"}`}>
                    {expired ? "Expired" : "Expires"} {row.expiresAt}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {row.type} · position {row.order}
                  </p>
                </div>
                <RowActions
                  onEdit={() => setEditing(row)}
                  onDelete={() => deleteOfferAction(row.id)}
                  label={row.title}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function OfferForm({ initial, onDone }: { initial?: OfferRow; onDone: () => void }) {
  const [state, action] = useActionState(saveOfferAction, idleState);
  const e = state.ok ? undefined : state.fieldErrors;

  return (
    <form
      action={async (fd) => {
        await action(fd);
        onDone();
      }}
      className="space-y-4"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <ActionMessage state={state} />

      <TextInput label="Title" name="title" required defaultValue={initial?.title} placeholder="Cox's Bazar beach escape" errors={e?.title} />
      <TextArea label="Description" name="description" rows={2} defaultValue={initial?.description} placeholder="Two nights by the sea, breakfast included." errors={e?.description} />

      <FormGrid cols={3}>
        <TextInput label="Badge" name="discount" required defaultValue={initial?.discount} placeholder="25% OFF" errors={e?.discount} />
        <TextInput label="Promo code" name="code" defaultValue={initial?.code} placeholder="TOFIZA500" hint="Optional." errors={e?.code} />
        <TextInput label="Expires" name="expiresAt" type="date" required defaultValue={initial?.expiresAt} errors={e?.expiresAt} />
      </FormGrid>

      <FormGrid cols={3}>
        <Select
          label="Applies to"
          name="type"
          defaultValue={initial?.type ?? "hotel"}
          options={[
            { value: "hotel", label: "Hotels" },
            { value: "flight", label: "Flights" },
          ]}
        />
        <TextInput label="Position" name="order" type="number" min={0} defaultValue={initial?.order ?? 0} hint="Lower shows first." errors={e?.order} />
        <Select label="Status" name="status" defaultValue={initial?.status ?? "published"} options={STATUS_OPTIONS} />
      </FormGrid>

      <TextInput label="Link" name="href" defaultValue={initial?.href} placeholder="/hotels/search?destination=Cox's Bazar" hint="Defaults to hotel or flight search." errors={e?.href} />

      <ImageUploader
        name="images"
        folder="hotels"
        scopeId={initial?.id ?? "offers"}
        initial={initial ? [initial.image] : []}
        max={1}
        label="Card image"
        hint="One landscape photo."
      />
      {e?.images && <p className="text-xs text-rose-600">{e.images[0]}</p>}

      <SubmitButton pendingLabel="Saving...">{initial ? "Save offer" : "Add offer"}</SubmitButton>
    </form>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
    >
      <X size={16} />
    </button>
  );
}

function RowActions({
  onEdit,
  onDelete,
  label,
}: {
  onEdit: () => void;
  onDelete: () => Promise<{ ok: boolean; message?: string }>;
  label: string;
}) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        title={`Edit ${label}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
      >
        <Pencil size={14} />
      </button>
      {confirming ? (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => void (await onDelete()))}
            className="text-[11px] font-semibold text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 disabled:opacity-50"
          >
            {pending ? <Loader2 size={13} className="animate-spin" /> : "Remove"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-[11px] text-slate-500 px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Keep
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          title={`Remove ${label}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
