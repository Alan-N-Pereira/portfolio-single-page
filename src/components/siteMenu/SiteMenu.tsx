"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./SiteMenu.module.css";

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];

type SiteMenuProps = {
  visible: boolean;
};

export default function SiteMenu({ visible }: SiteMenuProps) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const topLineRef = useRef<HTMLSpanElement | null>(null);
  const bottomLineRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const navRefs = useRef<HTMLButtonElement[]>([]);
  const socialRefs = useRef<HTMLAnchorElement[]>([]);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    if (!visible) return;
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    const topLine = topLineRef.current;
    const bottomLine = bottomLineRef.current;
    const contact = contactRef.current;

    if (!root || !backdrop || !panel || !topLine || !bottomLine || !contact) return;

    const ctx = gsap.context(() => {
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(panel, { xPercent: 100 });
      gsap.set(navRefs.current, { autoAlpha: 0, x: 40 });
      gsap.set(socialRefs.current, { autoAlpha: 0, x: 20 });
      gsap.set(contact, { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline({ paused: true });

      tl.to(backdrop, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0)
        .to(
          panel,
          {
            xPercent: 0,
            duration: 0.8,
            ease: "expo.inOut",
          },
          0
        )
        .to(
          topLine,
          {
            y: 6,
            rotate: 45,
            duration: 0.45,
            ease: "power3.out",
          },
          0
        )
        .to(
          bottomLine,
          {
            y: -6,
            rotate: -45,
            duration: 0.45,
            ease: "power3.out",
          },
          0
        )
        .to(
          navRefs.current,
          {
            autoAlpha: 1,
            x: 0,
            stagger: 0.06,
            duration: 0.45,
            ease: "power3.out",
          },
          0.18
        )
        .to(
          socialRefs.current,
          {
            autoAlpha: 1,
            x: 0,
            stagger: 0.05,
            duration: 0.35,
            ease: "power3.out",
          },
          0.34
        )
        .to(
          contact,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            ease: "power3.out",
          },
          0.42
        );

      tlRef.current = tl;
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (open) tl.play();
    else tl.reverse();
    }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const scrollToSection = (id: string) => {
    setOpen(false);

    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;

      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 220);
  };

  return (
    <div ref={rootRef} className={`${styles.menuRoot} ${visible ? styles.menuVisible : styles.menuHidden}`}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={toggleMenu}
      >
        <span className={styles.menuButtonInner}>
          <span ref={topLineRef} className={styles.menuLine} />
          <span ref={bottomLineRef} className={styles.menuLine} />
        </span>
      </button>

      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={() => setOpen(false)}
      />

      <aside ref={panelRef} className={styles.panel}>
        <div className={styles.panelInner}>
          <nav className={styles.nav}>
            {navItems.map((item, index) => (
              <button
                key={item.id}
                ref={(el) => {
                  if (el) navRefs.current[index] = el;
                }}
                type="button"
                className={styles.navItem}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles.panelBottom}>
            <div className={styles.socials}>
              <a
                ref={(el) => {
                  if (el) socialRefs.current[0] = el;
                }}
                className={styles.socialLink}
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

              <a
                ref={(el) => {
                  if (el) socialRefs.current[1] = el;
                }}
                className={styles.socialLink}
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>

            <div ref={contactRef} className={styles.contactBlock}>
              <p className={styles.contactName}>Alan Pereira</p>
              <p className={styles.contactMeta}>Phone number here</p>
              <p className={styles.contactMeta}>email@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}