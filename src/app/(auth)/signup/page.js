"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, Loader2, AlertCircle, Check, X } from "lucide-react";
import AuthCard from "@/components/Auth/AuthCard";
import PasswordInput from "@/components/Auth/PasswordInput";
import GoogleButton from "@/components/Auth/GoogleButton";
import { Button } from "@/components/UI/button";
import api from "@/lib/api";

// ── Password Strength Checker ──────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-400" };
  if (score <= 3) return { score: 2, label: "Fair", color: "bg-yellow-400" };
  return { score: 3, label: "Strong", color: "bg-green-500" };
}

// ── Requirement chip ───────────────────────────────────────────
function Requirement({ met, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
        met ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
      }`}
    >
      {met ? <Check size={10} /> : <X size={10} />}
      {label}
    </span>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const strength = getPasswordStrength(form.password);

  // ── Validation ──────────────────────────────────────────────
  function validateField(name, value) {
    if (name === "name") {
      if (!value.trim()) return "Name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return "";
    }
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Enter a valid email";
      return "";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 6) return "At least 6 characters";
      return "";
    }
    if (name === "confirmPassword") {
      if (!value) return "Please confirm your password";
      if (value !== form.password) return "Passwords don't match";
      return "";
    }
    return "";
  }

  function validateForm() {
    const next = {};
    next.name = validateField("name", form.name);
    next.email = validateField("email", form.email);
    next.password = validateField("password", form.password);
    next.confirmPassword = validateField(
      "confirmPassword",
      form.confirmPassword,
    );
    setErrors(next);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return !next.name && !next.email && !next.password && !next.confirmPassword;
  }

  // ── Handlers ────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Live confirm-password re-check when password changes
    if (
      name === "password" &&
      touched.confirmPassword &&
      form.confirmPassword
    ) {
      const matchErr =
        value !== form.confirmPassword ? "Passwords don't match" : "";
      setErrors((prev) => ({ ...prev, confirmPassword: matchErr }));
    }

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));

    // Also check confirm match on blur
    if (name === "password" && form.confirmPassword) {
      const matchErr =
        value !== form.confirmPassword ? "Passwords don't match" : "";
      setErrors((prev) => ({ ...prev, confirmPassword: matchErr }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus("loading");
    setServerError("");

    try {
      const res = await api.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      const data = res.data;

      setStatus("success");
      router.push("/login?register-success=true");
    } catch {
      setStatus("error");
      setServerError("Something went wrong. Please try again.");
    }
  }

  const isLoading = status === "loading";

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start practicing with Pitcho today"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div
            className={`flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ${
              status === "error" ? "animate-shake" : ""
            }`}
          >
            <AlertCircle size={16} className="shrink-0" />
            {serverError}
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-bold text-foreground"
          >
            Full name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <User
                size={18}
                className={
                  touched.name && errors.name
                    ? "text-red-400"
                    : "text-slate-400"
                }
              />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Your full name"
              autoComplete="name"
              className={`w-full rounded-xl border-2 px-3.5 py-2.5 pl-11 text-sm font-medium text-foreground placeholder:text-slate-400 transition-all duration-200 outline-none
                ${
                  touched.name && errors.name
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-main focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
                }
              `}
            />
          </div>
          {touched.name && errors.name && (
            <p className="mt-1.5 text-xs font-medium text-red-500 animate-fade-in">
              {errors.name}
            </p>
          )}
        </div>

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
                className={
                  touched.email && errors.email
                    ? "text-red-400"
                    : "text-slate-400"
                }
              />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full rounded-xl border-2 px-3.5 py-2.5 pl-11 text-sm font-medium text-foreground placeholder:text-slate-400 transition-all duration-200 outline-none
                ${
                  touched.email && errors.email
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-main focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
                }
              `}
            />
          </div>
          {touched.email && errors.email && (
            <p className="mt-1.5 text-xs font-medium text-red-500 animate-fade-in">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-bold text-foreground"
          >
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Create a password"
            error={touched.password ? errors.password : ""}
            autoComplete="new-password"
          />

          {/* Strength bar + requirements */}
          {form.password && (
            <div className="mt-2 space-y-2 animate-fade-in">
              {/* Strength bar */}
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-1">
                  <div
                    className={`h-full rounded-full transition-colors ${
                      strength.score >= 1 ? strength.color : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-colors ${
                      strength.score >= 2 ? strength.color : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-colors ${
                      strength.score >= 3 ? strength.color : "bg-slate-200"
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    strength.score === 1
                      ? "text-red-500"
                      : strength.score === 2
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {strength.label}
                </span>
              </div>

              {/* Requirements */}
              <div className="flex flex-wrap gap-1.5">
                <Requirement met={form.password.length >= 6} label="6+ chars" />
                <Requirement
                  met={form.password.length >= 10}
                  label="10+ chars"
                />
                <Requirement
                  met={/[A-Z]/.test(form.password)}
                  label="Uppercase"
                />
                <Requirement met={/[0-9]/.test(form.password)} label="Number" />
                <Requirement
                  met={/[^A-Za-z0-9]/.test(form.password)}
                  label="Symbol"
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-bold text-foreground"
          >
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Re-enter your password"
            error={touched.confirmPassword ? errors.confirmPassword : ""}
            autoComplete="new-password"
          />

          {/* Live match indicator */}
          {form.confirmPassword && form.password && (
            <p
              className={`mt-1.5 text-xs font-semibold animate-fade-in ${
                form.confirmPassword === form.password
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {form.confirmPassword === form.password
                ? "✓ Passwords match"
                : "✗ Passwords don't match"}
            </p>
          )}
        </div>

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
              Creating account…
            </>
          ) : (
            "Create account"
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
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-main hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
