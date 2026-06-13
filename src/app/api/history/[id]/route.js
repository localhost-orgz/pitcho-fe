import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Read token from cookie first, then fall back to Authorization header
    let token = request.cookies.get("auth-token")?.value;
    if (!token) {
      const authHeader = request.headers.get("authorization") || "";
      token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const backendUrl = `https://pitcho-be.vercel.app/api/history/${id}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to fetch session" },
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
