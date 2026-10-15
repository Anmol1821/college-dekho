import type { Metadata } from "next";
import SearchExperience from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "Exams",
  description:
    "Which entrance exam gets you into which college — JEE, NEET, CUET, CLAT, CAT and more.",
};

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <SearchExperience
      mode="exams"
      title="Exams & admission path"
      subtitle="Find out which exam gives admission to which college — JEE, NEET, CUET, CLAT and more."
      defaultQuery="which entrance exams give admission to top government colleges in India (JEE, NEET, CUET, CLAT)"
      userQuery={(q ?? "").trim()}
      showExams
    />
  );
}
