"use client";

import { useState } from "react";

/**
 * The one interactive element in the footer. Kept as its own island so the
 * rest of the footer can stay a cached server component.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="flex w-full max-w-md gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Email for newsletter"
      />
      <button
        type="submit"
        className="px-5 py-2.5 bg-white text-brand-700 font-semibold text-sm rounded-xl hover:bg-brand-50 transition-colors shrink-0"
      >
        {done ? "Subscribed" : "Subscribe"}
      </button>
    </form>
  );
}
