// セッション・コメントの保存（開発中はファイルに保存して再起動でも残す）

import fs from "fs";
import path from "path";

export type Comment = {
  id: string;
  x: number; // 0-100 のパーセント
  y: number;
  text: string;
  author: string;
  createdAt: string;
};

export type Session = {
  id: string;
  url: string;
  title: string;
  comments: Comment[];
  createdAt: string;
};

const sessions = new Map<string, Session>();

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function loadFromFile(): void {
  try {
    const data = fs.readFileSync(SESSIONS_FILE, "utf-8");
    const arr: Session[] = JSON.parse(data);
    sessions.clear();
    for (const s of arr) sessions.set(s.id, s);
  } catch {
    // ファイルが無い・読めない場合は何もしない（メモリのまま）
  }
}

function saveToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const arr = Array.from(sessions.values());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch {
    // 保存失敗は無視（メモリには残っている）
  }
}

export function createSession(url: string, title?: string): Session {
  loadFromFile();
  const id = generateId();
  const session: Session = {
    id,
    url: url.startsWith("http") ? url : `https://${url}`,
    title: title || "フィードバックセッション",
    comments: [],
    createdAt: new Date().toISOString(),
  };
  sessions.set(id, session);
  saveToFile();
  return session;
}

export function getSession(id: string): Session | undefined {
  loadFromFile();
  return sessions.get(id);
}

export function addComment(
  sessionId: string,
  comment: Omit<Comment, "id" | "createdAt">
): Comment | null {
  loadFromFile();
  const session = sessions.get(sessionId);
  if (!session) return null;
  const newComment: Comment = {
    ...comment,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  session.comments.push(newComment);
  saveToFile();
  return newComment;
}
