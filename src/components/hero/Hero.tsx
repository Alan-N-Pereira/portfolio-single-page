"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

type HeroProps = {
  aboutSectionRef: RefObject<HTMLElement| null>;
  onIntroComplete?: () => void;
};

type BubbleItem = {
  text: string;
  actionLabel?: string;
  actionTarget?: string;
};

export default function Hero({ aboutSectionRef, onIntroComplete }: HeroProps) {
  const [showContent, setShowContent] = useState(false);
  const [aboutSettled, setAboutSettled] = useState(false); // ✅ handoff: fixed -> in-flow
  const [showAboutBody, setShowAboutBody] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);

  const [showBubble, setShowBubble] = useState(false);
  const [typedBubbleText, setTypedBubbleText] = useState("");

  const heroBubbleWrapRef = useRef<HTMLDivElement | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinWrapRef = useRef<HTMLDivElement | null>(null);

  // A real section in the page flow that will hold the title+intro after pin ends
  const aboutFlowWrapRef = useRef<HTMLElement | null>(null);

  // Hero refs
  const heroMainRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const alanRef = useRef<HTMLImageElement | null>(null);

  // About overlay refs
  const aboutOverlayRef = useRef<HTMLDivElement | null>(null);
  const aboutOverlayMoveRef = useRef<HTMLDivElement | null>(null);
  const aboutIntroRef = useRef<HTMLDivElement | null>(null);

  const aboutBodyRef = useRef<HTMLDivElement | null>(null);

  const bubbleItems = useMemo<BubbleItem[]>(
  () => [
    {
      text: "Hi, I am Alan — Web Developer / Front-End Developer.",
    },
    {
      text: "Open to work. Check out my projects.",
      actionLabel: "View Projects",
      actionTarget: "projects",
    },
    {
      text: "Want to work together? Let’s get in touch.",
      actionLabel: "Contact Me",
      actionTarget: "contact",
    },
  ],
  []
);

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

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
        onComplete: () => {
          setShowContent(true);
          onIntroComplete?.();
        },
      },
      "-=1.8"
    );

    return () => {tl.kill()};
  }, []);

  // ---- 2) Hero reveal + parallax ----
  useEffect(() => {
    if (!showContent) return;

    const main = heroMainRef.current;
    const sky = skyRef.current;
    const bg = bgRef.current;
    const alan = alanRef.current;
    const title = heroTitleRef.current;
    const bubble = heroBubbleWrapRef.current;

    if (!main || !sky || !bg || !alan || !title || !bubble) return;

    gsap.set(main, { scale: 2, rotate: -10, transformOrigin: "50% 50%" });
    gsap.set(sky, { scale: 2, rotate: -20, transformOrigin: "50% 50%" });
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

    gsap.set(bubble, { autoAlpha: 0, y: 40 });
    setShowBubble(false);

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
      .to(title, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, "-=0.2")
      .to(
        bubble,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "back.out(1.4)",
          onStart: () => setShowBubble(true),
        },
        ">-0.1"
      );

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
      gsap.killTweensOf([main, sky, bg, alan, title, bubble]);
    };
  }, [showContent]);

  useEffect(() => {
    if (!showBubble) return;

    const currentText = bubbleItems[bubbleIndex].text;
    let charIndex = 0;

    setTypedBubbleText("");

    const typingInterval = window.setInterval(() => {
      charIndex += 1;
      setTypedBubbleText(currentText.slice(0, charIndex));

      if (charIndex >= currentText.length) {
        window.clearInterval(typingInterval);

        const nextTimeout = window.setTimeout(() => {
          setBubbleIndex((prev) => (prev + 1) % bubbleItems.length);
        }, 2600);

        return () => window.clearTimeout(nextTimeout);
      }
    }, 42);

    return () => {
      window.clearInterval(typingInterval);
    };
  }, [showBubble, bubbleIndex, bubbleItems]);

  // ---- 3) Mask transition (shrink + settle) then handoff to in-flow ----
  useLayoutEffect(() => {
    if (!showContent) return;

    const pinWrap = pinWrapRef.current;
    const heroMain = heroMainRef.current;
    const heroTitle = heroTitleRef.current;

    const overlay = aboutOverlayRef.current;
    const overlayMove = aboutOverlayMoveRef.current;
    const aboutIntro = aboutIntroRef.current;
    const aboutBody = aboutBodyRef.current

    if (!pinWrap || !heroMain || !heroTitle || !overlay || !overlayMove ||  !aboutIntro || !aboutBody) return;

    // ✅ FIX: these are NOT inside pinWrap anymore
    const cutLayer = overlay.querySelector<HTMLElement>("[data-cut-layer='true']");
    const solidLayer = overlay.querySelector<HTMLElement>("[data-solid-layer='true']");
    if (!cutLayer || !solidLayer) return;

    setAboutSettled(false);

    setShowAboutBody(false);

    gsap.set(overlay, { autoAlpha: 0 });

    gsap.set(overlayMove, {
      x: 0,
      y: 0,
      scale: 6,
      transformOrigin: "50% 50%",
      force3D: true,
    });

    gsap.set(cutLayer, { autoAlpha: 1 });
    gsap.set(solidLayer, { autoAlpha: 0 });

    gsap.set(aboutIntro, { autoAlpha: 0, y: 20 });

    // gsap.set(aboutBodyRef.current, {
    //   opacity: 0
    // });

    const ctx = gsap.context(() => {
      const endDistance = window.innerHeight * 0.49;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrap,
          start: "top top",
          end: () => `+=${endDistance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(overlay, { autoAlpha: 1, duration: 0.01 }, 0);

      tl.to(heroMain, { scale: 0.97, duration: 0.6, ease: "power2.out" }, 0);
      tl.to(heroTitle, { autoAlpha: 0, y: -40, duration: 0.7, ease: "power2.out" }, 0);
      tl.to(heroMain, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.35);

      tl.to(overlayMove, { scale: 0.62, duration: 1.2, ease: "expo.inOut" }, 0);

      tl.to(cutLayer, { autoAlpha: 0, duration: 0.12, ease: "none" }, 0.55);
      tl.to(solidLayer, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0.55);

      tl.to(
        overlayMove,
        {
          scale: 0.22,
          y: -window.innerHeight * 0.28,
          duration: 1.2,
          ease: "expo.inOut",
        },
        1.0
      );

      tl.to(aboutIntro, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.40);

      tl.to({}, { duration: 0.3 });

      // ✅ 2) Fade OUT title + intro together
      tl.to([overlayMove, aboutIntro], {
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      // ScrollTrigger.create({
      //   trigger: aboutFlowWrapRef.current,
      //   start: "top 70%",
      //   once: true,   
      //   onEnter: () => {
      //     gsap.to(aboutBody, {
      //       autoAlpha: 1,
      //       y: 0,
      //       duration: 0.8,
      //       ease: "power2.out"
      //     });
      //   },
        // onLeaveBack: () => {
        //   gsap.set(aboutBody, {
        //     autoAlpha: 0,
        //     y: 30
        //   });
        // }
      // });

      // ✅ 3) Fade IN aboutBody after they disappear
      // tl.to(aboutBody, {
      //   autoAlpha: 1,
      //   y: 0,
      //   duration: 0.6,
      //   ease: "power2.out",
      // }, ">-0.25");

      const st = tl.scrollTrigger!;

      const handoffST = ScrollTrigger.create({
        trigger: pinWrap,
        start: "top top",
        end: () => `+=${endDistance}`,

        onUpdate: (self) => {
          const p = self.progress;

          // body appears first, while still centered
          setShowAboutBody(p > 0.62);

          // overlay collapses slightly later, so body joins page flow
          setAboutSettled(p > 0.66);
        },

        // onLeave: () => {
        //   // lock to final frame
        //   tl.progress(1);

        //   // switch to in-flow
        //   setAboutSettled(true);
        //   setShowAboutBody(true);

        //   requestAnimationFrame(() => {
       

        //     gsap.set(overlay, { autoAlpha: 1 });
        //     gsap.set(overlayMove, { autoAlpha: 0 });
        //     gsap.set(aboutIntro, { autoAlpha: 0, y: 0 });

        //     // ✅ IMPORTANT: disable the pinhole ScrollTrigger while in-flow
        //     st.disable();
            
        //     ScrollTrigger.refresh();
        //   });
        // },

        // onEnterBack: () => {
        //   // ✅ switch back to fixed mode
        //   setAboutSettled(false);
        //   setShowAboutBody(false);

        //   gsap.set(aboutIntro, {
        //     autoAlpha: 0,
        //     y: 20,
        //   });

        //   gsap.set(overlayMove, {
        //     autoAlpha: 1,
        //     clearProps: "transform,x,y",
        //   });

        //   requestAnimationFrame(() => {

        //     // ✅ IMPORTANT: re-enable pinhole ScrollTrigger so it replays
        //     st.enable();

        //     ScrollTrigger.refresh();
        //   });
        // },
      });
      return () => {
        handoffST.kill();
        st.kill();
        tl.kill();
      };
    }, rootRef); // ✅ FIX: scope includes overlay now

    ScrollTrigger.refresh();
    return () => ctx.revert();
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

      {showContent && (
        <>
          {/* HERO pinned block */}
          <div ref={pinWrapRef} className={styles.pinWrap}>
            <div ref={heroMainRef} className={styles.main} data-main="true" data-hero="true">
              <div className={styles.landing}>
                <div className={styles.navbar}>
                  <div className={styles.logo}>
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
                  {showContent && (
                    <div ref={heroBubbleWrapRef} className={styles.heroBubbleWrap}>
                      <div className={styles.heroBubble}>
                        <p className={styles.heroBubbleText}>
                          {typedBubbleText}
                          <span className={styles.heroBubbleCursor}>|</span>
                        </p>

                        {typedBubbleText === bubbleItems[bubbleIndex].text &&
                          bubbleItems[bubbleIndex].actionLabel &&
                          bubbleItems[bubbleIndex].actionTarget && (
                            <button
                              type="button"
                              className={styles.heroBubbleButton}
                              onClick={() => scrollToSection(bubbleItems[bubbleIndex].actionTarget!)}
                            >
                              {bubbleItems[bubbleIndex].actionLabel}
                            </button>
                          )}
                      </div>
                    </div>
                  )}
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
          </div>

          {/* ✅ In-page flow wrapper (this is where the title+intro live after pin ends) */}
          <section ref={aboutFlowWrapRef} className={styles.aboutFlowWrap}>
            <div
              ref={aboutOverlayRef}
              className={`${styles.aboutOverlay} ${aboutSettled ? `${styles.aboutOverlayInFlow} ${styles.aboutOverlayCollapsed}` : ""}`}
            >
              <div ref={aboutOverlayMoveRef} className={styles.aboutOverlayMove}>
                <div className={styles.cutLayer} data-cut-layer="true">
                  <svg className={styles.aboutSvg} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <mask id="aboutHoleMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="1000" height="600" fill="white" />
                        <image href="/svg/about-mask.svg" x="0" y="0" width="1000" height="600" preserveAspectRatio="none" />
                      </mask>
                    </defs>
                    <rect x="0" y="0" width="1000" height="600" fill="black" mask="url(#aboutHoleMask)" />
                  </svg>
                </div>

                <div className={styles.solidLayer} data-solid-layer="true">
                  <svg className={styles.aboutSvg} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                    <image href="/svg/about-solid.svg" x="0" y="0" width="1000" height="600" preserveAspectRatio="none" />
                  </svg>
                </div>
              </div>

              <div ref={aboutIntroRef} className={styles.aboutIntro}>
                <p>Mumbai-born. London-based.</p>
                <p>Frontend developer building bold, interactive web experiences.</p>
                <p>I focus on clean UI, smooth motion, and performance that feels invisible.</p>
                <p className={styles.aboutIntroTags}>
                  React • NextJS • TypeScript • UI Architecture • Performance Optimization
                </p>
              </div>
            </div>

            <div ref={aboutBodyRef} className={`${styles.aboutBody} ${showAboutBody ? styles.aboutBodyVisible : ""} `}>
              <p>
                I design and build immersive web experiences with React, TypeScript and
                modern animation systems.
              </p>

              <p>
                My focus is creating interfaces that feel alive and thoughtful, with layout systems designed to keep performance hidden.
              </p>

              <p>
                I enjoy turning complex ideas into elegant UI systems that scale.
              </p>

              <p className={styles.callToAction}>
                Scroll Down to know more About Me.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}