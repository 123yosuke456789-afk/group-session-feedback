import { NextResponse } from "next/server";
import { createSession } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url?.trim();
    const title = body?.title?.trim();
    if (!url) {
      return NextResponse.json(
        { error: "URLを入力してください" },
        { status: 400 }
      );
    }
    const session = await createSession(url, title || undefined);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
