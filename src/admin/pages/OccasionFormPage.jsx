import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle, Save } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import Select from "../../components/ui/Select.jsx";
import TextField from "../../components/ui/TextField.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import OccasionCard from "../../components/occasions/OccasionCard.jsx";
import { deriveTheme } from "../../lib/theme/deriveTheme.js";
import { BUILT_IN } from "../../data/fonts.js";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import BilingualField from "../components/BilingualField.jsx";
import IconPicker from "../components/IconPicker.jsx";
import Dropzone from "../components/Dropzone.jsx";
import AsyncSection from "../components/AsyncSection.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { listFonts, listOccasions } from "../lib/api.js";
import { processCover, processHero, ImageError } from "../lib/images.js";
import { uploadBrandCover, uploadHero } from "../lib/storage.js";
import { createOccasion, updateOccasion } from "../lib/mutations.js";
import { isLucideIcon } from "../../components/occasions/lucideIcons.js";
import { BRANDS } from "../../data/brands.js";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CARD_FONT = "__card__";

const load = async () => {
  const [occasions, fonts] = await Promise.all([listOccasions(), listFonts()]);
  return { occasions, fonts };
};

const BLANK = {
  slug: "",
  order: 99,
  enabled: true,
  status: "draft",
  title: { en: "", ar: "" },
  shortTitle: { en: "", ar: "" },
  tagline: { en: "", ar: "" },
  edition: null,
  icon: "lucide:Sparkles",
  cardsDir: null,
  artStatus: "final",
  placeholderSource: null,
  defaultFontId: "cairo",
  brandCovers: {},
  hero: {
    base: "",
    width: 1672,
    height: 941,
    focal: "50% 50%",
    formats: ["webp", "jpg"],
    widths: [760, 1520],
    alt: { en: "", ar: "" },
  },
};

const OccasionFormPage = () => {
  const { slug } = useParams();
  const { state, data, error, reload } = useAsync(load);

  return (
    <AsyncSection state={state} error={error} onRetry={reload} empty={null}>
      {data ? <Form all={data.occasions} fonts={data.fonts} slug={slug} /> : null}
    </AsyncSection>
  );
};

