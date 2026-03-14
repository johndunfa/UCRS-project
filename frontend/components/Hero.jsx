// components/Hero.jsx
"use client";
export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold">University Car Reservation System</h1>
          <p className="text-lg md:text-xl text-gray-200">
            Efficiently manage vehicles, drivers, and transportation requests in your organization.
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
              Request Demo
            </button>
            <button className="bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Contact Admin
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mb-10 md:mb-0">
          <img src="/images/hero-dashboard.svg" alt="Dashboard illustration" className="w-full" />
        </div>
      </div>
    </section>
  );
}