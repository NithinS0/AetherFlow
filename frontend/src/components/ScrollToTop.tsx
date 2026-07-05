import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Always start at the top for a premium navigation experience
    // Firing synchronously before the next paint prevents vertical layout shifts
    // during Framer Motion page transitions.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
