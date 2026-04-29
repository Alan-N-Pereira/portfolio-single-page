"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./ProjectsTransition.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectsTransition() {
  const trackRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const introTitleRef = useRef<HTMLHeadingElement | null>(null);
  const mainTitleRef = useRef<HTMLHeadingElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    const introTitle = introTitleRef.current;
    const mainTitle = mainTitleRef.current;
    const line = lineRef.current;

    if (!track || !panel || !introTitle || !mainTitle || !line) return;

    const ctx = gsap.context(() => {
      gsap.set(panel, {
        yPercent: 4,
      });

      gsap.set(introTitle, {
        autoAlpha: 0,
        y: 28,
      });

      gsap.set(mainTitle, {
        autoAlpha: 0,
        y: 28,
      });

      gsap.set(line, {
        scaleX: 0,
        transformOrigin: "left center",
        autoAlpha: 0.7,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to({}, { duration: 0.22 });

      tl.to(
        panel,
        {
          yPercent: 0,
          ease: "none",
          duration: 0.32,
        },
        ">"
      );

      tl.to(
        introTitle,
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          duration: 0.18,
        },
        0.24
      );

      tl.to({}, { duration: 0.16 });

      tl.to(
        introTitle,
        {
          autoAlpha: 0,
          y: -18,
          ease: "none",
          duration: 0.14,
        },
        ">"
      );

      tl.to(
        mainTitle,
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          duration: 0.2,
        },
        ">"
      );

      tl.to(
        line,
        {
          scaleX: 1,
          autoAlpha: 1,
          ease: "none",
          duration: 0.16,
        },
        ">-0.04"
      );
    }, track);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section ref={trackRef} className={styles.transitionTrack}>
      <section className={styles.transitionSection}>
        <div ref={panelRef} className={styles.panel}>
          <div className={styles.text}>
            <div className={styles.titleStage}>
              <h2 ref={introTitleRef} className={styles.introTitle}>
                <span className={styles.introTitleText}>"From Ideas to Interface"</span>
              </h2>

              <h2 ref={mainTitleRef} className={styles.mainTitle}>
                Projects
              </h2>
            </div>

            <div ref={lineRef} className={styles.line} />
          </div>
        </div>
      </section>
    </section>
  );
}