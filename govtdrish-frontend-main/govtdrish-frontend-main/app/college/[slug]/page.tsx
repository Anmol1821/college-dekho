import { notFound } from 'next/navigation';
import CollegeDetailClient from "@/components/CollegeDetailClient";
import { API_URL } from "@/lib/config";
import type { CollegeDetail } from "@/lib/types";

async function getCollege(slug: string): Promise<CollegeDetail | null> {
  // Use 127.0.0.1 to avoid localhost node fetch errors
  const url = `${API_URL}/api/colleges/${slug}/`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.log("Failed. Status:", res.status);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
}

export default async function CollegeDetail({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug } = await params;
  const college = await getCollege(slug);

  if (!college) {
    notFound();
  }

  // Pass data to the Client Component
  return <CollegeDetailClient college={college} />;
}