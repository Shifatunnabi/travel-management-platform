"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, User, Mail, Phone, Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function HotelGuestsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const hotelId = params.get("hotelId") || "ht-001";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hotels/book/payment?hotelId=${hotelId}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm mb-3">
              <Link href="/" className="text-slate-500 hover:text-blue-600">Home</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <Link href="/hotels/search" className="text-slate-500 hover:text-blue-600">Hotels</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-800 font-medium">Guest Details</span>
            </div>
            <div className="flex items-center gap-0">
              {["Guest Info", "Payment", "Confirmation"].map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center gap-2 ${i === 0 ? "text-blue-700" : "text-slate-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${i === 0 ? "text-blue-700" : "text-slate-400"}`}>{step}</span>
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
              <div className="flex-1 space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                    <User size={18} className="text-blue-500" />
                    Primary Guest Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "First Name", placeholder: "As on ID" },
                      { label: "Last Name", placeholder: "As on ID" },
                      { label: "Email", placeholder: "you@email.com", type: "email" },
                      { label: "Phone", placeholder: "+880 1XXX-XXXXXX", type: "tel" },
                    ].map(({ label, placeholder, type = "text" }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          {label} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-base mb-4">Special Requests</h2>
                  <textarea
                    rows={3}
                    placeholder="e.g. Early check-in, high floor, crib for baby, etc..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Requests are not guaranteed and subject to availability</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
                  <p className="font-semibold text-amber-800 mb-1">Important Information</p>
                  <ul className="text-amber-700 space-y-1 list-disc list-inside">
                    <li>Valid photo ID required at check-in</li>
                    <li>Check-in from 14:00, Check-out by 12:00</li>
                    <li>Credit card may be required for deposit</li>
                  </ul>
                </div>
              </div>

              <div className="lg:w-72 shrink-0">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                  <h3 className="font-bold text-slate-900 mb-4">Booking Summary</h3>
                  <div className="p-3 bg-blue-50 rounded-xl text-sm mb-4">
                    <p className="font-semibold text-blue-900">The Peninsula Cox's Bazar</p>
                    <p className="text-blue-700 text-xs mt-0.5">Superior Room · 2 nights</p>
                  </div>
                  <div className="space-y-2 text-sm border-t border-slate-100 pt-4 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room × 2 nights</span>
                      <span>৳25,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxes</span>
                      <span>৳1,250</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                      <span>Total</span>
                      <span className="text-blue-700">৳26,250</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <Shield size={13} className="text-emerald-500" />
                    Free cancellation until 48h before check-in
                  </div>
                  <Button type="submit" variant="primary" fullWidth size="lg">
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
