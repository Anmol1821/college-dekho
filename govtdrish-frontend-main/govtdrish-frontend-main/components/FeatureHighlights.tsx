"use client";

import { FileText, Clock, Layout, Gift, Compass, PhoneCall } from "lucide-react";

const features = [
  {
    icon: <FileText size={32} className="text-blue-600" />,
    title: "Apply With One Form",
    desc: "One platform to apply to 2000+ esteemed colleges"
  },
  {
    icon: <Clock size={32} className="text-blue-600" />,
    title: "Easy Apply in 5 mins",
    desc: "Fill your college applications in 5 minutes or less."
  },
  {
    icon: <Layout size={32} className="text-blue-600" />,
    title: "Track applications",
    desc: "Apply to and manage all college applications through My Profile"
  },
  {
    icon: <Gift size={32} className="text-blue-600" />,
    title: "Get Exciting Rewards",
    desc: "Win amazing rewards and cash-backs while applying"
  },
  {
    icon: <Compass size={32} className="text-blue-600" />,
    title: "Get Your Career Match",
    desc: "Take our free career compass quiz and get top options."
  },
  {
    icon: <PhoneCall size={32} className="text-blue-600" />,
    title: "Talk to Experts",
    desc: "Get free personalised expert guidance on colleges."
  }
];

export default function FeatureHighlights() {
  return (
    <div className="bg-white py-16 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Choosing the right college can be confusing</h2>
            <p className="text-slate-500 mt-2">We&apos;re here to guide you at every step of your college journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
                <div key={idx} className="flex gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-colors cursor-pointer group">
                    <div className="bg-blue-50 group-hover:bg-white w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors">
                        {feat.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{feat.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                    </div>
                </div>
            ))}
        </div>
        
      </div>
    </div>
  );
}