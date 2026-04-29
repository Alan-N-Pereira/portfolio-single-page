"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./ProjectsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: "card-1",
    className: "card1",
    eyebrow: "Featured Project",
    title: "Signal Drift",
    subtitle: "Motion-led storytelling for a cinematic digital experience.",
    button: "View Project",
    index: "01",
  },
  {
    id: "card-2",
    className: "card2",
    eyebrow: "Creative Build",
    title: "Quiet Control",
    subtitle: "A premium interaction system built around clarity and pace.",
    button: "Open Case Study",
    index: "02",
  },
  {
    id: "card-3",
    className: "card3",
    eyebrow: "Case Study",
    title: "Midnight Atlas",
    subtitle: "Editorial layouts, bold hierarchy, and immersive scroll.",
    button: "See Details",
    index: "03",
  },
  {
    id: "card-4",
    className: "card4",
    eyebrow: "Experimental",
    title: "Static Echo",
    subtitle: "Poster-inspired composition with strong framing and mood.",
    button: "Explore Project",
    index: "04",
  },
];

export default function ProjectsSection() {
  const trackRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const cardsWrap = cardsRef.current;
    if (!track || !cardsWrap) return;

    const cards = Array.from(
      cardsWrap.querySelectorAll<HTMLElement>(`.${styles.card}`)
    );

    if (!cards.length) return;

    const totalCards = cards.length;
    const totalSteps = totalCards - 1;

    const cardYOffset = 4.5;
    const cardScaleStep = 0.06;

    const introHold = 0.34;
    const stepDuration = 1;
    const outroHold = 0.24;

    const ctx = gsap.context(() => {
      const hoverCleanups: Array<() => void> = [];

      cards.forEach((card, i) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50 + i * cardYOffset,
          scale: 1 - i * cardScaleStep,
          rotationX: 0,
          transformOrigin: "center bottom",
          force3D: true,
        });
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

      tl.to({}, { duration: introHold });

      for (let active = 0; active < totalSteps; active++) {
        tl.to(
          cards[active],
          {
            yPercent: -205,
            rotationX: 34,
            scale: 1,
            ease: "none",
            duration: stepDuration,
          },
          ">"
        );

        for (let i = active + 1; i < totalCards; i++) {
          const newStackIndex = i - active - 1;

          tl.to(
            cards[i],
            {
              yPercent: -50 + newStackIndex * cardYOffset,
              scale: 1 - newStackIndex * cardScaleStep,
              rotationX: 0,
              ease: "none",
              duration: stepDuration,
            },
            "<"
          );
        }
      }

      tl.to({}, { duration: outroHold });

      const updateFrontCard = () => {
        const t = tl.time();

        let frontIndex = 0;

        if (t <= introHold) {
          frontIndex = 0;
        } else if (t >= introHold + totalSteps * stepDuration) {
          frontIndex = totalCards - 1;
        } else {
          frontIndex = Math.min(
            Math.floor((t - introHold) / stepDuration),
            totalCards - 1
          );
        }

        cards.forEach((card, i) => {
          card.classList.toggle(styles.isFront, i === frontIndex);
        });
      };

      updateFrontCard();
      tl.eventCallback("onUpdate", updateFrontCard);

      cards.forEach((card) => {
        const inner = card.querySelector<HTMLElement>(`.${styles.cardInner}`);
        const frame = card.querySelector<HTMLElement>(`.${styles.frame}`);
        const artwork = card.querySelector<HTMLElement>(`.${styles.artwork}`);
        const content = card.querySelector<HTMLElement>(`.${styles.content}`);

        if (!inner || !frame) return;

        const rotateXTo = gsap.quickTo(inner, "rotationX", {
          duration: 0.32,
          ease: "power3.out",
        });

        const rotateYTo = gsap.quickTo(inner, "rotationY", {
          duration: 0.32,
          ease: "power3.out",
        });

        const yTo = gsap.quickTo(inner, "y", {
          duration: 0.32,
          ease: "power3.out",
        });

        const scaleTo = gsap.quickTo(inner, "scale", {
          duration: 0.32,
          ease: "power3.out",
        });

        const artworkXTo =
          artwork &&
          gsap.quickTo(artwork, "x", {
            duration: 0.32,
            ease: "power3.out",
          });

        const artworkYTo =
          artwork &&
          gsap.quickTo(artwork, "y", {
            duration: 0.32,
            ease: "power3.out",
          });

        const contentXTo =
          content &&
          gsap.quickTo(content, "x", {
            duration: 0.32,
            ease: "power3.out",
          });

        const onMove = (e: MouseEvent) => {
          if (!card.classList.contains(styles.isFront)) return;

          const rect = inner.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;

          const rx = gsap.utils.mapRange(0, rect.height, 4, -4, py);
          const ry = gsap.utils.mapRange(0, rect.width, -6, 6, px);

          rotateXTo(rx);
          rotateYTo(ry);
          yTo(-4);
          scaleTo(1.008);

          inner.style.setProperty("--mx", `${px}px`);
          inner.style.setProperty("--my", `${py}px`);

          const artworkOffsetX = gsap.utils.mapRange(0, rect.width, -8, 8, px);
          const artworkOffsetY = gsap.utils.mapRange(0, rect.height, -6, 6, py);
          const contentOffsetX = gsap.utils.mapRange(0, rect.width, 5, -5, px);

          artworkXTo && artworkXTo(artworkOffsetX);
          artworkYTo && artworkYTo(artworkOffsetY);
          contentXTo && contentXTo(contentOffsetX);
        };

        const onEnter = () => {
          if (!card.classList.contains(styles.isFront)) return;

          yTo(-4);
          scaleTo(1.008);

          gsap.to(frame, {
            boxShadow:
              "0 24px 52px rgba(0, 0, 0, 0.24), 0 2px 0 rgba(255, 255, 255, 0.35) inset",
            duration: 0.28,
            ease: "power3.out",
          });
        };

        const onLeave = () => {
          rotateXTo(0);
          rotateYTo(0);
          yTo(0);
          scaleTo(1);

          artworkXTo && artworkXTo(0);
          artworkYTo && artworkYTo(0);
          contentXTo && contentXTo(0);

          inner.style.removeProperty("--mx");
          inner.style.removeProperty("--my");

          gsap.to(frame, {
            boxShadow:
              "0 18px 40px rgba(0, 0, 0, 0.22), 0 2px 0 rgba(255, 255, 255, 0.35) inset",
            duration: 0.3,
            ease: "power3.out",
          });
        };

        inner.addEventListener("mouseenter", onEnter);
        inner.addEventListener("mousemove", onMove);
        inner.addEventListener("mouseleave", onLeave);

        hoverCleanups.push(() => {
          inner.removeEventListener("mouseenter", onEnter);
          inner.removeEventListener("mousemove", onMove);
          inner.removeEventListener("mouseleave", onLeave);
        });
      });

      return () => {
        hoverCleanups.forEach((cleanup) => cleanup());
      };
    }, track);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.projectsShell}>
      <section ref={trackRef} className={styles.projectsTrack}>
        <section className={styles.stickyCards}>
          <div ref={cardsRef} className={styles.cardsWrap}>
            {projects.map((project) => (
              <div
                key={project.id}
                className={`${styles.card} ${styles[project.className]}`}
                id={project.id}
              >
                <div className={styles.cardInner}>
                  <div className={styles.frame}>
                    <div className={styles.artwork}>
                      <div className={styles.artworkSky} />
                      <div className={styles.artworkGlow} />
                      <div className={styles.artworkGrain} />

                      <div className={styles.logoBlock}>
                        <p className={styles.eyebrow}>{project.eyebrow}</p>
                        <h2>{project.title}</h2>
                      </div>

                      <div className={styles.indexBadge}>{project.index}</div>

                      <div className={styles.content}>
                        <p className={styles.subtitle}>{project.subtitle}</p>
                        <button className={styles.cta} type="button">
                          {project.button}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </section>
  );
}