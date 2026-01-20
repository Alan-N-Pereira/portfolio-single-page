"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Hero.module.css";

function cssVarNumber(el: HTMLElement, name: string, fallback: number) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function cssVarString(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

export default function Hero() {
  const [showContent, setShowContent] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Intro mask animation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const maskGroup = root.querySelector<SVGGElement>(".vi-mask-group");
    const solidHi = root.querySelector<SVGGElement>(".hi-solid");
    if (!maskGroup || !solidHi) return;

    const tl = gsap.timeline({ defaults: { transformOrigin: "50% 50%" } });

    tl.set(solidHi, { opacity: 1 });
    tl.to({}, { duration: 0.35 });

    tl.to(solidHi, {
      opacity: 0,
      duration: 1.8,
      ease: "power2.inOut",
    });

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
      tl.kill()
    };
  }, []);

  // Reveal + Parallax
  useEffect(() => {
    if (!showContent) return;

    const root = rootRef.current;
    if (!root) return;

    const main = root.querySelector<HTMLElement>("[data-main='true']");
    const skyEl = root.querySelector<HTMLElement>("[data-sky='true']");
    const bgEl = root.querySelector<HTMLElement>("[data-bg='true']");
    const alanEl = root.querySelector<HTMLElement>("[data-alan='true']");
    const textEl = root.querySelector<HTMLElement>("[data-text='true']");

    if (!main || !skyEl || !bgEl || !alanEl || !textEl) return;

    // Read responsive values from CSS
    const mainStartScale = cssVarNumber(root, "--mainStartScale", 1.7);
    const mainStartRot = cssVarNumber(root, "--mainStartRot", -10);

    const skyStartScale = cssVarNumber(root, "--skyStartScale", 1.7);
    const skyStartRot = cssVarNumber(root, "--skyStartRot", -20);

    const bgStartScale = cssVarNumber(root, "--bgStartScale", 1.8);
    const bgStartRot = cssVarNumber(root, "--bgStartRot", -5);

    const skyEndScale = cssVarNumber(root, "--skyEndScale", 1.2);
    const bgEndScale = cssVarNumber(root, "--bgEndScale", 1.1);

    const alanStartScale = cssVarNumber(root, "--alanStartScale", 2);
    const alanEndScale = cssVarNumber(root, "--alanEndScale", 2.4);
    const alanStartBottom = cssVarString(root, "--alanStartBottom", "-150%");
    const alanEndBottom = cssVarString(root, "--alanEndBottom", "-25%");

    const textStartY = cssVarNumber(root, "--textStartY", 250);

    // Start states
    gsap.set(main, { scale: mainStartScale, rotate: mainStartRot, transformOrigin: "50% 50%" });
    gsap.set(skyEl, { scale: skyStartScale, rotate: skyStartRot, transformOrigin: "50% 50%" });
    gsap.set(bgEl, { scale: bgStartScale, rotate: bgStartRot, transformOrigin: "50% 50%" });

    gsap.set(alanEl, {
      xPercent: -50,
      left: "50%",
      bottom: alanStartBottom,
      rotate: -20,
      scale: alanStartScale,
      transformOrigin: "50% 100%",
    });

    gsap.set(textEl, { y: textStartY, opacity: 0 });

    // Reveal timeline
    const tl = gsap.timeline();

    tl.to(main, {
      scale: 1,
      rotate: 0,
      duration: 1,
      ease: "expo.inOut",
    })
      .to(
        skyEl,
        {
          scale: skyEndScale,
          rotate: 0,
          duration: 1,
          ease: "expo.inOut",
        },
        "-=1.0"
      )
      .to(
        bgEl,
        {
          scale: bgEndScale,
          rotate: 0,
          duration: 1,
          ease: "expo.inOut",
        },
        "-=0.8"
      )
      .to(
        alanEl,
        {
          scale: alanEndScale,
          rotate: 0,
          bottom: alanEndBottom,
          duration: 2,
          ease: "expo.inOut",
        },
        "-=0.8"
      )
      .to(
        textEl,
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
        },
        "-=0.2"
      );

    // Parallax (desktop + mobile touch)
    const parallaxMax = cssVarNumber(root, "--parallaxMax", 40);
    const quickSky = gsap.quickTo(skyEl, "x", { duration: 0.6, ease: "power3.out" });
    const quickBg = gsap.quickTo(bgEl, "x", { duration: 0.6, ease: "power3.out" });
    const quickText = gsap.quickTo(textEl, "x", { duration: 0.6, ease: "power3.out" });

    const applyMove = (clientX: number) => {
      const xMove = (clientX / window.innerWidth - 0.5) * parallaxMax;
      quickText(xMove * 3);
      quickSky(xMove);
      quickBg(xMove * 1.7);
    };

    const onPointerMove = (e: PointerEvent) => applyMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      applyMove(e.touches[0].clientX);
    };

    main.addEventListener("pointermove", onPointerMove, { passive: true });
    main.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      main.removeEventListener("pointermove", onPointerMove);
      main.removeEventListener("touchmove", onTouchMove);
      tl.kill();
      gsap.killTweensOf([main, skyEl, bgEl, alanEl, textEl]);
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
                    fontFamily="MainText"
                  >
                    HI
                  </text>
                </g>
              </mask>
            </defs>

            <image
              href="/hero/bg.png"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              mask="url(#hiMask)"
            />

            <g className="hi-solid">
              <text
                x="50%"
                y="50%"
                fontSize="250"
                textAnchor="middle"
                fill="white"
                dominantBaseline="middle"
                fontFamily="MainText"
              >
                HI
              </text>
            </g>
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
              <img className={styles.sky} data-sky="true" src="/hero/sky.png" alt="" />
              <img className={styles.bg} data-bg="true" src="/hero/bg.png" alt="" />

              <div className={styles.text} data-text="true">
                <h1>Web</h1>
                <h1>Developer</h1>
              </div>

              <img className={styles.alan} data-alan="true" src="/hero/alan1.png" alt="" />
            </div>

            <div className={styles.btmbar}>
              <div className={styles.btmbarInner}>
                <div className={styles.footerLeft}>
                  <p className={styles.footerTitle}>Mumbai, India</p>
                  <p className={styles.footerSub}>Where it all began</p>
                </div>

                <div className={styles.btmbarScroll}>
                  <h3 className={styles.scrollText}>Scroll Down</h3>
                  <img className={styles.scrollArrow} src="/hero/downSymbol.png" alt="" aria-hidden="true" />
                </div>

                <div className={styles.footerRight}>
                  <p className={styles.footerTitle}>Web Developer / Frontend Engineer</p>
                  <p className={styles.footerSub}>Based in London</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}