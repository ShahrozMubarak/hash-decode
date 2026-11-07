'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import SceneSurface from './SceneSurface';

interface Props {
  className?: string;
}

export default function TeleportBot({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [teleported, setTeleported] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'angry' | 'success' | 'error' | 'submitting'>('idle');
  const [thoughtText, setThoughtText] = useState('Greetings, I am Hash. Hash Decode develops secure, mission-critical software and conducts deep security audits. Submit your brief below to initiate a review.');

  // Listen to form lifecycle events
  useEffect(() => {
    const onSubmitting = () => {
      setMood('submitting');
      setThoughtText('Encrypting and transmitting your project brief to Shahroz and the Hash Decode team...');
    };

    const onSuccess = (e: Event) => {
      setMood('success');
      const detail = (e as CustomEvent).detail;
      const ref = detail?.reference ? ` Reference #${detail.reference}.` : '';
      setThoughtText(`Thank you. Your project brief has been received securely.${ref} Shahroz will review your requirements and respond within 24 hours.`);
    };

    const onError = (e: Event) => {
      setMood('error');
      const detail = (e as CustomEvent).detail;
      const msg = detail?.error || 'Please review your email and project details, then submit again.';
      setThoughtText(`Notice: ${msg}`);
      setTimeout(() => {
        setMood('idle');
        setThoughtText('Greetings, I am Hash. Hash Decode develops secure, mission-critical software and conducts deep security audits. Submit your brief below to initiate a review.');
      }, 6000);
    };

    const onBotMood = (e: Event) => {
      const m = (e as CustomEvent<{ mood: 'idle' | 'happy' | 'angry' }>).detail?.mood;
      if (m === 'angry') {
        setMood('angry');
        setThoughtText('Security boundary engaged. Integrity scan in progress.');
      } else if (m === 'happy') {
        setMood('happy');
        setThoughtText('Ready to build high-availability software or verify system security? Hash Decode engineers are ready to assist.');
      } else if (m === 'idle') {
        setMood('idle');
        setThoughtText('Greetings, I am Hash. Hash Decode develops secure, mission-critical software and conducts deep security audits. Submit your brief below to initiate a review.');
      }
    };

    window.addEventListener('hd:form-submitting', onSubmitting);
    window.addEventListener('hd:form-success', onSuccess);
    window.addEventListener('hd:form-error', onError);
    window.addEventListener('hd:bot-mood', onBotMood);

    return () => {
      window.removeEventListener('hd:form-submitting', onSubmitting);
      window.removeEventListener('hd:form-success', onSuccess);
      window.removeEventListener('hd:form-error', onError);
      window.removeEventListener('hd:bot-mood', onBotMood);
    };
  }, []);

  // Teleportation intersection trigger
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !teleported) {
          setIsGlitching(true);
          const t1 = setTimeout(() => {
            setTeleported(true);
            setIsGlitching(false);
          }, 650);
          return () => clearTimeout(t1);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [teleported]);

  const handlePointerEnter = useCallback(() => {
    if (mood === 'success' || mood === 'submitting') return;
    setMood('happy');
    setThoughtText('Ready to build high-availability software or verify system security? Hash Decode engineers are ready to assist.');
    window.dispatchEvent(new CustomEvent('hd:bot-mood', { detail: { mood: 'happy' } }));
  }, [mood]);

  const handlePointerLeave = useCallback(() => {
    if (mood === 'success' || mood === 'submitting') return;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setMood('idle');
    setThoughtText('Greetings, I am Hash. Hash Decode develops secure, mission-critical software and conducts deep security audits. Submit your brief below to initiate a review.');
    window.dispatchEvent(new CustomEvent('hd:bot-mood', { detail: { mood: 'idle' } }));
  }, [mood]);

  // Hold for 4 full seconds to engage security / angry mode
  const handlePointerDown = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setMood('angry');
      setThoughtText('Security boundary engaged. Integrity scan in progress.');
      window.dispatchEvent(new CustomEvent('hd:bot-mood', { detail: { mood: 'angry' } }));
      setTimeout(() => {
        setMood('idle');
        setThoughtText('Greetings, I am Hash. Hash Decode develops secure, mission-critical software and conducts deep security audits. Submit your brief below to initiate a review.');
        window.dispatchEvent(new CustomEvent('hd:bot-mood', { detail: { mood: 'idle' } }));
      }, 5000);
    }, 4000);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`teleport-bot-stage ${teleported ? 'is-materialized' : ''} ${isGlitching ? 'is-glitching' : ''} mood-${mood} ${className}`}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Teleportation Scanline Holographic Glitch Flash */}
      <div className="teleport-glitch-overlay" aria-hidden="true">
        <div className="teleport-slice slice-1" />
        <div className="teleport-slice slice-2" />
        <div className="teleport-slice slice-3" />
        <div className="teleport-ring" />
      </div>

      {/* Hand-Drawn Sketchy Thought/Speech Bubble (Matching Image 1) */}
      <div className={`teleport-thought-bubble bubble-${mood}`}>
        <svg
          viewBox="0 0 320 200"
          className="bubble-hand-drawn-svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Hand-drawn organic multi-stroke wobbly bubble matching Image 1 */}
          <path
            d="M 45 35
               C 120 18, 220 18, 280 38
               C 310 50, 312 110, 285 130
               C 260 148, 180 152, 100 148
               C 65 146, 42 165, 25 180
               C 32 155, 30 140, 25 125
               C 12 95, 15 50, 45 35 Z"
            fill="#ffffff"
            stroke="#0A2540"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Second overlapping sketchy contour for hand-drawn art effect */}
          <path
            d="M 47 38
               C 122 22, 218 22, 278 40
               C 306 53, 308 108, 282 128
               C 258 145, 178 150, 102 146
               C 68 144, 45 162, 28 176
               C 34 153, 32 138, 27 127
               C 15 97, 18 53, 47 38 Z"
            fill="none"
            stroke="rgba(10, 37, 64, 0.45)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Quotation Marks: Opening double quotes top-left */}
          <text x="65" y="65" className="bubble-quote-glyph">“</text>
          {/* Quotation Marks: Closing double quotes bottom-right */}
          <text x="245" y="135" className="bubble-quote-glyph">”</text>
        </svg>

        <div className="bubble-text-content">
          <p>{thoughtText}</p>
          <span className="bubble-tap-hint">
            {mood === 'angry' ? '⚡ Security posture engaged' : mood === 'happy' ? '✨ Hash online' : 'Drag to rotate · Hold 4s for security mode'}
          </span>
        </div>
      </div>

      {/* 3D Bot Specimen Surface */}
      <div className="teleport-model-anchor">
        <SceneSurface model="eva" autoMobile={true} />
      </div>
    </div>
  );
}

