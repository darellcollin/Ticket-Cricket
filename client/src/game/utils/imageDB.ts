/**
 * Stockage des images de cartes dans IndexedDB (persisté dans le navigateur).
 */

const DB_NAME = "TicketCricketDB";
const DB_VERSION = 2;
const STORE_NAME = "cardImages";
const RULES_STORE = "ruleImages";

// ─── Connexion mise en cache (une seule instance par session) ────────────────
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(RULES_STORE)) {
        db.createObjectStore(RULES_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => { dbPromise = null; reject(req.error); };
    req.onblocked = () => {
      // Une autre connexion bloque la mise à niveau — on invalide le cache
      dbPromise = null;
      reject(new Error("IndexedDB blocked"));
    };
  });
  return dbPromise;
}

// ─── Card images ────────────────────────────────────────────
export async function saveCardImage(cardNumber: number, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, cardNumber);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCardImageBlob(cardNumber: number): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(cardNumber);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getStoredCardCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllCardImages(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Cache en mémoire pour éviter de recréer les object URLs à chaque rendu
const urlCache = new Map<number, string>();

export async function getCardImageUrl(cardNumber: number): Promise<string | null> {
  if (urlCache.has(cardNumber)) return urlCache.get(cardNumber)!;
  const blob = await getCardImageBlob(cardNumber);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(cardNumber, url);
  return url;
}

export function clearUrlCache() {
  urlCache.forEach((url) => URL.revokeObjectURL(url));
  urlCache.clear();
}

// ─── Rule images ────────────────────────────────────────────
export async function saveRuleImage(slotId: number, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RULES_STORE, "readwrite");
    tx.objectStore(RULES_STORE).put(blob, slotId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRuleImageBlob(slotId: number): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RULES_STORE, "readonly");
    const req = tx.objectStore(RULES_STORE).get(slotId);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRuleImage(slotId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RULES_STORE, "readwrite");
    tx.objectStore(RULES_STORE).delete(slotId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const ruleUrlCache = new Map<number, string>();

export async function getRuleImageUrl(slotId: number): Promise<string | null> {
  if (ruleUrlCache.has(slotId)) return ruleUrlCache.get(slotId)!;
  const blob = await getRuleImageBlob(slotId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  ruleUrlCache.set(slotId, url);
  return url;
}

export function clearRuleUrlCache(slotId?: number) {
  if (slotId !== undefined) {
    const url = ruleUrlCache.get(slotId);
    if (url) URL.revokeObjectURL(url);
    ruleUrlCache.delete(slotId);
  } else {
    ruleUrlCache.forEach((url) => URL.revokeObjectURL(url));
    ruleUrlCache.clear();
  }
}