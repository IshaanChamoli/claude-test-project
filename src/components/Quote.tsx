"use client";

import { useEffect, useState } from "react";

const quotes = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "If you're not embarrassed by the first version of your product, you've launched too late.", author: "Reid Hoffman" },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki" },
  { text: "Make something people want.", author: "Paul Graham" },
];

export default function Quote() {
  const [quote, setQuote] = useState(quotes[0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div className="glass glass-glow animate-fade-up delay-1 rounded-2xl p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.689 11 13.186 11 15c0 1.933-1.567 3.5-3.5 3.5-1.196 0-2.322-.585-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.689 21 13.186 21 15c0 1.933-1.567 3.5-3.5 3.5-1.196 0-2.322-.585-2.917-1.179z" />
        </svg>
        <p className="text-muted text-xs font-semibold uppercase tracking-widest">
          Daily Inspiration
        </p>
      </div>
      <blockquote
        className={`text-lg font-medium leading-relaxed transition-all duration-700 sm:text-xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {quote.text}
      </blockquote>
      <p
        className={`mt-3 text-sm font-medium transition-all duration-700 delay-200 ${
          visible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        — {quote.author}
      </p>
    </div>
  );
}
