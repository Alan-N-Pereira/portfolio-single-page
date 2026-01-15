"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Hero.module.css";

export default function Hero() {
  const [showContent, setShowContent] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Intro mask animation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const maskGroup = root.querySelector<SVGGElement>(".vi-mask-group");
    if (!maskGroup) return;

    const tl = gsap.timeline({ defaults: { transformOrigin: "50% 50%" } });

    tl.to(maskGroup, {
      rotate: 10,
      duration: 2,
      ease: "power4.inOut",
    }).to(
      maskGroup,
      {
        scale: 10,
        duration: 2,
        ease: "expo.inOut",
        opacity: 0,
        onComplete: () => setShowContent(true),
      },
      "-=1.8"
    );

    return () => {
      tl.kill();
    };
  }, []);

  // Mouse parallax on hero content
  useEffect(() => {
    if (!showContent) return;

    const root = rootRef.current;
    if (!root) return;

    const main = root.querySelector<HTMLElement>("[data-main='true']");
    if (!main) return;

    const textEl = main.querySelector<HTMLElement>("[data-text='true']");
    const skyEl = main.querySelector<HTMLElement>("[data-sky='true']");
    const bgEl = main.querySelector<HTMLElement>("[data-bg='true']");

    if (!textEl || !skyEl || !bgEl) return;

    // smoother + prevents creating a new tween every mousemove
    const quickSky = gsap.quickTo(skyEl, "x", { duration: 0.6, ease: "power3.out" });
    const quickBg = gsap.quickTo(bgEl, "x", { duration: 0.6, ease: "power3.out" });
    const quickText = gsap.quickTo(textEl, "x", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const xMove = (e.clientX / window.innerWidth - 0.5) * 40;

      // matches your original intent
      quickText(xMove * -2);
      quickSky(xMove);
      quickBg(xMove * 1.7);
    };

    main.addEventListener("mousemove", onMove);

    return () => {
      main.removeEventListener("mousemove", onMove);
    };
  }, [showContent]);

  return (
    <div ref={rootRef} className={styles.root}>
      {!showContent && (
        <div className={styles.svgOverlay}>
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <mask id="hiMask">
                <rect width="100%" height="100%" fill="black" />
                <g className="vi-mask-group">
                  <text
                    x="50%"
                    y="50%"
                    fontSize="250"
                    textAnchor="middle"
                    fill="white"
                    dominantBaseline="middle"
                    fontFamily="Arial Black"
                  >
                    HI
                  </text>
                </g>
              </mask>
            </defs>

            {/* SVG uses <image>, not <Image> */}
            <image
              href="/hero/bg.png"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              mask="url(#hiMask)"
            />
          </svg>
        </div>
      )}

      {showContent && (
        <div className={styles.main} data-main="true">
          <div className={styles.landing}>
            <div className={styles.navbar}>
              <div className={styles.logo}>
                <div className={styles.lines}>
                  <div className={styles.line15} />
                  <div className={styles.line8} />
                  <div className={styles.line5} />
                </div>
                <h3 className={styles.logoText}>Alan</h3>
              </div>
            </div>

            <div className={styles.imagesDiv}>
              <img
                className={`${styles.sky} ${styles.skyScale}`}
                data-sky="true"
                src="/hero/sky.png"
                alt=""
              />
              <img
                className={`${styles.bg} ${styles.bgScale}`}
                data-bg="true"
                src="/hero/bg.png"
                alt=""
              />

              <div className={styles.text} data-text="true">
                <h1 className={styles.textWeb}>Web</h1>
                <h1 className={styles.textDev}>Devloper</h1>
              </div>

              <img className={styles.alan} src="/hero/alan1.png" alt="" />
            </div>

            <div className={styles.btmbar}>
              <div className={styles.btmbarInner}>
                <h3 className={styles.scrollText}>Scroll Down</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}