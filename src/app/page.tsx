"use client";

import { useState, useRef } from "react";
import Hero from "../components/hero/Hero";
import ProjectsSection from "../components/projects/ProjectsSection";
import AboutSection from "../components/about/AboutSection";
import SiteMenu from "../components/siteMenu/SiteMenu";
// import AboutIntroSection from "../components/aboutIntro/AboutIntroSection";
// import AboutTitleSection from "../components/aboutTitle/AboutTitleSection";

export default function Home() {

  const [menuReady, setMenuReady] = useState(false);
  const aboutRef = useRef<HTMLElement | null>(null);

  return (
       <>
        <SiteMenu visible={menuReady} />

        <section id="home">
          <Hero aboutSectionRef={aboutRef} onIntroComplete={() => setMenuReady(true)} />
        </section>

        <section id="about">
          <AboutSection  ref={aboutRef}/>
        </section>

        <section id="projects">
          <ProjectsSection />
        </section>

        <section id="contact">
          <div style={{ minHeight: "100vh", background: "#07080c", color: "#fff" }}>
            Contact placeholder
          </div>
        </section>
      </>
  );
}
