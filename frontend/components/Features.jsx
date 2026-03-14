// components/Features.jsx
"use client";
const features = [
  { icon: "🛡️", title: "Role-Based Access", desc: "Admin, Staff, Transport Officer, Driver with permissions." },
  { icon: "🚗", title: "Fleet Management", desc: "Manage vehicles, maintenance, and availability." },
  { icon: "📍", title: "Trip Tracking", desc: "Real-time tracking of requests and trips." },
  { icon: "📊", title: "Reports & Analytics", desc: "Detailed dashboards and activity logs." },
];

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}