"use client";

import { useState } from "react";
import { User, Mail, Phone, Globe, Calendar, CreditCard, Save } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information and travel documents</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shrink-0">
              F
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Farhan Ahmed</h2>
              <p className="text-slate-500 text-sm">Member since 2024</p>
              <button type="button" className="mt-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                Change Photo
              </button>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", defaultValue: "Farhan", icon: User },
              { label: "Last Name", defaultValue: "Ahmed", icon: User },
              { label: "Email Address", defaultValue: "farhan@email.com", type: "email", icon: Mail },
              { label: "Phone", defaultValue: "+880 1712-345678", type: "tel", icon: Phone },
              { label: "Date of Birth", defaultValue: "1990-05-15", type: "date", icon: Calendar },
              { label: "Nationality", defaultValue: "Bangladeshi", icon: Globe },
            ].map(({ label, defaultValue, type = "text", icon: Icon }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type}
                    defaultValue={defaultValue}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passport */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <CreditCard size={18} className="text-blue-500" />
            Passport & Travel Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Passport Number", placeholder: "AA1234567" },
              { label: "Issuing Country", placeholder: "Bangladesh" },
              { label: "Issue Date", type: "date" },
              { label: "Expiry Date", type: "date" },
            ].map(({ label, placeholder, type = "text" }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
