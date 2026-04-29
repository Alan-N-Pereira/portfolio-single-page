"use client";


import PageTransition from "../transitions/PageTransition/PageTransition";
import styles from "./ContactSection.module.css";

export default function ContactSection() {
  return (
    <PageTransition title="Contact">
      <section className={styles.contactSection}>
        <div className={styles.inner}>
          <p className={styles.kicker}>Let&apos;s build something memorable</p>

          <h1 className={styles.title}>
            Get in touch
          </h1>

          <p className={styles.description}>
            I&apos;m Alan Pereira, a frontend developer focused on building
            premium, interactive web experiences with strong motion, clean
            structure, and polished UI.
          </p>

          <div className={styles.actions}>
            <a href="mailto:yourmail@example.com" className={styles.primaryBtn}>
              EMAIL ME
            </a>

            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className={styles.secondaryBtn}
            >
              LinkedIn
            </a>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Email</span>
              <p>yourmail@example.com</p>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Location</span>
              <p>London, UK</p>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Focus</span>
              <p>Frontend / React / NextJs</p>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}