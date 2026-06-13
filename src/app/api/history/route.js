import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Forward limit query param if present
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const backendUrl = new URL("https://pitcho-be.vercel.app/api/history");
    if (limit) backendUrl.searchParams.set("limit", limit);

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
        { error: data.error || data.message || "Failed to fetch history" },
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
