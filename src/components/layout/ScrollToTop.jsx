import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset scroll on navigation. Very noticeable on the longer redesigned pages. */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
