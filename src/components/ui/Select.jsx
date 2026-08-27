import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Dropdown built from a button and a listbox rather than a native <select>.
 *
 * A native <select> draws its option list through the operating system: the
 * popup ignores our surfaces, radii, accent and dark theme completely, so on a
 * card-styled page it arrives as a grey system menu. Everything here is our own
 * markup, so the open list matches the closed control and the rest of the app.
 *
 * It follows the WAI-ARIA combobox pattern: focus stays on the trigger the
 * whole time and the highlighted row is tracked with aria-activedescendant.
 * The keyboard behaviours a native select would have given us for free --
 * arrows, Home/End, Escape, type-to-jump -- are reimplemented below, because
 * dropping them is the usual cost of a custom picker and it is a real one.
 *
 * Options are data rather than <option> children: a row is a label plus an
 * optional hint, which markup children could not carry.
 *
 * @param {Array<{value: string, label: string, hint?: string, disabled?: boolean}>} options
 * @param {string} [labelId] id of the visible label, for the accessible name
 */

/**
 * Matches max-h-80 on the panel; used to decide whether to drop up. Sized so
 * the longest list we have -- the seven brands -- fits without scrolling.
 */
const PANEL_MAX_H = 320;

/** How long consecutive keystrokes count as one type-to-jump query. */
const TYPEAHEAD_MS = 700;

const Select = ({ id, value, options, onChange, labelId, className = "" }) => {
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const listId = `${rootId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const typeahead = useRef({ query: "", at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Pointerdown rather than click: closing on mousedown matches how every other
  // menu on the platform behaves, and it fires before a click on whatever is
  // underneath.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted row visible when arrowing through a scrolled list.
  useLayoutEffect(() => {
    if (!open) return;
    rootRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  /** Next selectable index in `delta` direction, wrapping and skipping disabled. */
  const step = (from, delta) => {
    const n = options.length;
    if (n === 0) return -1;
    for (let i = 1; i <= n; i += 1) {
      const next = (((from + delta * i) % n) + n) % n;
      if (!options[next].disabled) return next;
    }
    return from;
  };

  const openList = () => {
    // Flip the panel above the trigger only when it genuinely will not fit
    // below and there is more room above -- near the foot of a long page.
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < PANEL_MAX_H + 12 && rect.top > below);
    }
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : step(-1, 1));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (index) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== value) onChange(option.value);
    close();
  };

  const jumpToTyped = (key) => {
    if (key.length !== 1) return;
    const now = Date.now();
    const state = typeahead.current;
    state.query = now - state.at > TYPEAHEAD_MS ? key : state.query + key;
    state.at = now;

    const query = state.query.toLowerCase();
    const match = options.findIndex(
      (o) => !o.disabled && String(o.label).toLowerCase().startsWith(query),
    );
    if (match >= 0) setActiveIndex(match);
  };

  const handleKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => step(i, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => step(i, -1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(step(-1, 1));
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(step(options.length, -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        // Let focus move on; just do not leave a menu hanging open behind it.
        setOpen(false);
        break;
      default:
        jumpToTyped(e.key);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={rootId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${rootId}-option-${activeIndex}` : undefined
        }
        // Both ids: the field's label, then the trigger's own text, so the
        // control announces as "Brand, REDA Green" rather than either half.
        aria-labelledby={labelId ? `${labelId} ${rootId}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex h-11 w-full items-center rounded-xl border bg-surface-2 pe-10 ps-3.5 text-sm text-ink transition-colors duration-200 ${
          open ? "border-brand" : "border-line hover:border-ink-3"
        }`}
      >
        <span className="min-w-0 flex-1 truncate text-start">{selected?.label ?? ""}</span>
        <ChevronDown
          className={`pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          // Under the sticky header (z-40) so a dropdown scrolled to the top of
          // the viewport slides beneath it rather than over it.
          className={`absolute z-30 max-h-80 w-full overflow-y-auto rounded-xl border border-line bg-surface-2 p-1.5 shadow-[var(--shadow-card)] ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            const isActive = i === activeIndex;

            return (
              <li
                key={option.value}
                id={`${rootId}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                data-active={isActive || undefined}
                onMouseMove={() => !option.disabled && setActiveIndex(i)}
                onClick={() => choose(i)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  option.disabled
                    ? "cursor-not-allowed text-ink-3"
                    : `cursor-pointer text-ink ${isActive ? "bg-surface-3" : ""}`
                }`}
              >
                <Check
                  className={`h-4 w-4 shrink-0 text-accent ${isSelected ? "" : "opacity-0"}`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${isSelected ? "font-medium" : ""}`}>
                    {option.label}
                  </span>
                  {/* Second line rather than a trailing note: the reason a row is
                      unavailable is a sentence, and it will not sit beside a
                      label in a control this narrow. */}
                  {option.hint && (
                    <span className="mt-0.5 block text-xs leading-snug text-ink-3">
                      {option.hint}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
