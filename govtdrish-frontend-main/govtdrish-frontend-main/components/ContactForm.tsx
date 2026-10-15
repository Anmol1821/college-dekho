"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { API_URL } from "@/lib/config";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/colleges/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          college_name: "General Enquiry",
          note: form.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.phone?.[0] || data.detail || "Could not send your request.");
      }

      setSuccess(true);
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-white border border-green-100 rounded-3xl p-10 text-center shadow-sm">
        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-1">Request sent!</h3>
        <p className="text-slate-500 text-sm">Our counsellor will reach out within 24 hours.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-bold text-blue-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4"
    >
      <h3 className="text-xl font-black text-slate-900">Talk to a counsellor</h3>
      <p className="text-slate-500 text-sm">
        Tell us what you need — college guidance, fees, scholarships or exam counselling.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <input
          required
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full name"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          required
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email (optional)"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        rows={4}
        placeholder="Your question or message"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        {loading ? "Sending..." : "Send Request"}
      </button>
    </form>
  );
}
