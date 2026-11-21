"use client";

import { useEffect } from "react";
import { initMotion } from "@/lib/motion";

/** Starts GSAP + Lenis once the page has hydrated. */
export default function MotionProvider() {
  useEffect(() => initMotion(), []);
  return null;
}
