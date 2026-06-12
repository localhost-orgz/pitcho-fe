"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userJson = searchParams.get("user");

    if (token) {
      localStorage.setItem("auth-token", token);
    }
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        localStorage.setItem("auth-user", JSON.stringify(user));
      } catch {
        // Ignore parse errors
      }
    }

    // Redirect to studio — if the backend already set an httpOnly cookie,
    // the user is authenticated server-side
    router.replace("/studio");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-full items-center justify-center bg-[#f7f9ff]">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Loader2 size={32} className="animate-spin text-main" />
        <p className="text-sm font-semibold text-slate-500">
          Completing sign in…
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[#f7f9ff]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin text-main" />
            <p className="text-sm font-semibold text-slate-500">Loading…</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
