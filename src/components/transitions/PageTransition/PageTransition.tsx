"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import styles from "./PageTransition.module.css";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

type PageTransitionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  triggerOffset?: string;
  boundaryTriggerOffset?: string;
};

export default function PageTransition({
  title,
  children,
  className = "",
  triggerOffset = "42vh",
  boundaryTriggerOffset = "12vh",
}: PageTransitionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const enterTriggerRef = useRef<HTMLDivElement | null>(null);
  const boundaryTriggerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const transitionsLockedRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const onLockChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ locked?: boolean }>;
      transitionsLockedRef.current = !!customEvent.detail?.locked;
    };

    window.addEventListener(
      "section-transition-lock",
      onLockChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "section-transition-lock",
        onLockChange as EventListener
      );
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const enterTrigger = enterTriggerRef.current;
    const boundaryTrigger = boundaryTriggerRef.current;
    const overlay = overlayRef.current;
    const path = pathRef.current;
    const heading = titleRef.current;
    const content = contentRef.current;

    if (
      !section ||
      !enterTrigger ||
      !boundaryTrigger ||
      !overlay ||
      !path ||
      !heading ||
      !content
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const setStartState = () => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });
        gsap.set(heading, {
          autoAlpha: 0,
          y: 32,
        });
        gsap.set(content, {
          autoAlpha: 0,
          y: 40,
        });
      };

      const setEndState = () => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });
        gsap.set(heading, {
          autoAlpha: 0,
          y: 32,
        });
        gsap.set(content, {
          autoAlpha: 1,
          y: 0,
        });
      };

      const forwardTl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
      });

      forwardTl
        .set(overlay, { autoAlpha: 1 })
        .to(
          path,
          {
            drawSVG: "100%",
            strokeWidth: 300,
            duration: 1.2,
          },
          0
        )
        .to(
          heading,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.34,
          },
          0.42
        )
        .to(
          heading,
          {
            autoAlpha: 0,
            y: -18,
            duration: 0.24,
          },
          1.14
        )
        .to(
          path,
          {
            drawSVG: "100% 100%",
            strokeWidth: 2,
            duration: 1.05,
          },
          0.96
        )
        .to(
          overlay,
          {
            autoAlpha: 0,
            duration: 0.36,
          },
          1.5
        )
        .to(
          content,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
          },
          1.4
        )
        .set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });

      const reverseTl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
      });

      reverseTl
        .set(overlay, { autoAlpha: 1 })
        .set(heading, { autoAlpha: 0, y: 0 })
        .set(path, {
          drawSVG: "100% 100%",
          strokeWidth: 2,
        })
        .to(
          content,
          {
            autoAlpha: 0,
            y: 28,
            duration: 0.26,
            ease: "power2.out",
          },
          0
        )
        .to(
          path,
          {
            drawSVG: "0% 100%",
            strokeWidth: 300,
            duration: 0.9,
          },
          0.02
        )
        .to(
          overlay,
          {
            autoAlpha: 0,
            duration: 0.32,
          },
          0.82
        )
        .set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });

      const playForward = () => {
        if (transitionsLockedRef.current) {
          hasEnteredRef.current = true;
          isVisibleRef.current = true;
          setEndState();
          return;
        }

        heading.textContent = title;
        reverseTl.pause(0);
        forwardTl.restart();

        hasEnteredRef.current = true;
        isVisibleRef.current = true;
      };

      const playReverse = () => {
        if (transitionsLockedRef.current) {
          isVisibleRef.current = false;
          setStartState();
          return;
        }

        forwardTl.pause(0);
        reverseTl.restart();

        isVisibleRef.current = false;
      };

      const sectionRect = section.getBoundingClientRect();
      const sectionVisibleOnLoad =
        sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

      if (sectionVisibleOnLoad) {
        hasEnteredRef.current = true;
        isVisibleRef.current = true;
        setEndState();
      } else {
        hasEnteredRef.current = false;
        isVisibleRef.current = false;
        setStartState();
      }

      const enterST = ScrollTrigger.create({
        trigger: enterTrigger,
        start: "top bottom",
        onEnter: () => {
          if (hasEnteredRef.current) return;
          playForward();
        },
      });

      const boundaryST = ScrollTrigger.create({
        trigger: boundaryTrigger,
        start: "top top",
        onLeaveBack: () => {
          if (!hasEnteredRef.current) return;
          if (!isVisibleRef.current) return;
          playReverse();
        },
        onEnter: () => {
          if (!hasEnteredRef.current) return;
          if (isVisibleRef.current) return;
          playForward();
        },
      });

      return () => {
        enterST.kill();
        boundaryST.kill();
        forwardTl.kill();
        reverseTl.kill();
      };
    }, section);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [title, triggerOffset, boundaryTriggerOffset]);

  return (
    <div
      ref={sectionRef}
      className={`${styles.transitionSection} ${className}`.trim()}
    >
      <div
        ref={enterTriggerRef}
        className={styles.trigger}
        style={{ top: triggerOffset }}
        aria-hidden="true"
      />

      <div
        ref={boundaryTriggerRef}
        className={styles.trigger}
        style={{ top: boundaryTriggerOffset }}
        aria-hidden="true"
      />

      <div ref={overlayRef} className={styles.transitionOverlay}>
        <svg
          className={styles.transitionSvg}
          viewBox="0 0 1316 664"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d="M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213"
            stroke="#82A0FF"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className={styles.titleWrap}>
          <h2 ref={titleRef} className={styles.title}>
            {title}
          </h2>
        </div>
      </div>

      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  );
}