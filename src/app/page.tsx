"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!url.trim()) {
      setError("作品のURLを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "作成に失敗しました");
      router.push(`/session/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const id = sessionId.trim();
    if (!id) {
      setError("セッションIDを入力するか、招待リンクを貼ってください");
      return;
    }
    // リンク形式でも対応（/session/xxx の xxx 部分を抽出）
    const match = id.match(/\/session\/([a-z0-9]+)/i) || id.match(/^([a-z0-9]+)$/i);
    const targetId = match ? match[1] : id;
    router.push(`/session/${targetId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
          グループセッション
        </h1>
        <p className="mb-10 text-center text-slate-600 dark:text-slate-400">
          作品URLを共有して、みんなでフィードバック
        </p>

        {/* 新規セッション作成 */}
        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            新規セッションを作成
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="url" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                作品のURL
              </label>
              <input
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="title" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                セッション名（任意）
              </label>
              <input
                id="title"
                type="text"
                placeholder="例：ポートフォリオレビュー"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "作成中…" : "セッションを作成"}
            </button>
          </form>
        </section>

        {/* セッションに参加 */}
        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            セッションに参加
          </h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="sessionId" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                セッションID または 招待リンク
              </label>
              <input
                id="sessionId"
                type="text"
                placeholder="例：abc12def または https://.../session/abc12def"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              参加する
            </button>
          </form>
        </section>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
