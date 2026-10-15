import { Sparkles, Globe2, Database, MessageSquareQuote } from "lucide-react";
import type { AIResult } from "@/lib/types";

/**
 * Renders the AI answer returned by /api/ai-search/.
 * The model may include light markdown (**bold**, bullet lines) so we do a
 * tiny, dependency-free formatting pass instead of showing raw asterisks.
 */
function formatLine(line: string, key: number) {
  const bullet = /^\s*[*\-•]\s+/.test(line);
  const text = bullet ? line.replace(/^\s*[*\-•]\s+/, "") : line;
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  const content = parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-bold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );

  if (bullet) {
    return (
      <li key={key} className="flex gap-2">
        <span className="text-blue-500 mt-[2px]">•</span>
        <span>{content}</span>
      </li>
    );
  }
  return (
    <p key={key} className="mb-2 last:mb-0">
      {content}
    </p>
  );
}

export default function AIAnswerCard({ result }: { result: AIResult }) {
  const isLive = result.source === "gemini";
  const blocks = result.reply
    .split(/\n{2,}|\n(?=[*\-•]\s)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-lg">
      <div className="bg-white/95 rounded-[20px] p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            <Sparkles size={12} /> AI Answer
          </span>
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${isLive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
            {isLive ? <Globe2 size={12} /> : <Database size={12} />}
            {isLive ? "Live Google Search" : "Govt Drish database"}
          </span>
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            <MessageSquareQuote size={12} /> {result.language === "hi" ? "हिंदी" : "English"}
          </span>
        </div>

        <div className="text-slate-700 leading-relaxed text-[15px]">
          {blocks.map((block, index) => {
            const lines = block.split("\n");
            const allBullets = lines.every((line) => /^\s*[*\-•]\s+/.test(line));
            if (allBullets && lines.length > 0) {
              return (
                <ul key={index} className="space-y-1.5 my-2">
                  {lines.map((line, i) => formatLine(line, i))}
                </ul>
              );
            }
            return <div key={index}>{lines.map((line, i) => formatLine(line, i))}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
