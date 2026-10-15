import type { Metadata } from "next";
import SearchExperience from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Discover which courses you can pursue and which college offers them — engineering, medical, commerce, arts, law and more.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <SearchExperience
      mode="courses"
      title="Courses you can pursue"
      subtitle="See which courses are offered and by which college — across every stream."
      defaultQuery="what courses can I pursue in government colleges in India"
      userQuery={(q ?? "").trim()}
      showCourses
    />
  );
}
