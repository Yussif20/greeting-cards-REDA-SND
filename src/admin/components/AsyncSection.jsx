import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle } from "lucide-react";

import Button from "../../components/ui/Button.jsx";

/**
 * The three non-content outcomes of a read, rendered once instead of in every
 * list page.
 *
 * The error branch shows the actual message rather than a friendly
 * substitute. This surface has one operator, the failures are almost always
 * either "not signed in any more" or a row level security refusal, and both
 * are diagnosable from the real text and invisible behind "Something went
 * wrong."
 */
const AsyncSection = ({ state, error, onRetry, empty, children }) => {
  const { t } = useTranslation();

  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-ink-2">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t("admin.loading")}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="panel rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-danger">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {t("admin.errors.loadFailed")}
        </div>
        <p dir="ltr" className="mt-2 font-mono text-xs break-words text-ink-3">
          {error?.message}
        </p>
        {onRetry && (
          <Button size="sm" variant="secondary" className="mt-4" onClick={onRetry}>
            {t("admin.retry")}
          </Button>
        )}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="panel rounded-2xl p-10 text-center text-sm text-ink-2">{empty}</div>
    );
  }

  return children;
};

export default AsyncSection;