const Form = ({ all, fonts, slug }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const existing = slug ? all.find((o) => o.slug === slug) : null;
  const isNew = !slug;

  // brandCovers is defaulted rather than trusted: an occasion row read from a
  // database that has not had 0007_brand_covers.sql applied carries no such key,
  // and every write below would then spread `undefined` into the payload.
  const [draft, setDraft] = useState(() =>
    existing
      ? { ...structuredClone(existing), brandCovers: structuredClone(existing.brandCovers ?? {}) }
      : structuredClone(BLANK),
  );
  const [accents, setAccents] = useState(() => ({
    light: existing?.theme?.light?.accent ?? "#0F5F4A",
    dark: existing?.theme?.dark?.accent ?? "#4FBF85",
  }));
  const [busy, setBusy] = useState(null);
  const [failure, setFailure] = useState(null);

  const patch = (fields) => setDraft((d) => ({ ...d, ...fields }));
  const patchHero = (fields) => setDraft((d) => ({ ...d, hero: { ...d.hero, ...fields } }));

  // Removing DELETES the key rather than writing null. The public side reads
  // `covers?.[id]?.src ?? firstCard`, which a null would satisfy just as well --
  // but the stored map is what an admin reads back next year, and "this company
  // has no cover" should not be spelled as an entry saying so.
  const patchCover = (brandId, cover) =>
    setDraft((d) => {
      const brandCovers = { ...d.brandCovers };
      if (cover) brandCovers[brandId] = cover;
      else delete brandCovers[brandId];
      return { ...d, brandCovers };
    });

  // Derived rather than stored as ten separate inputs: accentSoft, onAccent and
  // the two scrim stops are consequences of the accent, not free choices, and
  // asking an admin for ten hex codes is asking them to maintain a colour
  // system by hand.
  const theme = useMemo(() => deriveTheme(accents.light, accents.dark), [accents]);

  // Shaped exactly like a registry occasion, so the preview is the real tile
  // component rather than an approximation of it.
  const preview = useMemo(() => ({ ...draft, theme }), [draft, theme]);

  // The slug is the primary key, is embedded in every design id, and is in
  // shared URLs and localStorage keys. It can be chosen once and then never
  // again without orphaning artwork.
  const slugLocked = !isNew;

  const takeHero = async (file) => {
    setFailure(null);
    try {
      setBusy("hero");
      const processed = await processHero(file);
      const { base } = await uploadHero({
        occasionSlug: draft.slug || "unassigned",
        variants: processed.variants,
        original: processed.original,
      });
      patchHero({
        base,
        width: processed.width,
        height: processed.height,
        formats: processed.formats,
        widths: processed.widths,
      });
    } catch (err) {
      setFailure(
        err instanceof ImageError ? t(`admin.upload.errors.${err.code}`) : err.message,
      );
    } finally {
      setBusy(null);
    }
  };

  // The same shape as takeHero: processed and stored on drop, recorded on the
  // draft, and written to the row only when the admin presses Save. So a cover
  // uploaded and then abandoned costs an orphaned object in the bucket and
  // nothing else -- which is the trade every upload here already makes.
  const takeCover = async (brandId, file) => {
    setFailure(null);
    try {
      setBusy(`cover:${brandId}`);
      const processed = await processCover(file);
      const { src } = await uploadBrandCover({
        occasionSlug: draft.slug || "unassigned",
        brandId,
        cover: processed.cover,
        original: processed.original,
      });
      patchCover(brandId, { src, width: processed.width, height: processed.height });
    } catch (err) {
      setFailure(
        err instanceof ImageError ? t(`admin.upload.errors.${err.code}`) : err.message,
      );
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setFailure(null);
    setBusy("save");
    try {
      const payload = { ...draft, theme };
      if (isNew) {
        await createOccasion({ ...payload, slug: slugify(draft.slug) });
      } else {
        await updateOccasion(slug, payload);
      }
      navigate("/admin/occasions");
    } catch (err) {
      setFailure(err.message);
      setBusy(null);
    }
  };

  const complete =
    draft.slug &&
    draft.title.en &&
    draft.title.ar &&
    draft.shortTitle.en &&
    draft.shortTitle.ar &&
    draft.hero.base;

  const focal = draft.hero.focal.split(" ").map((v) => Number.parseInt(v, 10));
  const fontOptions = [
    { value: CARD_FONT, label: t("admin.occasion.cardFont") },
    ...BUILT_IN.map((font) => ({ value: font.id, label: loc(font.label, lang) })),
    ...fonts.map((font) => ({
      value: font.id,
      label: loc(font.label, lang),
      hint: t(`admin.status.${font.status}`),
      disabled: font.status !== "published",
    })),
  ];

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-ink">
            {t(isNew ? "admin.occasion.newTitle" : "admin.occasion.editTitle")}
            {!isNew && <StatusPill status={draft.status} />}
          </h1>
          <p className="mt-1 text-sm text-ink-2">{t("admin.occasion.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/admin/occasions")}>
            {t("admin.upload.cancel")}
          </Button>
          <Button variant="primary" onClick={save} disabled={!complete || Boolean(busy)}>
            {busy === "save" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {t(isNew ? "admin.occasion.create" : "admin.occasion.save")}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-line bg-surface-2 p-5">
            <div>
              <label htmlFor="slug" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.occasion.slug")}
              </label>
              <TextField
                id="slug"
                dir="ltr"
                value={draft.slug}
                disabled={slugLocked}
                placeholder="ramadan"
                onChange={(e) => patch({ slug: slugify(e.target.value) })}
              />
              <p className="mt-1.5 text-xs text-ink-3">
                {t(slugLocked ? "admin.occasion.slugLocked" : "admin.occasion.slugHint", {
                  slug: draft.slug || "ramadan",
                })}
              </p>
            </div>

            <BilingualField
              labelKey="admin.occasion.title"
              value={draft.title}
              onChange={(title) => patch({ title })}
              required
            />
            <BilingualField
              labelKey="admin.occasion.shortTitle"
              value={draft.shortTitle}
              onChange={(shortTitle) => patch({ shortTitle })}
              required
            />
            <BilingualField
              labelKey="admin.occasion.tagline"
              value={draft.tagline}
              onChange={(tagline) => patch({ tagline })}
              multiline
            />

            <div>
              <label
                htmlFor="occasion-default-font"
                className="mb-2 block text-sm font-medium text-ink"
              >
                {t("admin.occasion.defaultFont")}
              </label>
              <Select
                id="occasion-default-font"
                value={draft.defaultFontId ?? CARD_FONT}
                options={fontOptions}
                onChange={(fontId) =>
                  patch({ defaultFontId: fontId === CARD_FONT ? null : fontId })
                }
              />
              <p className="mt-1.5 text-xs text-ink-3">
                {t("admin.occasion.defaultFontHint")}
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-line bg-surface-2 p-5">
            <p className="text-sm font-medium text-ink">{t("admin.occasion.hero")}</p>

            {busy === "hero" ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t("admin.upload.busy.processing")}
              </div>
            ) : (
              <Dropzone onFile={takeHero} />
            )}

            {draft.hero.base && (
              <p dir="ltr" className="truncate font-mono text-[11px] text-ink-3">
                {draft.hero.base} · {draft.hero.width}×{draft.hero.height} ·{" "}
                {draft.hero.formats.join("/")}
              </p>
            )}

            <BilingualField
              labelKey="admin.occasion.heroAlt"
              value={draft.hero.alt}
              onChange={(alt) => patchHero({ alt })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {["x", "y"].map((axis, index) => (
                <div key={axis}>
                  <label
                    htmlFor={`focal-${axis}`}
                    className="mb-1 block text-xs text-ink-3"
                  >
                    {t(`admin.occasion.focal${axis.toUpperCase()}`)} {focal[index]}%
                  </label>
                  <input
                    id={`focal-${axis}`}
                    type="range"
                    min="0"
                    max="100"
                    value={focal[index]}
                    onChange={(e) => {
                      const next = [...focal];
                      next[index] = Number(e.target.value);
                      patchHero({ focal: `${next[0]}% ${next[1]}%` });
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-3">{t("admin.occasion.focalHint")}</p>
          </section>

          {/* One picture per company, for this occasion's brand chooser.
              Deliberately not per season: the cover stands for the company, and
              tying it to a year would mean refilling all seven every time a
              season is added. A company with no cover keeps showing its first
              card, so a half-filled occasion has no half-broken tiles. */}
          <section className="space-y-4 rounded-2xl border border-line bg-surface-2 p-5">
            <div>
              <p className="text-sm font-medium text-ink">{t("admin.occasion.brandCovers")}</p>
              <p className="mt-1 text-xs text-ink-3">{t("admin.occasion.brandCoversHint")}</p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {BRANDS.map((brand) => {
                const cover = draft.brandCovers[brand.id] ?? null;
                const uploading = busy === `cover:${brand.id}`;

                return (
                  <li key={brand.id} className="space-y-2 rounded-xl border border-line p-3">
                    {/* Trade names stay English in both languages -- see the
                        note in src/data/brands.js. */}
                    <p className="truncate text-sm font-medium text-ink">
                      <bdi dir="ltr">{brand.name}</bdi>
                    </p>

                    {uploading ? (
                      <div className="flex aspect-4/3 items-center justify-center gap-2 rounded-lg bg-surface-3 text-xs text-ink-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {t("admin.upload.busy.processing")}
                      </div>
                    ) : cover ? (
                      <img
                        src={cover.src}
                        alt=""
                        className="aspect-4/3 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <p className="text-xs text-ink-3">{t("admin.occasion.coverFallback")}</p>
                    )}

                    <Dropzone
                      compact
                      disabled={Boolean(busy)}
                      // The brand is in the label, not just in the heading
                      // above it: seven buttons reading "Choose a picture" are
                      // seven buttons a screen reader cannot tell apart.
                      label={t(
                        cover ? "admin.occasion.coverReplace" : "admin.occasion.coverChoose",
                        { name: brand.name },
                      )}
                      onFile={(file) => takeCover(brand.id, file)}
                    />

                    {cover && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={Boolean(busy)}
                        onClick={() => patchCover(brand.id, null)}
                      >
                        {t("admin.occasion.coverRemove")}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-4 rounded-2xl border border-line bg-surface-2 p-5">
            <IconPicker
              value={draft.icon}
              onChange={(icon) => patch({ icon })}
              disabled={Boolean(draft.icon) && !isLucideIcon(draft.icon)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {["light", "dark"].map((mode) => (
                <div key={mode}>
                  <label
                    htmlFor={`accent-${mode}`}
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    {t(`admin.occasion.accent.${mode}`)}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`accent-${mode}`}
                      type="color"
                      value={accents[mode]}
                      onChange={(e) =>
                        setAccents((a) => ({ ...a, [mode]: e.target.value.toUpperCase() }))
                      }
                      className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-transparent p-1"
                    />
                    <TextField
                      dir="ltr"
                      value={accents[mode]}
                      onChange={(e) =>
                        setAccents((a) => ({ ...a, [mode]: e.target.value.toUpperCase() }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-3">{t("admin.occasion.accentHint")}</p>
          </section>
        </div>

        {/* The real tile component, not a mock-up of it: an accent that reads
            badly against a photograph is exactly what this has to reveal. */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-sm font-medium text-ink">{t("admin.occasion.preview")}</p>
          <div className="aspect-16/9">
            {draft.hero.base ? (
              <OccasionCard occasion={preview} eager />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-line text-xs text-ink-3">
                {t("admin.occasion.previewEmpty")}
              </div>
            )}
          </div>

          {failure && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{failure}</span>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
};

export default OccasionFormPage;
