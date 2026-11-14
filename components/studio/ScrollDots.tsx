'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'security', label: 'Security' },
  { id: 'work', label: 'Work' },
  { id: 'brief', label: 'Contact' },
];

export default function ScrollDots() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;

        // Check if known page section elements exist
        const sectionElements = SECTIONS.map((s) => document.getElementById(s.id));
        const hasSections = sectionElements.some((el) => el !== null);

        if (hasSections) {
          const scrollMiddle = window.scrollY + window.innerHeight * 0.38;
          let current = 0;

          sectionElements.forEach((el, idx) => {
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY;
              if (scrollMiddle >= top - 80) {
                current = idx;
              }
            }
          });

          // If scrolled to bottom of page, activate last dot
          if (
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 50
          ) {
            current = SECTIONS.length - 1;
          }

          setActiveIndex(current);
        } else {
          // Proportional scroll fallback for interior pages
          const maxScroll = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
          );
          const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
          const index = Math.min(
            SECTIONS.length - 1,
            Math.floor(progress * SECTIONS.length)
          );
          setActiveIndex(index);
        }
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Hide on admin and portal screens
  if (
    pathname &&
    (pathname.startsWith('/shahroz') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/portal'))
  ) {
    return null;
  }

  const scrollToSection = (index: number) => {
    const targetSection = document.getElementById(SECTIONS[index].id);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (maxScroll * index) / (SECTIONS.length - 1);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <nav className="scroll-dots-nav" aria-label="Page navigation dots">
      {SECTIONS.map((section, idx) => (
        <button
          key={section.id}
          type="button"
          className={`scroll-dot-btn ${idx === activeIndex ? 'is-active' : ''}`}
          onClick={() => scrollToSection(idx)}
          aria-label={`Scroll to ${section.label}`}
          title={section.label}
        />
      ))}
    </nav>
  );
}

