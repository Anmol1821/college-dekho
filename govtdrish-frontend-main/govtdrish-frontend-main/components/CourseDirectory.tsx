"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, X, GraduationCap } from "lucide-react";
import type { CollegeCourse } from "@/lib/types";

function formatFees(value: number): string {
  if (!value) return "N/A";
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(2)} L`;
  return `₹ ${value.toLocaleString("en-IN")}`;
}

export default function CourseDirectory({ courses }: { courses: CollegeCourse[] }) {
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(q) ||
        course.college_name.toLowerCase().includes(q) ||
        course.college_city.toLowerCase().includes(q)
    );
  }, [courses, term]);

  // Group by college so the page answers "which college offers which course".
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; city: string; courses: CollegeCourse[] }>();
    for (const course of filtered) {
      const entry = map.get(course.college_slug) ?? {
        name: course.college_name,
        slug: course.college_slug,
        city: course.college_city,
        courses: [],
      };
      entry.courses.push(course);
      map.set(course.college_slug, entry);
    }
    return [...map.values()];
  }, [filtered]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Courses by College</h2>
          <p className="text-slate-500 mt-1">
            {filtered.length} courses across {grouped.length} institutes
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Filter by course, college or city..."
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {term && (
            <button
              onClick={() => setTerm("")}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear filter"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-slate-400 italic">No courses match your filter.</p>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.slug} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 p-5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-blue-600" size={20} />
                  <Link href={`/college/${group.slug}`} className="font-bold text-slate-900 hover:text-blue-600">
                    {group.name}
                  </Link>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={14} /> {group.city}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {group.courses.map((course) => (
                  <div key={course.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">{course.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {course.seats} seats • {course.eligibility}
                      </p>
                    </div>
                    <div className="text-right font-bold text-slate-900">{formatFees(course.total_fees)}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
