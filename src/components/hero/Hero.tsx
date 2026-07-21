"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

type HeroProps = {
  aboutSectionRef: RefObject<HTMLElement | null>;
  onIntroComplete?: () => void;
  onNavigate?: (label: string, id: string) => void;
};

type BubbleItem = {
  text: string;
  actionLabel?: string;
  actionTarget?: string;
};

const LOADER_WORDS = ["HI", "HOLA", "CIAO", "SALUT", "OLÁ"] as const;

const HERO_MINIMUM_LOAD_MS = 3200;
const HERO_MAXIMUM_LOAD_MS = 8000;

export default function Hero({
  aboutSectionRef,
  onIntroComplete,
  onNavigate,
}: HeroProps) {
  const [showContent, setShowContent] = useState(false);
  const [heroAssetsReady, setHeroAssetsReady] = useState(false);

  const [portalReady, setPortalReady] = useState(false);
  const [introBgSrc, setIntroBgSrc] = useState("/hero/bg.webp");

  const [aboutSettled, setAboutSettled] = useState(false);
  const [showAboutBody, setShowAboutBody] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);

  const [showBubble, setShowBubble] = useState(false);
  const [typedBubbleText, setTypedBubbleText] = useState("");


  const heroBubbleWrapRef = useRef<HTMLDivElement | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinWrapRef = useRef<HTMLDivElement | null>(null);

  const loaderHiRef = useRef<HTMLDivElement | null>(null);
  const maskGroupRef = useRef<SVGGElement | null>(null);
  const maskedImageGroupRef = useRef<SVGGElement | null>(null);
  const solidHiRef = useRef<SVGGElement | null>(null);

  const onIntroCompleteRef = useRef(onIntroComplete);

  const aboutFlowWrapRef = useRef<HTMLElement | null>(null);

  const heroMainRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const alanRef = useRef<HTMLImageElement | null>(null);
  const imagesDivRef = useRef<HTMLDivElement | null>(null);

  const aboutOverlayRef = useRef<HTMLDivElement | null>(null);
  const aboutOverlayMoveRef = useRef<HTMLDivElement | null>(null);
  const aboutIntroRef = useRef<HTMLDivElement | null>(null);

  const aboutBodyRef = useRef<HTMLDivElement | null>(null);

  const bubbleItems = useMemo<BubbleItem[]>(
    () => [
      {
        text: "Hi, I am Alan — Web Developer / Front-End Developer.",
      },
      {
        text: "Open to work. Check out my projects.",
        actionLabel: "View Projects",
        actionTarget: "projects",
      },
      {
        text: "Want to work together? Let’s get in touch.",
        actionLabel: "Contact Me",
        actionTarget: "contact",
      },
    ],
    []
  );

  const handleBubbleNavigate = (id: string) => {
    if (onNavigate) {
      const label =
        id === "home"
          ? "Home"
          : id === "about"
            ? "About"
            : id === "projects"
              ? "Projects"
              : id === "contact"
                ? "Contact"
                : id;

      onNavigate(label, id);
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    onIntroCompleteRef.current = onIntroComplete;
  }, [onIntroComplete]);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
  const mobileBackground = window.matchMedia("(max-width: 900px)").matches;

  setIntroBgSrc(
    mobileBackground
      ? "/hero/bg-mobile.webp"
      : "/hero/bg.webp"
  );

  setPortalReady(true);
}, []);

  useEffect(() => {
    const sky = skyRef.current;
    const background = bgRef.current;
    const alan = alanRef.current;

    if (!sky || !background || !alan) return;

    let cancelled = false;
    let minimumTimer = 0;
    let maximumTimer = 0;

    const imageCleanups: Array<() => void> = [];

    const waitForImage = (image: HTMLImageElement) => {
      return new Promise<void>((resolve) => {
        let finished = false;

        const cleanup = () => {
          image.removeEventListener("load", onLoad);
          image.removeEventListener("error", onError);
        };

        const finish = async () => {
          if (finished) return;

          finished = true;
          cleanup();

          try {
            await image.decode();
          } catch {
            // A decode failure should not trap the visitor on the loader.
          }

          resolve();
        };

        const onLoad = () => {
          void finish();
        };

        const onError = () => {
          if (finished) return;

          finished = true;
          cleanup();
          resolve();
        };

        if (image.complete) {
          if (image.naturalWidth > 0) {
            void finish();
          } else {
            onError();
          }

          return;
        }

        image.addEventListener("load", onLoad, { once: true });
        image.addEventListener("error", onError, { once: true });
        imageCleanups.push(cleanup);
      });
    };

    const fontsReady =
      "fonts" in document
        ? Promise.all([
            document.fonts.load('250px "MainText"'),
            document.fonts.ready,
          ])
            .then(() => undefined)
            .catch(() => undefined)
        : Promise.resolve();

    const criticalAssetsReady = Promise.all([
      waitForImage(sky),
      waitForImage(background),
      waitForImage(alan),
      fontsReady,
    ]).then(() => undefined);

    const minimumVisibleTime = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, HERO_MINIMUM_LOAD_MS);
    });

    const maximumWait = new Promise<void>((resolve) => {
      maximumTimer = window.setTimeout(resolve, HERO_MAXIMUM_LOAD_MS);
    });

    Promise.all([
      Promise.race([criticalAssetsReady, maximumWait]),
      minimumVisibleTime,
    ]).then(() => {
      window.clearTimeout(maximumTimer);

      if (!cancelled) {
        setHeroAssetsReady(true);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(maximumTimer);
      imageCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useLayoutEffect(() => {
    if (!heroAssetsReady) return;

    const loaderHi = loaderHiRef.current;
    const maskGroup = maskGroupRef.current;
    const maskedImageGroup = maskedImageGroupRef.current;
    const solidHi = solidHiRef.current;

    if (!loaderHi || !maskGroup || !maskedImageGroup || !solidHi) {
      return;
    }

    const tl = gsap.timeline({
      defaults: {
        transformOrigin: "50% 50%",
      },
    });

    gsap.set(maskGroup, {
      rotate: 0,
      scale: 1,
      opacity: 1,
    });

    gsap.set(loaderHi, { autoAlpha: 1 });
    gsap.set(maskedImageGroup, { autoAlpha: 0 });
    gsap.set(solidHi, { autoAlpha: 0 });

    tl.to(loaderHi, {
      autoAlpha: 0,
      duration: 0.16,
      ease: "power2.out",
    })
      .set(maskedImageGroup, { autoAlpha: 1 })
      .to(
        solidHi,
        {
          autoAlpha: 1,
          duration: 0.22,
          ease: "power2.out",
        },
        "<"
      )
      .to({}, { duration: 0.25 })
      .to(solidHi, {
        autoAlpha: 0,
        duration: 1.8,
        ease: "power2.inOut",
      })
      .to(maskGroup, {
        rotate: 10,
        duration: 2,
        ease: "power4.inOut",
      })
      .to(
        maskGroup,
        {
          scale: 10,
          duration: 2,
          ease: "expo.inOut",
          opacity: 0,
          onComplete: () => {
            setShowContent(true);
            onIntroCompleteRef.current?.();
          },
        },
        "-=1.8"
      );

    return () => {
      tl.kill();
    };
  }, [heroAssetsReady]);

  useEffect(() => {
    if (!showContent) return;

    const main = heroMainRef.current;
    const sky = skyRef.current;
    const bg = bgRef.current;
    const alan = alanRef.current;
    const title = heroTitleRef.current;
    const bubble = heroBubbleWrapRef.current;
    const imagesDiv = imagesDivRef.current;

    if (!main || !sky || !bg || !alan || !title || !bubble || !imagesDiv) {
      return;
    }

    const getBgFinalScale = () => {
      const width = window.innerWidth;

      if (width >= 2200) return 1.24;
      if (width >= 1900) return 1.18;

      if (width <= 767) return 1.12;

      // Tablet portrait / small tablet
      if (width <= 900) return 1.00;

      if (width <= 1200) return 1.04;
      if (width <= 1440) return 1.19;

      return 1.1;
    };

    const getBgFinalY = () => {
      const width = window.innerWidth;

      if (width >= 1900) return 28;

      if (width <= 767) return 36;

      // Less vertical movement at 768–900
      if (width <= 900) return 20;

      if (width <= 1200) return 33;

      return 0;
    };

    const getAlanFinalScale = () => {
      const width = window.innerWidth;

      /* Mobile only */
      if (width <= 480) {
        return 1.72;
      }

      if (width <= 767) {
        return 2.05;
      }

      if (width >= 768 && width <= 900) {
        return 1.9;
      }

      if (width >= 901 && width <= 1200) {
        return 2.05;
      }

      if (width >= 1201 && width <= 1440) {
        return 2.17;
      }

      return 2.4;
    };

    const getAlanFinalBottom = () => {
      const width = window.innerWidth;

      /* Mobile only */
      if (width <= 480) {
        return "-11%";
      }

      if (width <= 767) {
        return "-12%";
      }

      if (width >= 768 && width <= 900) {
        return "-13%";
      }

      if (width >= 901 && width <= 1200) {
        return "-13%";
      }

      if (width >= 1201 && width <= 1440) {
        return "-14%";
      }

      return "-25%";
    };

    const positionBubbleToAlanHead = () => {
      const stageRect = imagesDiv.getBoundingClientRect();
      const alanRect = alan.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const width = window.innerWidth;

      if (width <= 480) {
        const headXRatio = 0.5;
        const headYRatio = 0.05;

        // Increase this number to create more space above Alan's head
        const gapAboveHead = 48;

        const headCenterX =
          alanRect.left -
          stageRect.left +
          alanRect.width * headXRatio;

        const headTopY =
          alanRect.top -
          stageRect.top +
          alanRect.height * headYRatio;

        const horizontalPadding = 12;
        const halfBubbleWidth = bubbleRect.width / 2;

        const safeBubbleCenterX = Math.min(
          stageRect.width - halfBubbleWidth - horizontalPadding,
          Math.max(
            halfBubbleWidth + horizontalPadding,
            headCenterX
          )
        );

        const bubbleTop = Math.max(
          28,
          headTopY - bubbleRect.height - gapAboveHead
        );

        gsap.set(bubble, {
          left: safeBubbleCenterX,
          top: bubbleTop,
          bottom: "auto",
        });

        return;
      }

      /*
        Tablet and mobile:
        place the bubble above Alan's head.
      */
      if (width <= 900) {
        const headXRatio = 0.5;
        const headYRatio = 0.08;
        const gapAboveHead = width <= 640 ? 40 : 50;

        const headCenterX =
          alanRect.left -
          stageRect.left +
          alanRect.width * headXRatio;

        const headTopY =
          alanRect.top -
          stageRect.top +
          alanRect.height * headYRatio;

        const horizontalPadding = 14;
        const halfBubbleWidth = bubbleRect.width / 2;

        const safeBubbleCenterX = Math.min(
          stageRect.width - halfBubbleWidth - horizontalPadding,
          Math.max(halfBubbleWidth + horizontalPadding, headCenterX)
        );

        const bubbleTop = Math.max(
          20,
          headTopY - bubbleRect.height - gapAboveHead
        );

        bubble.style.left = `${safeBubbleCenterX}px`;
        bubble.style.top = `${bubbleTop}px`;
        bubble.style.bottom = "auto";

        return;
      }

      /*
        Existing desktop positioning:
        keep the bubble beside Alan's head.
      */
      const headXRatio = 0.7;
      const headYRatio = 0.08;
      const gapFromHead = 28;

      const headX =
        alanRect.left -
        stageRect.left +
        alanRect.width * headXRatio;

      const headY =
        alanRect.top -
        stageRect.top +
        alanRect.height * headYRatio;

      const bubbleCenterX =
        headX + gapFromHead + bubbleRect.width / 2;

      bubble.style.left = `${bubbleCenterX}px`;
      bubble.style.top = `${headY}px`;
      bubble.style.bottom = "auto";
    };

    gsap.set(main, {
      scale: 2,
      rotate: -10,
      transformOrigin: "50% 50%",
    });

    gsap.set(sky, {
      scale: 2,
      rotate: -20,
      transformOrigin: "50% 50%",
    });

    gsap.set(bg, {
      scale: 1.8,
      rotate: -5,
      transformOrigin: "50% 50%",
    });

    gsap.set(alan, {
      left: "50%",
      xPercent: -50,
      bottom: "-150%",
      rotate: -20,
      scale: 2,
      transformOrigin: "50% 100%",
      force3D: true,
    });

    gsap.set(title, {
      y: 250,
      opacity: 0,
    });

    gsap.set(bubble, {
      autoAlpha: 0,
      y: 40,
    });

    setShowBubble(false);

    const tl = gsap.timeline({
      onUpdate: positionBubbleToAlanHead,

      onComplete: () => {
        positionBubbleToAlanHead();

        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.overflowX = "hidden";

        const refreshScroll = () => {
          window.dispatchEvent(new Event("resize"));
          ScrollTrigger.refresh();
          positionBubbleToAlanHead();
        };

        requestAnimationFrame(() => {
          refreshScroll();

          window.setTimeout(refreshScroll, 150);
          window.setTimeout(refreshScroll, 500);
        });
      },
    });

    tl.to(main, {
      scale: 1,
      rotate: 0,
      duration: 1,
      ease: "expo.inOut",
    })
      .to(
        sky,
        {
          scale: 1.2,
          rotate: 0,
          duration: 1,
          ease: "expo.inOut",
        },
        "-=1.0"
      )
      .to(
        bg,
        {
          scale: getBgFinalScale(),
          rotate: 0,
          y: getBgFinalY(),
          duration: 1,
          ease: "expo.inOut",
        },
        "-=0.8"
      )
      .to(
        alan,
        {
          scale: getAlanFinalScale(),
          rotate: 0,
          bottom: getAlanFinalBottom(),
          duration: 2,
          ease: "expo.inOut",
        },
        "-=0.8"
      )
      .to(
        title,
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
        },
        "-=0.2"
      )
      .to(
        bubble,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "back.out(1.4)",
          onStart: () => setShowBubble(true),
        },
        ">-0.1"
      );

    const quickSky = gsap.quickTo(sky, "x", {
      duration: 0.6,
      ease: "power3.out",
    });

    const quickBg = gsap.quickTo(bg, "x", {
      duration: 0.6,
      ease: "power3.out",
    });

    const quickTitle = gsap.quickTo(title, "x", {
      duration: 0.6,
      ease: "power3.out",
    });

    const isMobileDevice = window.matchMedia("(max-width: 900px)").matches;

    const onMove = (e: MouseEvent) => {
      if (isMobileDevice) return;

      const xMove = (e.clientX / window.innerWidth - 0.5) * 40;

      quickTitle(xMove * 3);
      quickSky(xMove);
      quickBg(xMove * 1.7);
    };

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!isMobileDevice) return;

      const gamma = e.gamma ?? 0; // left/right tilt
      const beta = e.beta ?? 0;   // front/back tilt

      const xMove = gsap.utils.clamp(-1, 1, gamma / 22);
      const yMove = gsap.utils.clamp(-1, 1, (beta - 45) / 28);

      quickTitle(xMove * 18);
      quickSky(xMove * 8);
      quickBg(xMove * 14);

      gsap.to(alan, {
        xPercent: -50 + xMove * 1.8,
        y: yMove * 5,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const enableGyroParallax = async () => {
      if (!isMobileDevice) return;
      if (!("DeviceOrientationEvent" in window)) return;

      const DeviceOrientation =
        window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<PermissionState>;
        };

      try {
        if (typeof DeviceOrientation.requestPermission === "function") {
          const permission = await DeviceOrientation.requestPermission();

          if (permission !== "granted") return;
        }

        window.addEventListener("deviceorientation", onDeviceOrientation);
      } catch {
        // If permission fails, just keep the hero without gyro parallax.
      }
    };

    main.addEventListener("mousemove", onMove);

    /*
      iPhone needs this to happen from a real user action.
      The first tap anywhere on the hero enables gyro.
    */
    main.addEventListener("click", enableGyroParallax, { once: true });
    main.addEventListener("touchstart", enableGyroParallax, { once: true });

    const onResize = () => {
      requestAnimationFrame(positionBubbleToAlanHead);
    };

    window.addEventListener("resize", onResize);

    return () => {
      main.removeEventListener("mousemove", onMove);
      main.removeEventListener("click", enableGyroParallax);
      main.removeEventListener("touchstart", enableGyroParallax);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
      window.removeEventListener("resize", onResize);

      tl.kill();

      gsap.killTweensOf([main, sky, bg, alan, title, bubble]);
    };
  }, [showContent]);

  useEffect(() => {
    if (!showBubble) return;

    const currentText = bubbleItems[bubbleIndex].text;
    let charIndex = 0;

    setTypedBubbleText("");

    const typingInterval = window.setInterval(() => {
      charIndex += 1;

      setTypedBubbleText(currentText.slice(0, charIndex));

      if (charIndex >= currentText.length) {
        window.clearInterval(typingInterval);

        const nextTimeout = window.setTimeout(() => {
          setBubbleIndex((prev) => (prev + 1) % bubbleItems.length);
        }, 2600);

        return () => window.clearTimeout(nextTimeout);
      }
    }, 42);

    return () => {
      window.clearInterval(typingInterval);
    };
  }, [showBubble, bubbleIndex, bubbleItems]);

  useLayoutEffect(() => {
    if (!showContent) return;

    const pinWrap = pinWrapRef.current;
    const heroMain = heroMainRef.current;
    const heroTitle = heroTitleRef.current;

    const overlay = aboutOverlayRef.current;
    const overlayMove = aboutOverlayMoveRef.current;
    const aboutIntro = aboutIntroRef.current;
    const aboutBody = aboutBodyRef.current;

    if (
      !pinWrap ||
      !heroMain ||
      !heroTitle ||
      !overlay ||
      !overlayMove ||
      !aboutIntro ||
      !aboutBody
    ) {
      return;
    }

    const cutLayer = overlay.querySelector<HTMLElement>(
      "[data-cut-layer='true']"
    );

    const solidLayer = overlay.querySelector<HTMLElement>(
      "[data-solid-layer='true']"
    );

    if (!cutLayer || !solidLayer) return;

    setAboutSettled(false);
    setShowAboutBody(false);

    gsap.set(overlay, {
      autoAlpha: 0,
    });

    gsap.set(overlayMove, {
      x: 0,
      y: 0,
      scale: 6,
      transformOrigin: "50% 50%",
      force3D: true,
    });

    gsap.set(cutLayer, {
      autoAlpha: 1,
    });

    gsap.set(solidLayer, {
      autoAlpha: 0,
    });

    gsap.set(aboutIntro, {
      autoAlpha: 0,
      y: 20,
    });

    const getAboutSettledScale = () => {
      const width = window.innerWidth;

      if (width <= 480) {
        return 0.42;
      }

      if (width <= 767) {
        return 0.31;
      }

      if (width >= 768 && width <= 900) {
        return 0.3;
      }

      if (width >= 901 && width <= 1200) {
        return 0.22;
      }

      if (width >= 1201 && width <= 1440) {
        return 0.205;
      }

      return 0.22;
    };

    const ctx = gsap.context(() => {
      const endDistance = window.innerHeight * 0.49;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrap,
          start: "top top",
          end: () => `+=${endDistance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        overlay,
        {
          autoAlpha: 1,
          duration: 0.01,
        },
        0
      );

      tl.to(
        heroMain,
        {
          scale: 0.97,
          duration: 0.6,
          ease: "power2.out",
        },
        0
      );

      tl.to(
        heroTitle,
        {
          autoAlpha: 0,
          y: -40,
          duration: 0.7,
          ease: "power2.out",
        },
        0
      );

      tl.to(
        heroMain,
        {
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        0.35
      );

      tl.to(
        overlayMove,
        {
          scale: 0.62,
          duration: 1.2,
          ease: "expo.inOut",
        },
        0
      );

      tl.to(
        cutLayer,
        {
          autoAlpha: 0,
          duration: 0.12,
          ease: "none",
        },
        0.55
      );

      tl.to(
        solidLayer,
        {
          autoAlpha: 1,
          duration: 0.12,
          ease: "none",
        },
        0.55
      );

      tl.to(
        overlayMove,
        {
          scale: getAboutSettledScale,
          y: -window.innerHeight * 0.28,
          duration: 1.2,
          ease: "expo.inOut",
        },
        1
      );

      tl.to(
        aboutIntro,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        1.4
      );

      tl.to({}, { duration: 0.3 });

      tl.to([overlayMove, aboutIntro], {
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      const st = tl.scrollTrigger!;

      const handoffST = ScrollTrigger.create({
        trigger: pinWrap,
        start: "top top",
        end: () => `+=${endDistance}`,

        onUpdate: (self) => {
          const p = self.progress;

          setShowAboutBody(p > 0.62);
          setAboutSettled(p > 0.66);
        },
      });

      return () => {
        handoffST.kill();
        st.kill();
        tl.kill();
      };
    }, rootRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [showContent]);

  const introOverlay = (
    <div className={styles.svgOverlay}>
      <div
        ref={loaderHiRef}
        className={styles.languageLoader}
        aria-hidden="true"
      >
        {LOADER_WORDS.map((word, index) => (
          <span
            key={word}
            className={`${styles.languageWord} ${
              styles[`languageWord${index + 1}`]
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      <svg
        className={styles.introSvg}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id="hiMask">
            <rect width="100%" height="100%" fill="black" />

            <g ref={maskGroupRef} className="vi-mask-group">
              <text
                x="50%"
                y="50%"
                fontSize="250"
                textAnchor="middle"
                fill="white"
                dominantBaseline="middle"
                fontFamily="MainText"
              >
                HI
              </text>
            </g>
          </mask>
        </defs>

        <g
          ref={maskedImageGroupRef}
          className={styles.hiMaskedImageGroup}
          mask="url(#hiMask)"
        >
          <image
            href={introBgSrc}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>

        <g ref={solidHiRef} className={styles.hiOriginal}>
          <text
            x="50%"
            y="50%"
            fontSize="250"
            textAnchor="middle"
            fill="white"
            dominantBaseline="middle"
            fontFamily="MainText"
          >
            HI
          </text>
        </g>
      </svg>
    </div>
  );

  return (
  <>
    {portalReady && !showContent
      ? createPortal(introOverlay, document.body)
      : null}

    <div
      ref={rootRef}
      className={`${styles.root} ${
        !showContent ? styles.introPending : ""
      }`}
    >

      <div
        ref={pinWrapRef}
        className={styles.pinWrap}
        aria-hidden={!showContent}
      >
            <div
              ref={heroMainRef}
              className={styles.main}
              data-main="true"
              data-hero="true"
            >
              <div className={styles.landing}>
                <div className={styles.navbar}>
                  <div className={styles.logo}>
                    <h3 className={styles.logoText}>Alan</h3>
                  </div>
                </div>

                <div ref={imagesDivRef} className={styles.imagesDiv}>
                  <img
                    ref={skyRef}
                    className={`${styles.sky} ${styles.skyScale}`}
                    src="/hero/sky.webp"
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />

                  <picture className={styles.bgPicture}>
                    <source
                      media="(max-width: 900px)"
                      srcSet="/hero/bg-mobile.webp"
                    />

                    <img
                      ref={bgRef}
                      className={`${styles.bg} ${styles.bgScale}`}
                      src="/hero/bg.webp"
                      alt=""
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </picture>

                  <div
                    ref={heroTitleRef}
                    className={styles.text}
                    data-hero-title="true"
                  >
                    <h1 className={styles.textWeb}>Web</h1>
                    <h1 className={styles.textDev}>Developer</h1>
                  </div>

                  <img
                    ref={alanRef}
                    className={styles.alan}
                    data-alan="true"
                    src="/hero/alan.webp"
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />

                  <div
                    ref={heroBubbleWrapRef}
                    className={styles.heroBubbleWrap}
                  >
                    <div className={styles.heroBubble}>
                      <p className={styles.heroBubbleText}>
                        {typedBubbleText}

                        <span className={styles.heroBubbleCursor}>|</span>
                      </p>

                      {typedBubbleText === bubbleItems[bubbleIndex].text &&
                        bubbleItems[bubbleIndex].actionLabel &&
                        bubbleItems[bubbleIndex].actionTarget && (
                          <button
                            type="button"
                            className={styles.heroBubbleButton}
                            onClick={() =>
                              handleBubbleNavigate(
                                bubbleItems[bubbleIndex].actionTarget!
                              )
                            }
                          >
                            {bubbleItems[bubbleIndex].actionLabel}
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                <div className={styles.btmbar}>
                  <div className={styles.btmbarInner}>
                    <div className={styles.footerLeft}>
                      <p className={styles.footerTitle}>Mumbai, India</p>

                      <p className={styles.footerSub}>Where it all began</p>
                    </div>

                    <div className={styles.btmbarScroll}>
                      <h3 className={styles.scrollText}>Scroll Down</h3>

                      <img
                        className={styles.scrollArrow}
                        src="/hero/downSymbol.png"
                        alt=""
                        aria-hidden="true"
                      />
                    </div>

                    <div className={styles.footerRight}>
                      <p className={styles.footerTitle}>
                        Web Developer / Frontend Engineer
                      </p>

                      <p className={styles.footerSub}>Based in London</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {showContent && (
        <section ref={aboutFlowWrapRef} className={styles.aboutFlowWrap}>
            <div
              ref={aboutOverlayRef}
              className={`${styles.aboutOverlay} ${
                aboutSettled
                  ? `${styles.aboutOverlayInFlow} ${styles.aboutOverlayCollapsed}`
                  : ""
              }`}
            >
              <div
                ref={aboutOverlayMoveRef}
                className={styles.aboutOverlayMove}
              >
                <div className={styles.cutLayer} data-cut-layer="true">
                  <svg
                    className={styles.aboutSvg}
                    viewBox="0 0 1000 600"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <mask
                        id="aboutHoleMask"
                        maskUnits="userSpaceOnUse"
                        maskContentUnits="userSpaceOnUse"
                      >
                        <rect
                          x="0"
                          y="0"
                          width="1000"
                          height="600"
                          fill="white"
                        />

                        <image
                          href="/svg/about-mask.svg"
                          x="0"
                          y="0"
                          width="1000"
                          height="600"
                          preserveAspectRatio="none"
                        />
                      </mask>
                    </defs>

                    <rect
                      x="0"
                      y="0"
                      width="1000"
                      height="600"
                      fill="black"
                      mask="url(#aboutHoleMask)"
                    />
                  </svg>
                </div>

                <div className={styles.solidLayer} data-solid-layer="true">
                  <svg
                    className={styles.aboutSvg}
                    viewBox="0 0 1000 600"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <image
                      href="/svg/about-solid.svg"
                      x="0"
                      y="0"
                      width="1000"
                      height="600"
                      preserveAspectRatio="none"
                    />
                  </svg>
                </div>
              </div>

              <div ref={aboutIntroRef} className={styles.aboutIntro}>
                <p>Mumbai-born. London-based.</p>

                <p>
                  Frontend developer building bold, interactive web experiences.
                </p>

                <p>
                  I care about usability, performance, and interfaces that feel
                  clear from the first interaction.
                </p>

                <p className={styles.aboutIntroTags}>
                  React • NextJS • TypeScript • UI Architecture • Performance
                  Optimization
                </p>
              </div>
            </div>

            <div
              ref={aboutBodyRef}
              className={`${styles.aboutBody} ${
                showAboutBody ? styles.aboutBodyVisible : ""
              }`}
            >
              <p>
                I’ve always been interested in what makes a website feel good to
                use.
              </p>

              <p>
                That curiosity first pulled me into frontend development, then
                gradually shaped how I think about design, performance, and the
                details users notice without realising it.
              </p>

              <p>
                The more I built, the more I understood that good frontend work
                is not just about making things work it is about making them feel
                right.
              </p>

              <p className={styles.callToAction}>
                Scroll to see the story behind that.
              </p>
            </div>
        </section>
      )}
    </div>
  </>
  );
}