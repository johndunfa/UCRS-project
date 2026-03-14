"use client";
import { motion } from "framer-motion";

const testimonials = [
  { name: "John Doe", role: "University Admin", quote: "UCRS made vehicle management effortless.", avatar: "/images/admin-avatar.png" },
  { name: "Jane Smith", role: "Transport Officer", quote: "Approving trips and assigning drivers is now seamless.", avatar: "/images/driver-avatar.png" },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white p-6 rounded-xl shadow"
            >
              <p className="text-gray-700 mb-4">"{t.quote}"</p>
              <div className="flex items-center justify-center gap-4">
                <img src={t.avatar} className="w-12 h-12 rounded-full" alt={t.name} />
                <div className="text-left">
                  <h4 className="font-semibold">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}