'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Mark document as JS-enabled
    document.documentElement.classList.add('js');

    const revealAll = () => {
      const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
      elements.forEach((el) => {
        el.classList.add('is-in');
      });
    };

    // Reveal immediately
    revealAll();

    // 2. Setup stagger delays for parents with data-stagger
    const setupStagger = () => {
      const staggeredParents = document.querySelectorAll<HTMLElement>('[data-stagger]');
      staggeredParents.forEach((parent) => {
        const children = Array.from(parent.children) as HTMLElement[];
        children.forEach((child, index) => {
          if (!child.hasAttribute('data-reveal')) {
            child.setAttribute('data-reveal', 'up');
          }
          child.classList.add('is-in');
          if (!child.hasAttribute('data-reveal-delay') && !child.style.transitionDelay) {
            const step = Math.min(index, 7);
            child.style.transitionDelay = `${step * 70}ms`;
          }
        });
      });
    };

    setupStagger();

    // 3. MutationObserver to handle streamed React server components or client navigation
    const mutationObserver = new MutationObserver(() => {
      revealAll();
      setupStagger();
    });

    if (document.body) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Safety intervals to guarantee zero blank elements
    const t1 = setTimeout(revealAll, 50);
    const t2 = setTimeout(revealAll, 300);
    const t3 = setTimeout(revealAll, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
