"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import type { College } from "@/lib/types";

interface SpeechRecognitionResultLike {
  results: { 0: { 0: { transcript: string } } };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionResultLike) => void;
  onend: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [botReply, setBotReply] = useState("");
  const [results, setResults] = useState<College[]>([]);

  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel(); // Stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN"; // Indian accent
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleVoiceQuery = useCallback(
    async (text: string) => {
      try {
        const res = await fetch(`${API_URL}/api/voice-counselor/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data = await res.json();
        setBotReply(data.reply);
        // New API returns "colleges"; keep "data" as a legacy fallback.
        setResults(data.colleges ?? data.data ?? []);

        speak(data.reply);
      } catch (error) {
        console.error("Voice Error:", error);
        setBotReply("Sorry, connection failed.");
        speak("Maaf kijiye, connection fail ho gaya.");
      }
    },
    [speak]
  );

  // Initialize Speech Recognition (Browser Native)
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "hi-IN"; // Creates the "Hinglish" bias
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleVoiceQuery(text);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [handleVoiceQuery]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("Listening...");
      setBotReply("");
      setResults([]);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* 1. VISUAL RESPONSE CARD (Only shows when active) */}
      {(transcript || botReply) && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-80 mb-2 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">AI Counselor</span>
                <button onClick={() => { setTranscript(""); setBotReply(""); }}><X size={14} className="text-slate-400" /></button>
            </div>

            <p className="text-slate-500 text-sm italic mb-2">&ldquo;{transcript}&rdquo;</p>

            {botReply && (
                <div className="bg-blue-50 p-3 rounded-lg text-slate-800 text-sm font-medium">
                    {botReply}
                </div>
            )}

            {/* ACTION BUTTONS (The "Visual" part) */}
            {results.length > 0 && (
                <div className="mt-3 space-y-2">
                    {results.map((college) => (
                        <button
                            key={college.slug}
                            onClick={() => router.push(`/college/${college.slug}`)}
                            className="w-full text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center group transition-colors"
                        >
                            <span className="text-sm font-bold text-slate-800">{college.name}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full group-hover:bg-green-200">View</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* 2. THE GLOWING MIC BUTTON */}
      <button
        onClick={toggleMic}
        className={`h-16 w-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            isListening
            ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200 scale-110"
            : isSpeaking
                ? "bg-green-500 text-white ring-4 ring-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
        }`}
      >
        {isListening ? <MicOff size={28} /> : isSpeaking ? <Volume2 size={28} className="animate-bounce" /> : <Mic size={28} />}
      </button>

    </div>
  );
}
