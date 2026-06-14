"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import AuthCard from "@/components/Auth/AuthCard";
import PasswordInput from "@/components/Auth/PasswordInput";
import GoogleButton from "@/components/Auth/GoogleButton";
import { Button } from "@/components/UI/button";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/signin", { email, password });
      const { user, token } = response.data.data;

      if (token) {
        login(user, token);
        router.refresh();
        router.push("/studio");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unauthorized";
        setServerError(message);
      } else {
        const apiErrors = error?.response?.data?.errors ?? [];
        const nextErrors = {};
        for (const err of apiErrors) {
          if (err.field) {
            const parts = err.field.split(".");
            const fieldName = parts[parts.length - 1];
            nextErrors[fieldName] = err.message;
          }
        }
        setErrors(nextErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // // ── Validation ──────────────────────────────────────────────
  // function validateField(name, value) {
  //   if (name === "email") {
  //     if (!value.trim()) return "Email is required";
  //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
  //       return "Enter a valid email";
  //     return "";
  //   }
  //   if (name === "password") {
  //     if (!value) return "Password is required";
  //     if (value.length < 6) return "Password must be at least 6 characters";
  //     return "";
  //   }
  //   return "";
  // }

  // function validateForm() {
  //   const next = {};
  //   next.email = validateField("email", form.email);
  //   next.password = validateField("password", form.password);
  //   setErrors(next);
  //   setTouched({ email: true, password: true });
  //   return !next.email && !next.password;
  // }

  // // ── Handlers ────────────────────────────────────────────────
  // function handleChange(e) {
  //   const { name, value, type, checked } = e.target;
  //   const val = type === "checkbox" ? checked : value;
  //   setForm((prev) => ({ ...prev, [name]: val }));

  //   // Clear errors on change
  //   if (errors[name]) {
  //     setErrors((prev) => ({ ...prev, [name]: "" }));
  //   }
  //   if (serverError) setServerError("");
  // }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    // const err = validateField(name, value);
    // setErrors((prev) => ({ ...prev, [name]: err }));
  }

  // async function handleSubmit(e) {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   setStatus("loading");
  //   setServerError("");

  //   try {
  //     const res = await fetch("/api/auth/signin", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email: form.email, password: form.password }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       setStatus("error");
  //       setServerError(data.error || "Invalid email or password");
  //       return;
  //     }

  //     const { token, user } = data.data;
  //     // Store token for use across the app
  //     if (token) {
  //       localStorage.setItem("auth-token", token);
  //       document.cookie = `auth-token=${token}; path=/`;
  //     }
  //     if (user) {
  //       localStorage.setItem("auth-user", JSON.stringify(user));
  //     }

  //     setStatus("success");
  //     router.push("/studio");
  //   } catch {
  //     setStatus("error");
  //     setServerError("Something went wrong. Please try again.");
  //   }
  // }

  // const hasFormError = status === "error";
  // const isLoading = status === "loading";

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your Pitcho account">
      <form onSubmit={handleEmailLogin} noValidate className="space-y-5">
        {/* Server error banner */}
        {serverError && (
          <div className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {serverError}
          </div>
        )}
        {errors &&
          typeof errors === "object" &&
          !Array.isArray(errors) &&
          Object.values(errors).some(Boolean) && (
            <div className="flex flex-col gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>There are errors:</span>
              </div>
              <ul className="list-disc ml-6 font-normal">
                {Object.entries(errors).map(
                  ([key, val]) => val && <li key={key}>{val}</li>,
                )}
              </ul>
            </div>
          )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-bold text-foreground"
          >
            Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail
                size={18}
                className={touched.email ? "text-red-400" : "text-slate-400"}
              />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full rounded-xl border-2 px-3.5 py-2.5 pl-11 text-sm font-medium text-foreground placeholder:text-slate-400 transition-all duration-200 outline-none
              `}
            />
          </div>
          {/* ${
            touched.email && errors.email
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
              : "border-slate-200 bg-white focus:border-main focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
          } */}
          {/* {touched.email && errors.email && (
            <p className="mt-1.5 text-xs font-medium text-red-500 animate-fade-in">
              {errors.email}
            </p>
          )} */}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-foreground"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-main hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter your password"
            // error={touched.password ? errors.password : ""}
            autoComplete="current-password"
          />
        </div>

        {/* Remember me */}
        {/* <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-main peer-checked:border-main transition-colors flex items-center justify-center">
            <svg
              className={`size-3 text-white transition-opacity ${form.remember ? "opacity-100" : "opacity-0"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-600">
            Remember me
          </span>
        </label> */}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="default"
          disabled={isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs font-semibold uppercase">
          <span className="bg-card px-3 text-slate-400">or</span>
        </div>
      </div>

      {/* Google OAuth */}
      <GoogleButton />

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-main hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
