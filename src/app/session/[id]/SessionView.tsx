"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Comment, Session } from "@/lib/store";

type SessionViewProps = { session: Session };

export function SessionView({ session: initialSession }: SessionViewProps) {
  const [session, setSession] = useState(initialSession);
  const [selectedPin, setSelectedPin] = useState<Comment | null>(null);
  const [addingPin, setAddingPin] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/session/${session.id}`
      : "";

  const copyShareLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const refreshSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${session.id}`);
    if (res.ok) {
      const data = await res.json();
      setSession(data);
    }
  }, [session.id]);

  useEffect(() => {
    const t = setInterval(refreshSession, 5000);
    return () => clearInterval(t);
  }, [refreshSession]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || addingPin) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setAddingPin({ x, y });
    setSelectedPin(null);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingPin || !commentText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: addingPin.x,
          y: addingPin.y,
          text: commentText.trim(),
          author: author.trim() || "匿名",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const newComment = await res.json();
      setSession((s) => ({ ...s, comments: [...s.comments, newComment] }));
      setAddingPin(null);
      setCommentText("");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const cancelAdd = () => {
    setAddingPin(null);
    setCommentText("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-900">
      {/* ヘッダー */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-100">
            {session.title}
          </h1>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {session.url}
          </p>
          <a
            href={session.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            作品を新しいタブで開く
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
            {session.comments.length} 件のコメント
          </span>
          <button
            type="button"
            onClick={copyShareLink}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? "コピーしました" : "招待リンクをコピー"}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            トップへ
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* 作品エリア（iframe + オーバーレイ） */}
        <div className="relative flex-1 overflow-hidden" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            <iframe
              src={session.url}
              title="共有作品"
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          {/* クリックでピン追加用オーバーレイ */}
          <div
            className="absolute inset-0 cursor-crosshair"
            onClick={handleOverlayClick}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
            aria-label="クリックでコメントを追加"
          />
          {/* ピン表示 */}
          {session.comments.map((c) => (
            <button
              key={c.id}
              type="button"
              className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 text-white shadow-md transition hover:scale-110 hover:bg-amber-600"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPin(selectedPin?.id === c.id ? null : c);
                setAddingPin(null);
              }}
              aria-label={`コメント: ${c.text.slice(0, 30)}...`}
            >
              <span className="text-sm font-bold">!</span>
            </button>
          ))}
          {addingPin && (
            <div
              className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-emerald-500 bg-white dark:bg-slate-800"
              style={{ left: `${addingPin.x}%`, top: `${addingPin.y}%` }}
            />
          )}
        </div>

        {/* 右サイド: コメント一覧 & 追加フォーム */}
        <aside className="w-full shrink-0 border-t border-slate-200 bg-white lg:w-96 lg:border-l lg:border-t-0 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-full max-h-[50vh] flex-col lg:max-h-none">
            {/* 追加フォーム（ピン位置を指定したとき） */}
            {addingPin && (
              <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  この位置にコメントを追加
                </p>
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <input
                    type="text"
                    placeholder="名前（任意）"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <textarea
                    placeholder="フィードバックを入力..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    required
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelAdd}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !commentText.trim()}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {loading ? "送信中…" : "送信"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* コメント一覧 */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                作品上をクリックすると、その位置にコメントを追加できます
              </p>
              <ul className="space-y-3">
                {session.comments.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                    まだコメントはありません
                  </li>
                ) : (
                  session.comments.map((c) => (
                    <li
                      key={c.id}
                      className={`rounded-lg border p-3 ${
                        selectedPin?.id === c.id
                          ? "border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20"
                          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {c.author}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(c.createdAt).toLocaleString("ja-JP")}
                        </span>
                        <span className="text-xs text-slate-400">
                          位置: {c.x.toFixed(0)}%, {c.y.toFixed(0)}%
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
                        {c.text}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* 選択したピンのポップオーバー（モバイル用） */}
      {selectedPin && !addingPin && (
        <div
          className="fixed inset-x-4 bottom-4 z-20 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800 lg:hidden"
          role="dialog"
          aria-label="コメント内容"
        >
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {selectedPin.author} · {new Date(selectedPin.createdAt).toLocaleString("ja-JP")}
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
            {selectedPin.text}
          </p>
          <button
            type="button"
            onClick={() => setSelectedPin(null)}
            className="mt-3 w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
