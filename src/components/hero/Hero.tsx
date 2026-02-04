"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styles from "./Hero.module.css";
import AboutSection from "../about/AboutSection";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const [showContent, setShowContent] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinWrapRef = useRef<HTMLDivElement | null>(null);

  // Hero refs
  const heroMainRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const alanRef = useRef<HTMLImageElement | null>(null);

  // About overlay refs
  const aboutOverlayRef = useRef<HTMLDivElement | null>(null);
  const aboutOverlayMoveRef = useRef<HTMLDivElement | null>(null);

  // About section ref
  const aboutSectionRef = useRef<HTMLElement | null>(null);

  // ---- 1) Intro HI mask ----
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const root = rootRef.current;
    if (!root) return;

    const maskGroup = root.querySelector<SVGGElement>(".vi-mask-group");
    const solidHi = root.querySelector<SVGGElement>(".hi-solid");
    if (!maskGroup || !solidHi) return;

    const tl = gsap.timeline({ defaults: { transformOrigin: "50% 50%" } });

    tl.set(solidHi, { opacity: 1 });
    tl.to({}, { duration: 0.3 });

    tl.to(solidHi, { opacity: 0, duration: 1.8, ease: "power2.inOut" });

    tl.to(maskGroup, { rotate: 10, duration: 2, ease: "power4.inOut" }).to(
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

  // ---- 2) Hero reveal + parallax ----
  useEffect(() => {
    if (!showContent) return;

    const main = heroMainRef.current;
    const sky = skyRef.current;
    const bg = bgRef.current;
    const alan = alanRef.current;
    const title = heroTitleRef.current;

    if (!main || !sky || !bg || !alan || !title) return;

    gsap.set(main, { scale: 1.5, rotate: -10, transformOrigin: "50% 50%" });
    gsap.set(sky, { scale: 1.5, rotate: -20, transformOrigin: "50% 50%" });
    gsap.set(bg, { scale: 1.8, rotate: -5, transformOrigin: "50% 50%" });

    gsap.set(alan, {
      left: "50%",
      xPercent: -50,
      bottom: "-150%",
      rotate: -20,
      scale: 2,
      transformOrigin: "50% 100%",
      force3D: true,
    });

    gsap.set(title, { y: 250, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.overflowX = "hidden";
        ScrollTrigger.refresh();
      },
    });

    tl.to(main, { scale: 1, rotate: 0, duration: 1, ease: "expo.inOut" })
      .to(sky, { scale: 1.2, rotate: 0, duration: 1, ease: "expo.inOut" }, "-=1.0")
      .to(bg, { scale: 1.1, rotate: 0, duration: 1, ease: "expo.inOut" }, "-=0.8")
      .to(
        alan,
        { scale: 2.4, rotate: 0, bottom: "-25%", duration: 2, ease: "expo.inOut" },
        "-=0.8"
      )
      .to(title, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, "-=0.2");

    const quickSky = gsap.quickTo(sky, "x", { duration: 0.6, ease: "power3.out" });
    const quickBg = gsap.quickTo(bg, "x", { duration: 0.6, ease: "power3.out" });
    const quickTitle = gsap.quickTo(title, "x", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const xMove = (e.clientX / window.innerWidth - 0.5) * 40;
      quickTitle(xMove * 3);
      quickSky(xMove);
      quickBg(xMove * 1.7);
    };

    main.addEventListener("mousemove", onMove);

    return () => {
      main.removeEventListener("mousemove", onMove);
      tl.kill();
      gsap.killTweensOf([main, sky, bg, alan, title]);
    };
  }, [showContent]);

  // ---- 3) Mask transition ----
  useLayoutEffect(() => {
    if (!showContent) return;

    const pinWrap = pinWrapRef.current;
    const heroMain = heroMainRef.current;
    const heroTitle = heroTitleRef.current;

    const overlay = aboutOverlayRef.current;
    const overlayMove = aboutOverlayMoveRef.current;
    const aboutSection = aboutSectionRef.current;

    if (!pinWrap || !heroMain || !heroTitle || !overlay || !overlayMove || !aboutSection) return;

    const cutLayer = pinWrap.querySelector<HTMLElement>("[data-cut-layer='true']");
    const solidLayer = pinWrap.querySelector<HTMLElement>("[data-solid-layer='true']");
    const aboutIntro = overlay.querySelector<HTMLElement>("[data-about-intro='true']");
    if (!cutLayer || !solidLayer || !aboutIntro) return;

    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(aboutSection, { autoAlpha: 0 });

    gsap.set(overlayMove, {
      x: 0,
      y: 0,
      scale: 6,
      transformOrigin: "50% 50%",
      force3D: true,
    });

    gsap.set(cutLayer, { autoAlpha: 1, force3D: true });
    gsap.set(solidLayer, { autoAlpha: 0, force3D: true });

    gsap.set(aboutIntro, { autoAlpha: 0, y: 30 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrap,
          start: "top top",
          end: "+=2200",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      tl.to(overlay, { autoAlpha: 1, duration: 0.01 }, 0);

      tl.to(heroMain, { scale: 0.97, duration: 0.6, ease: "power2.out", transformOrigin: "50% 50%" }, 0);
      tl.to(heroTitle, { autoAlpha: 0, y: -40, duration: 0.7, ease: "power2.out" }, 0);
      tl.to(heroMain, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.35);

      tl.to(overlayMove, { scale: 0.62, duration: 1.2, ease: "expo.inOut" }, 0);

      tl.to(cutLayer, { autoAlpha: 0, duration: 0.12, ease: "none" }, 0.55);
      tl.to(solidLayer, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0.55);

      tl.to(
        overlayMove,
        {
          scale: 0.28,
          y: -window.innerHeight * 0.32,
          duration: 1.2,
          ease: "expo.inOut",
        },
        1.05
      );

      tl.to(
        aboutIntro,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        1.9
      );

      tl.to(aboutSection, { autoAlpha: 1, duration: 0.2, ease: "none" }, 1.05);

      return () => tl.kill();
    }, pinWrap);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => {
        const t = st.vars.trigger as Element | undefined;
        if (t === pinWrap) st.kill();
      });
    };
  }, [showContent]);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* INTRO HI MASK */}
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

            <image href="/hero/bg.png" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" mask="url(#hiMask)" />

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

      {/* HERO + ABOUT MASK PINNED */}
      {showContent && (
        <>
          <div ref={pinWrapRef} className={styles.pinWrap}>
            {/* HERO */}
            <div ref={heroMainRef} className={styles.main} data-main="true" data-hero="true">
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
                  <img ref={skyRef} className={`${styles.sky} ${styles.skyScale}`} src="/hero/sky.png" alt="" />
                  <img ref={bgRef} className={`${styles.bg} ${styles.bgScale}`} src="/hero/bg.png" alt="" />

                  <div ref={heroTitleRef} className={styles.text} data-hero-title="true">
                    <h1 className={styles.textWeb}>Web</h1>
                    <h1 className={styles.textDev}>Developer</h1>
                  </div>

                  <img ref={alanRef} className={styles.alan} data-alan="true" src="/hero/alan1.png" alt="" />
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

            {/* ABOUT MASK OVERLAY (SVG MASK — stable) */}
            <div ref={aboutOverlayRef} className={styles.aboutOverlay}>
              <div ref={aboutOverlayMoveRef} className={styles.aboutOverlayMove}>
                {/* CUTOUT */}
                <div className={styles.cutLayer} data-cut-layer="true">
                  <svg className={styles.aboutSvg} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <mask id="aboutHoleMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="1000" height="600" fill="white" />
                        {/* about-mask.svg MUST be black text on transparent */}
                        <image
                          href="/svg/about-mask.svg"
                          x="0"
                          y="0"
                          width="1000"
                          height="600"
                          preserveAspectRatio="none"
                        />
                      </mask>
                    </defs>

                    <rect x="0" y="0" width="1000" height="600" fill="black" mask="url(#aboutHoleMask)" />
                  </svg>
                </div>

                {/* SOLID */}
                <div className={styles.solidLayer} data-solid-layer="true">
                  <svg className={styles.aboutSvg} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                    <image
                      href="/svg/about-solid.svg"
                      x="0"
                      y="0"
                      width="1000"
                      height="600"
                      preserveAspectRatio="none"
                    />
                  </svg>
                </div>
              </div>

              {/* ✅ Intro text that appears AFTER heading settles */}
              <div className={styles.aboutIntro} data-about-intro="true">
                <p>Mumbai-born. London-based.</p>
                <p>Frontend developer building bold, interactive web experiences.</p>
                <p>I focus on clean UI, smooth motion, and performance that feels invisible.</p>
                <p className={styles.aboutIntroTags}>React • Next.js • TypeScript • GSAP</p>
              </div>
            </div>
          </div>

          {/* REAL ABOUT SECTION */}
          <AboutSection ref={aboutSectionRef} />
        </>
      )}
    </div>
  );
}