import { Suspense } from "react";
import FlightPaymentForm from "./FlightPaymentForm";

// Server shell: Navbar and Footer stay server components so they are cached
// and never ship to the browser. The interactive form is the only client part.
export default function PaymentPage() {
  return (
    <>
      <Suspense>
        <FlightPaymentForm />
      </Suspense>
    </>
  );
}
