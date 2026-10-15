import { Users, GraduationCap, Download } from "lucide-react";

interface CourseProps {
  name: string;
  seats: number;
  total_fees: number;
  eligibility: string;
}

export default function CourseCard({ course }: { course: CourseProps }) {
  // Convert fee to Lakhs for better display
  const feeInLakhs = (course.total_fees / 100000).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                Full Time
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                {course.name}
            </h3>
        </div>
        <div className="text-right">
            <p className="text-2xl font-black text-slate-800">₹{feeInLakhs} L</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Fees</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <GraduationCap size={16} className="text-slate-400" />
            <span className="truncate max-w-[200px]" title={course.eligibility}>
                {course.eligibility}
            </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} className="text-slate-400" />
            <span>{course.seats} Seats Available</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-slate-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
            Enquire Now
        </button>
        <button className="px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors" title="Download Syllabus">
            <Download size={18} />
        </button>
      </div>
    </div>
  );
}