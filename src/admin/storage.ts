import type { AdminState } from './model';

export type Change = { id: string; at: string; entity: string; name: string; before: AdminState; after: AdminState };
export type Revision = { revision: number; state: AdminState; history: Change[] };

const key = 'catalog';
const open = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('cyber-catalog-admin', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('revisions');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function loadRevision(): Promise<Revision | undefined> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('revisions').objectStore('revisions').get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function saveRevision(previous: Revision, state: AdminState, entity: string, name: string): Promise<Revision> {
  const next = {
    revision: previous.revision + 1, state,
    history: [{ id: crypto.randomUUID(), at: new Date().toISOString(), entity, name, before: previous.state, after: state },
      ...previous.history].slice(0, 25),
  };
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('revisions', 'readwrite');
      const store = transaction.objectStore('revisions');
      const request = store.get(key);
      let conflict = false;
      request.onsuccess = () => {
        if ((request.result?.revision ?? 0) !== previous.revision) {
          conflict = true;
          transaction.abort();
        } else store.put(next, key);
      };
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(conflict ? new Error('Данные обновились в другой вкладке. Экспортируйте черновик и перезагрузите страницу.') : transaction.error);
    });
    return next;
  } finally { db.close(); }
}
