import { INITIAL_SITE_CONFIG, SiteConfig } from '../data/akeaData';

/**
 * Dynamically injects global CSS variables into :root (document.documentElement)
 * so that primary, secondary, and surface colors update in real time across the entire application.
 */
export function applyGlobalThemeCssVariables(config?: Partial<SiteConfig> | null): void {
  if (typeof document === 'undefined') return;

  const merged = {
    ...INITIAL_SITE_CONFIG,
    ...(config || {}),
  };

  const primary = merged.primaryAccentColor || '#FF2C54';
  const secondary = merged.secondaryAccentColor || '#5960FF';
  const pageBg = merged.pageBackgroundColor || '#FFFFFF';
  const surfaceBg = merged.surfaceBackgroundColor || '#f7f8fc';
  const footerBg = merged.footerBackgroundColor || '#f7f8fc';
  const logoDot = merged.logoDotColor || primary;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--accent-color', primary);
  root.style.setProperty('--secondary-accent', secondary);
  root.style.setProperty('--color-page-bg', pageBg);
  root.style.setProperty('--color-surface-bg', surfaceBg);
  root.style.setProperty('--color-footer-bg', footerBg);
  root.style.setProperty('--color-logo-dot', logoDot);
}

/**
 * Generates the live :root CSS variables declaration block for inspection or export.
 */
export function formatRootCssVariablesSnippet(config?: Partial<SiteConfig> | null): string {
  const merged = {
    ...INITIAL_SITE_CONFIG,
    ...(config || {}),
  };

  const primary = merged.primaryAccentColor || '#FF2C54';
  const secondary = merged.secondaryAccentColor || '#5960FF';
  const pageBg = merged.pageBackgroundColor || '#FFFFFF';
  const surfaceBg = merged.surfaceBackgroundColor || '#f7f8fc';
  const footerBg = merged.footerBackgroundColor || '#f7f8fc';
  const logoDot = merged.logoDotColor || primary;

  return `:root {
  --color-primary: ${primary};
  --color-secondary: ${secondary};
  --accent-color: var(--color-primary);
  --secondary-accent: var(--color-secondary);
  --color-page-bg: ${pageBg};
  --color-surface-bg: ${surfaceBg};
  --color-footer-bg: ${footerBg};
  --color-logo-dot: ${logoDot};
}`;
}
