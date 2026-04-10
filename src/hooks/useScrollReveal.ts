import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observed = new WeakSet<Element>();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all current .reveal elements
    const observeAll = () => {
      el.querySelectorAll('.reveal').forEach((r) => {
        if (!observed.has(r)) {
          intersectionObserver.observe(r);
          observed.add(r);
        }
      });
    };
    observeAll();

    // Watch for new .reveal elements added later (e.g. after async data load)
    const mutationObserver = new MutationObserver(() => observeAll());
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
}
