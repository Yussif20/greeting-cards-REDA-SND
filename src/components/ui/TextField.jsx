const TextField = ({ className = "", ...props }) => (
  <input
    type="text"
    className={`h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-sm text-ink transition-colors duration-200 placeholder:text-ink-3 hover:border-ink-3 focus:border-brand focus:outline-none ${className}`}
    {...props}
  />
);

export default TextField;
