"use client";

import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import styles from "./GlobalPageTransition.module.css";

gsap.registerPlugin(DrawSVGPlugin);

export type GlobalPageTransitionHandle = {
  play: (options: {
    title: string;
    durationScale?: number;
    onMidpoint?: () => void;
    onComplete?: () => void;
  }) => void;
};

const GlobalPageTransition = forwardRef<GlobalPageTransitionHandle>(
  function GlobalPageTransition(_, ref) {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const pathRef = useRef<SVGPathElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useLayoutEffect(() => {
      const overlay = overlayRef.current;
      const path = pathRef.current;
      const title = titleRef.current;

      if (!overlay || !path || !title) return;

      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(path, {
        drawSVG: "0%",
        strokeWidth: 2,
      });
      gsap.set(title, {
        autoAlpha: 0,
        y: 32,
      });

      return () => {
        tlRef.current?.kill();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play: ({ title, durationScale = 1, onMidpoint, onComplete }) => {
        const overlay = overlayRef.current;
        const path = pathRef.current;
        const heading = titleRef.current;

        if (!overlay || !path || !heading) return;

        tlRef.current?.kill();

        heading.textContent = title;

        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });
        gsap.set(heading, {
          autoAlpha: 0,
          y: 32,
        });

        const tl = gsap.timeline({
          defaults: {
            ease: "power2.inOut",
          },
          onComplete,
        });

        tl.set(overlay, { autoAlpha: 1 })
          .to(
            path,
            {
              drawSVG: "100%",
              strokeWidth: 300,
              duration: 1.15 * durationScale,
            },
            0
          )
          .to(
            heading,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.34 * durationScale,
            },
            0.42 * durationScale
          )
          .add(() => {
            onMidpoint?.();
          }, 0.95 * durationScale)
          .to(
            heading,
            {
              autoAlpha: 0,
              y: -18,
              duration: 0.24 * durationScale,
            },
            1.1 * durationScale
          )
          .to(
            path,
            {
              drawSVG: "100% 100%",
              strokeWidth: 2,
              duration: 1.02 * durationScale,
            },
            0.92 * durationScale
          )
          .to(
            overlay,
            {
              autoAlpha: 0,
              duration: 0.36 * durationScale,
            },
            1.46 * durationScale
          )
          .set(path, {
            drawSVG: "0%",
            strokeWidth: 2,
          });

        tlRef.current = tl;
      },
    }));

    return (
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
          <h2 ref={titleRef} className={styles.title} />
        </div>
      </div>
    );
  }
);

export default GlobalPageTransition;