import type { Metadata } from "next";
import SearchExperience from "@/components/SearchExperience";
import type { AISearchMode } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search",
  description:
    "AI-powered search for colleges, courses, exams and scholarships across India. Ask in English or Hindi.",
};

const MODES: AISearchMode[] = ["general", "colleges", "exams", "courses", "scholarships", "test_series"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>;
}) {
  const { q, mode } = await searchParams;
  const query = (q ?? "").trim();
  const safeMode: AISearchMode = MODES.includes(mode as AISearchMode)
    ? (mode as AISearchMode)
    : "general";

  return (
    <SearchExperience
      mode={safeMode}
      title="Search colleges, courses & scholarships"
      subtitle="Powered by AI with live Google Search — ask in English or Hindi."
      defaultQuery={query || "best government colleges in India"}
      userQuery={query}
      showDirectory
    />
  );
}
