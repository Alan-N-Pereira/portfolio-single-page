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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const gateRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<TransitionPhase>("projects");

  const menuNavigationUntilRef = useRef(0);
  const menuTargetRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const gate = gateRef.current;
    const overlay = overlayRef.current;
    const path = pathRef.current;
    const heading = titleRef.current;
    const content = contentRef.current;

    if (!wrapper || !gate || !overlay || !path || !heading || !content) {
      return;
    }

    const ctx = gsap.context(() => {
      const setBaseState = () => {
        gsap.set(overlay, { autoAlpha: 0 });

        gsap.set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });

        gsap.set(heading, {
          autoAlpha: 0,
          y: 32,
        });

        /*
          Important:
          Contact content stays loaded.
          The transition overlay hides/reveals the page,
          but Contact itself is not being switched on/off.
        */
        gsap.set(content, {
          autoAlpha: 1,
          y: 0,
        });
      };

      const isMenuNavigating = () => {
        return Date.now() < menuNavigationUntilRef.current;
      };

      const getElementTop = (element: HTMLElement) => {
        return Math.round(
          window.scrollY + element.getBoundingClientRect().top
        );
      };

      const getGateTop = () => {
        return getElementTop(gate);
      };

      const getContactTop = () => {
        return getElementTop(content);
      };

    const getMaxScrollTop = () => {
      return Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const forceScrollTo = (top: number) => {
      const targetY = Math.round(
        Math.max(0, Math.min(top, getMaxScrollTop()))
      );

      window.dispatchEvent(
        new CustomEvent("portfolio-scroll-to", {
          detail: {
            top: targetY,
          },
        })
      );

      ScrollTrigger.update();
    };

    const moveIntoContactUnderCover = () => {
      /*
        Move from the black transition gate into Contact
        while the blue overlay is covering the screen.
      */
      forceScrollTo(getContactTop());
    };

    const moveBeforeGateUnderCover = () => {
      /*
        Reverse should finish just before the transition gate starts.

        Because the forward trigger will now be "top top",
        landing at gateTop - 2 means a tiny scroll down
        will trigger Contact again.
      */
      forceScrollTo(getGateTop() - 2);
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

        /*
          Move into Contact while the screen is covered.
        */
        .add(moveIntoContactUnderCover, 0.72)

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
        .set(path, {
          drawSVG: "0%",
          strokeWidth: 2,
        });

      forwardTl.eventCallback("onComplete", () => {
        phaseRef.current = "contact";
        setBaseState();
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
          path,
          {
            drawSVG: "0% 100%",
            strokeWidth: 300,
            duration: 0.9,
          },
          0.02
        )

        /*
          Move back before the invisible gate
          while the screen is covered.
        */
        .add(moveBeforeGateUnderCover, 0.32)

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
        setBaseState();
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

          setBaseState();
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
          setBaseState();
          moveIntoContactUnderCover();
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

          setBaseState();
        }
      };

      window.addEventListener("portfolio-contact-request", onContactRequest);
      window.addEventListener("portfolio-menu-navigation", onMenuNavigation);

      const contactRect = content.getBoundingClientRect();

      const contactIsVisible =
        contactRect.top <= 2 && contactRect.bottom > 0;

      if (contactIsVisible) {
        phaseRef.current = "contact";
      } else {
        phaseRef.current = "projects";
      }

      setBaseState();

      const enterST = ScrollTrigger.create({
        trigger: gate,

        /*
          Trigger when the black transition gate reaches the top.
          This stops the transition from firing too early
          while the last project card is still active.
        */
        start: "top top",

        invalidateOnRefresh: true,

        onEnter: () => {
          if (phaseRef.current !== "projects") return;
          if (isMenuNavigating() && menuTargetRef.current === "contact") return;

          playForward();
        },
      });

     const reverseST = ScrollTrigger.create({
      trigger: content,

      /*
        Because forward lands exactly at Contact,
        even a tiny scroll upward crosses this boundary.
      */
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
    }, wrapper);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, [title]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.transitionSection} ${className}`.trim()}
    >
      <div ref={gateRef} className={styles.transitionGate} aria-hidden="true" />

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