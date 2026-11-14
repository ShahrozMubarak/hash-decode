'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SceneSurface from './SceneSurface';

export default function PageExperience() {
  const path = usePathname();
  const prevPathRef = useRef<string>(path);
  const [shifting, setShifting] = useState<boolean>(false);

  useEffect(() => {
    if (path === '/' || path.startsWith('/admin') || path.startsWith('/shahroz') || path.startsWith('/portal')) return;
    let reveal: IntersectionObserver | null = null;
    let elements: HTMLElement[] = [];
    const timer = setTimeout(() => {
      elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.page-intro,.owner-intro,.owner-login,.principles article,.service-index section,.article-list a,.tool-cards a,.admin-item,.dashboard-kpis>div,.editorial-admin,.form-panel'
        )
      );
      reveal = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('page-visible');
              reveal?.unobserve(entry.target);
            }
          }),
        { threshold: 0.08 }
      );
      elements.forEach((el) => {
        el.classList.add('page-reveal');
        reveal?.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      reveal?.disconnect();
      elements.forEach((el) => el.classList.remove('page-reveal', 'page-visible'));
    };
  }, [path]);

  useEffect(() => {
    if (path !== prevPathRef.current) {
      setShifting(true);
      const timer = setTimeout(() => {
        setShifting(false);
      }, 1000);
      prevPathRef.current = path;
      return () => clearTimeout(timer);
    }
  }, [path]);

  if (
    path === '/' ||
    path.startsWith('/admin') ||
    path.startsWith('/shahroz') ||
    path === '/contact' ||
    path === '/about' ||
    path.startsWith('/portfolio') ||
    path.startsWith('/work') ||
    path.startsWith('/lab')
  ) {
    return null;
  }

  const pageClass = 'page-' + (path.replace('/', '').split('/')[0] || 'root');

  return (
    <aside className={`inner-experience ${pageClass} ${shifting ? 'robot-tab-shifting' : ''}`} aria-hidden="true">
      <div className="inner-model-wrapper">
        <SceneSurface model="eva" autoMobile={true} />
      </div>
    </aside>
  );
}
