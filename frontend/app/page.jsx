"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  Users,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-800">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Security />
      <CTA />
      <Footer />
    </main>
  );
}

/* ================= NAVBAR ================= */

function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">
          UCRS
        </h1>
        <div className="space-x-6 hidden md:flex items-center">
          <a href="#features" className="hover:text-blue-700 transition">
            Features
          </a>
          <a href="#security" className="hover:text-blue-700 transition">
            Security
          </a>
          <Link
            href="/login"
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ================= HERO ================= */

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Smart University Transportation Management
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Automate vehicle allocation, driver assignment, and transportation
            requests with a secure enterprise-level system.
          </p>
          <div className="space-x-4">
            <Link
              href="/login"
              className="bg-white text-blue-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Request Vehicle
            </Link>
            <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-900 transition">
              Learn More
            </button>
          </div>
        </div>

        <div className="bg-white/10 p-8 rounded-2xl backdrop-blur shadow-xl">
          <p className="text-blue-100 text-sm">
            Enterprise Dashboard Preview
          </p>
          <div className="mt-4 bg-white rounded-xl h-64 shadow-inner"></div>
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURES ================= */

function Features() {
  const features = [
    { icon: <Car />, title: "Vehicle Management", desc: "Manage and monitor all institutional vehicles." },
    { icon: <Users />, title: "Driver Assignment", desc: "Smart driver allocation workflow system." },
    { icon: <ClipboardList />, title: "Request Tracking", desc: "Track transportation requests in real-time." },
    { icon: <ShieldCheck />, title: "Secure Authentication", desc: "JWT & Role-Based Access Control." },
    { icon: <BarChart3 />, title: "Analytics & Reports", desc: "Generate reports for management insights." },
    { icon: <Clock />, title: "Real-Time Updates", desc: "Instant status updates from drivers." },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-12">
          System Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="text-blue-900 mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorks() {
  const steps = [
    "Staff submits transportation request",
    "Transport officer reviews & approves",
    "System assigns driver & vehicle",
    "Driver updates trip status",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h3 className="text-3xl font-bold mb-12">
          How It Works
        </h3>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-6 border rounded-xl hover:bg-gray-50 transition"
            >
              <span className="font-bold text-blue-900 mr-2">
                {index + 1}.
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= STATS ================= */

function Stats() {
  const [count, setCount] = useState({
    vehicles: 0,
    drivers: 0,
    requests: 0,
    uptime: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => ({
        vehicles: prev.vehicles < 120 ? prev.vehicles + 5 : 120,
        drivers: prev.drivers < 45 ? prev.drivers + 2 : 45,
        requests: prev.requests < 850 ? prev.requests + 20 : 850,
        uptime: prev.uptime < 99 ? prev.uptime + 1 : 99,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
        <StatCard number={count.vehicles} label="Total Vehicles" />
        <StatCard number={count.drivers} label="Active Drivers" />
        <StatCard number={count.requests} label="Requests Completed" />
        <StatCard number={`${count.uptime}%`} label="System Uptime" />
      </div>
    </section>
  );
}

function StatCard({ number, label }) {
  return (
    <div>
      <h4 className="text-4xl font-bold mb-2">{number}</h4>
      <p className="text-blue-200">{label}</p>
    </div>
  );
}

/* ================= SECURITY ================= */

function Security() {
  return (
    <section id="security" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-3xl font-bold mb-6">
            Enterprise Security & Reliability
          </h3>
          <ul className="space-y-4 text-gray-700">
            <li>✔ JWT Authentication</li>
            <li>✔ Role-Based Access Control</li>
            <li>✔ MongoDB Secure Storage</li>
            <li>✔ Audit Logs & Monitoring</li>
          </ul>
        </div>

        <div className="bg-white p-10 rounded-2xl shadow-lg">
          <ShieldCheck size={64} className="text-blue-900" />
        </div>
      </div>
    </section>
  );
}

/* ================= CTA ================= */

function CTA() {
  return (
    <section className="py-20 bg-emerald-600 text-white text-center">
      <h3 className="text-3xl font-bold mb-6">
        Digitize Your University Transportation Today
      </h3>
      <Link
        href="/login"
        className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
      >
        Get Started
      </Link>
    </section>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h4 className="text-white font-bold mb-4">UCRS</h4>
        <p className="text-sm">
          University Car Reservation System – Enterprise Transportation Platform
        </p>
        <p className="text-xs mt-6">
          © {new Date().getFullYear()} UCRS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}