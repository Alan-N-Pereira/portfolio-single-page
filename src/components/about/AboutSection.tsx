"use client";

import { forwardRef } from "react";
import styles from "./AboutSection.module.css";

type Props = {
  className?: string;
};

const AboutSection = forwardRef<HTMLElement, Props>(function AboutSection({ className }, ref) {
  return (
    <section ref={ref} className={`${styles.about} ${className ?? ""}`} data-about="true">
      <div className={styles.inner}>
        <h2 className={styles.heading} data-about-heading="true">
          ABOUT
          <span className={styles.headingIndent}>ME</span>
        </h2>

        <p className={styles.lead}>
          Mumbai-born, London-based frontend developer building bold interfaces and smooth motion.
        </p>

        <p className={styles.body}>
          I care about clean UI, strong UX, and performance that feels invisible. I love crafting
          interactive experiences that feel premium, not noisy.
        </p>
      </div>
    </section>
  );
});

export default AboutSection;