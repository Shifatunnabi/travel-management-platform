"use client";

import { useActionState, useState } from "react";
import { FileText, Trash2, Upload, Loader2 } from "lucide-react";
import { saveOnboardingAction } from "@/lib/actions/vendor";
import { idleState } from "@/lib/actions/_result";
import { Card } from "@/components/admin/Shell";
import { SubmitButton, ActionMessage } from "@/components/admin/SubmitBar";
import { FormGrid, TextInput } from "@/components/admin/Inputs";

interface KycDoc {
  label: string;
  publicId: string;
  url: string;
}

export interface OnboardingValues {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  tradeLicenceNo?: string;
  tin?: string;
  kycDocuments: KycDoc[];
}

const DOC_TYPES = ["Trade licence", "TIN certificate", "Owner NID", "Bank statement"];

export default function OnboardingForm({
  vendorId,
  initial,
}: {
  vendorId: string;
  initial?: OnboardingValues;
}) {
  const [state, action] = useActionState(saveOnboardingAction, idleState);
  const [docs, setDocs] = useState<KycDoc[]>(initial?.kycDocuments ?? []);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const e = state.ok ? undefined : state.fieldErrors;

  const upload = async (label: string, file: File) => {
    setUploadError(null);
    setUploading(label);
    try {
      const signRes = await fetch("/api/uploads/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "kyc", scopeId: vendorId }),
      });
      if (!signRes.ok) throw new Error("Could not authorise the upload.");
      const sign = await signRes.json();

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey);
      body.append("timestamp", String(sign.timestamp));
      body.append("signature", sign.signature);
      body.append("folder", sign.folder);

      const res = await fetch(sign.uploadUrl, { method: "POST", body });
      if (!res.ok) throw new Error("Upload failed.");
      const data = await res.json();

      setDocs((prev) => [
        ...prev.filter((d) => d.label !== label),
        { label, publicId: data.public_id, url: data.secure_url },
      ]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="kycDocuments" value={JSON.stringify(docs)} readOnly />
      <ActionMessage state={state} />

      <Card title="Your business">
        <div className="space-y-4">
          <TextInput label="Business name" name="businessName" required defaultValue={initial?.businessName} placeholder="Bay Breeze Hospitality" errors={e?.businessName} />
          <FormGrid>
            <TextInput label="Contact email" name="contactEmail" type="email" required defaultValue={initial?.contactEmail} errors={e?.contactEmail} />
            <TextInput label="Contact phone" name="contactPhone" type="tel" required defaultValue={initial?.contactPhone} placeholder="+880 1XXX-XXXXXX" errors={e?.contactPhone} />
          </FormGrid>
          <TextInput label="Business address" name="address" required defaultValue={initial?.address} errors={e?.address} />
          <FormGrid cols={3}>
            <TextInput label="City" name="city" required defaultValue={initial?.city} errors={e?.city} />
            <TextInput label="Trade licence no." name="tradeLicenceNo" required={false} defaultValue={initial?.tradeLicenceNo} errors={e?.tradeLicenceNo} />
            <TextInput label="TIN" name="tin" required={false} defaultValue={initial?.tin} errors={e?.tin} />
          </FormGrid>
        </div>
      </Card>

      <Card
        title="Verification documents"
        description="Only Tofiza's platform team can see these. They are never shown publicly."
      >
        <div className="space-y-2">
          {DOC_TYPES.map((label) => {
            const doc = docs.find((d) => d.label === label);
            return (
              <div
                key={label}
                className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3"
              >
                <FileText size={17} className={doc ? "text-emerald-600" : "text-slate-300"} />
                <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>

                {doc ? (
                  <>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => setDocs((prev) => prev.filter((d) => d.label !== label))}
                      aria-label={`Remove ${label}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer">
                    {uploading === label ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    {uploading === label ? "Uploading" : "Upload"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="sr-only"
                      onChange={(ev) => {
                        const file = ev.target.files?.[0];
                        if (file) void upload(label, file);
                        ev.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
        {uploadError && <p className="text-xs text-rose-600 mt-2">{uploadError}</p>}
      </Card>

      <SubmitButton pendingLabel="Submitting...">
        {initial ? "Save details" : "Submit application"}
      </SubmitButton>
    </form>
  );
}
