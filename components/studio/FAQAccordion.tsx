'use client';

import { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const defaultFAQs: FAQItem[] = [
  {
    question: 'How long does a typical project take?',
    answer:
      'We set milestones after reviewing your requirements and dependencies. If you have a launch date, include it in your brief so we can identify what fits the first release.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'We price the agreed scope. The number of workflows, integrations and review requirements all affect the quote. Our estimator gives you a starting range before you send a brief.',
  },
  {
    question: 'Which technologies do you use?',
    answer:
      'We build with modern, battle-tested technologies including React, Next.js, TypeScript, Node.js, Python, and Cloudflare, pairing them with robust databases and Zero Trust security architectures.',
  },
  {
    question: 'How does a security audit work?',
    answer:
      'Share the stack, the issue and who can authorise access. We agree the review boundaries before testing and provide findings your team can act on.',
  },
  {
    question: 'Who owns the code when the project ends?',
    answer:
      'We agree source ownership and third-party licences in the proposal. Handover covers repository access, deployment instructions and the accounts you need to run the software.',
  },
];

export default function FAQAccordion({ items = defaultFAQs }: { items?: FAQItem[] }) {
  // One open at a time; null means all closed
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="faq-accordions-block" role="region" aria-label="Frequently Asked Questions">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const triggerId = `faq-trigger-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div
            key={item.question}
            className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
          >
            <button
              id={triggerId}
              type="button"
              className="faq-accordion-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span className="faq-accordion-q">{item.question}</span>
              <span className="faq-accordion-plus" aria-hidden="true">
                +
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`faq-accordion-body ${isOpen ? 'is-open' : ''}`}
            >
              <div className="faq-accordion-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
