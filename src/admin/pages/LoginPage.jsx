import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldAlert } from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import TextField from "../../components/ui/TextField.jsx";
import LanguageToggle from "../../components/ui/LanguageToggle.jsx";
import ThemeSwitcher from "../../components/ui/ThemeSwitcher.jsx";

/**
 * Sign in to /admin.
 *
 * Signing in and being an admin are separate outcomes, and the difference is
 * worth showing plainly. A correct password from someone who is not in the
 * `admins` table lands on `notAdmin` -- not on a generic failure -- because
 * that is a real state with a real remedy, and reporting it as "wrong
 * password" would send whoever hits it hunting for the wrong problem.
 *
 * The language and theme controls are here rather than only inside the signed-
 * in shell: this is the first screen an Arabic-speaking admin sees, and a
 * login page they cannot read is a poor place to first need the toggle.
 */
const LoginPage = ({ status, onSignIn, onSignOut }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: failure } = await onSignIn(email.trim(), password);
    if (failure) setError(t("admin.auth.invalid"));
    setBusy(false);
  };

  if (status === "unconfigured") {
    return (
      <Frame>
        <Notice
          title={t("admin.auth.unconfiguredTitle")}
          body={t("admin.auth.unconfiguredBody")}
        />
      </Frame>
    );
  }

  if (status === "notAdmin") {
    return (
      <Frame>
        <Notice
          title={t("admin.auth.notAdminTitle")}
          body={t("admin.auth.notAdminBody")}
          action={
            <Button variant="secondary" onClick={onSignOut}>
              {t("admin.auth.signOut")}
            </Button>
          }
        />
      </Frame>
    );
  }

  return (
    <Frame>
      <h1 className="text-center text-2xl font-bold tracking-tight text-brand-strong">
        {t("admin.title")}
      </h1>
      <p className="mt-2 mb-8 text-center text-sm text-ink-2">
        {t("admin.auth.subtitle")}
      </p>

      <form onSubmit={submit} className="panel rounded-2xl p-6">
        <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-ink">
          {t("admin.auth.email")}
        </label>
        <TextField
          id="admin-email"
          type="email"
          name="email"
          autoComplete="username"
          required
          autoFocus
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label
          htmlFor="admin-password"
          className="mt-4 mb-2 block text-sm font-medium text-ink"
        >
          {t("admin.auth.password")}
        </label>
        <TextField
          id="admin-password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="mt-6 w-full"
          disabled={busy || status === "checking"}
        >
          {(busy || status === "checking") && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {t("admin.auth.signIn")}
        </Button>
      </form>
    </Frame>
  );
};

/**
 * Centred card on the arabesque ground, with the two controls that must work
 * before anyone is signed in. Vertically centred rather than top-aligned --
 * a lone 300px form pinned to the top of a 1440px viewport reads as a page
 * that failed to finish loading.
 */
const Frame = ({ children }) => (
  <div className="bg-arabesque flex min-h-screen flex-col bg-surface">
    <div className="flex justify-end gap-2 p-4">
      <LanguageToggle />
      <ThemeSwitcher />
    </div>
    <div className="flex flex-1 items-center justify-center px-4 pb-24">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  </div>
);

const Notice = ({ title, body, action }) => (
  <div className="panel rounded-2xl p-6 text-center">
    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft text-danger">
      <ShieldAlert className="h-5 w-5" aria-hidden="true" />
    </span>
    <h1 className="text-lg font-semibold text-ink">{title}</h1>
    <p className="mt-2 text-sm text-ink-2">{body}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default LoginPage;
