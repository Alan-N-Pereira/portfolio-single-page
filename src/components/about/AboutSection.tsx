"use client";

import React, { forwardRef, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {};

const AboutSection = forwardRef<HTMLElement, Props>(function AboutSection(_props, ref) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Scene refs
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const charRef = useRef<HTMLImageElement | null>(null);

  // Text refs
  const copyRef = useRef<HTMLDivElement | null>(null);

  // Merge forwarded ref + local ref
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
      // --- Start states (tilt + slight zoom like Rockstar) ---
      // gsap.set(scene, {
      //   transformOrigin: "50% 50%",
      //   rotate: -6,
      //   y: 80,
      //   scale: 1.06,
      //   force3D: true,
      // });

      // Depth feeling (bg moves less, character moves more)
      gsap.set(bg, {
        transformOrigin: "50% 50%",
        rotate: -5,
        scale: 1.07,
        y: 10,
        force3D: true,
      });

      // gsap.set(character, {
      //   transformOrigin: "60% 70%",
      //   scale: 1.08,
      //   y: 28,
      //   x: 14,
      //   force3D: true,
      // });

      gsap.set(copy, { autoAlpha: 0, y: 24 });

      // --- Scroll-tied leveling ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 15%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        scene,
        {
          rotate: 0,
          y: 0,
          scale: 1,
          ease: "none",
        },
        0
      )
        .to(
          bg,
          {
            rotate: 0,
            scale: 1,
            y: 0,
            ease: "none",
          },
          0
        )
        // .to(
        //   character,
        //   {
        //     scale: 1,
        //     y: 0,
        //     x: 0,
        //     ease: "none",
        //   },
        //   0
        // )
        .to(
          copy,
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
          },
          0.15
        );

      return () => {
        tl.kill();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={setRefs} className={styles.aboutSection}>
      {/* FULLSCREEN SCENE */}
      <div ref={sceneRef} className={styles.scene}>
        <img
          ref={bgRef}
          className={styles.bgLayer}
          src="/about/about-bg.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />

        <img
          ref={charRef}
          className={styles.charLayer}
          src="/about/about-character.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>

      {/* TEXT OVERLAY */}
      <div ref={copyRef} className={styles.copy}>
        <p className={styles.kicker}>
          Alan Pereira
        </p>

        <p className={styles.stack}>React • Next.js • TypeScript • GSAP</p>

        <p className={styles.body}>
          I’m a frontend developer who builds modern web experiences that feel fast, smooth, and intuitive. With a background in Computer Science and hands-on experience in React, JavaScript, and Next.js, I focus on creating interfaces that are not just functional — but thoughtfully engineered and visually refined.
          I enjoy solving real UI problems, structuring scalable components, and optimizing performance so applications stay responsive as they grow. From translating designs into production-ready code to fine-tuning interactions and animations, I care about how things work and how they feel.
          I believe great frontend development sits at the intersection of logic, design, and user behavior — and that’s where I do my best work.
        </p>
      </div>
    </section>
  );
});

export default AboutSection;