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
  const [thoughtText, setThoughtText] = useState('Greetings, I am Hash. We engineer secure software and perform deep audits. Submit your brief below.');

  // Listen to form lifecycle events
  useEffect(() => {
    const onSubmitting = () => {
      setMood('submitting');
      setThoughtText('Encrypting and transmitting your brief to Shahroz and the team...');
    };

    const onSuccess = (e: Event) => {
      setMood('success');
      const detail = (e as CustomEvent).detail;
      const ref = detail?.reference ? ` Ref #${detail.reference}.` : '';
      setThoughtText(`Thank you. Your project brief has been received securely.${ref} Shahroz will respond within 24 hours.`);
    };

    const onError = (e: Event) => {
      setMood('error');
      const detail = (e as CustomEvent).detail;
      const msg = detail?.error || 'Please review your details and send again.';
      setThoughtText(`Notice: ${msg}`);
      setTimeout(() => {
        setMood('idle');
        setThoughtText('Greetings, I am Hash. We engineer secure software and perform deep audits. Submit your brief below.');
      }, 6000);
    };

    const onBotMood = (e: Event) => {
      const m = (e as CustomEvent<{ mood: 'idle' | 'happy' | 'angry' }>).detail?.mood;
      if (m === 'angry') {
        setMood('angry');
        setThoughtText('Security boundary engaged. Integrity scan in progress.');
      } else if (m === 'happy') {
        setMood('happy');
        setThoughtText('Ready to build high-availability software? Hash Decode engineers are ready to assist.');
      } else if (m === 'idle') {
        setMood('idle');
        setThoughtText('Greetings, I am Hash. We engineer secure software and perform deep audits. Submit your brief below.');
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

      {/* Unified Bot Speech Card with pointer to robot head */}
      <div className={`bot-speech-card mood-${mood}`}>
        <p className="bot-speech-text">{thoughtText}</p>
        <span className="bot-speech-hint">
          {mood === 'angry' ? '⚡ Security posture engaged' : mood === 'happy' ? '✨ Hash online' : 'Drag to rotate · Hold 4s for security mode'}
        </span>
      </div>

      {/* 3D Bot Specimen Surface */}
      <div className="teleport-model-anchor">
        <SceneSurface model="eva" autoMobile={true} />
      </div>
    </div>
  );
}

