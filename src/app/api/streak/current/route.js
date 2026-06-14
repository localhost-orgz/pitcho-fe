import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const token =
      request.cookies.get("auth-token")?.value ??
      request.cookies.get("auth-token-fallback")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = new URL(
      "https://pitcho-be.vercel.app/api/streak/current"
    );

    const res = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to fetch current streak" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
