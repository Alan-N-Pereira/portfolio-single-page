"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./AboutMaskTransition.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function AboutMaskTransition() {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Elements we animate
    const overlay = wrap.querySelector<HTMLElement>(`[data-overlay="true"]`);
    const maskGroup = wrap.querySelector<SVGGElement>(`[data-mask-group="true"]`);
    const whiteText = wrap.querySelector<SVGGElement>(`[data-white-text="true"]`);

    const hero = document.querySelector<HTMLElement>(`[data-hero="true"]`);
    const heroTitle = document.querySelector<HTMLElement>(`[data-hero-title="true"]`);
    const aboutSection = document.querySelector<HTMLElement>(`[data-about-section="true"]`);

    if (!overlay || !maskGroup || !whiteText || !hero || !heroTitle || !aboutSection) return;

    // About section hidden until transition ends
    gsap.set(aboutSection, { autoAlpha: 0 });

    // Overlay hidden until scroll starts
    gsap.set(overlay, { autoAlpha: 0 });

    // Start state: BIG cutout (mask text huge), white fill invisible
    gsap.set(maskGroup, {
      transformOrigin: "50% 50%",
      scale: 1,
      x: 0,
      y: 0,
    });
    gsap.set(whiteText, { opacity: 0 });

    // This timeline is the GTA-style pinned scroll beat
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "bottom bottom",
        end: "+=2200",
        scrub: 1.25,
        pin: true,
        anticipatePin: 1,
      },
    });

    // show overlay
    tl.to(overlay, { autoAlpha: 1, duration: 0.01 }, 0);

    // hero scales down slightly
    tl.to(
      hero,
      { scale: 0.92, transformOrigin: "50% 50%", ease: "power2.out", duration: 0.8 },
      0
    );

    // hero "Web Developer" disappears
    tl.to(
      heroTitle,
      { autoAlpha: 0, y: -40, ease: "power2.out", duration: 0.6 },
      0.05
    );

    // BIG cutout shrinks + moves toward top-left heading position
    // (You can tweak these numbers to match your exact layout)
    tl.to(
      maskGroup,
      {
        scale: 1.15,
        x: "-26vw",
        y: "-22vh",
        ease: "expo.inOut",
        duration: 1.2,
      },
      0.35
    );

    // Fill the text to white while it settles
    tl.to(
      whiteText,
      {
        opacity: 1,
        ease: "power2.inOut",
        duration: 0.8,
      },
      0.9
    );

    // Reveal about section content (and we’ll keep the overlay for a moment)
    tl.to(
      aboutSection,
      {
        autoAlpha: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      1.05
    );

    // Fade out overlay once the heading is established
    tl.to(
      overlay,
      { autoAlpha: 0, duration: 0.35, ease: "power2.out" },
      1.35
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={wrapRef} className={styles.wrap} aria-hidden="true">
      <div className={styles.overlay} data-overlay="true">
        {/* SVG mask: black rectangle with text punched out */}
        <svg className={styles.svg} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Mask where WHITE shows the rect, BLACK cuts holes (the text) */}
            <mask id="aboutCutoutMask" maskUnits="userSpaceOnUse">
              <rect width="1000" height="1000" fill="white" />
              <g data-mask-group="true">
                <text
                  x="210"
                  y="470"
                  fontSize="220"
                  fontFamily="MainText"
                  fontWeight="900"
                  letterSpacing="-12"
                  fill="black"
                >
                  ABOUT
                </text>
                <text
                  x="210"
                  y="650"
                  fontSize="220"
                  fontFamily="MainText"
                  fontWeight="900"
                  letterSpacing="-12"
                  fill="black"
                >
                  {/* Indent so M starts under the T-ish area: tweak x if you want */}
                  ME
                </text>
              </g>
            </mask>
          </defs>

          {/* Dark overlay with cutout */}
          <rect
            width="1000"
            height="1000"
            fill="rgba(0,0,0,0.72)"
            mask="url(#aboutCutoutMask)"
          />

          {/* Solid white text layer (fades in to “fill”) */}
          <g data-white-text="true">
            <text
              x="210"
              y="470"
              fontSize="220"
              fontFamily="MainText"
              fontWeight="900"
              letterSpacing="-12"
              fill="white"
            >
              ABOUT
            </text>
            <text
              x="210"
              y="650"
              fontSize="220"
              fontFamily="MainText"
              fontWeight="900"
              letterSpacing="-12"
              fill="white"
            >
              ME
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
}