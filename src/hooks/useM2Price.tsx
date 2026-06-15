import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'kema:m2Price';
const EVENT_NAME = 'kema:m2Price:change';
export const DEFAULT_M2_PRICE = 20;

function readPrice(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_M2_PRICE;
    const parsed = Number(JSON.parse(raw));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_M2_PRICE;
  } catch {
    return DEFAULT_M2_PRICE;
  }
}

export function getM2Price(): number {
  if (typeof window === 'undefined') return DEFAULT_M2_PRICE;
  return readPrice();
}

export function useM2Price() {
  const [price, setPriceState] = useState<number>(() =>
    typeof window === 'undefined' ? DEFAULT_M2_PRICE : readPrice()
  );

  useEffect(() => {
    const sync = () => setPriceState(readPrice());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const setPrice = useCallback((value: number) => {
    const safe = Number.isFinite(value) && value > 0 ? value : DEFAULT_M2_PRICE;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new Event(EVENT_NAME));
    setPriceState(safe);
  }, []);

  return { price, setPrice };
}