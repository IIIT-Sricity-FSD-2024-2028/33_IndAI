import { useEffect, useRef, useState } from "react";
// Scroll animation is an effect; React owns the visible class and rendered content.
export default function Reveal({ children, className = "", ...props }) {
  const ref = useRef(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px 40px 0px" },
      );
      observer.observe(ref.current);
    } catch {
      setVisible(true);
    }
    return () => observer?.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className + (visible ? " visible" : "")}
      {...props}
    >
      {children}
    </div>
  );
}
