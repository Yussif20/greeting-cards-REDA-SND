import { ChevronDown } from "lucide-react";

const Select = ({ className = "", children, ...props }) => (
  <div className="relative">
    <select
      className={`h-11 w-full appearance-none rounded-xl border border-line bg-surface-2 pe-10 ps-3.5 text-sm text-ink transition-colors duration-200 hover:border-ink-3 focus:border-brand focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
      aria-hidden="true"
    />
  </div>
);

export default Select;
