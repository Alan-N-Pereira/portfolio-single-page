"use client";

import { useRef, useState } from "react";
import Hero from "../components/hero/Hero";
import ProjectsSection from "../components/projects/ProjectsSection";
import AboutSection from "../components/about/AboutSection";
import SiteMenu from "../components/siteMenu/SiteMenu";
import ProjectsTransition from "../components/projectTransition/ProjectsTransition";
import ContactSection from "../components/contact/ContactSection";
import GlobalPageTransition, {
  type GlobalPageTransitionHandle,
} from "../components/transitions/GlobalTransition/GlobalPageTransition";

export default function Home() {
  const [menuReady, setMenuReady] = useState(false);
  const aboutRef = useRef<HTMLElement | null>(null);
  const globalTransitionRef = useRef<GlobalPageTransitionHandle | null>(null);

  const jumpToSectionInstant = (id: string) => {
    const root = document.documentElement;
    const body = document.body;

    const prevRootBehavior = root.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    if (id === "home") {
      window.scrollTo(0, 0);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top);
      }
    }

    requestAnimationFrame(() => {
      root.style.scrollBehavior = prevRootBehavior;
      body.style.scrollBehavior = prevBodyBehavior;
    });
  };

  const setSectionTransitionLock = (locked: boolean) => {
    window.dispatchEvent(
      new CustomEvent("section-transition-lock", {
        detail: { locked },
      })
    );
  };

  const handleMenuNavigate = (label: string, id: string) => {
    setSectionTransitionLock(true);

    const durationScale = id === "home" ? 1.35 : 1;

    globalTransitionRef.current?.play({
      title: label,
      durationScale,
      onMidpoint: () => {
        jumpToSectionInstant(id);
      },
      onComplete: () => {
        setSectionTransitionLock(false);
      },
    });
  };

  return (
    <>
      <GlobalPageTransition ref={globalTransitionRef} />

      <SiteMenu visible={menuReady} onNavigate={handleMenuNavigate} />

      <section id="home">
        <Hero
          aboutSectionRef={aboutRef}
          onIntroComplete={() => setMenuReady(true)}
          onNavigate={handleMenuNavigate}
        />
      </section>

      <section id="about">
        <AboutSection ref={aboutRef} />
      </section>

      <ProjectsTransition />

      <section id="projects">
        <ProjectsSection />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </>
  );
}