// セッション・コメントの保存
// 本番（Vercel）: Upstash Redis を使用
// 開発（ローカル）: Redis 環境変数がなければメモリに保存

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

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Redis が設定されているか（本番 Vercel では自動で入る）
// Vercel の Upstash 統合は KV_REST_API_URL / KV_REST_API_TOKEN という名前で環境変数を追加する
const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const isRedisConfigured = Boolean(REDIS_URL && REDIS_TOKEN);

// ローカル開発用メモリストア（再起動で消えるが開発用途には十分）
const memoryStore = new Map<string, Session>();

async function getRedisClient() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

async function redisGet(key: string): Promise<Session | null> {
  const redis = await getRedisClient();
  const data = await redis.get(key);
  if (!data) return null;
  if (typeof data === "string") return JSON.parse(data) as Session;
  return data as Session;
}

async function redisSet(key: string, value: Session): Promise<void> {
  const redis = await getRedisClient();
  // 90日で自動削除
  await redis.set(key, JSON.stringify(value), { ex: 60 * 60 * 24 * 90 });
}

export async function createSession(
  url: string,
  title?: string
): Promise<Session> {
  const id = generateId();
  const session: Session = {
    id,
    url: url.startsWith("http") ? url : `https://${url}`,
    title: title || "フィードバックセッション",
    comments: [],
    createdAt: new Date().toISOString(),
  };
  if (isRedisConfigured) {
    await redisSet(`session:${id}`, session);
  } else {
    memoryStore.set(id, session);
  }
  return session;
}

export async function getSession(id: string): Promise<Session | undefined> {
  if (isRedisConfigured) {
    const data = await redisGet(`session:${id}`);
    return data ?? undefined;
  }
  return memoryStore.get(id);
}

export async function addComment(
  sessionId: string,
  comment: Omit<Comment, "id" | "createdAt">
): Promise<Comment | null> {
  const session = await getSession(sessionId);
  if (!session) return null;
  const newComment: Comment = {
    ...comment,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  session.comments.push(newComment);
  if (isRedisConfigured) {
    await redisSet(`session:${sessionId}`, session);
  } else {
    memoryStore.set(sessionId, session);
  }
  return newComment;
}
