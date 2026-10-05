"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FadingScrollRowProps = {
  children: ReactNode;
  className?: string;
};

// A horizontally scrolling list whose edges fade out only where there is more to scroll.
export function FadingScrollRow({ children, className }: FadingScrollRowProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateFades = () => {
      const maxScroll = list.scrollWidth - list.clientWidth;
      // 1px of slack because browsers can report fractional scroll positions.
      setCanScrollLeft(list.scrollLeft > 1);
      setCanScrollRight(list.scrollLeft < maxScroll - 1);
    };

    // Runs once right away, then again whenever the row changes size.
    const resizeObserver = new ResizeObserver(updateFades);
    resizeObserver.observe(list);
    list.addEventListener("scroll", updateFades, { passive: true });

    // Cleanup: stop listening when the component leaves the page.
    return () => {
      resizeObserver.disconnect();
      list.removeEventListener("scroll", updateFades);
    };
  }, []);

  return (
    <ul
      ref={listRef}
      className={cn(
        "scrollbar-subtle fade-x overflow-x-auto",
        canScrollLeft && "[--fade-left:4rem]",
        canScrollRight && "[--fade-right:4rem]",
        className,
      )}
    >
      {children}
    </ul>
  );
}
