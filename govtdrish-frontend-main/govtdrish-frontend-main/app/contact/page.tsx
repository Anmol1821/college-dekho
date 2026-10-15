import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Govt Drish",
  description: "Talk to a Govt Drish counsellor about colleges, fees, exams and scholarships.",
};

const CONTACT_ITEMS = [
  { icon: Phone, label: "Call us", value: "08044187303", href: "tel:08044187303" },
  { icon: Mail, label: "Email", value: "hello@govtdrish.com", href: "mailto:hello@govtdrish.com" },
  { icon: MapPin, label: "Location", value: "India" },
  { icon: Clock, label: "Hours", value: "Mon – Sat, 10am – 7pm IST" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Contact Govt Drish</h1>
          <p className="text-slate-500">
            Free counselling for students and parents. No consultation fees, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {CONTACT_ITEMS.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-start gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="font-bold text-slate-800">{item.value}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="block hover:opacity-90">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
