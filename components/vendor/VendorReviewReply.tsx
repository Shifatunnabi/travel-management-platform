"use client";

import { useActionState, useState } from "react";
import { MessageSquare, Flag } from "lucide-react";
import { replyToReviewAction, reportReviewAction } from "@/lib/actions/review";
import { idleState } from "@/lib/actions/_result";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";

export default function VendorReviewReply({ reviewId }: { reviewId: string }) {
  const [replyState, reply] = useActionState(replyToReviewAction, idleState);
  const [reportState, report] = useActionState(reportReviewAction, idleState);
  const [mode, setMode] = useState<"idle" | "reply" | "report">("idle");

  if (replyState.message) return <ActionMessage state={replyState} />;
  if (reportState.message) return <ActionMessage state={reportState} />;

  if (mode === "idle") {
    return (
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setMode("reply")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <MessageSquare size={13} /> Reply publicly
        </button>
        <button
          type="button"
          onClick={() => setMode("report")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600"
        >
          <Flag size={13} /> Report
        </button>
      </div>
    );
  }

  if (mode === "report") {
    return (
      <form action={report} className="space-y-2">
        <input type="hidden" name="reviewId" value={reviewId} />
        <input
          name="reason"
          required
          minLength={5}
          placeholder="Why should the platform look at this review?"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="flex gap-3 items-center">
          <SubmitButton pendingLabel="Reporting..." size="sm" variant="danger">Report</SubmitButton>
          <button type="button" onClick={() => setMode("idle")} className="text-xs text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={reply} className="space-y-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="body"
        rows={3}
        required
        minLength={10}
        placeholder="Thank the guest, or explain what you have changed. This appears publicly under the review."
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 resize-y"
      />
      <div className="flex gap-3 items-center">
        <SubmitButton pendingLabel="Posting..." size="sm">Post reply</SubmitButton>
        <button type="button" onClick={() => setMode("idle")} className="text-xs text-slate-500 hover:text-slate-700">
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-slate-400">You can reply once per review.</p>
    </form>
  );
}
