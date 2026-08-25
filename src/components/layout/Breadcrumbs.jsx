import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * @param {Array<{label: string, to?: string}>} items last item is the current page
 */
const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.to && !last ? (
              <Link to={item.to} className="transition-colors hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current={last ? "page" : undefined} className="text-ink-2">
                {item.label}
              </span>
            )}
            {!last && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 rtl:rotate-180"
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
