"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight, User, Mail, Phone, Globe,
  Calendar, CreditCard, Shield,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

const titles = ["Mr", "Ms", "Mrs", "Dr"];
const genders = ["Male", "Female"];

function InputField({
  label,
  type = "text",
  placeholder,
  required,
  icon: Icon,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-300 ${Icon ? "pl-9 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  options,
  required,
}: {
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function PassengersPage() {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get("flightId") || "fl-001";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/flights/book/payment?flightId=${flightId}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* Progress bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm mb-3">
              <Link href="/" className="text-slate-500 hover:text-blue-600">Home</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <Link href="/flights/search" className="text-slate-500 hover:text-blue-600">Flights</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-800 font-medium">Passenger Info</span>
            </div>
            <div className="flex items-center gap-0">
              {["Passenger Info", "Payment", "Confirmation"].map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center gap-2 ${i === 0 ? "text-blue-700" : "text-slate-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm font-medium ${i === 0 ? "text-blue-700" : "text-slate-400"}`}>{step}</span>
                  </div>
                  {i < 2 && <div className={`h-px w-8 sm:w-16 mx-2 ${i === 0 ? "bg-blue-300" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Passenger form */}
              <div className="flex-1 space-y-5">
                {/* Primary passenger */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-1">
                    Passenger 1 — Primary Traveler
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    Enter details exactly as they appear on the travel document
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField label="Title" options={titles} required />
                    <SelectField label="Gender" options={genders} required />
                    <InputField label="First Name" placeholder="As on passport" required />
                    <InputField label="Last Name" placeholder="As on passport" required />
                    <InputField label="Date of Birth" type="date" required icon={Calendar} />
                    <SelectField
                      label="Nationality"
                      options={["Bangladeshi", "Indian", "Pakistani", "Other"]}
                      required
                    />
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
                      <CreditCard size={15} className="text-blue-500" />
                      Passport Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Passport Number" placeholder="e.g. AA1234567" required />
                      <InputField label="Passport Expiry" type="date" required />
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                    <Mail size={18} className="text-blue-500" />
                    Contact Information
                  </h2>
                  <p className="text-slate-500 text-sm mb-5">
                    Your e-ticket and updates will be sent here
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Email Address" type="email" placeholder="you@email.com" required icon={Mail} />
                    <InputField label="Phone Number" type="tel" placeholder="+880 1XXX-XXXXXX" required icon={Phone} />
                    <InputField label="Emergency Contact Name" placeholder="Full name" icon={User} />
                    <InputField label="Emergency Contact Phone" type="tel" placeholder="+880 1XXX-XXXXXX" icon={Phone} />
                  </div>
                </div>

                {/* Special requests */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-base mb-4">Special Requests</h2>
                  <textarea
                    rows={3}
                    placeholder="e.g. Wheelchair assistance, vegetarian meal, window seat preference..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-300 resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Requests are subject to availability and not guaranteed
                  </p>
                </div>
              </div>

              {/* Summary sidebar */}
              <div className="lg:w-72 shrink-0">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                  <h3 className="font-bold text-slate-900 mb-4">Booking Summary</h3>
                  <div className="space-y-3 text-sm pb-4 border-b border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Route</span>
                      <span className="font-semibold">DAC → CXB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium">4 Jul 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Passengers</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class</span>
                      <span className="font-medium">Economy</span>
                    </div>
                  </div>
                  <div className="py-4 border-b border-slate-100 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base fare</span>
                      <span>৳4,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxes</span>
                      <span>৳225</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Total</span>
                      <span className="text-blue-700">৳4,725</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Shield size={13} className="text-emerald-500" />
                    Secured with SSL encryption
                  </div>
                  <Button type="submit" variant="primary" fullWidth size="lg" className="mt-4">
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
