"use client";

import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {};

type DialogueItem = {
  question: string;
  answer: string;
};

const AboutSection = forwardRef<HTMLElement, Props>(function AboutSection(_props, ref) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const topPanelRef = useRef<HTMLDivElement | null>(null);

  const sceneClipRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  const charRef = useRef<HTMLImageElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  const postcardWrapRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);

  const [dialogueIndex, setDialogueIndex] = useState(0);

  const [typedQuestion, setTypedQuestion] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");

  const isSolved = typedAnswer.length > 0;

  const dialogueItems = useMemo<DialogueItem[]>(
    () => [
          {
            question: "Is your frontend getting harder to scale as your product grows?",
            answer: "I design systems that scale smoothly, so new features don’t slow you down.",
          },
          {
            question: "Are your components becoming harder to maintain or reuse?",
            answer: "I turn them into clean, reusable building blocks your team can rely on.",
          },
          {
            question: "Does your UI break or feel inconsistent across devices?",
            answer: "I build interfaces that stay consistent and reliable across every screen.",
          },
          {
            question: "Is performance starting to affect how your product feels?",
            answer: "I optimise what users actually experience, so everything feels fast and responsive.",
          },
          {
            question: "Does your frontend look good but lack structure underneath?",
            answer: "I bring clarity to the system behind the UI, so it stays solid as it grows.",
          },
        ],
    []
  );

  useEffect(() => {
    const currentItem = dialogueItems[dialogueIndex];

    let questionIndex = 0;
    let answerIndex = 0;

    let questionTimeout: number | undefined;
    let answerTimeout: number | undefined;
    let holdTimeout: number | undefined;

    setTypedQuestion("");
    setTypedAnswer("");

    const typeAnswer = () => {
      setTypedAnswer(currentItem.answer.slice(0, answerIndex));

      if (answerIndex < currentItem.answer.length) {
        answerIndex += 1;
        answerTimeout = window.setTimeout(typeAnswer, 24);
      } else {
        holdTimeout = window.setTimeout(() => {
          setDialogueIndex((prev) => (prev + 1) % dialogueItems.length);
        }, 2600);
      }
    };

    const typeQuestion = () => {
      setTypedQuestion(currentItem.question.slice(0, questionIndex));

      if (questionIndex < currentItem.question.length) {
        questionIndex += 1;
        questionTimeout = window.setTimeout(typeQuestion, 24);
      } else {
        answerTimeout = window.setTimeout(typeAnswer, 220);
      }
    };

    typeQuestion();

    return () => {
      if (questionTimeout) window.clearTimeout(questionTimeout);
      if (answerTimeout) window.clearTimeout(answerTimeout);
      if (holdTimeout) window.clearTimeout(holdTimeout);
    };
  }, [dialogueIndex, dialogueItems]);

  const setRefs = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const topPanel = topPanelRef.current;

    const sceneClip = sceneClipRef.current;
    const bg = bgRef.current;

    const character = charRef.current;
    const copy = copyRef.current;

    const postcardWrap = postcardWrapRef.current;
    const veil = veilRef.current;

    if (!section || !topPanel || !sceneClip || !bg || !character || !copy || !postcardWrap || !veil) return;

    const ctx = gsap.context(() => {
      gsap.set(sceneClip, { ["--skewY" as any]: "60px" });
      gsap.set(bg, {
        y: -30,
        scale: 1.06,
        transformOrigin: "50% 50%",
        force3D: true,
        autoAlpha: 1,
      });
      gsap.set(character, {
        y: 40,
        scale: 1.02,
        transformOrigin: "60% 70%",
        force3D: true,
        autoAlpha: 1,
      });
      gsap.set(copy, { autoAlpha: 0, y: 40 });
      gsap.set(veil, { autoAlpha: 0 });

      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: topPanel,
          start: "top 55%",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      enterTl
        .to(sceneClip, { ["--skewY" as any]: "0px", ease: "none" }, 0)
        .to(bg, { y: 10, scale: 1, ease: "none" }, 0)
        .to(character, { y: 0, scale: 1, ease: "none" }, 0.14)
        .to(copy, { autoAlpha: 1, y: 0, ease: "none" }, 0.18);

      gsap.to(bg, {
        y: 50,
        ease: "none",
        scrollTrigger: {
          trigger: topPanel,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(character, {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: topPanel,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(veil, {
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: postcardWrap,
          start: "top 85%",
          end: "top 35%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return (
    <section ref={setRefs} className={styles.aboutSection}>
      <div ref={topPanelRef} className={styles.topPanel}>
        <div ref={sceneClipRef} className={styles.sceneClip}>
          <div ref={sceneRef} className={styles.scene}>
            <img
              ref={bgRef}
              className={styles.bgLayer}
              src="/about/about-bg.png"
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            <div className={styles.bgOverlay} aria-hidden="true" />
            <div className={styles.bgBottomFade} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.aboutContent}>
          <div ref={copyRef} className={styles.copy}>
            <p className={styles.kicker}>
              ALAN <br /> PEREIRA
            </p>

            <p className={styles.subkicker}>"From curiosity to code."</p>

            <p className={styles.body}>
              My interest in web development started early and led me to build a strong foundation in JavaScript, React, and modern frontend development.
            </p>

            <p className={styles.body}>
              Through professional experience and further study in Computer Science, I’ve expanded that into a broader understanding of backend systems, security, and product development, while keeping my main focus on building clear, scalable, and user-focused web applications.
            </p>
          </div>

          <img
            ref={charRef}
            className={styles.charLayer}
            src="/about/about-character.png"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>
      </div>

      <div ref={postcardWrapRef} className={styles.postcardWrap}>
        <div ref={veilRef} className={styles.postcardVeil} aria-hidden="true" />

        <div className={styles.postcard}>
          <div className={styles.postcardMedia}>
            <div className={styles.photoCard}>
              <div className={styles.pixelDialog} aria-live="polite">
                <div className={styles.dialogInner}>
                  <div className={styles.faceWrap}>
                    <img
                      src="/about/Al-Sad.png"
                      alt="Sad Alan"
                      className={`${styles.faceImage} ${isSolved ? styles.faceHidden : styles.faceVisible}`}
                      draggable={false}
                    />
                    <img
                      src="/about/Al-Happy.png"
                      alt="Happy Alan"
                      className={`${styles.faceImage} ${isSolved ? styles.faceVisible : styles.faceHidden}`}
                      draggable={false}
                    />
                  </div>

                  <p className={styles.pixelDialogText}>
                    <span className={styles.dialogQuestion}>{typedQuestion}</span>

                    {(typedQuestion.length > 0 || typedAnswer.length > 0) && (
                      <>
                        <br />
                        <br />
                      </>
                    )}

                    <span className={styles.dialogAnswer}>{typedAnswer}</span>
                    <span className={styles.dialogCaret} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.postcardText}>
            <p className={styles.subkicker}>Clean UI • Component Thinking • Reliable Frontend</p>

            <p className={styles.body}>
              My focus has always been on building maintainable interfaces with reusable components, responsive layouts, and code that stays clear as products grow.
            </p>

            <p className={styles.body}>
              I work best when I can collaborate closely, ask the right questions early, and turn requirements into frontend solutions that are practical for users and easy for teams to build on.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;