import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageShell from "../components/layout/PageShell.jsx";
import Button from "../components/ui/Button.jsx";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-2xl font-bold text-ink">{t("errors.notFoundTitle")}</h1>
        <p className="mt-3 text-ink-2">{t("errors.notFoundBody")}</p>
        <Button as={Link} to="/" variant="primary" className="mt-7">
          {t("errors.backHome")}
        </Button>
      </div>
    </PageShell>
  );
};

export default NotFoundPage;
