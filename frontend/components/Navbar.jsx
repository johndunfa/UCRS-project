"use client";

import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 relative">

          {/* LEFT — Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 tracking-tight hover:text-blue-700 transition-colors"
            >
              UCRS
            </Link>
          </div>

          {/* CENTER — Desktop Links */}
          <div className="hidden md:flex flex-1 justify-center space-x-10">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium group"
              >
                {link.name}
                {/* Underline animation */}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* RIGHT — Login Button (CONNECTED TO LOGIN PAGE) */}
          <div className="hidden md:flex flex-1 justify-end">
            <Link
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
            >
              Login
            </Link>
          </div>

          {/* MOBILE — Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-8 h-8 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`absolute h-0.5 w-6 bg-gray-800 transform transition duration-300 ease-in-out ${
                  isOpen ? "rotate-45 translate-y-2.5" : "-translate-y-2"
                }`}
              />
              <span
                className={`absolute h-0.5 w-6 bg-gray-800 transition-all duration-300 ease-in-out ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-0.5 w-6 bg-gray-800 transform transition duration-300 ease-in-out ${
                  isOpen ? "-rotate-45 -translate-y-2.5" : "translate-y-2"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <Transition
        show={isOpen}
        enter="transition duration-300 ease-out"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-200 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-lg border-t border-gray-200 px-6 py-6 space-y-4">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="block text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {/* Mobile Login Button (CONNECTED TO LOGIN PAGE) */}
          <Link
            href="/login"
            className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            onClick={() => setIsOpen(false)}
          >
            Logins
          </Link>
        </div>
      </Transition>
    </nav>
  );
}