"use client";

import { useEffect } from 'react';

export default function ClientBodyCleanup() {
  useEffect(() => {
    try {
      // Remove known extension-injected attributes that commonly cause hydration mismatches
      const attrsToRemove = ['cz-shortcut-listen'];
      attrsToRemove.forEach((name) => {
        if (document?.body?.hasAttribute(name)) {
          document.body.removeAttribute(name);
        }
      });

      // Remove any attribute that starts with common extension prefixes (best-effort)
      Array.from(document?.body?.attributes || [])
        .map((a) => a.name)
        .filter((n) => /^(_?cz-|ext-|data-ext-)/i.test(n))
        .forEach((n) => document.body.removeAttribute(n));
    } catch (e) {
      // ignore
      console.warn('ClientBodyCleanup error', e);
    }
    return () => {};
  }, []);

  return null;
}
