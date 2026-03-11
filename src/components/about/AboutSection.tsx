"use client";

import React, { forwardRef, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {};

const AboutSection = forwardRef<HTMLElement, Props>(function AboutSection(_props, ref) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const topPanelRef = useRef<HTMLDivElement | null>(null);

  const sceneClipRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const charRef = useRef<HTMLImageElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  const postcardWrapRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
  };

 useLayoutEffect(() => {
  const section = sectionRef.current;
  const topPanel = topPanelRef.current;

  const sceneClip = sceneClipRef.current;
  const bg = bgRef.current;

  const character = charRef.current;
  const copy = copyRef.current;

  const postcardWrap = postcardWrapRef.current;
  const veil = veilRef.current;

  if (!section || !topPanel || !sceneClip || !bg || !character || !copy || !postcardWrap || !veil) return;

  const ctx = gsap.context(() => {
    // Initial states
    gsap.set(sceneClip, { ["--skewY" as any]: "60px" });
    gsap.set(bg, {
      y: -30,
      scale: 1.06,
      transformOrigin: "50% 50%",
      force3D: true,
      autoAlpha: 1,
    });
    gsap.set(character, {
      y: 40,
      scale: 1.02,
      transformOrigin: "60% 70%",
      force3D: true,
      autoAlpha: 1,
    });
    gsap.set(copy, { autoAlpha: 0, y: 40 });
    gsap.set(veil, { autoAlpha: 0 });

    // 1) Section enters -> skew straightens + content reveals
    const enterTl = gsap.timeline({
      scrollTrigger: {
        trigger: topPanel,
        start: "top 55%",
        end: "top top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    enterTl
      .to(sceneClip, { ["--skewY" as any]: "0px", ease: "none" }, 0)
      .to(bg, { y: 10, scale: 1, ease: "none" }, 0)
      .to(character, { y: 0, scale: 1, ease: "none" }, 0.14)
      .to(copy, { autoAlpha: 1, y: 0, ease: "none" }, 0.18);

    // 2) Mild continuous parallax while scrolling through panel
    gsap.to(bg, {
      y: 50,
      ease: "none",
      scrollTrigger: {
        trigger: topPanel,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.to(character, {
      y: -18,
      ease: "none",
      scrollTrigger: {
        trigger: topPanel,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // 3) Postcard veil appears as postcard comes in
    gsap.to(veil, {
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: {
        trigger: postcardWrap,
        start: "top 85%",
        end: "top 35%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }, section);

  requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => ctx.revert();
}, []);

  return (
    <section ref={setRefs} className={styles.aboutSection}>
      {/* TOP CINEMATIC PANEL */}
      <div ref={topPanelRef} className={styles.topPanel}>
        {/* clipper for bg/overlays only */}
        <div ref={sceneClipRef} className={styles.sceneClip}>
          <div ref={sceneRef} className={styles.scene}>
            <img ref={bgRef} className={styles.bgLayer} src="/about/about-bg.png" alt="" aria-hidden="true" draggable={false} />
            <div className={styles.bgOverlay} aria-hidden="true" />
            <div className={styles.bgBottomFade} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.aboutContent}>
          <div ref={copyRef} className={styles.copy}>
            <p className={styles.kicker}>
              ALAN <br /> PEREIRA
            </p>

            <p className={styles.subkicker}>"I am the developer you are looking for."</p>

            <p className={styles.body}>
              I’m a Front-End Engineer / Web Developer with over 3 years of experience building scalable,
              high-performance web applications using React and TypeScript. I hold a Master’s degree in
              Computer Science from Queen Mary University of London.
            </p>

            <p className={styles.body}>
              Over the years, I’ve worked on production applications where I’ve modernized legacy codebases,
              improved performance and test coverage, and collaborated closely with backend teams to deliver
              reliable, well-structured features that scale.
            </p>
          </div>

          <img ref={charRef} className={styles.charLayer} src="/about/about-character.png" alt="" aria-hidden="true" draggable={false} />
        </div>
      </div>

      {/* POSTCARD */}
      <div ref={postcardWrapRef} className={styles.postcardWrap}>
        <div ref={veilRef} className={styles.postcardVeil} aria-hidden="true" />

        <div className={styles.postcard}>
          <div className={styles.postcardMedia}>
            <div className={styles.photoCard}>
              {/* <img src="/about/postcard-photo.png" alt="Project / moment" draggable={false} /> */}
            </div>
          </div>

          <div className={styles.postcardText}>
            <p className={styles.subkicker}>React • Next.js • TypeScript • GSAP</p>

            <p className={styles.body}>
              I focus on building clean, modular UI architectures and writing type-safe, maintainable code.
              I focus strongly on performance optimization, efficient state management, and building frontend
              systems that scale.
            </p>

            <p className={styles.body}>
              With a solid understanding of fundamentals and software engineering principles, I aim to build
              systems that are robust, scalable, and built for long-term impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;