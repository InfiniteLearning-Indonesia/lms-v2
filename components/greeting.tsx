"use client";

import { useState, useEffect } from "react";

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Selamat Datang");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 11 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
    else if (hour >= 18 || hour < 4) setGreeting("Selamat Malam");
    else setGreeting("Selamat Pagi");
  }, []);

  return <>{`${greeting}, ${name}`}</>;
}
