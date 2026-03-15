import { useState, useEffect, useRef } from "react";

export function useScrollOverflow(dependency) {
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

  const checkOverflow = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setCanScroll(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [dependency]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const move = direction === "left" ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: move, behavior: "smooth" });
    }
  };

  return { scrollRef, canScroll, scroll };
}