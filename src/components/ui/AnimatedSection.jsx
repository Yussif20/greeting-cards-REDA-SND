import { useInView } from "react-intersection-observer";

/**
 * Scroll reveal. The old version accepted a `delay` prop from three callers and
 * silently ignored it; here it is honoured.
 */
const AnimatedSection = ({ delay = 0, className = "", children }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
