import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-12 animate-pulse">Loading…</div>}>
      <SignInForm />
    </Suspense>
  );
}
