import { Suspense } from "react";
import PassengersForm from "./PassengersForm";

// Server shell: Navbar and Footer stay server components so they are cached
// and never ship to the browser. The interactive form is the only client part.
export default function PassengersPage() {
  return (
    <>
      <Suspense>
        <PassengersForm />
      </Suspense>
    </>
  );
}
