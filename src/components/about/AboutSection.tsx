"use client";

import React, { forwardRef, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {};

const AboutSection = forwardRef<HTMLElement, Props>(function AboutSection(_props, ref) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const charRef = useRef<HTMLImageElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const bg = bgRef.current;
    const character = charRef.current;
    const copy = copyRef.current;

    if (!section || !scene || !bg || !character || !copy) return;

    const ctx = gsap.context(() => {
      gsap.set(bg, {
        y: -24,
        scale: 1.05,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      gsap.set(character, {
        y: 14,
        scale: 1.02,
        transformOrigin: "60% 70%",
        force3D: true,
      });

      gsap.set(copy, { autoAlpha: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 15%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(bg, { y: 24, scale: 1, ease: "none" }, 0)
        .to(character, { y: 0, scale: 1, ease: "none" }, 0)
        .to(copy, { autoAlpha: 1, y: 0, ease: "none" }, 0.12);

      return () => tl.kill();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={setRefs} className={styles.aboutSection}>
      <div ref={sceneRef} className={styles.scene}>
        <img ref={bgRef} className={styles.bgLayer} src="/about/about-bg.png" alt="" aria-hidden="true" draggable={false} />
        <img ref={charRef} className={styles.charLayer} src="/about/about-character.png" alt="" aria-hidden="true" draggable={false} />

        <div className={styles.bgOverlay} aria-hidden="true" />
        <div className={styles.bgBottomFade} aria-hidden="true" />
      </div>

      <div ref={copyRef} className={styles.copy}>
        <p className={styles.kicker}>ALAN PEREIRA</p>

        <p className={styles.subkicker}>"I am the developer you are looking for"</p>

        <p className={styles.body}>
          I’m a frontend / Web developer who builds modern web experiences that feel fast, smooth, and intuitive. I enjoy solving
          real UI problems, structuring scalable components, and optimizing performance so applications stay responsive as
          they grow.
        </p>

        <p className={styles.body}>
          From translating designs into production-ready code to fine-tuning animations, I care about how things work and
          how they feel — and that’s how I do my best work!
        </p>
      </div>
    </section>
  );
});

export default AboutSection;