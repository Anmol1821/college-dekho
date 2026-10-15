import type { Metadata } from "next";
import SearchExperience from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "Colleges",
  description:
    "Explore engineering, medical, law and central universities across India — with live AI answers.",
};

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <SearchExperience
      mode="colleges"
      title="Find the right college"
      subtitle="Engineering, medical, law, central universities & state colleges — ask in English or Hindi."
      defaultQuery="top government colleges in India across engineering, medical, law and central universities"
      userQuery={(q ?? "").trim()}
      showDirectory
    />
  );
}
