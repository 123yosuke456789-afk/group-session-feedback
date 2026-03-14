import { NextResponse } from "next/server";
import { addComment } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { x, y, text, author } = body ?? {};
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof text !== "string" ||
      !text.trim()
    ) {
      return NextResponse.json(
        { error: "x, y, text は必須です（author は任意）" },
        { status: 400 }
      );
    }
    const comment = addComment(id, {
      x,
      y,
      text: text.trim(),
      author: typeof author === "string" ? author.trim() || "匿名" : "匿名",
    });
    if (!comment) {
      return NextResponse.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json(
      { error: "コメントの追加に失敗しました" },
      { status: 500 }
    );
  }
}
