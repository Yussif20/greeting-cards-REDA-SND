const VARIANTS = {
  primary:
    "bg-brand text-on-brand border border-transparent hover:bg-brand-strong shadow-sm",
  secondary:
    "bg-surface-2 text-ink border border-line hover:bg-surface-3",
  ghost: "bg-transparent text-ink-2 border border-transparent hover:bg-surface-3",
  danger:
    "bg-danger-soft text-danger border border-transparent hover:brightness-95",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const Button = ({
  as: Tag = "button",
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}) => (
  <Tag
    className={`inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 disabled:opacity-45 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

export default Button;
