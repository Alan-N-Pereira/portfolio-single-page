"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import styles from "./PageTransition.module.css";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

type PageTransitionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

type TransitionPhase = "projects" | "forward" | "contact" | "reverse";

export default function PageTransition({
  title,
  children,
  className = "",
}: PageTransitionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const phaseRef = useRef<TransitionPhase>("projects");

  const menuNavigationUntilRef = useRef(0);
  const menuTargetRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const path = pathRef.current;
    const heading = titleRef.current;
    const content = contentRef.current;

    if (!section || !overlay || !path || !heading || !content) return;

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

      const isMenuNavigating = () => {
        return Date.now() < menuNavigationUntilRef.current;
      };

      const getSectionTop = () => {
        return Math.round(
          window.scrollY + section.getBoundingClientRect().top
        );
      };

      const getForwardOffset = () => {
        const height = window.innerHeight;
        const width = window.innerWidth;

        if (width <= 767) return Math.round(height * 0.24);
        if (width <= 1024) return Math.round(height * 0.18);

        return Math.round(height * 0.14);
      };

      const getForwardTriggerTop = () => {
        const contactTop = getSectionTop();

        return Math.max(
          0,
          contactTop - window.innerHeight - getForwardOffset()
        );
      };

      const jumpToContact = () => {
        const contactTop = getSectionTop();

        window.scrollTo({
          top: contactTop + 1,
          left: 0,
          behavior: "auto",
        });

        ScrollTrigger.update();
      };

      const jumpToProjectsEnd = () => {
        window.scrollTo({
          top: Math.max(0, getForwardTriggerTop() - 1),
          left: 0,
          behavior: "auto",
        });

        ScrollTrigger.update();
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
        .add(jumpToContact, 0.96)
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

      forwardTl.eventCallback("onComplete", () => {
        phaseRef.current = "contact";
        setEndState();
        ScrollTrigger.update();
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
        .add(jumpToProjectsEnd, 0.72)
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

      reverseTl.eventCallback("onComplete", () => {
        phaseRef.current = "projects";
        setStartState();
        ScrollTrigger.update();
      });

      const playForward = () => {
        if (phaseRef.current === "forward") return;
        if (phaseRef.current === "contact") return;

        phaseRef.current = "forward";

        heading.textContent = title;

        reverseTl.pause(0);
        forwardTl.restart();
      };

      const playReverse = () => {
        if (phaseRef.current !== "contact") return;

        if (isMenuNavigating() && menuTargetRef.current !== "contact") {
          phaseRef.current = "projects";

          forwardTl.pause(0);
          reverseTl.pause(0);

          setStartState();
          return;
        }

        phaseRef.current = "reverse";

        forwardTl.pause(0);
        reverseTl.restart();
      };

      const onContactRequest = () => {
        menuTargetRef.current = "contact";
        menuNavigationUntilRef.current = Date.now() + 2600;

        if (phaseRef.current === "contact") {
          jumpToContact();
          setEndState();
          return;
        }

        playForward();
      };

      const onMenuNavigation = (event: Event) => {
        const customEvent = event as CustomEvent<{ targetId?: string }>;
        const targetId = customEvent.detail?.targetId ?? null;

        menuTargetRef.current = targetId;
        menuNavigationUntilRef.current = Date.now() + 2200;

        if (targetId !== "contact") {
          phaseRef.current = "projects";

          forwardTl.pause(0);
          reverseTl.pause(0);

          setStartState();
        }
      };

      window.addEventListener("portfolio-contact-request", onContactRequest);
      window.addEventListener("portfolio-menu-navigation", onMenuNavigation);

      const sectionRect = section.getBoundingClientRect();
      const contactHasStarted = sectionRect.top <= 2 && sectionRect.bottom > 0;

      if (contactHasStarted) {
        phaseRef.current = "contact";
        setEndState();
      } else {
        phaseRef.current = "projects";
        setStartState();
      }

      const enterST = ScrollTrigger.create({
        trigger: section,
        start: () => `top bottom+=${getForwardOffset()}`,
        invalidateOnRefresh: true,

        onEnter: () => {
          if (phaseRef.current !== "projects") return;
          if (isMenuNavigating() && menuTargetRef.current === "contact") return;

          playForward();
        },
      });

      const reverseST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        invalidateOnRefresh: true,

        onLeaveBack: () => {
          if (phaseRef.current !== "contact") return;

          playReverse();
        },
      });

      return () => {
        window.removeEventListener(
          "portfolio-contact-request",
          onContactRequest
        );
        window.removeEventListener(
          "portfolio-menu-navigation",
          onMenuNavigation
        );

        enterST.kill();
        reverseST.kill();
        forwardTl.kill();
        reverseTl.kill();
      };
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
    };
  }, [title]);

  return (
    <div
      ref={sectionRef}
      className={`${styles.transitionSection} ${className}`.trim()}
    >
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