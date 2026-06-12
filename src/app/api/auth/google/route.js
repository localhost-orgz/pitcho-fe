import { NextResponse } from "next/server";

export async function GET() {
  const googleAuthUrl = new URL(
    "https://pitcho-be.vercel.app/api/auth/google"
  );

  // Tell the backend where to redirect after successful auth
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  googleAuthUrl.searchParams.set("redirect", `${frontendUrl}/callback`);

  return NextResponse.redirect(googleAuthUrl.toString());
}
