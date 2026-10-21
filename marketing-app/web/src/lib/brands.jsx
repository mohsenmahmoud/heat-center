import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const BrandsContext = createContext(null);

const KEY = 'qms-brand';
const remembered = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const remember = (id) => {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
};

/** All brands plus the one the studio is working on right now (remembered per browser). */
export function BrandsProvider({ enabled, children }) {
  const [brands, setBrands] = useState([]);
  const [activeId, setActiveIdState] = useState(remembered);

  const reload = useCallback(() => api.get('/api/brands').then((d) => setBrands(d.items)).catch(() => {}), []);
  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);

  const setActiveId = useCallback((id) => {
    setActiveIdState(id);
    remember(id);
  }, []);

  const value = useMemo(() => {
    const active = brands.find((b) => b.id === activeId) || brands[0] || null;
    return {
      brands,
      active,
      activeId: active?.id || null,
      setActiveId,
      reload,
      byId: (id) => brands.find((b) => b.id === id) || active,
      // Keep the list in step after a save without another request.
      upsert: (brand) => setBrands((list) => (list.some((b) => b.id === brand.id) ? list.map((b) => (b.id === brand.id ? brand : b)) : [...list, brand])),
      drop: (id) => setBrands((list) => list.filter((b) => b.id !== id)),
    };
  }, [brands, activeId, setActiveId, reload]);

  return <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>;
}

export const useBrands = () => useContext(BrandsContext);

/** What the video composition needs from a brand. */
export const brandVideoProps = (brand) => (brand ? { name: brand.name, website: brand.website, visual: brand.visual } : undefined);

export const brandLabel = (brand, lang) => (brand ? brand.name?.[lang] || brand.name?.en || brand.name?.ar : '');
