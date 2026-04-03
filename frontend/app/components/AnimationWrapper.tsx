'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface AnimationWrapperProps {
  children: ReactNode;
  type?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'zoom' | 'bounce' | 'stagger';
  delay?: number;
  duration?: number;
  className?: string;
  triggerOnScroll?: boolean;
  staggerIndex?: number;
  staggerDelay?: number;
}

/**
 * Reusable animation wrapper component that applies smooth animations to children
 * Supports multiple animation types with configurable delays and durations
 */
export default function AnimationWrapper({
  children,
  type = 'fadeIn',
  delay = 0,
  duration = 600,
  className = '',
  triggerOnScroll = false,
  staggerIndex = 0,
  staggerDelay = 100,
}: AnimationWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!triggerOnScroll);

  useEffect(() => {
    if (!triggerOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [triggerOnScroll]);

  const animationClasses: Record<string, string> = {
    fadeIn: 'animate-fade-in-smooth',
    slideUp: 'animate-slide-in-up',
    slideDown: 'animate-slide-in-down',
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',
    scale: 'animate-fade-in-scale',
    zoom: 'animate-scale-up',
    bounce: 'animate-bounce-soft',
    stagger: 'animate-stagger-fade-in',
  };

  const effectiveDelay = type === 'stagger' ? delay + staggerIndex * staggerDelay : delay;

  return (
    <div
      ref={ref}
      className={`${isVisible ? animationClasses[type] : 'opacity-0'} ${className}`}
      style={{
        animationDelay: `${effectiveDelay}ms`,
        animationDuration: `${duration}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
