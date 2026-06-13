"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userJson = searchParams.get("user");

    if (token && userJson) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userJson));
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
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-sm text-muted-foreground animate-pulse">
        Menghubungkan ke Pitcho Studio...
      </p>
    </div>
  );
}
