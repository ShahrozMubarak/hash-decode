'use client';

import { useState, useTransition, useMemo } from 'react';
import type { Project } from '@/lib/studio-data';
import { WorkCard } from './Work';

export default function WorkShowcase({ projects }: { projects: Project[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPending, startTransition] = useTransition();

  // Extract unique categories from real data
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  const handleSelect = (category: string) => {
    startTransition(() => {
      setSelectedCategory(category);
    });
  };

  return (
    <div className="work-showcase-wrapper">
      {/* Filter Chips Bar with Sliding Indicator */}
      <div className="work-filter-bar" role="tablist" aria-label="Project category filters">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              type="button"
              aria-selected={isActive}
              className={`work-filter-chip ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSelect(cat)}
            >
              <span>{cat}</span>
              {isActive && (
                <span className="filter-sliding-pill" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filtered Project Cards Grid */}
      <div
        className={`work-grid ${isPending ? 'is-filtering' : ''}`}
        aria-live="polite"
      >
        {filteredProjects.map((p, i) => (
          <div
            key={p.slug}
            className="work-grid-item"
            style={{
              animationDelay: `${i * 60}ms`,
            }}
          >
            <WorkCard project={p} index={i} />
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="work-empty-state">
            <p>No projects currently published in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
