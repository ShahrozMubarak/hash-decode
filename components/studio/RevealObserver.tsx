'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Mark document as JS-enabled
    document.documentElement.classList.add('js');

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        el.classList.add('is-in');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const observeElements = () => {
      // Setup stagger delays for parents with data-stagger (60-80ms)
      const staggeredParents = document.querySelectorAll<HTMLElement>('[data-stagger]');
      staggeredParents.forEach((parent) => {
        const children = Array.from(parent.children) as HTMLElement[];
        children.forEach((child, index) => {
          if (!child.hasAttribute('data-reveal')) {
            child.setAttribute('data-reveal', 'up');
          }
          if (!child.hasAttribute('data-reveal-delay') && !child.style.transitionDelay) {
            const step = Math.min(index, 7);
            child.style.transitionDelay = `${step * 70}ms`;
          }
        });
      });

      const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-in');
        } else {
          observer.observe(el);
        }
      });
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    if (document.body) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    const safetyTimer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          el.classList.add('is-in');
        }
      });
    }, 2000);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(safetyTimer);
    };
  }, [pathname]);

  return null;
}
