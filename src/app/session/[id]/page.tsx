import { notFound } from "next/navigation";
import { getSession } from "@/lib/store";
import { SessionView } from "./SessionView";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) notFound();
  return <SessionView session={session} />;
}
