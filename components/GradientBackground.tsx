'use client';

import { useEffect, useRef } from 'react';
import styles from './GradientBackground.module.css';

export function GradientBackground() {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const curX = useRef(0);
  const curY = useRef(0);
  const tgX = useRef(0);
  const tgY = useRef(0);

  useEffect(() => {
    const move = () => {
      if (!interactiveRef.current) return;
      
      curX.current += (tgX.current - curX.current) / 20;
      curY.current += (tgY.current - curY.current) / 20;
      
      interactiveRef.current.style.transform = `translate(${Math.round(curX.current)}px, ${Math.round(curY.current)}px)`;
      requestAnimationFrame(move);
    };

    const handleMouseMove = (event: MouseEvent) => {
      tgX.current = event.clientX;
      tgY.current = event.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Prevent scrolling while touching
      event.preventDefault();
      
      // Get the first touch point
      const touch = event.touches[0];
      tgX.current = touch.clientX;
      tgY.current = touch.clientY;
    };

    // Add both mouse and touch event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Start the animation loop
    move();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className={styles.gradientBg}>
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur-sm" />
            <feColorMatrix
              in="blur-sm"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={styles.gradientsContainer}>
        <div className={styles.g1}></div>
        <div className={styles.g2}></div>
        <div className={styles.g3}></div>
        <div className={styles.g4}></div>
        <div className={styles.g5}></div>
        <div className={styles.g6}></div>
        <div className={styles.g7}></div>
        <div ref={interactiveRef} className={styles.interactive}></div>
      </div>
    </div>
  );
} 