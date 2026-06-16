import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-12 text-center text-gray-600">Loading…</div>}>
      <OnboardingClient />
    </Suspense>
  );
}
