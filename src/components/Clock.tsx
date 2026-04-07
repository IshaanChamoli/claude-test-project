"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-40" />;

  const hours = time.getHours();
  const greeting =
    hours < 12 ? "Don't forget your jacket" : hours < 18 ? "Money doesn't grow on trees" : "Who left all the lights on?";

  const timeParts = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="animate-fade-up space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
        <p className="text-muted text-sm font-medium tracking-wide">
          {greeting}
        </p>
      </div>
      <p className="text-gradient text-6xl font-bold tracking-tight tabular-nums sm:text-7xl">
        {timeParts}
      </p>
      <p className="text-muted/60 text-sm font-light tracking-wide">
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
