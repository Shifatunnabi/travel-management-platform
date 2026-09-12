/*
 * NOTE FOR MAINTAINERS: this lists the cookies the app actually sets today —
 * the Auth.js session pair and the CSRF token. If you add analytics, a consent
 * tool, a chat widget or any embedded third party, add it to the table below
 * before it ships. Not reviewed by a lawyer.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { Points } from "@/components/legal/PolicyPage";

export const metadata: Metadata = {
  title: "Cookie Policy · Tofiza",
  description:
    "The cookies Tofiza sets, what each one does, how long it lasts, and how to control them in your browser.",
};

export default function CookiesPage() {
  return (
    <PolicyPage
      title="Cookie Policy"
      summary="We use a small number of cookies, and all of them are there to make signing in and booking work. We do not use cookies to advertise to you."
      effective="13 September 2026"
      sections={[
        {
          id: "what",
          heading: "What a cookie is",
          body: (
            <p>
              A cookie is a small file a website asks your browser to keep, so that the site can
              recognise the same browser on the next request. Without them a site cannot tell that
              the person loading the checkout page is the same person who just signed in.
            </p>
          ),
        },
        {
          id: "which",
          heading: "The cookies we set",
          body: (
            <>
              <p>
                Every cookie below is strictly necessary — the site cannot do its job without them,
                so they are set without asking, as the rules for necessary cookies allow.
              </p>

              <div className="overflow-x-auto my-4 -mx-1">
                <table className="w-full text-left text-[14px] border-collapse min-w-[440px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-4 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        Cookie
                      </th>
                      <th className="py-2 pr-4 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        What it does
                      </th>
                      <th className="py-2 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                        Lasts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 pr-4 font-mono text-[12px] text-slate-700 align-top">
                        authjs.session-token
                      </td>
                      <td className="py-3 pr-4 text-slate-600 align-top">
                        Keeps you signed in as you move between pages, so your bookings and profile
                        stay available without signing in again on each one.
                      </td>
                      <td className="py-3 text-slate-600 align-top whitespace-nowrap">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-[12px] text-slate-700 align-top">
                        authjs.csrf-token
                      </td>
                      <td className="py-3 pr-4 text-slate-600 align-top">
                        Protects sign-in and form submissions against cross-site request forgery —
                        it stops another site submitting a form as you.
                      </td>
                      <td className="py-3 text-slate-600 align-top whitespace-nowrap">Session</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-[12px] text-slate-700 align-top">
                        authjs.callback-url
                      </td>
                      <td className="py-3 pr-4 text-slate-600 align-top">
                        Remembers the page you were on when you signed in, so you are returned there
                        rather than to the homepage.
                      </td>
                      <td className="py-3 text-slate-600 align-top whitespace-nowrap">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                “Session” means the cookie is discarded when you close your browser. Our cookies are
                set as <span className="font-mono text-[13px]">HttpOnly</span> where possible, which
                means scripts on the page cannot read them.
              </p>
            </>
          ),
        },
        {
          id: "not-used",
          heading: "What we do not do",
          body: (
            <Points
              items={[
                "We do not set advertising or retargeting cookies, and we do not sell or share cookie data with ad networks.",
                "We do not build a profile of you across other websites.",
                "We do not currently run third-party analytics on this site. If that changes, this page and the table above will be updated first, and we will ask your consent where consent is required.",
              ]}
            />
          ),
        },
        {
          id: "third-party",
          heading: "Content loaded from elsewhere",
          body: (
            <p>
              Some things on our pages are served by other companies — property photographs through
              our image host, and the payment page itself, which is hosted by SSLCommerz. When you
              are on the gateway’s payment page you are on their site, and their cookie policy
              applies there. See our{" "}
              <Link href="/privacy" className="text-brand-700 font-semibold hover:underline">
                Privacy Policy
              </Link>{" "}
              for the full list of providers we use.
            </p>
          ),
        },
        {
          id: "control",
          heading: "Controlling cookies",
          body: (
            <>
              <p>
                Every browser lets you see the cookies a site has set and delete them, usually under
                Settings → Privacy. You can also block cookies entirely.
              </p>
              <p>
                Be aware of the trade-off: because all of our cookies are the necessary kind,
                blocking them means you will not be able to sign in, and you will not be able to
                complete a booking. Browsing and searching will still work.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
