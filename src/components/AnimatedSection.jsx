import React from 'react';
import { useInView } from 'react-intersection-observer';

// AnimatedSection Wrapper Component
const AnimatedSection = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animation triggers only once when entering view
    threshold: 0.2, // Triggers when 20% of the section is visible
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
