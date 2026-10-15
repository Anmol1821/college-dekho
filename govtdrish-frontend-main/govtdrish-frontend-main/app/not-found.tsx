import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
      <p className="text-slate-500 mb-8">The page you are looking for does not exist.</p>
      <div className="flex gap-3">
        <Link href="/" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
          Go home
        </Link>
        <Link href="/search" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          Search colleges
        </Link>
      </div>
    </div>
  );
}
