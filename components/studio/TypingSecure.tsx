'use client';

import { useState, useEffect } from 'react';

const words = ['Protect.', 'Secure.', 'Scale.', 'Deliver.'];

export default function TypingSecure() {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (text.length < currentWord.length) {
        timeout = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, 90);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 45);
      } else {
        setIsDeleting(false);
        setWordIdx((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIdx]);

  return (
    <span
      className="hero-typing-word hd-accent-navy hero-tag-last-word"
      style={{ color: '#0071e3', fontWeight: 800 }}
    >
      {text}
      <span
        className="typewriter-cursor"
        aria-hidden="true"
        style={{ color: '#0071e3', fontWeight: 400 }}
      >
        |
      </span>
    </span>
  );
}
