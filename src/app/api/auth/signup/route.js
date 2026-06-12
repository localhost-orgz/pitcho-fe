import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Forward to backend
    const res = await fetch("https://pitcho-be.vercel.app/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Signup failed" },
        { status: res.status }
      );
    }

    // Create response with token
    const response = NextResponse.json(data);

    // Set httpOnly cookie if token is returned
    if (data.token) {
      response.cookies.set("auth-token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
