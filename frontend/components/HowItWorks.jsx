"use client";
import AnimatedCard from "./AnimatedCard";

const steps = [
  { icon: "1️⃣", title: "Submit Request", desc: "Staff submits a car request with details." },
  { icon: "2️⃣", title: "Approval & Assignment", desc: "Transport officer approves and assigns vehicle & driver." },
  { icon: "3️⃣", title: "Trip Execution", desc: "Driver completes the trip and updates status." },
];

export default function HowItWorks() {
  return (
    <section id="workflow" className="py-20">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {steps.map((s, i) => (
            <AnimatedCard key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}