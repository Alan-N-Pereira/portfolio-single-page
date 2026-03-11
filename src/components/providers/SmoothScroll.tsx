"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.overflowX = "hidden";

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    // ✅ Let ScrollTrigger read/write scroll positions through Lenis
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // pinType matters on mobile; fixed is safest when transforms are not used on body
      pinType: "fixed",
    });

    ScrollTrigger.defaults({
      scroller: document.documentElement,
    });

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ✅ refresh after everything is wired
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.scrollerProxy(document.documentElement, null as any);
      lenis.destroy();
    };
  }, []);

  return null;
}