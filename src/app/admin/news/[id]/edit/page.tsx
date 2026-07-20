import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { NewsForm } from "../../NewsForm";

export const metadata: Metadata = { title: "Edit Post" };
export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await db.newsItem.findUnique({ where: { id } });
  if (!item || item.isHtml) notFound(); // SEO Agent HTML posts aren't manually editable here

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="section-title">Edit News Post</h2>
      <NewsForm
        mode="edit"
        newsId={item.id}
        initialTitle={item.title}
        initialSummary={item.summary ?? ""}
        initialContent={item.content}
      />
    </div>
  );
}
