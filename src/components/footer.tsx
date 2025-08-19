"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 w-full py-6 transition-colors duration-300">
      <div className="mx-auto text-center">
        <div className="mt-3 flex items-center justify-center gap-2">
          <Image
            src="/felidev_profile.jpg"
            alt="felidev"
            width={32}
            height={32}
            className="rounded-full"
          />
          <p className="text-sm text-muted-foreground">
            {t("createdBy")}{" "}
            <a
              href="https://x.com/felidev_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
            >
              @felidev_
            </a>
          </p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground transition-colors duration-300">
          {t("copyright", { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}
