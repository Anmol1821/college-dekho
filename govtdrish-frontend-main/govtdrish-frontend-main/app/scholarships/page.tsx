import type { Metadata } from "next";
import SearchExperience from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "Scholarships",
  description:
    "Find scholarships, fee waivers and concessions — including schemes for SC/ST/OBC and army/defence families.",
};

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <SearchExperience
      mode="scholarships"
      title="Scholarships & fee waivers"
      subtitle="Find financial aid, discounts and fee-free schemes — including for army & defence families."
      defaultQuery="government scholarships, fee waivers and army family concessions available for students"
      userQuery={(q ?? "").trim()}
      showScholarships
    />
  );
}
