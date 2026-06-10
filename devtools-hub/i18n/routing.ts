import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'pt', 'es', 'ja', 'ko', 'zh', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: false,
});
