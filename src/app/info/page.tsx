'use client';

import { useState } from 'react';

export default function Page() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 pb-40">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-emerald-700">📘 About Live.ly</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-800">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Live.ly is a compassion-driven platform created to support individuals navigating housing, food, and mental health insecurity in cities like Toronto.
            Powered by smart, real-time AI and reliable local data, we aim to remove the barriers that often make it difficult to get help — whether that means finding shelter, meals, or critical support.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We believe access to basic necessities should be straightforward, stigma-free, and human-centered. Live.ly exists to make that belief a reality.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-800">How It Works</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Live.ly is powered by a system of AI agents built using Vellum. These agents continuously pull, process, and verify information from trusted sources like the City of Toronto&apos;s shelter and food databases, as well as community-based services and nonprofits.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            When you interact with Live.ly, the app takes into account your current location, time of day, and any information you choose to share. Using this, it recommends the most appropriate, accessible, and currently available resources near you.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Think of Live.ly as your guide — helping you find help faster, with less stress, and more dignity.
          </p>
        </section>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium">Name</label>
            <input type="text" id="name" name="name" required
              className="w-full p-3 mt-1 border border-gray-300 rounded-xl shadow-sm focus:ring-emerald-600 focus:border-emerald-600" />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
            <input type="email" id="email" name="email" required
              className="w-full p-3 mt-1 border border-gray-300 rounded-xl shadow-sm focus:ring-emerald-600 focus:border-emerald-600" />
          </div>

          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium">Message</label>
            <textarea id="message" name="message" rows={5} required
              className="w-full p-3 mt-1 border border-gray-300 rounded-xl shadow-sm resize-none focus:ring-emerald-600 focus:border-emerald-600"></textarea>
          </div>

          <button type="submit"
            disabled={isSubmitted}
            className={`px-6 py-3 rounded-xl shadow font-semibold transition-all ${
              isSubmitted
                ? 'bg-gray-400 text-white cursor-default'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isSubmitted ? 'Sent' : 'Send'}
          </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-0 w-full z-50 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-4 shadow-2xl">
            <div className="flex justify-center items-center space-x-12">

              <a href="/resources">
                <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform">
                    <path d="M21 8v13H3V8"/>
                    <path d="M1 3h22l-2 5H3l-2-5z"/>
                    <path d="M10 12v6"/>
                    <path d="M14 12v6"/>
                  </svg>
                </button>
              </a>

              <a href="/dashboard">
                <button className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </button>
              </a>

              <a href="/info">
                <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                </button>
              </a>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
