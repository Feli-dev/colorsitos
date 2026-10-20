import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import es from "../../messages/es.json";

type Messages = { [key: string]: string | Messages };

// Component tests mock next-intl, so this is what proves a key added for one
// locale also exists in the other.
function flatten(messages: Messages, prefix = ""): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>(
    (acc, [key, value]) =>
      typeof value === "string"
        ? { ...acc, [prefix + key]: value }
        : { ...acc, ...flatten(value, `${prefix}${key}.`) },
    {}
  );
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)/g)].map(([, name]) => name).sort();
}

const locales = { en: flatten(en), es: flatten(es) };

describe("locale messages", () => {
  it("define the same keys in every locale", () => {
    expect(Object.keys(locales.es).sort()).toEqual(
      Object.keys(locales.en).sort()
    );
  });

  it("leave no message empty", () => {
    for (const [locale, messages] of Object.entries(locales)) {
      const empty = Object.keys(messages).filter((key) => !messages[key].trim());
      expect(empty, locale).toEqual([]);
    }
  });

  it("use the same placeholders for each key", () => {
    for (const [key, message] of Object.entries(locales.en)) {
      const translated = locales.es[key];
      if (translated === undefined) continue;
      expect(placeholders(translated), key).toEqual(placeholders(message));
    }
  });
});
