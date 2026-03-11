"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./ProjectsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

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

    const cardYOffset = 5;
    const cardScaleStep = 0.075;

    const introHold = 0.5;
    const stepDuration = 1;
    const outroHold = 0.36;

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
        yPercent: -220,
        rotationX: 45,
        scale: 1,
        ease: "none",
        duration: 1,
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
          duration: 1,
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

  // premium hover on visible card
  cards.forEach((card) => {
  const inner = card.querySelector<HTMLElement>(`.${styles.cardInner}`);
  if (!inner) return;

  const cols = inner.querySelectorAll<HTMLElement>(`.${styles.col}`);
  const textCol = cols[0] ?? null;
  const media = inner.querySelector<HTMLElement>(`.${styles.mediaGradient}`);

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

  const mediaXTo =
    media &&
    gsap.quickTo(media, "x", {
      duration: 0.32,
      ease: "power3.out",
    });

  const mediaYTo =
    media &&
    gsap.quickTo(media, "y", {
      duration: 0.32,
      ease: "power3.out",
    });

  const mediaScaleTo =
    media &&
    gsap.quickTo(media, "scale", {
      duration: 0.32,
      ease: "power3.out",
    });

  const textXTo =
    textCol &&
    gsap.quickTo(textCol, "x", {
      duration: 0.32,
      ease: "power3.out",
    });

  const onMove = (e: MouseEvent) => {
    if (!card.classList.contains(styles.isFront)) return;

    const rect = inner.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const rx = gsap.utils.mapRange(0, rect.height, 5, -5, py);
    const ry = gsap.utils.mapRange(0, rect.width, -7, 7, px);

    rotateXTo(rx);
    rotateYTo(ry);
    yTo(-6);
    scaleTo(1.01);

    inner.style.setProperty("--mx", `${px}px`);
    inner.style.setProperty("--my", `${py}px`);

    const mediaOffsetX = gsap.utils.mapRange(0, rect.width, -6, 6, px);
    const mediaOffsetY = gsap.utils.mapRange(0, rect.height, -5, 5, py);
    const textOffsetX = gsap.utils.mapRange(0, rect.width, 4, -4, px);

    mediaXTo && mediaXTo(mediaOffsetX);
    mediaYTo && mediaYTo(mediaOffsetY);
    mediaScaleTo && mediaScaleTo(1.02);
    textXTo && textXTo(textOffsetX);
  };

  const onEnter = () => {
    if (!card.classList.contains(styles.isFront)) return;

    yTo(-6);
    scaleTo(1.01);

    gsap.to(inner, {
      boxShadow: "0 22px 50px rgba(0,0,0,0.22)",
      duration: 0.28,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    rotateXTo(0);
    rotateYTo(0);
    yTo(0);
    scaleTo(1);

    mediaXTo && mediaXTo(0);
    mediaYTo && mediaYTo(0);
    mediaScaleTo && mediaScaleTo(1);
    textXTo && textXTo(0);

    inner.style.removeProperty("--mx");
    inner.style.removeProperty("--my");

    gsap.to(inner, {
      boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
      duration: 0.32,
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
          <div className={styles.titleContainer}>
            <div className={styles.title}>
              <h1>Projects</h1>
            </div>
          </div>

          <div ref={cardsRef} className={styles.cardsWrap}>
           <div className={`${styles.card} ${styles.card1}`} id="card-1">
            <div className={styles.cardInner}>
              <div className={styles.col}>
                <p>Quiet Control</p>
                <h1>Signal Drift</h1>
              </div>
              <div className={styles.col}>
                <div className={styles.mediaGradient} />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.card2}`} id="card-2">
            <div className={styles.cardInner}>
              <div className={styles.col}>
                <p>Quiet Control</p>
                <h1>Signal Drift</h1>
              </div>
              <div className={styles.col}>
                <div className={styles.mediaGradient} />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.card3}`} id="card-3">
            <div className={styles.cardInner}>
              <div className={styles.col}>
                <p>Quiet Control</p>
                <h1>Signal Drift</h1>
              </div>
              <div className={styles.col}>
                <div className={styles.mediaGradient} />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.card4}`} id="card-4">
            <div className={styles.cardInner}>
              <div className={styles.col}>
                <p>Quiet Control</p>
                <h1>Signal Drift</h1>
              </div>
              <div className={styles.col}>
                <div className={styles.mediaGradient} />
              </div>
            </div>
          </div>
          </div>
        </section>
      </section>
    </section>
  );
}