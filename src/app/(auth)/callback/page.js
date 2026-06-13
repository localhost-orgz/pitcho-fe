"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;

    const token = searchParams.get("token");
    const userJson = searchParams.get("user");

    if (token && userJson) {
      isProcessed.current = true;
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userJson));
        document.cookie = `auth-token-fallback=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        login(parsedUser, token);

        router.replace("/studio");
      } catch (error) {
        console.error("Gagal membaca data login:", error);
        router.replace("/login?error=invalid_callback");
      }
    } else {
      router.replace("/login");
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="mt-4 text-sm text-slate-400 animate-pulse font-medium">
        Menghubungkan ke Pitcho Studio...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-400 animate-pulse font-medium">
            Menghubungkan ke Pitcho Studio...
          </p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
