"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";

export default function ApplyModal({ collegeName }: { collegeName: string }) {
  // --- 1. DEFINE ALL STATES ---
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // <--- This was missing!
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    college_name: collegeName
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Force college name into the payload
    const payload = {
        ...formData,
        college_name: collegeName 
    };

    try {
        const res = await fetch(`${API_URL}/api/colleges/leads/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setSuccess(true); // <--- Now this will work
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setFormData({ name: "", phone: "", email: "", college_name: collegeName });
            }, 3000);
        } else {
            const errorData = await res.json();
            alert(`Error: ${JSON.stringify(errorData)}`);
        }
    } catch (error) {
        console.error("Lead Error:", error);
        alert("Network error. Check connection.");
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm"
      >
        Apply Now
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    {!success ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900">Check Eligibility</h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Get details for <span className="font-bold text-blue-600">{collegeName}</span>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                                    <input 
                                        type="text" name="name" required
                                        value={formData.name} onChange={handleChange}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                                    <input 
                                        type="tel" name="phone" required
                                        value={formData.phone} onChange={handleChange}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                                    <input 
                                        type="email" name="email"
                                        value={formData.email} onChange={handleChange}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 mt-4 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Request Callback"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Request Sent!</h3>
                            <button onClick={() => setIsOpen(false)} className="bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-xl mt-4">Close</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
}