'use client';
import { useEffect, useState } from 'react';

export default function TypingSecure() {
  const fullText = 'Secure it.';
  const [text, setText] = useState('Secure it.');
  const [index, setIndex] = useState(fullText.length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (index < fullText.length) {
        timer = setTimeout(() => {
          setText(fullText.slice(0, index + 1));
          setIndex(prev => prev + 1);
        }, 70); // 70ms per character
      } else {
        // Hold on "Secure it." for 2.5 seconds
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    } else {
      if (index > 0) {
        timer = setTimeout(() => {
          setText(fullText.slice(0, index - 1));
          setIndex(prev => prev - 1);
        }, 45);
      } else {
        setIsDeleting(false);
      }
    }

    return () => clearTimeout(timer);
  }, [index, isDeleting]);

  return (
    <span className="typing-secure-word" aria-label="Secure it.">
      <span className="typing-letters">{text}</span>
      <span className="typing-cursor" aria-hidden="true">|</span>
    </span>
  );
}

