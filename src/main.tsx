import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ADMIN_PATH, defaultAdmin, parseAdmin, type AdminState } from './admin/model';
import { loadRevision, type Revision } from './admin/storage';
import { CONFIG } from './core/config';
import { App } from './ui/App';
import { currentUrl, go, MODE, subscribe } from './ui/router';
import './ui/styles.css';

const Admin = lazy(() => import('./admin/Admin').then(module => ({ default: module.Admin })));
declare const __CATALOG_SNAPSHOT__: unknown;
const deployed = __CATALOG_SNAPSHOT__ ? parseAdmin(__CATALOG_SNAPSHOT__) : defaultAdmin;
const baseline: Revision = { revision: 0, state: deployed, history: [] };

function Root() {
  const url = useSyncExternalStore(subscribe, currentUrl);
  const [revision, setRevision] = useState<Revision>();
  const [warning, setWarning] = useState('');
  const [preview, setPreview] = useState<AdminState>();
  const channel = useRef<BroadcastChannel>();
  useEffect(() => {
    let cancelled = false;
    const refresh = () => loadRevision().then(data => {
      if (!cancelled) setRevision(data ? { ...data, state: parseAdmin(data.state) } : baseline);
    });
    void refresh().catch(() => {
      if (!cancelled) {
        setWarning('Хранилище браузера недоступно. Доступен просмотр и экспорт черновика.');
        setRevision(baseline);
      }
    });
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel('cyber-catalog-admin');
      channel.current.onmessage = () => {
        if (!currentUrl().startsWith(ADMIN_PATH)) void refresh().catch(() => undefined);
      };
    }
    return () => { cancelled = true; channel.current?.close(); };
  }, []);
  if (!revision) return <main className="container"><p role="status">Загрузка каталога…</p></main>;
  const isAdmin = MODE === 'history' && /^\/admin\/catalog\/?(?:\?.*)?$/.test(url);
  return <>
    {(isAdmin || preview) && <div hidden={!!preview}>
      <Suspense fallback={<p role="status">Загрузка админки…</p>}>
        <Admin initial={revision} warning={warning} onSave={next => { setRevision(next); channel.current?.postMessage(next.revision); }} onPreview={draft => {
          setPreview(draft);
          go(CONFIG.base);
        }} />
      </Suspense>
    </div>}
    {preview && <div className="admin-preview-banner">
      Предпросмотр черновика{' '}<button onClick={() => { go(ADMIN_PATH); setPreview(undefined); }}>Вернуться к редактированию</button>
    </div>}
    {(!isAdmin || (preview && !url.startsWith(ADMIN_PATH))) && <App config={preview ?? revision.state} />}
  </>;
}
createRoot(document.getElementById('root')!).render(<Root />);
