import { useState, useEffect } from 'react';

// ─── View Transition CSS ──────────────────────────────────────────────────────
const VT_STYLE_ID = 'igloo-theme-toggle-vt';

const VT_CSS = `
/* ── Light → Dark: nova tela escura sobe de baixo ── */
html[data-igloo-vt="to-dark"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-igloo-vt="to-dark"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: igloo-slide-up 420ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Dark → Light: nova tela clara sobe de baixo (mesmo padrão) ── */
html[data-igloo-vt="to-light"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-igloo-vt="to-light"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: igloo-slide-up 420ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes igloo-slide-up {
  from { clip-path: inset(100% 0 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}

`;

function injectVTStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(VT_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = VT_STYLE_ID;
  el.textContent = VT_CSS;
  document.head.appendChild(el);
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    injectVTStyle();

    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') checkTheme();
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      root.classList.remove('dark');
      localStorage.theme = 'light';
    }
    root.style.colorScheme = dark ? 'dark' : 'light';
  };

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains('dark');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !('startViewTransition' in document)) {
      applyTheme(nextDark);
      return;
    }

    const root = document.documentElement;
    root.dataset.iglooVt = nextDark ? 'to-dark' : 'to-light';

    (
      document as Document & {
        startViewTransition(cb: () => void): { finished: Promise<void> };
      }
    )
      .startViewTransition(() => applyTheme(nextDark))
      .finished.finally(() => {
        delete root.dataset.iglooVt;
      });
  };

  return { isDark, toggleTheme };
};
