import { getTranslations } from "next-intl/server";

export default async function LocaleLoading() {
  const t = await getTranslations("loading");

  return (
    <main
      className="flex min-h-[60vh] items-center justify-center px-6"
      aria-busy="true"
    >
      <span className="sr-only">{t("label")}</span>
      {/* Mirrors the generator card's footprint so the layout does not jump. */}
      <div
        aria-hidden="true"
        className="w-full max-w-3xl animate-pulse space-y-4 rounded-xl border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
