"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Without this the boundary swallows the cause entirely.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground">{t("description")}</p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          {error.digest}
        </p>
      ) : null}
      <Button type="button" onClick={reset} className="mt-2">
        {t("action")}
      </Button>
    </main>
  );
}
