"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const authError = searchParams.get("error") === "auth_callback";
  const nextPath = searchParams.get("next") || "/";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpSent, setSignUpSent] = useState(false);

  async function handleGoogle() {
    setError("");
    const supabase = createClient();
    const redirectTo = typeof window !== "undefined"
      ? (nextPath === "/" ? `${window.location.origin}/auth/callback` : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`)
      : undefined;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      setError(oauthError.message || "Could not start Google sign-in.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    if (mode === "signup") {
      const redirectTo = typeof window !== "undefined"
        ? (nextPath === "/" ? `${window.location.origin}/auth/callback` : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`)
        : undefined;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message || "Sign up failed.");
        return;
      }
      setSignUpSent(true);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Invalid email or password.");
      return;
    }
    if (nextPath !== "/") {
      router.push(nextPath);
      router.refresh();
      return;
    }
    const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({}));
    if (me.isAdmin) router.replace("/dashboard");
    else if (me.isParticipant) router.replace("/portal");
    else router.replace("/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-teal-blue mb-6">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      {registered && (
        <p className="mb-4 text-sm text-lime-green bg-lime-green/10 px-3 py-2 rounded">
          Registration successful. Sign in below.
        </p>
      )}
      {authError && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          Sign-in was cancelled or failed. Please try again.
        </p>
      )}
      {signUpSent && (
        <p className="mb-4 text-sm text-lime-green bg-lime-green/10 px-3 py-2 rounded">
          Check your email for the confirmation link to finish signing up.
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full py-2.5 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition mb-4 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green"
            required
            minLength={6}
          />
          {mode === "signup" && (
            <p className="text-xs text-gray-500 mt-1">At least 6 characters.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading
            ? (mode === "signup" ? "Creating account…" : "Signing in…")
            : (mode === "signup" ? "Sign up" : "Sign in")}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600 text-left">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); setSignUpSent(false); }}
              className="text-lime-green font-medium hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); }}
              className="text-lime-green font-medium hover:underline"
            >
              Sign in
            </button>
          </>
        )}
        {" · "}
        <Link href="/register" className="text-lime-green font-medium hover:underline">
          Register in programme
        </Link>
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Have an admin invite link? Use it to request SALT Hub admin access (subject to approval).
      </p>
    </div>
  );
}
