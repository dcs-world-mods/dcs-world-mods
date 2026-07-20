import type { Metadata } from "next";
import { NewsForm } from "../NewsForm";

export const metadata: Metadata = { title: "New Post" };

export default function NewNewsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="section-title">New News Post</h2>
      <NewsForm mode="create" />
    </div>
  );
}
